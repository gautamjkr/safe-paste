from typing import List, Dict, Any

from fastapi import FastAPI
from pydantic import BaseModel

from presidio_analyzer import AnalyzerEngine, RecognizerResult
from presidio_analyzer.nlp_engine import NlpEngineProvider


def create_analyzer_engine() -> AnalyzerEngine:
    """
    Create a Presidio AnalyzerEngine with spaCy large English model.
    This is done once at startup so that subsequent requests are fast.
    """
    configuration = {
        "nlp_engine_name": "spacy",
        "models": [{"lang_code": "en", "model_name": "en_core_web_lg"}],
    }
    provider = NlpEngineProvider(nlp_configuration=configuration)
    nlp_engine = provider.create_engine()

    analyzer = AnalyzerEngine(
        nlp_engine=nlp_engine,
        supported_languages=["en"],
    )
    return analyzer


analyzer_engine = create_analyzer_engine()

app = FastAPI(
    title="SafePaste Processor",
    description="Privacy-first redaction processor using Presidio (analyze & anonymize).",
    version="0.1.0",
)


class AnalyzeRequest(BaseModel):
    text: str


class Entity(BaseModel):
    entity_type: str
    start: int
    end: int
    score: float


class AnalyzeResponse(BaseModel):
    entities: List[Entity]


class AnonymizeResponse(BaseModel):
    masked_text: str
    ghost_map: Dict[str, str]
    entities: List[Entity]


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_text(payload: AnalyzeRequest) -> AnalyzeResponse:
    """
    Run Presidio analysis on the provided text and return detected entities.
    """
    results: List[RecognizerResult] = analyzer_engine.analyze(
        text=payload.text,
        language="en",
        score_threshold=0.3,
    )

    entities = [
        Entity(
            entity_type=r.entity_type,
            start=r.start,
            end=r.end,
            score=r.score,
        )
        for r in results
    ]
    return AnalyzeResponse(entities=entities)


@app.post("/anonymize", response_model=AnonymizeResponse)
async def anonymize_text(payload: AnalyzeRequest) -> AnonymizeResponse:
    """
    Perform a lightweight anonymization:
    - Detect entities via Presidio.
    - Replace each span with a placeholder like <PHONE_NUMBER_1>.
    - Build a Ghost Map from placeholder -> original span.

    This avoids sending raw secrets further downstream while allowing
    local reconstruction when needed.
    """
    results: List[RecognizerResult] = analyzer_engine.analyze(
        text=payload.text,
        language="en",
        score_threshold=0.3,
    )

    # Sort by start index to build the masked string left-to-right
    results_sorted = sorted(results, key=lambda r: r.start)

    masked_parts: List[str] = []
    ghost_map: Dict[str, str] = {}
    entities: List[Entity] = []

    cursor = 0
    type_counters: Dict[str, int] = {}

    for r in results_sorted:
        # Skip overlapping or invalid ranges defensively
        if r.start < cursor or r.start < 0 or r.end > len(payload.text):
            continue

        # Add the non-PII text before the entity
        masked_parts.append(payload.text[cursor : r.start])

        # Build placeholder token e.g. <PHONE_NUMBER_1>
        count = type_counters.get(r.entity_type, 0) + 1
        type_counters[r.entity_type] = count
        placeholder = f"<{r.entity_type}_{count}>"

        original_value = payload.text[r.start : r.end]
        masked_parts.append(placeholder)

        ghost_map[placeholder] = original_value
        entities.append(
            Entity(
                entity_type=r.entity_type,
                start=r.start,
                end=r.end,
                score=r.score,
            )
        )

        cursor = r.end

    # Append any trailing non-PII text
    if cursor < len(payload.text):
        masked_parts.append(payload.text[cursor:])

    masked_text = "".join(masked_parts) if results_sorted else payload.text

    return AnonymizeResponse(
        masked_text=masked_text,
        ghost_map=ghost_map,
        entities=entities,
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)



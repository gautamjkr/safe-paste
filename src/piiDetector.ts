/**
 * Aggressive Client-side PII (Personally Identifiable Information) Detector
 * Uses comprehensive regex patterns and heuristics to detect sensitive information
 * Designed for aggressive detection to maximize privacy protection
 */

export type EntityType =
  | "PHONE_NUMBER"
  | "EMAIL_ADDRESS"
  | "CREDIT_CARD"
  | "SSN"
  | "IP_ADDRESS"
  | "IPV6_ADDRESS"
  | "URL"
  | "DATE"
  | "DATE_OF_BIRTH"
  | "PERSON_NAME"
  | "LOCATION"
  | "PASSPORT"
  | "DRIVER_LICENSE"
  | "BANK_ACCOUNT"
  | "API_KEY"
  | "PASSWORD"
  | "JWT_TOKEN"
  | "AWS_KEY"
  | "PRIVATE_KEY"
  | "MAC_ADDRESS"
  | "UUID"
  | "IBAN"
  | "SWIFT_CODE"
  | "BITCOIN_ADDRESS"
  | "ETHEREUM_ADDRESS";

export type DetectedEntity = {
  entity_type: EntityType;
  start: number;
  end: number;
  score: number;
  value: string;
};

/**
 * Luhn algorithm to validate credit card numbers
 */
function luhnCheck(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, "");
  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * Validate IBAN checksum
 */
function validateIBAN(iban: string): boolean {
  const cleaned = iban.replace(/\s/g, "").toUpperCase();
  if (cleaned.length < 15 || cleaned.length > 34) return false;
  
  // Move first 4 characters to end
  const rearranged = cleaned.slice(4) + cleaned.slice(0, 4);
  
  // Convert letters to numbers (A=10, B=11, etc.)
  let numeric = "";
  for (const char of rearranged) {
    if (char >= "0" && char <= "9") {
      numeric += char;
    } else if (char >= "A" && char <= "Z") {
      numeric += (char.charCodeAt(0) - 55).toString();
    } else {
      return false;
    }
  }
  
  // Calculate mod 97
  let remainder = "";
  for (let i = 0; i < numeric.length; i += 7) {
    const chunk = remainder + numeric.slice(i, i + 7);
    remainder = (parseInt(chunk, 10) % 97).toString();
  }
  
  return parseInt(remainder, 10) === 1;
}

/**
 * Comprehensive phone number patterns (aggressive detection)
 */
const PHONE_PATTERNS = [
  // US/Canada formats
  /\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g,
  /\b1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b/g,
  /\b[0-9]{3}[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b/g,
  // International formats (more aggressive)
  /\b\+?[1-9]\d{0,3}[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}\b/g,
  /\b\+?\d{1,4}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}\b/g,
  // Generic patterns (catch more edge cases)
  /\b\d{7,15}\b/g, // Any 7-15 digit sequence
  /\b(?:tel|phone|mobile|cell)[:\s]*[+\d\s\-\(\)\.]{7,}\b/gi,
];

/**
 * Enhanced email address patterns
 */
const EMAIL_PATTERNS = [
  // Standard email
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  // Email with subdomain
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  // Email-like patterns (more aggressive)
  /\b\w+[.\-_]?\w*@\w+[.\-_]?\w*\.\w+\b/gi,
];

/**
 * Comprehensive credit card patterns
 */
const CREDIT_CARD_PATTERNS = [
  // Standard formats
  /\b(?:\d[-\s]?){13,19}\d\b/g,
  // Visa (starts with 4)
  /\b4\d{3}[-.\s]?\d{4}[-.\s]?\d{4}[-.\s]?\d{4}\b/g,
  // Mastercard (starts with 5)
  /\b5[1-5]\d{2}[-.\s]?\d{4}[-.\s]?\d{4}[-.\s]?\d{4}\b/g,
  // Amex (starts with 34 or 37)
  /\b3[47]\d{2}[-.\s]?\d{6}[-.\s]?\d{5}\b/g,
  // Discover (starts with 6011 or 65)
  /\b(?:6011|65\d{2})[-.\s]?\d{4}[-.\s]?\d{4}[-.\s]?\d{4}\b/g,
];

/**
 * Enhanced SSN patterns
 */
const SSN_PATTERNS = [
  // Standard format: XXX-XX-XXXX
  /\b\d{3}-\d{2}-\d{4}\b/g,
  // Without dashes: XXXXXXXXX
  /\b\d{9}\b/g,
  // With spaces: XXX XX XXXX
  /\b\d{3}\s+\d{2}\s+\d{4}\b/g,
  // SSN-like patterns
  /\b(?:SSN|Social Security)[:\s]*\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b/gi,
];

/**
 * IPv4 address patterns
 */
const IP_PATTERNS = [
  // Standard IPv4
  /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
  // IP with port
  /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?):\d{1,5}\b/g,
];

/**
 * IPv6 address patterns
 */
const IPV6_PATTERNS = [
  /\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b/g,
  /\b(?:[0-9a-fA-F]{1,4}:){1,7}:\b/g,
  /\b::(?:[0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4}\b/g,
];

/**
 * URL patterns (more comprehensive)
 */
const URL_PATTERNS = [
  // Standard URLs
  /\b(?:https?:\/\/|www\.)[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)?/gi,
  // URLs without protocol
  /\b[a-zA-Z0-9][-a-zA-Z0-9]{0,62}\.[a-zA-Z]{2,}(?:\/[-a-zA-Z0-9@:%_\+.~#?&\/=]*)?/gi,
];

/**
 * Comprehensive date patterns
 */
const DATE_PATTERNS = [
  // MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD
  /\b(?:\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}|\d{4}-\d{1,2}-\d{1,2})\b/g,
  // Month name formats
  /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}\b/gi,
  // Full month names
  /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/gi,
  // ISO format
  /\b\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})?)?\b/g,
];

/**
 * Date of birth patterns (more specific)
 */
const DOB_PATTERNS = [
  /\b(?:DOB|Date of Birth|Born)[:\s]*\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}\b/gi,
  /\b(?:DOB|Date of Birth|Born)[:\s]*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}\b/gi,
];

/**
 * Enhanced person name patterns
 */
const PERSON_NAME_PATTERNS = [
  // Capitalized names (2-4 words)
  /\b(?:[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\b/g,
  // Names with titles
  /\b(?:Mr|Mrs|Ms|Dr|Prof|Rev)\.?\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b/gi,
  // Names with suffixes
  /\b[A-Z][a-z]+\s+[A-Z][a-z]+\s+(?:Jr|Sr|II|III|IV|V)\.?\b/gi,
];

/**
 * Enhanced location patterns
 */
const LOCATION_PATTERNS = [
  // Street addresses
  /\b\d+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Boulevard|Drive|Dr|Lane|Ln|Way|Court|Ct|Circle|Cir|Parkway|Pkwy)\b/gi,
  // ZIP codes (US)
  /\b\d{5}(?:-\d{4})?\b/g,
  // Postal codes (international formats)
  /\b[A-Z0-9]{3,10}\s?[A-Z0-9]{3,10}\b/g,
  // City, State format
  /\b[A-Z][a-z]+,\s*[A-Z]{2}\b/g,
  // Coordinates (lat/long)
  /\b-?\d{1,3}\.\d+,\s*-?\d{1,3}\.\d+\b/g,
];

/**
 * Passport number patterns
 */
const PASSPORT_PATTERNS = [
  /\b(?:Passport|Passport No|Passport#)[:\s]*[A-Z0-9]{6,12}\b/gi,
  /\b[A-Z]{1,2}\d{6,9}\b/g, // Common passport formats
];

/**
 * Driver license patterns
 */
const DRIVER_LICENSE_PATTERNS = [
  /\b(?:DL|Driver'?s?\s+License|License No|License#)[:\s]*[A-Z0-9]{5,15}\b/gi,
  /\b[A-Z]\d{7,9}\b/g, // Common DL formats
];

/**
 * Bank account patterns
 */
const BANK_ACCOUNT_PATTERNS = [
  /\b(?:Account|Acct|Account No|Account#|Bank Account)[:\s]*\d{8,17}\b/gi,
  /\b\d{8,17}\b/g, // Generic account numbers
];

/**
 * API key patterns (aggressive)
 */
const API_KEY_PATTERNS = [
  // Generic API keys
  /\b(?:api[_-]?key|apikey|api_key)[=:\s]*['"]?([A-Za-z0-9_\-]{20,})['"]?/gi,
  // Common API key formats
  /\b[A-Za-z0-9_\-]{20,}\b/g, // Long alphanumeric strings
  // Service-specific patterns
  /\b(?:sk|pk)_[A-Za-z0-9]{20,}\b/gi, // Stripe keys
  /\bAKIA[0-9A-Z]{16}\b/g, // AWS access keys
  /\bAIza[0-9A-Za-z\-_]{35}\b/g, // Google API keys
];

/**
 * Password patterns
 */
const PASSWORD_PATTERNS = [
  /\b(?:password|passwd|pwd|pass)[=:\s]*['"]?([^\s'"]{8,})['"]?/gi,
];

/**
 * JWT token patterns
 */
const JWT_PATTERNS = [
  /\beyJ[A-Za-z0-9\-_]+\.eyJ[A-Za-z0-9\-_]+\.?[A-Za-z0-9\-_]*\b/g,
];

/**
 * AWS key patterns
 */
const AWS_KEY_PATTERNS = [
  /\bAKIA[0-9A-Z]{16}\b/g, // Access key ID
  /\b(?:AWS_ACCESS_KEY|AWS_SECRET_KEY|aws_access_key_id|aws_secret_access_key)[=:\s]*['"]?([A-Za-z0-9/+=]{20,})['"]?/gi,
];

/**
 * Private key patterns
 */
const PRIVATE_KEY_PATTERNS = [
  /\b-----BEGIN\s+(?:RSA|DSA|EC|OPENSSH)?\s*PRIVATE\s+KEY-----\s*[A-Za-z0-9/+\s=]+-----END\s+(?:RSA|DSA|EC|OPENSSH)?\s*PRIVATE\s+KEY-----\b/gi,
  /\b-----BEGIN\s+PGP\s+PRIVATE\s+KEY\s+BLOCK-----\s*[A-Za-z0-9/+\s=]+-----END\s+PGP\s+PRIVATE\s+KEY\s+BLOCK-----\b/gi,
];

/**
 * MAC address patterns
 */
const MAC_ADDRESS_PATTERNS = [
  /\b(?:[0-9A-Fa-f]{2}[:-]){5}(?:[0-9A-Fa-f]{2})\b/g,
  /\b(?:[0-9A-Fa-f]{4}\.){2}(?:[0-9A-Fa-f]{4})\b/g,
];

/**
 * UUID patterns
 */
const UUID_PATTERNS = [
  /\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b/g,
  /\b[0-9a-fA-F]{32}\b/g, // UUID without dashes
];

/**
 * IBAN patterns
 */
const IBAN_PATTERNS = [
  /\b[A-Z]{2}\d{2}[A-Z0-9]{4,30}\b/g,
];

/**
 * SWIFT/BIC code patterns
 */
const SWIFT_PATTERNS = [
  /\b(?:SWIFT|BIC|Bank Identifier)[:\s]*[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}(?:[A-Z0-9]{3})?\b/gi,
  /\b[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}(?:[A-Z0-9]{3})?\b/g,
];

/**
 * Bitcoin address patterns
 */
const BITCOIN_PATTERNS = [
  /\b[13][a-km-zA-HJ-NP-Z1-9]{25,34}\b/g, // Legacy addresses
  /\bbc1[a-z0-9]{39,59}\b/gi, // Bech32 addresses
];

/**
 * Ethereum address patterns
 */
const ETHEREUM_PATTERNS = [
  /\b0x[a-fA-F0-9]{40}\b/g,
];

/**
 * Detect entities in text using comprehensive regex patterns
 */
export function detectEntities(text: string): DetectedEntity[] {
  const entities: DetectedEntity[] = [];
  const seenRanges = new Set<string>();

  // Helper to add entity if not overlapping with existing ones
  function addEntity(
    entityType: EntityType,
    match: RegExpMatchArray,
    score: number = 0.8
  ) {
    const start = match.index!;
    const end = start + match[0].length;
    const value = match[0];
    const rangeKey = `${start}-${end}`;

    // Skip if already seen
    if (seenRanges.has(rangeKey)) {
      return;
    }

    // Check for overlap with existing entities (allow partial overlap for aggressive detection)
    for (const existing of entities) {
      // Only skip if completely contained or completely contains
      if (
        (start >= existing.start && end <= existing.end) ||
        (start <= existing.start && end >= existing.end)
      ) {
        // Prefer higher score entity
        if (score <= existing.score) {
          return;
        } else {
          // Remove lower score entity
          const index = entities.indexOf(existing);
          if (index > -1) {
            entities.splice(index, 1);
            seenRanges.delete(`${existing.start}-${existing.end}`);
          }
        }
      }
    }

    seenRanges.add(rangeKey);
    entities.push({
      entity_type: entityType,
      start,
      end,
      score,
      value,
    });
  }

  // Detect phone numbers (aggressive)
  for (const pattern of PHONE_PATTERNS) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const phone = match[0].replace(/\D/g, "");
      // More aggressive: accept 7-15 digits
      if (phone.length >= 7 && phone.length <= 15) {
        // Higher score for standard formats
        const score = phone.length >= 10 ? 0.9 : 0.7;
        addEntity("PHONE_NUMBER", match, score);
      }
    }
  }

  // Detect email addresses (aggressive)
  for (const pattern of EMAIL_PATTERNS) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const email = match[0].toLowerCase();
      // Filter out only obvious test domains
      if (
        !email.includes("example.com") &&
        !email.includes("test.com") &&
        !email.includes("domain.com") &&
        !email.includes("localhost") &&
        email.includes("@") &&
        email.includes(".")
      ) {
        addEntity("EMAIL_ADDRESS", match, 0.95);
      }
    }
  }

  // Detect credit cards (with validation)
  for (const pattern of CREDIT_CARD_PATTERNS) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const cardNumber = match[0].replace(/\D/g, "");
      if (cardNumber.length >= 13 && cardNumber.length <= 19) {
        if (luhnCheck(cardNumber)) {
          addEntity("CREDIT_CARD", match, 0.98);
        } else if (cardNumber.length === 16) {
          // Still flag as potential even if Luhn fails
          addEntity("CREDIT_CARD", match, 0.7);
        }
      }
    }
  }

  // Detect SSNs (aggressive)
  for (const pattern of SSN_PATTERNS) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const ssn = match[0].replace(/\D/g, "");
      if (ssn.length === 9) {
        const area = parseInt(ssn.substring(0, 3), 10);
        // More aggressive: flag even invalid area codes
        if (area !== 0 && area !== 666 && area < 1000) {
          addEntity("SSN", match, 0.95);
        } else {
          // Still flag as potential
          addEntity("SSN", match, 0.6);
        }
      }
    }
  }

  // Detect IPv4 addresses
  for (const pattern of IP_PATTERNS) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const ip = match[0];
      // More aggressive: flag all IPs except obvious localhost
      if (!ip.startsWith("0.0.0.0") && ip !== "127.0.0.1" && !ip.startsWith("192.168.") && !ip.startsWith("10.") && !ip.startsWith("172.16.")) {
        addEntity("IP_ADDRESS", match, 0.9);
      } else {
        // Still flag private IPs as potential PII
        addEntity("IP_ADDRESS", match, 0.5);
      }
    }
  }

  // Detect IPv6 addresses
  for (const pattern of IPV6_PATTERNS) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      addEntity("IPV6_ADDRESS", match, 0.85);
    }
  }

  // Detect URLs (aggressive)
  for (const pattern of URL_PATTERNS) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const url = match[0].toLowerCase();
      // More aggressive: flag all URLs except obvious test domains
      if (
        !url.includes("example.com") &&
        !url.includes("test.com") &&
        !url.includes("localhost") &&
        !url.includes("127.0.0.1")
      ) {
        addEntity("URL", match, 0.8);
      }
    }
  }

  // Detect dates
  for (const pattern of DATE_PATTERNS) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const dateStr = match[0];
      if (dateStr.includes("/") || dateStr.includes("-") || /[A-Za-z]/.test(dateStr)) {
        addEntity("DATE", match, 0.7);
      }
    }
  }

  // Detect date of birth
  for (const pattern of DOB_PATTERNS) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      addEntity("DATE_OF_BIRTH", match, 0.9);
    }
  }

  // Detect person names (more aggressive)
  for (const pattern of PERSON_NAME_PATTERNS) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const name = match[0];
      const commonWords = [
        "The", "This", "That", "There", "These", "Those",
        "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
        "United", "States", "America", "Europe", "Asia", "Africa",
      ];
      if (!commonWords.some((word) => name.toLowerCase().startsWith(word.toLowerCase()))) {
        addEntity("PERSON_NAME", match, 0.6);
      }
    }
  }

  // Detect locations
  for (const pattern of LOCATION_PATTERNS) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      addEntity("LOCATION", match, 0.75);
    }
  }

  // Detect passport numbers
  for (const pattern of PASSPORT_PATTERNS) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      addEntity("PASSPORT", match, 0.9);
    }
  }

  // Detect driver licenses
  for (const pattern of DRIVER_LICENSE_PATTERNS) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      addEntity("DRIVER_LICENSE", match, 0.9);
    }
  }

  // Detect bank accounts
  for (const pattern of BANK_ACCOUNT_PATTERNS) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const account = match[0].replace(/\D/g, "");
      if (account.length >= 8 && account.length <= 17) {
        addEntity("BANK_ACCOUNT", match, 0.85);
      }
    }
  }

  // Detect API keys (very aggressive)
  for (const pattern of API_KEY_PATTERNS) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const key = match[1] || match[0];
      if (key.length >= 20) {
        addEntity("API_KEY", match, 0.95);
      }
    }
  }

  // Detect passwords
  for (const pattern of PASSWORD_PATTERNS) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const password = match[1] || match[0];
      if (password.length >= 8) {
        addEntity("PASSWORD", match, 0.98);
      }
    }
  }

  // Detect JWT tokens
  for (const pattern of JWT_PATTERNS) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      addEntity("JWT_TOKEN", match, 0.95);
    }
  }

  // Detect AWS keys
  for (const pattern of AWS_KEY_PATTERNS) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      addEntity("AWS_KEY", match, 0.95);
    }
  }

  // Detect private keys
  for (const pattern of PRIVATE_KEY_PATTERNS) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      addEntity("PRIVATE_KEY", match, 0.99);
    }
  }

  // Detect MAC addresses
  for (const pattern of MAC_ADDRESS_PATTERNS) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      addEntity("MAC_ADDRESS", match, 0.8);
    }
  }

  // Detect UUIDs
  for (const pattern of UUID_PATTERNS) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      addEntity("UUID", match, 0.85);
    }
  }

  // Detect IBANs
  for (const pattern of IBAN_PATTERNS) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const iban = match[0];
      if (validateIBAN(iban)) {
        addEntity("IBAN", match, 0.95);
      } else if (iban.length >= 15 && iban.length <= 34) {
        // Flag as potential even if validation fails
        addEntity("IBAN", match, 0.7);
      }
    }
  }

  // Detect SWIFT codes
  for (const pattern of SWIFT_PATTERNS) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      addEntity("SWIFT_CODE", match, 0.9);
    }
  }

  // Detect Bitcoin addresses
  for (const pattern of BITCOIN_PATTERNS) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      addEntity("BITCOIN_ADDRESS", match, 0.9);
    }
  }

  // Detect Ethereum addresses
  for (const pattern of ETHEREUM_PATTERNS) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      addEntity("ETHEREUM_ADDRESS", match, 0.9);
    }
  }

  // Sort by start position
  return entities.sort((a, b) => a.start - b.start);
}

/**
 * Anonymize text by replacing detected entities with placeholders
 */
export function anonymizeText(
  text: string,
  entities: DetectedEntity[],
  selectedEntityIds?: Set<number>
): { masked_text: string; ghost_map: Record<string, string> } {
  // If no entities, return original
  if (entities.length === 0) {
    return { masked_text: text, ghost_map: {} };
  }

  // Filter entities based on selection (if provided)
  const entitiesToMask = selectedEntityIds
    ? entities.filter((_, index) => selectedEntityIds.has(index))
    : entities;

  if (entitiesToMask.length === 0) {
    return { masked_text: text, ghost_map: {} };
  }

  // Sort by start position (reverse to avoid index shifting)
  const sortedEntities = [...entitiesToMask].sort((a, b) => b.start - a.start);

  let maskedText = text;
  const ghostMap: Record<string, string> = {};
  const typeCounters: Record<EntityType, number> = {} as Record<EntityType, number>;

  for (const entity of sortedEntities) {
    const count = (typeCounters[entity.entity_type] || 0) + 1;
    typeCounters[entity.entity_type] = count;
    const placeholder = `<${entity.entity_type}_${count}>`;

    // Replace the entity with placeholder
    maskedText =
      maskedText.slice(0, entity.start) +
      placeholder +
      maskedText.slice(entity.end);

    ghostMap[placeholder] = entity.value;
  }

  return { masked_text: maskedText, ghost_map: ghostMap };
}


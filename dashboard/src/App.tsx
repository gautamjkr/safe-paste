import React, { useState, useEffect } from "react";
import Dashboard from "./components/Dashboard";

const GATEWAY_BASE_URL = import.meta.env.VITE_GATEWAY_URL || "http://localhost:8080";

export type RedactionLog = {
  entity_type: string;
  count: number;
  createdAt?: string;
  updatedAt?: string;
};

function App() {
  const [logs, setLogs] = useState<RedactionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchLogs = async () => {
    try {
      setError(null);
      const response = await fetch(`${GATEWAY_BASE_URL}/logs/redactions`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch logs: ${response.status}`);
      }

      const data = await response.json();
      setLogs(data.logs || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error fetching logs:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch redaction logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchLogs, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <Dashboard
      logs={logs}
      loading={loading}
      error={error}
      lastUpdated={lastUpdated}
      onRefresh={fetchLogs}
    />
  );
}

export default App;


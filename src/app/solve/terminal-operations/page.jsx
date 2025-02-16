"use client";

import { useEffect, useState } from "react";
import SplitShell from "@/components/SplitShell";

const TerminalOperations = () => {
  const [webSocketUrl, setWebSocketUrl] = useState("");
  const [tokenValue, setTokenValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [instanceId, setInstanceId] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [region, setRegion] = useState("");

  useEffect(() => {
    fetch(`/api/start-instance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("API Response:", data);
        console.log(data.instanceId);
        console.log(data.sessionId);
        console.log(data.region);
        if (data.streamUrl && data.tokenValue && data.instanceId && data.sessionId && data.region) {
          setWebSocketUrl(data.streamUrl);
          setTokenValue(data.tokenValue);
          setInstanceId(data.instanceId);
          setSessionId(data.sessionId);
          setRegion(data.region);
        } else {
          console.error("WebSocket URL or Token not received.");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error setting up EC2 session:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Setting up your terminal environment...</div>;

  return (
    <div>
      <SplitShell websocketUrl={webSocketUrl} tokenValue={tokenValue} instanceId={instanceId} sessionId={sessionId} region={region} />
    </div>
  );
};

export default TerminalOperations;

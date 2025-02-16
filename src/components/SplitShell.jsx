"use client";

import { useEffect, useRef, useState } from "react";
import ssm from "@/lib/ssm-session";
import "xterm/css/xterm.css";

const SplitShell = ({ websocketUrl, tokenValue, instanceId, sessionId, region }) => {
  const terminalRef = useRef(null);
  const socketRef = useRef(null);
  const terminalInstance = useRef(null);
  const [isDomReady, setIsDomReady] = useState(false);
  console.log("InstanceId:", instanceId, " sessionId:", sessionId);

  const termOptions = {
    rows: 34,
    cols: 120,
    fontFamily: "Fira Code, courier-new, courier, monospace",
  };

  useEffect(() => {
    setIsDomReady(true);
  }, []);

  useEffect(() => {
    if (!isDomReady || !terminalRef.current) return;
    if (!websocketUrl || !tokenValue) {
      console.warn("⚠️ WebSocket URL or Token missing. Skipping connection.");
      return;
    }

    console.log("Initializing SplitShell with:", { websocketUrl, tokenValue });
    let keepAliveInterval;

    const startSession = async () => {
      try {
        const { Terminal } = await import("xterm");
        console.log("✅ XTerm loaded successfully.");

        if (!terminalRef.current) {
          console.error("❌ Terminal ref is still missing after DOM ready!");
          return;
        }

        console.log("✅ Initializing terminal...");
        const terminal = new Terminal(termOptions);
        terminal.open(terminalRef.current);
        terminalInstance.current = terminal;
        console.log("✅ Terminal opened and ready.");

        const socket = new WebSocket(websocketUrl);
        socket.binaryType = "arraybuffer";
        socketRef.current = socket;

        socket.addEventListener("open", () => {
          console.log("✅ WebSocket connected.");

          keepAliveInterval = setInterval(() => {
            console.log("🔄 Sending Keep-Alive Ping...");
            socket.send(JSON.stringify({ action: "ping" }));
          }, 30000);

          ssm.init(socket, { token: tokenValue, termOptions });

          console.log("✅ SSM session initialized.");
        });

        socket.addEventListener("message", (event) => {
          console.log("📩 Message received from WebSocket.");
          const agentMessage = ssm.decode(event.data);
          console.log("📩 Decoded agent message:", agentMessage);

          ssm.sendACK(socket, agentMessage);

          if (agentMessage.payloadType === 1) {
            console.log("📩 Writing to terminal:", agentMessage.payload);
            setTimeout(() => {
              terminal.write(agentMessage.payload);
            }, 50);
          } else if (agentMessage.payloadType === 17) {
            console.log("🔄 Sending init message...");
            ssm.sendInitMessage(socket, termOptions);
          }
        });

        terminal.onData((data) => {
          console.log("⌨️ User input:", data);
          ssm.sendText(socket, data);
        });

        socket.addEventListener("close", () => {
          console.log("❌ WebSocket connection closed.");
          clearInterval(keepAliveInterval);
          terminal.dispose();
        });

        socket.addEventListener("error", (error) => {
          console.error("⚠️ WebSocket error:", error);
        });
      } catch (error) {
        console.error("❌ Error initializing SplitShell:", error);
      }
    };

    startSession();

    return () => {
      if (socketRef.current) {
        console.log("🔌 Closing WebSocket...");
        clearInterval(keepAliveInterval);
        socketRef.current.close();
      }
    };
  }, [isDomReady, websocketUrl, tokenValue]);

  const handleCancel = async () => {
    console.log("❌ Cancel button clicked. Terminating session...");
    try {
      if (socketRef.current) {
        socketRef.current.close();
      }

      await fetch("/api/terminate-instance", {
        method: "POST",
        body: JSON.stringify({ instanceId, sessionId, region }),
        headers: { "Content-Type": "application/json" },
      });

      console.log("✅ EC2 instance terminated and SSM session ended.");
      window.close();
    } catch (error) {
      console.error("⚠️ Error during termination:", error);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left Half: Terminal */}
      <div className="w-1/2 bg-black text-white p-4 overflow-auto border-r-2 border-white-700">
        {isDomReady ? (
          <div ref={terminalRef} className="h-full w-full"></div>
        ) : (
          <p className="text-white">Initializing terminal...</p>
        )}
      </div>

      {/* Right Half: Description Box */}
      <div className="w-1/2 p-6 bg-gray-900 text-white flex flex-col justify-between border-l-2 border-white-700">
        <div>
          <h2 className="text-2xl font-bold">EC2 Session</h2>
          <p className="mt-2">You are connected to an EC2 instance via SSM.</p>
          <p className="mt-2">
            Instance ID: <span className="font-mono text-blue-400">{instanceId}</span>
          </p>
          <p className="mt-2">
            Session ID: <span className="font-mono text-blue-400">{sessionId}</span>
          </p>
        </div>

        {/* Cancel Button */}
        <button
          className="bg-red-600 hover:bg-red-800 text-white font-bold py-2 px-4 rounded transition duration-200"
          onClick={handleCancel}
        >
          Cancel & Terminate
        </button>
      </div>
    </div>
  );
};

export default SplitShell;

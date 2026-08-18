import { useState } from "react";
import { Node } from "./primitives/Node";
import { Arrow } from "./primitives/Arrow";
import { Timeline, type TimelineEvent } from "./primitives/Timeline";

type Mode = "sync" | "async";

const EVENTS: Record<Mode, TimelineEvent[]> = {
  sync: [
    { t: 0, label: "write", state: "neutral" },
    { t: 0.5, label: "replicated to follower", state: "healthy" },
    { t: 0.85, label: "ack to client", state: "healthy" },
  ],
  async: [
    { t: 0, label: "write", state: "neutral" },
    { t: 0.25, label: "ack to client", state: "healthy" },
    { t: 0.82, label: "replicated (late)", state: "warning" },
  ],
};

export default function ReplicationDiagram() {
  const [mode, setMode] = useState<Mode>("sync");
  const events = EVENTS[mode];

  return (
    <div>
      <div className="diagram-toggle-group" role="tablist" aria-label="Replication mode">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "sync"}
          className={`diagram-toggle${mode === "sync" ? " diagram-toggle--active" : ""}`}
          onClick={() => setMode("sync")}
        >
          Synchronous
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "async"}
          className={`diagram-toggle${mode === "async" ? " diagram-toggle--active" : ""}`}
          onClick={() => setMode("async")}
        >
          Asynchronous
        </button>
      </div>

      <svg viewBox="0 0 500 170" width="100%" role="img" aria-label={`${mode === "sync" ? "Synchronous" : "Asynchronous"} replication timeline`}>
        <Node x={0} y={0} width={140} height={44} label="Leader" />
        <Node x={330} y={0} width={140} height={44} label="Follower" />
        <Arrow x1={140} y1={22} x2={330} y2={22} label="replicate" state={mode === "sync" ? "healthy" : "warning"} />
        <Timeline width={470} y={100} events={events} axisLabel="time →" />
      </svg>

      <p style={{ fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", color: "var(--diagram-text-muted)", margin: "8px 0 0" }}>
        {mode === "sync"
          ? "The client waits until the follower confirms it has the write before getting an ack — durable even if the leader crashes right after, but every write is only as fast as the slowest follower."
          : "The client gets an ack as soon as the leader writes locally — low latency, but if the leader crashes before replicating, that write can be lost even though the client was told it succeeded."}
      </p>
    </div>
  );
}

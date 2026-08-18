import { useState } from "react";
import { Node } from "./primitives/Node";

const LEVELS = ["Read Uncommitted", "Read Committed", "Repeatable Read", "Serializable"] as const;
type Level = (typeof LEVELS)[number];

const ANOMALIES = ["Dirty Read", "Non-repeatable Read", "Phantom Read"] as const;

// Standard ANSI SQL isolation table: true = anomaly is still possible at this level.
const POSSIBLE: Record<Level, Record<(typeof ANOMALIES)[number], boolean>> = {
  "Read Uncommitted": { "Dirty Read": true, "Non-repeatable Read": true, "Phantom Read": true },
  "Read Committed": { "Dirty Read": false, "Non-repeatable Read": true, "Phantom Read": true },
  "Repeatable Read": { "Dirty Read": false, "Non-repeatable Read": false, "Phantom Read": true },
  Serializable: { "Dirty Read": false, "Non-repeatable Read": false, "Phantom Read": false },
};

const NODE_WIDTH = 180;
const NODE_HEIGHT = 56;
const NODE_GAP = 30;

export default function IsolationLevelDiagram() {
  const [level, setLevel] = useState<Level>("Read Uncommitted");
  const viewWidth = ANOMALIES.length * (NODE_WIDTH + NODE_GAP) - NODE_GAP + 20;

  return (
    <div>
      <div className="diagram-toggle-group" role="tablist" aria-label="Isolation level">
        {LEVELS.map((l) => (
          <button
            key={l}
            type="button"
            role="tab"
            aria-selected={level === l}
            className={`diagram-toggle${level === l ? " diagram-toggle--active" : ""}`}
            onClick={() => setLevel(l)}
          >
            {l}
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${viewWidth} 76`} width="100%" role="img" aria-label={`Anomalies possible at ${level}`}>
        {ANOMALIES.map((a, i) => (
          <Node
            key={a}
            x={i * (NODE_WIDTH + NODE_GAP)}
            y={0}
            width={NODE_WIDTH}
            height={NODE_HEIGHT}
            label={a}
            sublabel={POSSIBLE[level][a] ? "possible" : "prevented"}
            state={POSSIBLE[level][a] ? "warning" : "healthy"}
          />
        ))}
      </svg>

      <div className="diagram-legend">
        <div className="diagram-legend__item">
          <span className="diagram-legend__swatch" style={{ background: "var(--diagram-state-healthy)" }} />
          Prevented at this level
        </div>
        <div className="diagram-legend__item">
          <span className="diagram-legend__swatch" style={{ background: "var(--diagram-state-warning)" }} />
          Still possible
        </div>
      </div>
    </div>
  );
}

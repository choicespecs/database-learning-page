import { useState } from "react";
import { Node } from "./primitives/Node";

type Mode = "scan" | "index";

const KEYS = Array.from({ length: 16 }, (_, i) => i);
const TARGET = 13;

function linearScanTouched(): number[] {
  const touched: number[] = [];
  for (let i = 0; i < KEYS.length; i++) {
    touched.push(i);
    if (KEYS[i] === TARGET) break;
  }
  return touched;
}

function binarySearchTouched(): number[] {
  const touched: number[] = [];
  let lo = 0;
  let hi = KEYS.length - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    touched.push(mid);
    if (KEYS[mid] === TARGET) break;
    if (KEYS[mid] < TARGET) lo = mid + 1;
    else hi = mid - 1;
  }
  return touched;
}

const NODE_SIZE = 40;
const GAP = 6;

export default function IndexingDiagram() {
  const [mode, setMode] = useState<Mode>("scan");

  const touched = mode === "scan" ? linearScanTouched() : binarySearchTouched();
  const touchedSet = new Set(touched);

  return (
    <div>
      <div className="diagram-toggle-group" role="tablist" aria-label="Lookup strategy">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "scan"}
          className={`diagram-toggle${mode === "scan" ? " diagram-toggle--active" : ""}`}
          onClick={() => setMode("scan")}
        >
          Full Table Scan
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "index"}
          className={`diagram-toggle${mode === "index" ? " diagram-toggle--active" : ""}`}
          onClick={() => setMode("index")}
        >
          Indexed Lookup (B-Tree)
        </button>
      </div>

      <svg
        viewBox={`0 0 ${KEYS.length * (NODE_SIZE + GAP)} 60`}
        width="100%"
        role="img"
        aria-label={`Rows examined while searching for key ${TARGET}`}
      >
        {KEYS.map((key, i) => (
          <Node
            key={key}
            x={i * (NODE_SIZE + GAP)}
            y={0}
            width={NODE_SIZE}
            height={NODE_SIZE}
            label={String(key)}
            state={touchedSet.has(i) ? (mode === "scan" ? "warning" : "healthy") : "neutral"}
          />
        ))}
      </svg>

      <p
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "var(--text-sm)",
          color: "var(--diagram-text-muted)",
          margin: "8px 0 0",
        }}
      >
        Searching for key {TARGET}: {mode === "scan" ? (
          <>a full scan compares <strong style={{ color: "var(--diagram-text)" }}>{touched.length} of {KEYS.length}</strong> rows, one by one, until it finds a match — O(n).</>
        ) : (
          <>a B-tree index compares only <strong style={{ color: "var(--diagram-text)" }}>{touched.length} of {KEYS.length}</strong> rows by halving the search range each step — O(log n).</>
        )}
      </p>
    </div>
  );
}

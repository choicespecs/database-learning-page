import { useState } from "react";
import { Node } from "./primitives/Node";
import { InfoPanel } from "./primitives/InfoPanel";

const PROPERTIES = [
  {
    id: "atomicity",
    label: "Atomicity",
    note: "All of a transaction's writes happen, or none do. If a transfer debits one account and crashes before crediting the other, the whole transaction rolls back — the debit never happened either.",
  },
  {
    id: "consistency",
    label: "Consistency",
    note: "A transaction moves the database from one valid state to another, respecting every constraint (foreign keys, uniqueness, application invariants). This one is mostly on the application — the database enforces the constraints it's told about.",
  },
  {
    id: "isolation",
    label: "Isolation",
    note: "Concurrent transactions don't see each other's half-finished work — each one behaves as if it ran alone, even though many are running at once. Exactly how strictly this holds depends on the isolation level.",
  },
  {
    id: "durability",
    label: "Durability",
    note: "Once a transaction commits, it survives a crash — typically because it was written to a write-ahead log on disk before the client was told 'success'.",
  },
];

const NODE_WIDTH = 150;
const NODE_HEIGHT = 56;
const NODE_GAP = 30;

export default function AcidDiagram() {
  const [selected, setSelected] = useState<string | null>(null);
  const selectedProp = PROPERTIES.find((p) => p.id === selected) ?? null;
  const viewWidth = PROPERTIES.length * (NODE_WIDTH + NODE_GAP) - NODE_GAP + 20;

  return (
    <div>
      <svg viewBox={`0 0 ${viewWidth} 76`} width="100%" role="img" aria-label="ACID properties">
        {PROPERTIES.map((p, i) => (
          <Node
            key={p.id}
            x={i * (NODE_WIDTH + NODE_GAP)}
            y={0}
            width={NODE_WIDTH}
            height={NODE_HEIGHT}
            label={p.label}
            state={selected === p.id ? "healthy" : "neutral"}
            onClick={() => setSelected(p.id)}
          />
        ))}
      </svg>

      <InfoPanel
        label={selectedProp?.label ?? null}
        content={selectedProp?.note ?? null}
        hint="Click a letter to see what it actually guarantees."
      />
    </div>
  );
}

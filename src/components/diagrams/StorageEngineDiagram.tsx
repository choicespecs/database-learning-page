import { useState } from "react";
import { Node } from "./primitives/Node";
import { Arrow } from "./primitives/Arrow";
import { InfoPanel } from "./primitives/InfoPanel";

type Engine = "btree" | "lsm";

interface StageSpec {
  id: string;
  label: string;
  note: string;
}

const STAGES: Record<Engine, StageSpec[]> = {
  btree: [
    { id: "write", label: "Write", note: "A write comes in with a new or updated row." },
    {
      id: "page",
      label: "B-Tree Page",
      note: "The engine finds the exact on-disk page the key belongs on and updates it in place. This means random I/O — the page could be anywhere on disk — but reads are simple: there's only ever one copy of each key.",
    },
  ],
  lsm: [
    { id: "write", label: "Write", note: "A write comes in with a new or updated row." },
    {
      id: "memtable",
      label: "Memtable",
      note: "The write is appended to an in-memory sorted structure. Appending is sequential and fast — no seeking to find the right page.",
    },
    {
      id: "sstable",
      label: "SSTable",
      note: "Once the memtable fills up, it's flushed to disk as an immutable, sorted file (an SSTable). Old versions of a key may now exist in multiple SSTables.",
    },
    {
      id: "compaction",
      label: "Compaction",
      note: "A background process merges SSTables, discarding overwritten/deleted keys. This keeps read amplification (how many files a read might check) bounded over time.",
    },
  ],
};

const NODE_WIDTH = 150;
const NODE_HEIGHT = 56;
const NODE_GAP = 60;
const ROW_Y = 20;

export default function StorageEngineDiagram() {
  const [engine, setEngine] = useState<Engine>("btree");
  const [selected, setSelected] = useState<string | null>(null);

  const stages = STAGES[engine];
  const maxStages = Math.max(STAGES.btree.length, STAGES.lsm.length);
  const viewWidth = maxStages * (NODE_WIDTH + NODE_GAP) - NODE_GAP + 20;
  const viewHeight = ROW_Y + NODE_HEIGHT + 30;
  const rowWidth = stages.length * (NODE_WIDTH + NODE_GAP) - NODE_GAP;
  const offsetX = (viewWidth - 20 - rowWidth) / 2;

  const xById = Object.fromEntries(stages.map((s, i) => [s.id, offsetX + i * (NODE_WIDTH + NODE_GAP)]));

  const selectedStage = stages.find((s) => s.id === selected) ?? null;

  return (
    <div>
      <div className="diagram-toggle-group" role="tablist" aria-label="Storage engine">
        <button
          type="button"
          role="tab"
          aria-selected={engine === "btree"}
          className={`diagram-toggle${engine === "btree" ? " diagram-toggle--active" : ""}`}
          onClick={() => {
            setEngine("btree");
            setSelected(null);
          }}
        >
          B-Tree
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={engine === "lsm"}
          className={`diagram-toggle${engine === "lsm" ? " diagram-toggle--active" : ""}`}
          onClick={() => {
            setEngine("lsm");
            setSelected(null);
          }}
        >
          LSM-Tree
        </button>
      </div>

      <svg viewBox={`0 0 ${viewWidth} ${viewHeight}`} width="100%" role="img" aria-label={`${engine === "btree" ? "B-tree" : "LSM-tree"} write path`}>
        {stages.slice(1).map((s, i) => {
          const prev = stages[i];
          return (
            <Arrow
              key={s.id}
              x1={xById[prev.id] + NODE_WIDTH}
              y1={ROW_Y + NODE_HEIGHT / 2}
              x2={xById[s.id]}
              y2={ROW_Y + NODE_HEIGHT / 2}
            />
          );
        })}
        {stages.map((s) => (
          <Node
            key={s.id}
            x={xById[s.id]}
            y={ROW_Y}
            width={NODE_WIDTH}
            height={NODE_HEIGHT}
            label={s.label}
            onClick={() => setSelected(s.id)}
          />
        ))}
      </svg>

      <InfoPanel
        label={selectedStage?.label ?? null}
        content={selectedStage?.note ?? null}
        hint="Click a stage to see what happens there."
      />
    </div>
  );
}

import { useState } from "react";
import { Node } from "./primitives/Node";
import { Arrow } from "./primitives/Arrow";

type Mode = "range" | "hash";

const KEYS = ["2024-06-01", "2024-06-02", "2024-06-03", "2024-06-04"];
const PARTITION_COUNT = 4;

function hashKey(key: string): number {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return h % PARTITION_COUNT;
}

const keyY = (i: number) => 12 + i * 46;
const partY = (p: number) => 12 + p * 46;

export default function PartitioningDiagram() {
  const [mode, setMode] = useState<Mode>("range");

  // Sequential timestamp keys all fall in the newest key range under range
  // partitioning — that clustering is exactly what causes a write hotspot.
  const assignments = KEYS.map((key) => ({
    key,
    partition: mode === "range" ? 0 : hashKey(key),
  }));

  const counts = Array.from({ length: PARTITION_COUNT }, (_, p) =>
    assignments.filter((a) => a.partition === p).length,
  );

  return (
    <div>
      <div className="diagram-toggle-group" role="tablist" aria-label="Partitioning strategy">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "range"}
          className={`diagram-toggle${mode === "range" ? " diagram-toggle--active" : ""}`}
          onClick={() => setMode("range")}
        >
          Key Range
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "hash"}
          className={`diagram-toggle${mode === "hash" ? " diagram-toggle--active" : ""}`}
          onClick={() => setMode("hash")}
        >
          Hash
        </button>
      </div>

      <svg viewBox="0 0 560 200" width="100%" role="img" aria-label={`${mode === "range" ? "Key range" : "Hash"} partitioning`}>
        {KEYS.map((key, i) => (
          <Node key={key} x={0} y={keyY(i)} width={150} height={36} label={key} />
        ))}
        {assignments.map((a, i) => (
          <Arrow
            key={a.key}
            x1={150}
            y1={keyY(i) + 18}
            x2={400}
            y2={partY(a.partition) + 18}
            state={counts[a.partition] > 1 ? "warning" : "healthy"}
          />
        ))}
        {Array.from({ length: PARTITION_COUNT }).map((_, p) => (
          <Node
            key={p}
            x={400}
            y={partY(p)}
            width={150}
            height={36}
            label={`Partition ${p}`}
            sublabel={counts[p] > 1 ? `${counts[p]} keys — hot` : `${counts[p]} key${counts[p] === 1 ? "" : "s"}`}
            state={counts[p] > 1 ? "warning" : counts[p] === 1 ? "healthy" : "neutral"}
          />
        ))}
      </svg>

      <p style={{ fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", color: "var(--diagram-text-muted)", margin: "8px 0 0" }}>
        {mode === "range"
          ? "Sequential, timestamp-prefixed keys always fall into whichever range is 'newest' — every write lands on the same partition, creating a hotspot no matter how many partitions exist."
          : "Hashing the key spreads writes evenly across partitions — the hotspot disappears, but you lose the ability to efficiently scan a contiguous key range in one place."}
      </p>
    </div>
  );
}

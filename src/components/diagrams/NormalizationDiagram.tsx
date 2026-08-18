import { useState } from "react";
import { Node } from "./primitives/Node";
import { Arrow } from "./primitives/Arrow";
import { InfoPanel } from "./primitives/InfoPanel";

type Stage = "unf" | "1nf" | "2nf" | "3nf";

const STAGE_ORDER: Stage[] = ["unf", "1nf", "2nf", "3nf"];
const STAGE_LABELS: Record<Stage, string> = {
  unf: "Unnormalized",
  "1nf": "1NF",
  "2nf": "2NF",
  "3nf": "3NF",
};

interface TableSpec {
  id: string;
  label: string;
  fields: string[];
  note: string;
}

interface StageSpec {
  tables: TableSpec[];
  arrows: { from: string; to: string; label: string }[];
}

const STAGES: Record<Stage, StageSpec> = {
  unf: {
    tables: [
      {
        id: "orders",
        label: "Orders",
        fields: ["order_id (PK)", "customer_name", "customer_email", "products (repeating group)"],
        note: "One row per order crams a repeating list of products into a single field — you can't query 'how many orders included product X' without parsing text. This violates 1NF, which requires atomic, single-valued fields.",
      },
    ],
    arrows: [],
  },
  "1nf": {
    tables: [
      {
        id: "orders",
        label: "Orders",
        fields: ["order_id (PK)", "customer_name", "customer_email"],
        note: "The repeating group is gone — every field now holds a single atomic value, satisfying 1NF.",
      },
      {
        id: "order_items",
        label: "OrderItems",
        fields: ["order_id (FK)", "product_name", "price", "qty"],
        note: "One row per product per order. Still redundant: product_name and price repeat every time the same product is ordered.",
      },
    ],
    arrows: [{ from: "order_items", to: "orders", label: "order_id" }],
  },
  "2nf": {
    tables: [
      {
        id: "orders",
        label: "Orders",
        fields: ["order_id (PK)", "customer_name", "customer_email"],
        note: "Unchanged from 1NF.",
      },
      {
        id: "order_items",
        label: "OrderItems",
        fields: ["order_id (FK)", "product_id (FK)", "qty"],
        note: "Now only holds facts that depend on the whole composite key (order_id + product_id): quantity.",
      },
      {
        id: "products",
        label: "Products",
        fields: ["product_id (PK)", "product_name", "price"],
        note: "product_name and price depend only on product_id, not the full composite key — that partial dependency is exactly what 2NF removes.",
      },
    ],
    arrows: [
      { from: "order_items", to: "orders", label: "order_id" },
      { from: "order_items", to: "products", label: "product_id" },
    ],
  },
  "3nf": {
    tables: [
      {
        id: "customers",
        label: "Customers",
        fields: ["customer_id (PK)", "customer_name", "customer_email"],
        note: "customer_name and customer_email depended on customer_id, not directly on order_id — that transitive dependency (order_id → customer_id → name) is what 3NF removes.",
      },
      {
        id: "orders",
        label: "Orders",
        fields: ["order_id (PK)", "customer_id (FK)"],
        note: "Now just a pure link between a customer and their items — no non-key field depends on anything but order_id.",
      },
      {
        id: "order_items",
        label: "OrderItems",
        fields: ["order_id (FK)", "product_id (FK)", "qty"],
        note: "Unchanged from 2NF.",
      },
      {
        id: "products",
        label: "Products",
        fields: ["product_id (PK)", "product_name", "price"],
        note: "Unchanged from 2NF.",
      },
    ],
    arrows: [
      { from: "orders", to: "customers", label: "customer_id" },
      { from: "order_items", to: "orders", label: "order_id" },
      { from: "order_items", to: "products", label: "product_id" },
    ],
  },
};

const NODE_WIDTH = 150;
const NODE_HEIGHT = 56;
const NODE_GAP = 90;
const ROW_Y = 40;

export default function NormalizationDiagram() {
  const [stage, setStage] = useState<Stage>("unf");
  const [selected, setSelected] = useState<string | null>(null);

  const spec = STAGES[stage];
  const prevStage = STAGE_ORDER[STAGE_ORDER.indexOf(stage) - 1];
  const prevIds = new Set(prevStage ? STAGES[prevStage].tables.map((t) => t.id) : []);

  const ids = spec.tables.map((t) => t.id);
  const maxTables = Math.max(...STAGE_ORDER.map((s) => STAGES[s].tables.length));
  // Fixed viewBox sized for the widest stage — otherwise a single-table stage
  // gets a tiny viewBox that `width="100%"` scales up into oversized text.
  const viewWidth = maxTables * (NODE_WIDTH + NODE_GAP) - NODE_GAP + 20;
  const viewHeight = ROW_Y + NODE_HEIGHT + 30;
  const rowWidth = ids.length * (NODE_WIDTH + NODE_GAP) - NODE_GAP;
  const offsetX = (viewWidth - 20 - rowWidth) / 2;

  const xById = Object.fromEntries(ids.map((id, i) => [id, offsetX + i * (NODE_WIDTH + NODE_GAP)]));
  const idxById = Object.fromEntries(ids.map((id, i) => [id, i]));

  function edgeX(id: string, otherId: string) {
    return idxById[otherId] > idxById[id] ? xById[id] + NODE_WIDTH : xById[id];
  }

  const selectedTable = spec.tables.find((t) => t.id === selected) ?? null;

  return (
    <div>
      <div className="diagram-toggle-group" role="tablist" aria-label="Normal form">
        {STAGE_ORDER.map((s) => (
          <button
            key={s}
            type="button"
            role="tab"
            aria-selected={stage === s}
            className={`diagram-toggle${stage === s ? " diagram-toggle--active" : ""}`}
            onClick={() => {
              setStage(s);
              setSelected(null);
            }}
          >
            {STAGE_LABELS[s]}
          </button>
        ))}
      </div>

      <svg
        viewBox={`0 0 ${viewWidth} ${viewHeight}`}
        width="100%"
        role="img"
        aria-label={`Tables at ${STAGE_LABELS[stage]}`}
      >
        {spec.arrows.map((a, i) => (
          <Arrow
            key={i}
            x1={edgeX(a.from, a.to)}
            y1={ROW_Y + NODE_HEIGHT / 2}
            x2={edgeX(a.to, a.from)}
            y2={ROW_Y + NODE_HEIGHT / 2}
            label={a.label}
          />
        ))}
        {spec.tables.map((t) => (
          <Node
            key={t.id}
            x={xById[t.id]}
            y={ROW_Y}
            width={NODE_WIDTH}
            height={NODE_HEIGHT}
            label={t.label}
            sublabel={t.fields[0]}
            state={!prevIds.has(t.id) && prevStage ? "healthy" : "neutral"}
            onClick={() => setSelected(t.id)}
          />
        ))}
      </svg>

      <InfoPanel
        label={selectedTable?.label ?? null}
        content={selectedTable ? `Columns: ${selectedTable.fields.join(", ")}. ${selectedTable.note}` : null}
        hint="Click a table to see its columns and why it looks this way."
      />

      <div className="diagram-legend">
        <div className="diagram-legend__item">
          <span className="diagram-legend__swatch" style={{ background: "var(--diagram-state-healthy)" }} />
          Table newly split out at this stage
        </div>
      </div>
    </div>
  );
}

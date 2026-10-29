import { MarkerType } from "@xyflow/react";
import type { Edge, Node } from "@xyflow/react";

export type Shape = "rectangle" | "ellipse" | "diamond";
export type DiagramNode = Node<
  {
    label: string;
    shape: Shape;
    colour: string;
    symbol?: "browser" | "gateway" | "server" | "database" | "queue";
    caption?: string;
  },
  "shape"
>;
export type Diagram = { name: string; nodes: DiagramNode[]; edges: Edge[] };

export const storageKey = "diagram-creator:v1";
export const colours = [
  "#ffffff",
  "#e1f4ef",
  "#e1effa",
  "#fff1cb",
  "#fce5e9",
  "#eee9fa",
];
export const edgeStyle = {
  type: "smoothstep",
  style: {
    stroke: "var(--edge-stroke, #697984)",
    strokeWidth: "var(--edge-width, 1.6px)",
  },
  markerEnd: { type: MarkerType.ArrowClosed, color: "#697984" },
  labelStyle: { fill: "#52616b", fontSize: 11 },
  labelBgStyle: { fill: "#ffffff" },
  labelBgPadding: [8, 5] as [number, number],
  labelBgBorderRadius: 4,
};

export function blankDiagram(): Diagram {
  return { name: "Untitled diagram", nodes: [], edges: [] };
}

export function exampleDiagram(): Diagram {
  const nodes: DiagramNode[] = [
    {
      id: "browser",
      type: "shape",
      position: { x: 40, y: 180 },
      data: {
        label: "Web client",
        shape: "rectangle",
        colour: colours[2],
        symbol: "browser",
        caption: "PRESENTATION",
      },
      style: { width: 170, height: 110 },
    },
    {
      id: "gateway",
      type: "shape",
      position: { x: 310, y: 180 },
      data: {
        label: "API gateway",
        shape: "rectangle",
        colour: colours[1],
        symbol: "gateway",
        caption: "ROUTING",
      },
      style: { width: 170, height: 110 },
    },
    {
      id: "api",
      type: "shape",
      position: { x: 590, y: 65 },
      data: {
        label: "Core service",
        shape: "rectangle",
        colour: colours[0],
        symbol: "server",
        caption: "APPLICATION",
      },
      style: { width: 170, height: 110 },
    },
    {
      id: "worker",
      type: "shape",
      position: { x: 590, y: 315 },
      data: {
        label: "Job worker",
        shape: "rectangle",
        colour: colours[3],
        symbol: "queue",
        caption: "BACKGROUND",
      },
      style: { width: 170, height: 110 },
    },
    {
      id: "database",
      type: "shape",
      position: { x: 880, y: 180 },
      data: {
        label: "PostgreSQL",
        shape: "ellipse",
        colour: colours[4],
        symbol: "database",
        caption: "PERSISTENCE",
      },
      style: { width: 175, height: 120 },
    },
  ];
  const edges = [
    {
      id: "client-gateway",
      source: "browser",
      target: "gateway",
      label: "HTTPS",
    },
    { id: "gateway-api", source: "gateway", target: "api", label: "REST" },
    {
      id: "gateway-worker",
      source: "gateway",
      target: "worker",
      label: "Events",
    },
    { id: "api-database", source: "api", target: "database", label: "SQL" },
    { id: "worker-database", source: "worker", target: "database" },
  ].map((edge) => ({ ...edgeStyle, ...edge }));
  return { name: "Service architecture", nodes, edges };
}

export function snapshot(diagram: Diagram): Diagram {
  return {
    name: diagram.name,
    nodes: diagram.nodes.map(({ id, type, position, data, style }) => ({
      id,
      type,
      position: { ...position },
      data: { ...data },
      style: { ...style },
    })),
    edges: diagram.edges.map(({ selected: _selected, ...edge }) => ({
      ...edge,
    })),
  };
}

export function readSaved(): {
  diagram: Diagram;
  saved: boolean;
  error?: string;
} {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return { diagram: exampleDiagram(), saved: false };
    const stored = JSON.parse(raw);
    if (
      stored.version !== 1 ||
      typeof stored.diagram?.name !== "string" ||
      !Array.isArray(stored.diagram.nodes) ||
      !Array.isArray(stored.diagram.edges)
    )
      throw new Error("Invalid document");
    const diagram = stored.diagram as Diagram;
    for (const node of diagram.nodes) {
      if (
        typeof node.id !== "string" ||
        !Number.isFinite(node.position?.x) ||
        !Number.isFinite(node.position?.y) ||
        typeof node.data?.label !== "string" ||
        !["rectangle", "ellipse", "diamond"].includes(node.data.shape)
      )
        throw new Error("Invalid shape");
    }
    const ids = new Set(diagram.nodes.map((node) => node.id));
    if (
      diagram.edges.some(
        (edge) => !ids.has(edge.source) || !ids.has(edge.target),
      )
    )
      throw new Error("Invalid connector");
    return { diagram, saved: true };
  } catch {
    return {
      diagram: exampleDiagram(),
      saved: false,
      error: "Saved diagram could not be opened.",
    };
  }
}

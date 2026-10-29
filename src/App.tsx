import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  ConnectionMode,
  Handle,
  Position,
  NodeResizer,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  useReactFlow,
} from "@xyflow/react";
import type {
  Connection,
  EdgeChange,
  NodeChange,
  NodeProps,
} from "@xyflow/react";
import {
  ArrowDownToLine,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  Circle,
  Diamond,
  FilePlus2,
  GitBranch,
  Hand,
  Layers2,
  Maximize,
  Minus,
  MousePointer2,
  Plus,
  Redo2,
  Save,
  Search,
  Shapes,
  Square,
  Trash2,
  Undo2,
  Workflow,
} from "lucide-react";
import { toPng } from "html-to-image";
import exportFont from "@fontsource/dm-sans/files/dm-sans-latin-400-normal.woff2?inline";
import {
  blankDiagram,
  colours,
  edgeStyle,
  exampleDiagram,
  readSaved,
  snapshot,
  storageKey,
} from "./model";
import type { Diagram, DiagramNode, Shape } from "./model";
import { IconGlyph, findIcon, iconPacks, matchesIcon } from "./icons";
import "@xyflow/react/dist/style.css";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/600.css";
import "@fontsource/space-grotesk/500.css";
import "./styles.css";

function ShapeNode({ data, selected }: NodeProps<DiagramNode>) {
  return (
    <>
      <NodeResizer
        isVisible={selected}
        minWidth={100}
        minHeight={70}
        color="#118777"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="legacy-target"
        isConnectable={false}
      />
      <div
        className={`diagram-shape ${data.shape}`}
        style={{ "--shape-colour": data.colour } as CSSProperties}
      >
        <div className="shape-content">
          <IconGlyph id={data.symbol} />
          {data.caption && (
            <span className="shape-caption">{data.caption}</span>
          )}
          <span className="shape-label">{data.label}</span>
        </div>
      </div>
      <Handle
        id="right"
        type="source"
        position={Position.Right}
        title="Connect arrow from or to right"
        aria-label="Right connection handle"
      />
      <Handle
        id="left"
        type="source"
        position={Position.Left}
        title="Connect arrow from or to left"
        aria-label="Left connection handle"
      />
      <Handle
        id="top"
        type="source"
        position={Position.Top}
        title="Connect arrow from or to top"
        aria-label="Top connection handle"
      />
      <Handle
        id="bottom"
        type="source"
        position={Position.Bottom}
        title="Connect arrow from or to bottom"
        aria-label="Bottom connection handle"
      />
    </>
  );
}

const nodeTypes = { shape: ShapeNode };

function ToolButton({
  label,
  children,
  active,
  ...props
}: {
  label: string;
  children: ReactNode;
  active?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`icon-button ${active ? "active" : ""}`}
      aria-label={label}
      title={label}
      {...props}
    >
      {children}
    </button>
  );
}

function Field({
  label,
  value,
  onCommit,
  numeric = false,
  min,
  max,
}: {
  label: string;
  value: string | number;
  onCommit: (value: string) => void;
  numeric?: boolean;
  min?: number;
  max?: number;
}) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);
  return (
    <label className="field">
      <span>{label}</span>
      <input
        aria-label={label}
        value={draft}
        type={numeric ? "number" : "text"}
        min={min}
        max={max}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => {
          if (numeric && (!draft.trim() || !Number.isFinite(Number(draft)))) {
            setDraft(String(value));
            return;
          }
          if (numeric) {
            const clamped = Math.max(
              min ?? -10000,
              Math.min(max ?? 10000, Number(draft)),
            );
            setDraft(String(clamped));
            if (String(clamped) !== String(value)) onCommit(String(clamped));
          } else if (draft !== String(value)) onCommit(draft);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
        }}
      />
    </label>
  );
}

function Editor() {
  const [initial] = useState(readSaved);
  const [diagram, setDiagram] = useState(initial.diagram);
  const diagramRef = useRef(diagram);
  diagramRef.current = diagram;
  const [dirty, setDirty] = useState(!initial.saved);
  const [message, setMessage] = useState(
    initial.error ??
      (initial.saved ? "Saved in this browser" : "Unsaved changes"),
  );
  const [tool, setTool] = useState<"select" | "pan">("select");
  const [target, setTarget] = useState("");
  const [exporting, setExporting] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [iconQuery, setIconQuery] = useState("");
  const history = useRef<{ past: Diagram[]; future: Diagram[] }>({
    past: [],
    future: [],
  });
  const resizing = useRef(false);
  const flow = useReactFlow<DiagramNode>();
  const canvas = useRef<HTMLDivElement>(null);
  const selectedNode = diagram.nodes.find((node) => node.selected);
  const selectedEdge = diagram.edges.find((edge) => edge.selected);

  function checkpoint() {
    history.current.past.push(snapshot(diagramRef.current));
    if (history.current.past.length > 100) history.current.past.shift();
    history.current.future = [];
    setDirty(true);
    setMessage("Unsaved changes");
  }

  function edit(update: (current: Diagram) => Diagram) {
    checkpoint();
    setDiagram((current) => update(current));
  }

  function undo() {
    const previous = history.current.past.pop();
    if (!previous) return;
    history.current.future.push(snapshot(diagramRef.current));
    setDiagram(previous);
    setDirty(true);
    setMessage("Unsaved changes");
  }

  function redo() {
    const next = history.current.future.pop();
    if (!next) return;
    history.current.past.push(snapshot(diagramRef.current));
    setDiagram(next);
    setDirty(true);
    setMessage("Unsaved changes");
  }

  function save() {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ version: 1, diagram: snapshot(diagramRef.current) }),
      );
      setDirty(false);
      setMessage("Saved in this browser");
    } catch {
      setMessage("Could not save. Browser storage may be full or unavailable.");
    }
  }

  function removeSelection() {
    const current = diagramRef.current;
    const ids = new Set(
      current.nodes.filter((node) => node.selected).map((node) => node.id),
    );
    if (!ids.size && !current.edges.some((edge) => edge.selected)) return;
    edit((doc) => ({
      ...doc,
      nodes: doc.nodes.filter((node) => !ids.has(node.id)),
      edges: doc.edges.filter(
        (edge) =>
          !edge.selected && !ids.has(edge.source) && !ids.has(edge.target),
      ),
    }));
  }

  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      const input =
        event.target instanceof HTMLElement &&
        (event.target.matches("input, textarea, select") ||
          event.target.isContentEditable);
      if (input) return;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        save();
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
      }
      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        removeSelection();
      }
      if (event.key === "Escape")
        setDiagram((doc) => ({
          ...doc,
          nodes: doc.nodes.map((node) => ({ ...node, selected: false })),
          edges: doc.edges.map((edge) => ({ ...edge, selected: false })),
        }));
    };
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (dirty) event.preventDefault();
    };
    window.addEventListener("keydown", keydown);
    window.addEventListener("beforeunload", beforeUnload);
    return () => {
      window.removeEventListener("keydown", keydown);
      window.removeEventListener("beforeunload", beforeUnload);
    };
  });

  function addShape(shape: Shape, symbol?: string) {
    const count = diagram.nodes.length;
    const viewport = flow.getViewport();
    const centre = flow.screenToFlowPosition({
      x: (canvas.current?.getBoundingClientRect().left ?? 220) + 115,
      y: (canvas.current?.getBoundingClientRect().top ?? 120) + 110,
    });
    const node: DiagramNode = {
      id: crypto.randomUUID(),
      type: "shape",
      position: {
        x: Math.round(centre.x + ((count % 3) * 245) / viewport.zoom),
        y: Math.round(centre.y + (Math.floor(count / 3) * 170) / viewport.zoom),
      },
      data: {
        shape,
        label:
          findIcon(symbol)?.label ?? shape[0].toUpperCase() + shape.slice(1),
        colour: colours[0],
        ...(symbol && { symbol }),
      },
      style: { width: 176, height: 100 },
      selected: true,
    };
    edit((doc) => ({
      ...doc,
      nodes: [
        ...doc.nodes.map((existing) => ({ ...existing, selected: false })),
        node,
      ],
      edges: doc.edges.map((edge) => ({ ...edge, selected: false })),
    }));
    setTool("select");
    setTarget("");
  }

  function onNodesChange(changes: NodeChange<DiagramNode>[]) {
    if (
      changes.some(
        (change) => change.type === "dimensions" && change.resizing,
      ) &&
      !resizing.current
    ) {
      checkpoint();
      resizing.current = true;
    }
    if (
      changes.some(
        (change) => change.type === "dimensions" && change.resizing === false,
      )
    )
      resizing.current = false;
    setDiagram((doc) => ({
      ...doc,
      nodes: applyNodeChanges(changes, doc.nodes).map((node) => {
        const change = changes.find(
          (change) =>
            change.type === "dimensions" &&
            change.id === node.id &&
            change.resizing !== undefined,
        );
        if (change?.type !== "dimensions" || !change.dimensions) return node;
        return {
          ...node,
          style: {
            ...node.style,
            width: change.dimensions.width,
            height: change.dimensions.height,
          },
        };
      }),
    }));
  }

  function onEdgesChange(changes: EdgeChange[]) {
    setDiagram((doc) => ({
      ...doc,
      edges: applyEdgeChanges(changes, doc.edges),
    }));
  }

  function connect(connection: Connection) {
    if (connection.source === connection.target) return;
    edit((doc) => ({
      ...doc,
      edges: addEdge(
        { ...edgeStyle, ...connection, id: crypto.randomUUID() },
        doc.edges,
      ),
    }));
    setTarget("");
  }

  function updateNode(update: Partial<DiagramNode>) {
    if (!selectedNode) return;
    edit((doc) => ({
      ...doc,
      nodes: doc.nodes.map((node) =>
        node.id === selectedNode.id ? { ...node, ...update } : node,
      ),
    }));
  }

  function reset(example = false) {
    if (
      dirty &&
      !window.confirm(
        "Replace the current diagram? Unsaved changes will be lost.",
      )
    )
      return;
    edit(() => (example ? exampleDiagram() : blankDiagram()));
    setTarget("");
    if (example)
      requestAnimationFrame(() => {
        void flow.fitView({ padding: 0.18, duration: 200 });
      });
    else void flow.setViewport({ x: 0, y: 0, zoom: 1 });
  }

  async function exportPng() {
    if (!diagram.nodes.length || exporting) return;
    setExporting(true);
    try {
      await document.fonts.ready;
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      );
      const bounds = flow.getNodesBounds(diagram.nodes);
      const width = Math.ceil(bounds.width + 120);
      const height = Math.ceil(bounds.height + 120);
      if (width > 16000 || height > 16000 || width * height > 50000000)
        throw new Error("Diagram too large");
      const viewport = canvas.current?.querySelector<HTMLElement>(
        ".react-flow__viewport",
      );
      if (!viewport) throw new Error("Canvas unavailable");
      const image = await toPng(viewport, {
        backgroundColor: "#ffffff",
        width,
        height,
        pixelRatio: 2,
        fontEmbedCSS: `@font-face { font-family: 'DM Sans'; font-style: normal; font-weight: 100 900; src: url('${exportFont}') format('woff2'); }`,
        style: {
          width: `${width}px`,
          height: `${height}px`,
          transform: `translate(${60 - bounds.x}px, ${60 - bounds.y}px) scale(1)`,
        },
        filter: (element) =>
          !(
            element instanceof HTMLElement &&
            (element.classList.contains("react-flow__handle") ||
              element.classList.contains("react-flow__resize-control"))
          ),
      });
      const link = document.createElement("a");
      link.href = image;
      link.download = `${
        diagram.name
          .trim()
          .replace(/[^a-zA-Z0-9_-]+/g, "-")
          .replace(/^-|-$/g, "") || "diagram"
      }.png`;
      link.click();
      setMessage("PNG exported");
    } catch {
      setMessage("PNG export failed. Try a smaller diagram.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className={`app ${exporting ? "exporting" : ""}`}>
      <header className="app-header">
        <a
          className="brand"
          href={import.meta.env.BASE_URL}
          aria-label="Diagram Creator"
        >
          <span className="brand-mark">
            <Workflow size={23} />
          </span>
          <span>
            diagram<span className="brand-light">creator</span>
          </span>
        </a>
        <div className="document-title">
          <span className="workspace-name">Personal workspace</span>
          <ChevronRight size={14} />
          <input
            aria-label="Diagram name"
            value={diagram.name}
            onChange={(event) =>
              edit((doc) => ({ ...doc, name: event.target.value }))
            }
          />
        </div>
        <div className="header-actions">
          <button
            className="button save-button"
            aria-label="Save diagram"
            title="Save diagram"
            onClick={save}
          >
            <Save size={16} />
            <span>Save</span>
          </button>
          <button
            className="button primary"
            aria-label="Export PNG"
            onClick={() => void exportPng()}
            disabled={!diagram.nodes.length || exporting}
          >
            <ArrowDownToLine size={16} />
            <span>{exporting ? "Exporting..." : "Export PNG"}</span>
          </button>
        </div>
      </header>

      <aside className="library">
        <div className="sidebar-heading">
          <span>Library</span>
          <Shapes size={16} />
        </div>
        <div className="library-section">
          <span className="section-label">BASIC SHAPES</span>
          <ChevronDown size={13} />
        </div>
        <div className="shape-library">
          <button
            onClick={() => addShape("rectangle")}
            aria-label="Add rectangle"
          >
            <span className="shape-preview">
              <Square size={28} strokeWidth={1.4} />
            </span>
            <span>Rectangle</span>
            <Plus size={14} />
          </button>
          <button onClick={() => addShape("ellipse")} aria-label="Add ellipse">
            <span className="shape-preview">
              <Circle size={28} strokeWidth={1.4} />
            </span>
            <span>Ellipse</span>
            <Plus size={14} />
          </button>
          <button onClick={() => addShape("diamond")} aria-label="Add diamond">
            <span className="shape-preview">
              <Diamond size={28} strokeWidth={1.4} />
            </span>
            <span>Diamond</span>
            <Plus size={14} />
          </button>
        </div>
        <div className="library-section second-section">
          <span className="section-label">DOCUMENT</span>
        </div>
        <button
          className="sidebar-command"
          aria-label="New diagram"
          title="New diagram"
          onClick={() => reset()}
        >
          <FilePlus2 size={16} />
          <span>New diagram</span>
        </button>
        <button
          className="sidebar-command"
          aria-label="Service architecture"
          title="Service architecture"
          onClick={() => reset(true)}
        >
          <Workflow size={16} />
          <span>Service architecture</span>
        </button>
        <div className="library-section second-section">
          <span className="section-label">ICON PACKS</span>
        </div>
        <label className="icon-search">
          <Search size={14} />
          <input
            type="search"
            aria-label="Search icons"
            placeholder="Search icons"
            value={iconQuery}
            onChange={(event) => setIconQuery(event.target.value)}
          />
        </label>
        {iconPacks.map((pack) => {
          const icons = pack.icons.filter((icon) =>
            matchesIcon(icon, iconQuery.trim()),
          );
          return (
            <section
              key={pack.id}
              className="icon-pack"
              role="group"
              aria-label={`${pack.name} icons`}
            >
              <div className="icon-pack-heading">
                <span>{pack.name}</span>
                <span className="icon-pack-licence">
                  {pack.source} · {pack.licence}
                </span>
              </div>
              {icons.length ? (
                <div className="icon-grid">
                  {icons.map((icon) => (
                    <button
                      key={icon.id}
                      aria-label={`Add ${icon.label} icon`}
                      title={icon.label}
                      data-slug={icon.simple?.slug}
                      onClick={() => addShape("rectangle", icon.id)}
                    >
                      <IconGlyph id={icon.id} size={20} />
                    </button>
                  ))}
                </div>
              ) : (
                <span className="icon-empty">No matching icons</span>
              )}
            </section>
          );
        })}
        <div className="library-footer">
          <span className="workspace-dot" />
          <span>Local workspace</span>
        </div>
      </aside>

      <main className="canvas-area" ref={canvas} aria-label="Diagram canvas">
        <div className="canvas-caption">
          <span className="canvas-dot" />
          {diagram.name || "Untitled diagram"}
          <span className="draft-tag">{dirty ? "Draft" : "Saved"}</span>
        </div>
        <div
          className="canvas-toolbar"
          role="toolbar"
          aria-label="Drawing tools"
        >
          <ToolButton
            label="Select"
            active={tool === "select"}
            onClick={() => setTool("select")}
          >
            <MousePointer2 size={18} />
          </ToolButton>
          <ToolButton
            label="Pan"
            active={tool === "pan"}
            onClick={() => setTool("pan")}
          >
            <Hand size={18} />
          </ToolButton>
          <span className="toolbar-divider" />
          <ToolButton
            label="Insert rectangle"
            onClick={() => addShape("rectangle")}
          >
            <Square size={18} />
          </ToolButton>
          <ToolButton
            label="Insert ellipse"
            onClick={() => addShape("ellipse")}
          >
            <Circle size={18} />
          </ToolButton>
          <ToolButton
            label="Insert diamond"
            onClick={() => addShape("diamond")}
          >
            <Diamond size={18} />
          </ToolButton>
          <span className="toolbar-divider" />
          <ToolButton
            label="Undo"
            disabled={!history.current.past.length}
            onClick={undo}
          >
            <Undo2 size={18} />
          </ToolButton>
          <ToolButton
            label="Redo"
            disabled={!history.current.future.length}
            onClick={redo}
          >
            <Redo2 size={18} />
          </ToolButton>
        </div>
        <ReactFlow<DiagramNode>
          nodes={diagram.nodes}
          edges={diagram.edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={connect}
          connectionMode={ConnectionMode.Loose}
          isValidConnection={(connection) =>
            connection.source !== connection.target
          }
          onNodeDragStart={checkpoint}
          onMove={(_event, viewport) => setZoom(viewport.zoom)}
          onNodeClick={() => setTarget("")}
          nodesDraggable={tool === "select"}
          selectionOnDrag={tool === "select"}
          panOnDrag={tool === "pan" ? true : [1, 2]}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.15}
          maxZoom={2}
          deleteKeyCode={null}
          defaultEdgeOptions={edgeStyle}
          connectionLineStyle={{ stroke: "#118777", strokeWidth: 2 }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={22}
            size={1}
            color="#cdd5d9"
          />
        </ReactFlow>
        {!diagram.nodes.length && (
          <div className="empty-canvas">
            <Workflow size={36} strokeWidth={1} />
            <span>{diagram.name || "Untitled diagram"}</span>
          </div>
        )}
        <div className="zoom-toolbar" role="toolbar" aria-label="Canvas view">
          <ToolButton
            label="Zoom out"
            onClick={() => void flow.zoomOut({ duration: 150 })}
          >
            <Minus size={16} />
          </ToolButton>
          <span className="zoom-value">{Math.round(zoom * 100)}%</span>
          <ToolButton
            label="Zoom in"
            onClick={() => void flow.zoomIn({ duration: 150 })}
          >
            <Plus size={16} />
          </ToolButton>
          <span className="toolbar-divider" />
          <ToolButton
            label="Fit diagram"
            onClick={() => void flow.fitView({ padding: 0.2, duration: 200 })}
          >
            <Maximize size={16} />
          </ToolButton>
        </div>
      </main>

      <aside className="inspector" aria-label="Properties">
        <div className="sidebar-heading">
          <span>
            {selectedNode ? "Shape" : selectedEdge ? "Connector" : "Document"}
          </span>
          {selectedNode ? (
            <Square size={15} />
          ) : selectedEdge ? (
            <GitBranch size={15} />
          ) : (
            <Layers2 size={15} />
          )}
        </div>
        {selectedNode ? (
          <div className="inspector-body" key={selectedNode.id}>
            <span className="section-label">APPEARANCE</span>
            <Field
              label="Label"
              value={selectedNode.data.label}
              onCommit={(label) =>
                updateNode({ data: { ...selectedNode.data, label } })
              }
            />
            <label className="field">
              <span>Shape</span>
              <select
                aria-label="Shape"
                value={selectedNode.data.shape}
                onChange={(event) =>
                  updateNode({
                    data: {
                      ...selectedNode.data,
                      shape: event.target.value as Shape,
                    },
                  })
                }
              >
                <option value="rectangle">Rectangle</option>
                <option value="ellipse">Ellipse</option>
                <option value="diamond">Diamond</option>
              </select>
            </label>
            <label className="field">
              <span>Icon</span>
              <select
                aria-label="Icon"
                value={findIcon(selectedNode.data.symbol)?.id ?? ""}
                onChange={(event) =>
                  updateNode({
                    data: {
                      ...selectedNode.data,
                      symbol: event.target.value || undefined,
                    },
                  })
                }
              >
                <option value="">No icon</option>
                {iconPacks.map((pack) => (
                  <optgroup key={pack.id} label={pack.name}>
                    {pack.icons.map((icon) => (
                      <option key={icon.id} value={icon.id}>
                        {icon.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>
            <div className="field">
              <span>Fill</span>
              <div className="swatches">
                {colours.map((colour, index) => (
                  <button
                    key={colour}
                    aria-label={`Fill ${["white", "mint", "blue", "yellow", "pink", "lavender"][index]}`}
                    aria-pressed={selectedNode.data.colour === colour}
                    title={
                      ["White", "Mint", "Blue", "Yellow", "Pink", "Lavender"][
                        index
                      ]
                    }
                    style={{ backgroundColor: colour }}
                    onClick={() =>
                      updateNode({ data: { ...selectedNode.data, colour } })
                    }
                  >
                    {selectedNode.data.colour === colour && <Check size={12} />}
                  </button>
                ))}
              </div>
            </div>
            <div className="inspector-divider" />
            <span className="section-label">GEOMETRY</span>
            <div className="field-grid">
              <Field
                label="Width"
                numeric
                min={100}
                max={2000}
                value={Number(selectedNode.style?.width) || 176}
                onCommit={(width) =>
                  updateNode({
                    style: { ...selectedNode.style, width: Number(width) },
                  })
                }
              />
              <Field
                label="Height"
                numeric
                min={70}
                max={2000}
                value={Number(selectedNode.style?.height) || 100}
                onCommit={(height) =>
                  updateNode({
                    style: { ...selectedNode.style, height: Number(height) },
                  })
                }
              />
              <Field
                label="X position"
                numeric
                value={Math.round(selectedNode.position.x)}
                onCommit={(x) =>
                  updateNode({
                    position: { ...selectedNode.position, x: Number(x) },
                  })
                }
              />
              <Field
                label="Y position"
                numeric
                value={Math.round(selectedNode.position.y)}
                onCommit={(y) =>
                  updateNode({
                    position: { ...selectedNode.position, y: Number(y) },
                  })
                }
              />
            </div>
            <div className="inspector-divider" />
            <span className="section-label">CONNECTION</span>
            <label className="field">
              <span>Connect to</span>
              <select
                aria-label="Connect to"
                value={target}
                onChange={(event) => setTarget(event.target.value)}
              >
                <option value="">Select shape</option>
                {diagram.nodes
                  .filter((node) => node.id !== selectedNode.id)
                  .map((node) => (
                    <option key={node.id} value={node.id}>
                      {node.data.label || "Untitled shape"}
                    </option>
                  ))}
              </select>
            </label>
            <button
              className="button connect-button"
              aria-label="Create connector"
              disabled={!target}
              onClick={() =>
                connect({
                  source: selectedNode.id,
                  target,
                  sourceHandle: null,
                  targetHandle: null,
                })
              }
            >
              <GitBranch size={15} />
              Connect
              <ArrowRight size={14} />
            </button>
          </div>
        ) : selectedEdge ? (
          <div className="inspector-body" key={selectedEdge.id}>
            <span className="section-label">APPEARANCE</span>
            <Field
              label="Label"
              value={String(selectedEdge.label ?? "")}
              onCommit={(label) =>
                edit((doc) => ({
                  ...doc,
                  edges: doc.edges.map((edge) =>
                    edge.id === selectedEdge.id ? { ...edge, label } : edge,
                  ),
                }))
              }
            />
            <span className="section-label">CONNECTION</span>
            <div className="connection-summary">
              {
                diagram.nodes.find((node) => node.id === selectedEdge.source)
                  ?.data.label
              }
              <ArrowRight size={16} />
              {
                diagram.nodes.find((node) => node.id === selectedEdge.target)
                  ?.data.label
              }
            </div>
          </div>
        ) : (
          <div className="inspector-body document-properties">
            <span className="section-label">OVERVIEW</span>
            <div className="document-icon">
              <Workflow size={30} strokeWidth={1.3} />
            </div>
            <h1>{diagram.name || "Untitled diagram"}</h1>
            <span className="document-type">Architecture diagram</span>
            <div className="document-stats">
              <div>
                <strong>{diagram.nodes.length}</strong>
                <span>Shapes</span>
              </div>
              <div>
                <strong>{diagram.edges.length}</strong>
                <span>Connectors</span>
              </div>
            </div>
            <div className="inspector-divider" />
            <span className="section-label">STORAGE</span>
            <div className="storage-state">
              <span className="workspace-dot" />
              This browser
            </div>
          </div>
        )}
        {(selectedNode || selectedEdge) && (
          <div className="inspector-bottom">
            <button
              className="delete-button"
              aria-label="Delete selection"
              onClick={removeSelection}
            >
              <Trash2 size={15} />
              Delete {selectedNode ? "shape" : "connector"}
            </button>
          </div>
        )}
      </aside>

      <footer className="status-bar">
        <div role="status" aria-live="polite">
          <span className={`status-dot ${dirty ? "unsaved" : ""}`} />
          {message}
        </div>
        <span className="element-count">
          {diagram.nodes.length} shapes<span className="count-divider">/</span>
          {diagram.edges.length} connectors
        </span>
        <span className="version-label">
          DIAGRAM CREATOR<span>v0.1</span>
        </span>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <Editor />
    </ReactFlowProvider>
  );
}

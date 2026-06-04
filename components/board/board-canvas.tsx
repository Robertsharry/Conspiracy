"use client";

import { useCallback } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type Connection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { PinNode } from "./pin-node";
import { RedStringEdge } from "./red-string-edge";
import { BoardToolbar } from "./board-toolbar";
import { createNode, moveNode, createEdge } from "@/lib/actions/node-actions";
import type { NodeRow, EdgeRow } from "@/lib/data/boards";

const nodeTypes = { pin: PinNode };
const edgeTypes = { redstring: RedStringEdge };

export type BoardCanvasProps = {
  boardId: string;
  canEdit: boolean;
  initialNodes: NodeRow[];
  initialEdges: EdgeRow[];
};

function toFlowNodes(rows: NodeRow[]): Node[] {
  return rows.map((r) => ({
    id: r.id,
    type: "pin",
    position: { x: r.x, y: r.y },
    data: { type: r.type, title: r.title, body: r.body },
  }));
}

function toFlowEdges(rows: EdgeRow[]): Edge[] {
  return rows.map((r) => ({
    id: r.id,
    source: r.source_node_id,
    target: r.target_node_id,
    type: "redstring",
    data: { label: r.label, kind: r.kind },
  }));
}

const tempId = () => `tmp-${Math.random().toString(36).slice(2, 10)}`;

function Canvas({ boardId, canEdit, initialNodes, initialEdges }: BoardCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(toFlowNodes(initialNodes));
  const [edges, setEdges, onEdgesChange] = useEdgesState(toFlowEdges(initialEdges));

  // Draw the red string: optimistic add, then persist (reconcile/rollback by id).
  const onConnect = useCallback(
    async (c: Connection) => {
      if (!canEdit || !c.source || !c.target || c.source === c.target) return;
      const source = c.source;
      const target = c.target;
      const id = tempId();
      setEdges((eds) =>
        addEdge({ id, source, target, type: "redstring", data: {} }, eds),
      );
      const res = await createEdge({ boardId, source, target });
      if ("id" in res) {
        setEdges((eds) => eds.map((e) => (e.id === id ? { ...e, id: res.id } : e)));
      } else {
        setEdges((eds) => eds.filter((e) => e.id !== id));
      }
    },
    [boardId, canEdit, setEdges],
  );

  const onNodeDragStop = useCallback(
    (_event: MouseEvent | TouchEvent, node: Node) => {
      if (!canEdit) return;
      void moveNode({ id: node.id, x: node.position.x, y: node.position.y });
    },
    [canEdit],
  );

  const onAddPin = useCallback(
    async (type: string, title: string) => {
      const id = tempId();
      const position = { x: 80 + Math.random() * 240, y: 60 + Math.random() * 160 };
      setNodes((nds) => [...nds, { id, type: "pin", position, data: { type, title } }]);
      const res = await createNode({ boardId, type, title, x: position.x, y: position.y });
      if ("id" in res) {
        setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, id: res.id } : n)));
      } else {
        setNodes((nds) => nds.filter((n) => n.id !== id));
      }
    },
    [boardId, setNodes],
  );

  return (
    <div className="relative h-[70vh] w-full overflow-hidden rounded-sm border border-border">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodesDraggable={canEdit}
        nodesConnectable={canEdit}
        elementsSelectable
        fitView
        proOptions={{ hideAttribution: true }}
        className="cork-texture"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={26}
          size={1.5}
          color="oklch(0.35 0.03 60 / 0.5)"
        />
        <Controls className="!border-border !bg-card" />
        <MiniMap
          pannable
          zoomable
          className="!border !border-border !bg-card"
          maskColor="oklch(0 0 0 / 0.5)"
          nodeColor="var(--redthread)"
        />
      </ReactFlow>

      {canEdit && <BoardToolbar onAddPin={onAddPin} />}

      {nodes.length === 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <p className="font-typewriter text-lg uppercase tracking-wide text-paper/80">
            {canEdit ? "No evidence pinned yet — add the first." : "No evidence pinned yet."}
          </p>
        </div>
      )}
    </div>
  );
}

/** Public canvas — wrapped in a provider so future xyflow hooks have context. */
export function BoardCanvas(props: BoardCanvasProps) {
  return (
    <ReactFlowProvider>
      <Canvas {...props} />
    </ReactFlowProvider>
  );
}

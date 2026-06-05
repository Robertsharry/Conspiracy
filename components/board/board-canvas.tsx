"use client";

import { useCallback, useEffect, useState } from "react";
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

import { PinNode, type PinNodeData } from "./pin-node";
import { RedStringEdge } from "./red-string-edge";
import { BoardToolbar } from "./board-toolbar";
import { PinInspector, type SelectedPin } from "./pin-inspector";
import { PresenceRail, type Watcher } from "./presence-rail";
import { createNode, moveNode, createEdge } from "@/lib/actions/node-actions";
import { createClient } from "@/lib/supabase/client";
import { colorFor } from "@/lib/realtime/colors";
import type { NodeRow, EdgeRow } from "@/lib/data/boards";

const nodeTypes = { pin: PinNode };
const edgeTypes = { redstring: RedStringEdge };

export type BoardCanvasProps = {
  boardId: string;
  canEdit: boolean;
  me: { id: string; name: string; avatarUrl: string | null } | null;
  initialNodes: NodeRow[];
  initialEdges: EdgeRow[];
};

function toFlowNode(r: NodeRow): Node {
  return {
    id: r.id,
    type: "pin",
    position: { x: r.x, y: r.y },
    data: {
      type: r.type,
      title: r.title,
      body: r.body,
      sourceUrl: r.source_url,
      score: r.score,
    },
  };
}

function toFlowEdge(r: EdgeRow): Edge {
  return {
    id: r.id,
    source: r.source_node_id,
    target: r.target_node_id,
    type: "redstring",
    data: { label: r.label, kind: r.kind },
  };
}

const tempId = () => `tmp-${Math.random().toString(36).slice(2, 10)}`;

function Canvas({ boardId, canEdit, me, initialNodes, initialEdges }: BoardCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes.map(toFlowNode));
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges.map(toFlowEdge));
  const [selected, setSelected] = useState<SelectedPin | null>(null);
  const [watchers, setWatchers] = useState<Watcher[]>([]);

  const meId = me?.id ?? null;
  const meName = me?.name ?? null;
  const meAvatar = me?.avatarUrl ?? null;

  // ── Realtime: presence ("who's watching this case") ──────────────────────
  useEffect(() => {
    if (!meId || !meName) return;
    const supabase = createClient();
    const color = colorFor(meId);
    const channel = supabase.channel(`board:${boardId}:presence`, {
      config: { presence: { key: meId } },
    });
    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState() as unknown as Record<string, Watcher[]>;
        const list: Watcher[] = [];
        for (const key of Object.keys(state)) {
          const meta = state[key]?.[0];
          if (meta) list.push(meta);
        }
        setWatchers(list);
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          void channel.track({ id: meId, name: meName, avatarUrl: meAvatar, color });
        }
      });
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [boardId, meId, meName, meAvatar]);

  // ── Realtime: live pins + strings from other operatives ──────────────────
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`board:${boardId}:changes`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "nodes", filter: `board_id=eq.${boardId}` },
        (payload) => {
          const r = payload.new as unknown as NodeRow;
          setNodes((nds) => (nds.some((n) => n.id === r.id) ? nds : [...nds, toFlowNode(r)]));
        },
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "edges", filter: `board_id=eq.${boardId}` },
        (payload) => {
          const r = payload.new as unknown as EdgeRow;
          setEdges((eds) => (eds.some((e) => e.id === r.id) ? eds : [...eds, toFlowEdge(r)]));
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [boardId, setNodes, setEdges]);

  // Draw the red string: optimistic add, then persist (dedupe vs realtime echo).
  const onConnect = useCallback(
    async (c: Connection) => {
      if (!canEdit || !c.source || !c.target || c.source === c.target) return;
      const source = c.source;
      const target = c.target;
      const id = tempId();
      setEdges((eds) => addEdge({ id, source, target, type: "redstring", data: {} }, eds));
      const res = await createEdge({ boardId, source, target });
      if ("id" in res) {
        setEdges((eds) =>
          eds
            .filter((e) => e.id !== res.id)
            .map((e) => (e.id === id ? { ...e, id: res.id } : e)),
        );
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
        setNodes((nds) =>
          nds
            .filter((n) => n.id !== res.id)
            .map((n) => (n.id === id ? { ...n, id: res.id } : n)),
        );
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
        onNodeClick={(_event, node) =>
          setSelected({ id: node.id, data: node.data as PinNodeData })
        }
        onPaneClick={() => setSelected(null)}
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
      <PresenceRail watchers={watchers} />

      {selected && (
        <PinInspector
          boardId={boardId}
          pin={selected}
          canEdit={canEdit}
          onClose={() => setSelected(null)}
        />
      )}

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

/** Public canvas — wrapped in a provider so xyflow hooks have context. */
export function BoardCanvas(props: BoardCanvasProps) {
  return (
    <ReactFlowProvider>
      <Canvas {...props} />
    </ReactFlowProvider>
  );
}

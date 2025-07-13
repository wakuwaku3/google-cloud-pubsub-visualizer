import { useCallback, useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
} from "reactflow";
import type { Connection } from "reactflow";
import "reactflow/dist/style.css";

import { TopicNode } from "./TopicNode";
import { SubscriptionNode } from "./SubscriptionNode";
import { EndpointNode } from "./EndpointNode";
import { CustomEdge } from "./CustomEdge";
import type { GraphData } from "@/lib/graph-utils";
import "./PubSubGraph.css";

// コンポーネント外で定義してメモ化
const nodeTypes = {
  topic: TopicNode,
  subscription: SubscriptionNode,
  endpoint: EndpointNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

interface PubSubGraphProps {
  graphData: GraphData;
  className?: string;
}

function PubSubGraphInner({ graphData, className }: PubSubGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(graphData.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(graphData.edges);

  // グラフデータが変更されたときにノードとエッジを更新
  useMemo(() => {
    setNodes(graphData.nodes);
    setEdges(graphData.edges);
  }, [graphData, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges]
  );

  return (
    <div className={`pubsub-graph ${className ?? ""}`}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.1 }}
        attributionPosition="bottom-left"
        proOptions={{ hideAttribution: true }}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}

export function PubSubGraph(props: PubSubGraphProps) {
  return (
    <ReactFlowProvider>
      <PubSubGraphInner {...props} />
    </ReactFlowProvider>
  );
}

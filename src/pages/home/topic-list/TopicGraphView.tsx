import { useMemo } from "react";
import { PubSubGraph } from "@/components/graph";
import { buildPubSubGraph, autoLayoutGraph } from "@/lib/graph-utils";
import type { Topic, Subscription } from "@/types";
import "./TopicGraphView.css";

interface TopicGraphViewProps {
  topicsWithSubscriptions: {
    topic: Topic;
    subscriptions: Subscription[];
  }[];
}

export function TopicGraphView({
  topicsWithSubscriptions,
}: TopicGraphViewProps) {
  // グラフデータを構築
  const graphData = useMemo(() => {
    const topics = topicsWithSubscriptions.map((item) => item.topic);
    const subscriptions = topicsWithSubscriptions.flatMap(
      (item) => item.subscriptions
    );

    const graph = buildPubSubGraph(topics, subscriptions);
    return autoLayoutGraph(graph);
  }, [topicsWithSubscriptions]);

  if (topicsWithSubscriptions.length === 0) {
    return (
      <div className="topic-graph-container">
        <div className="no-data">
          <p>表示するデータがありません。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="topic-graph-container">
      <div className="graph-info">
        <div className="graph-legend">
          <div className="legend-item">
            <div className="legend-icon topic-icon">📢</div>
            <span>トピック</span>
          </div>
          <div className="legend-item">
            <div className="legend-icon subscription-icon">📥</div>
            <span>サブスクリプション</span>
          </div>
          <div className="legend-item">
            <div className="legend-icon endpoint-icon">🌐</div>
            <span>APIエンドポイント</span>
          </div>
        </div>
        <div className="graph-stats">
          <span>
            トピック: {graphData.nodes.filter((n) => n.type === "topic").length}
          </span>
          <span>
            サブスクリプション:{" "}
            {graphData.nodes.filter((n) => n.type === "subscription").length}
          </span>
          <span>
            APIエンドポイント:{" "}
            {graphData.nodes.filter((n) => n.type === "endpoint").length}
          </span>
        </div>
      </div>
      <div className="graph-wrapper">
        <PubSubGraph graphData={graphData} />
      </div>
    </div>
  );
}

import type { Topic, Subscription } from "@/types";

export interface GraphNode {
  id: string;
  type: "topic" | "subscription" | "endpoint";
  data: {
    label: string;
    name: string;
    projectId: string;
    isEventPublisher?: boolean;
    eventId?: string;
    state?: string;
    labels?: Record<string, string>;
    pushConfig?: {
      pushEndpoint?: string;
    };
    ackDeadlineSeconds?: number;
    endpointUrl?: string;
    publishingTopics?: string[];
    eventIds?: string[];
  };
  position: { x: number; y: number };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  label?: string;
  data?: {
    label?: string;
    type?: "subscription" | "publishing" | "push";
  };
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// publishing_event_id_${index} パターンを抽出（サブスクリプション名から）
function extractPublishingEventIdFromName(
  subscriptionName: string
): string | null {
  const match = /publishing_event_id_(\d+)/.exec(subscriptionName);
  return match ? match[1] : null;
}

// publishing_event_id_${index} ラベルからイベントIDを抽出
function extractPublishingEventIdFromLabels(
  labels: Record<string, string> | undefined
): string | null {
  if (!labels) return null;

  for (const [key, value] of Object.entries(labels)) {
    if (key === "publishing_event_id" || key.includes("publishing_event_id")) {
      // 数値のみを抽出
      const match = /(\d+)/.exec(value);
      return match ? match[1] : null;
    }
  }
  return null;
}

// サブスクリプションのラベルからすべてのpublishing_event_id_{index}を抽出
function extractAllPublishingEventIdsFromLabels(
  labels: Record<string, string> | undefined
): string[] {
  if (!labels) return [];
  const eventIds: string[] = [];
  let index = 1;
  while (index <= 100) {
    // 安全のため上限を設定
    const key = `publishing_event_id_${String(index)}`;
    if (key in labels) {
      eventIds.push(labels[key]);
      index++;
    } else {
      break;
    }
  }
  return eventIds;
}

// グラフ構造を構築（無限ループ防止付き）
export function buildPubSubGraph(
  topics: Topic[],
  subscriptions: Subscription[]
): GraphData {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const processedNodes = new Set<string>();
  const nodePositions = new Map<string, { x: number; y: number }>();

  let nodeIndex = 0;
  const nodeSpacing = { x: 300, y: 150 };

  // Step 1: トピックのリストを作成
  console.log("Step 1: Creating topic nodes");
  console.log(
    "All topics:",
    topics.map((topic) => ({
      name: topic.name,
      labels: topic.labels,
      state: topic.state,
    }))
  );
  topics.forEach((topic) => {
    const topicName = topic.name.split("/").pop() ?? topic.name;
    const nodeId = `topic-${topicName}`;
    if (!processedNodes.has(nodeId)) {
      const position = {
        x: nodeIndex * nodeSpacing.x,
        y: 0,
      };

      nodes.push({
        id: nodeId,
        type: "topic",
        data: {
          label: topicName,
          name: topic.name,
          projectId: topic.name.split("/")[1] ?? "",
          state: topic.state,
          labels: topic.labels,
        },
        position,
      });

      nodePositions.set(nodeId, position);
      processedNodes.add(nodeId);
      nodeIndex++;
    }
  });

  // Step 2: サブスクリプションのリストを作成（トピックの順番に合わせて）
  console.log("Step 2: Creating subscription nodes");

  // トピックごとにサブスクリプションをグループ化
  const topicSubscriptions = new Map<string, Subscription[]>();
  topics.forEach((topic) => {
    const topicName = topic.name.split("/").pop() ?? topic.name;
    const topicSubs = subscriptions.filter(
      (sub) => (sub.topic.split("/").pop() ?? sub.topic) === topicName
    );
    topicSubscriptions.set(topicName, topicSubs);
  });

  // トピックの順番に合わせてサブスクリプションを配置
  topics.forEach((topic) => {
    const topicName = topic.name.split("/").pop() ?? topic.name;
    const topicSubs = topicSubscriptions.get(topicName) ?? [];

    topicSubs.forEach((subscription) => {
      const nodeId = `subscription-${subscription.name}`;
      if (!processedNodes.has(nodeId)) {
        const position = {
          x: nodeIndex * nodeSpacing.x,
          y: nodeSpacing.y,
        };

        const eventIdFromName = extractPublishingEventIdFromName(
          subscription.name
        );
        const eventIdFromLabels = extractPublishingEventIdFromLabels(
          subscription.labels
        );
        const eventId = eventIdFromName ?? eventIdFromLabels;
        const isEventPublisher = eventId !== null;

        nodes.push({
          id: nodeId,
          type: "subscription",
          data: {
            label: subscription.name.split("/").pop() ?? subscription.name,
            name: subscription.name,
            projectId: subscription.name.split("/")[1] ?? "",
            isEventPublisher,
            eventId: eventId ?? undefined,
            state: subscription.state,
            labels: subscription.labels,
            pushConfig: subscription.pushConfig,
            ackDeadlineSeconds: subscription.ackDeadlineSeconds,
          },
          position,
        });

        nodePositions.set(nodeId, position);
        processedNodes.add(nodeId);
        nodeIndex++;
      }
    });
  });

  // Step 3: APIエンドポイントのリストを作成
  console.log("Step 3: Creating API endpoint nodes");
  const pushEndpoints = new Map<
    string,
    { subscriptionName: string; endpointUrl: string; eventIds: string[] }
  >();
  const endpointSubscriptions = new Map<string, string[]>(); // エンドポイントごとのサブスクリプション一覧

  subscriptions.forEach((subscription) => {
    if (subscription.pushConfig?.pushEndpoint) {
      const eventIds = extractAllPublishingEventIdsFromLabels(
        subscription.labels
      );

      // エンドポイントごとのサブスクリプション一覧を更新
      const existingSubscriptions =
        endpointSubscriptions.get(subscription.pushConfig.pushEndpoint) ?? [];
      endpointSubscriptions.set(subscription.pushConfig.pushEndpoint, [
        ...existingSubscriptions,
        subscription.name,
      ]);

      // pushEndpointsには最初に見つかったサブスクリプションの情報を保存（重複を避けるため）
      if (!pushEndpoints.has(subscription.pushConfig.pushEndpoint)) {
        pushEndpoints.set(subscription.pushConfig.pushEndpoint, {
          subscriptionName: subscription.name,
          endpointUrl: subscription.pushConfig.pushEndpoint,
          eventIds,
        });
      }

      console.log(
        `Push endpoint found: ${subscription.pushConfig.pushEndpoint}`,
        {
          subscriptionName: subscription.name,
          eventIds,
          labels: subscription.labels,
        }
      );
    }
  });

  console.log("All pushEndpoints:", Array.from(pushEndpoints.entries()));

  // APIエンドポイントが発行するトピック名を事前に計算
  const endpointPublishingTopics = new Map<string, string[]>();
  pushEndpoints.forEach(({ endpointUrl, eventIds }) => {
    const publishingTopics: string[] = [];
    eventIds.forEach((eventId) => {
      topics.forEach((topic) => {
        const topicName = topic.name.split("/").pop() ?? topic.name;
        if (topicName === eventId) {
          publishingTopics.push(topicName);
          console.log(
            `Found matching topic: ${topicName} for eventId: ${eventId}`
          );
        }
      });
    });
    endpointPublishingTopics.set(endpointUrl, publishingTopics);
    console.log(
      `API Endpoint ${endpointUrl} publishes to topics:`,
      publishingTopics
    );
  });

  pushEndpoints.forEach(({ endpointUrl, eventIds }) => {
    const endpointNodeId = `endpoint-${endpointUrl}`;
    if (!processedNodes.has(endpointNodeId)) {
      const position = {
        x: nodeIndex * nodeSpacing.x,
        y: nodeSpacing.y * 2,
      };

      // エンドポイントURLからドメイン名を抽出
      const url = new URL(endpointUrl);
      const endpointLabel = url.hostname + url.pathname;

      // 発行するトピック名を取得
      const publishingTopics = endpointPublishingTopics.get(endpointUrl) ?? [];

      nodes.push({
        id: endpointNodeId,
        type: "endpoint",
        data: {
          label: endpointLabel,
          name: endpointUrl,
          projectId: "",
          endpointUrl: endpointUrl,
          eventIds: eventIds,
          publishingTopics: publishingTopics,
        },
        position,
      });

      nodePositions.set(endpointNodeId, position);
      processedNodes.add(endpointNodeId);
      nodeIndex++;
    }
  });

  // Step 4: 関係性の構築
  console.log("Step 4: Building relationships");

  // 4-1: トピックとサブスクリプションの関係（1:N）
  console.log("Step 4-1: Topic-Subscription relationships (1:N)");
  subscriptions.forEach((subscription) => {
    const subscriptionNodeId = `subscription-${subscription.name}`;
    const topicName = subscription.topic.split("/").pop() ?? subscription.topic;
    const topicNodeId = `topic-${topicName}`;

    // トピックからサブスクリプションへのエッジ
    if (
      processedNodes.has(subscriptionNodeId) &&
      processedNodes.has(topicNodeId)
    ) {
      edges.push({
        id: `edge-${topicNodeId}-${subscriptionNodeId}`,
        source: topicNodeId,
        target: subscriptionNodeId,
        type: "custom",
        data: {
          type: "subscription",
        },
      });
    }
  });

  // 4-2: サブスクリプションとAPIエンドポイントの関係（1:N）
  console.log("Step 4-2: Subscription-API Endpoint relationships (1:N)");
  endpointSubscriptions.forEach((subscriptionNames, endpointUrl) => {
    const endpointNodeId = `endpoint-${endpointUrl}`;

    // 各サブスクリプションからエンドポイントへのエッジを生成
    subscriptionNames.forEach((subscriptionName) => {
      const subscriptionNodeId = `subscription-${subscriptionName}`;

      if (
        processedNodes.has(subscriptionNodeId) &&
        processedNodes.has(endpointNodeId)
      ) {
        edges.push({
          id: `edge-${subscriptionNodeId}-${endpointNodeId}`,
          source: subscriptionNodeId,
          target: endpointNodeId,
          type: "custom",
          data: {
            type: "push",
          },
        });
      }
    });
  });

  // 4-3: APIエンドポイントとトピックの関係（1:N）
  console.log("Step 4-3: API Endpoint-Topic relationships (1:N)");
  pushEndpoints.forEach(({ endpointUrl, eventIds }) => {
    if (eventIds.length === 0) return;

    const endpointNodeId = `endpoint-${endpointUrl}`;

    // eventIdsと一致するトピック名を持つトピックを検索
    const targetTopics = topics.filter((topic) => {
      const topicName = topic.name.split("/").pop() ?? topic.name;
      // eventIdsのいずれかとトピック名が一致する場合
      return eventIds.some((eventId) => topicName === eventId);
    });

    // 対応するトピックへの発行関係を追加
    targetTopics.forEach((topic) => {
      const topicName = topic.name.split("/").pop() ?? topic.name;
      const topicNodeId = `topic-${topicName}`;
      if (
        processedNodes.has(endpointNodeId) &&
        processedNodes.has(topicNodeId)
      ) {
        console.log(
          `Creating publishing edge from ${endpointUrl} to ${
            topic.name
          } for event ${String(eventIds)}`
        );
        edges.push({
          id: `edge-${endpointNodeId}-${topicNodeId}-publishing`,
          source: endpointNodeId,
          target: topicNodeId,
          type: "custom",
          data: {
            type: "publishing",
          },
        });
      }
    });
  });

  console.log(
    `Graph built: ${String(nodes.length)} nodes, ${String(edges.length)} edges`
  );
  return { nodes, edges };
}

// グラフのレイアウトを自動調整
export function autoLayoutGraph(graphData: GraphData): GraphData {
  const { nodes, edges } = graphData;
  const nodeSpacing = { x: 300, y: 300 }; // ノード間の間隔
  const columnSpacing = 400; // 列間の間隔

  // ノードの接続関係を構築
  const nodeConnections = new Map<string, Set<string>>();
  const nodeIncomingEdges = new Map<string, string[]>(); // 入ってくるエッジ
  const nodeOutgoingEdges = new Map<string, string[]>(); // 出ていくエッジ

  // 初期化
  nodes.forEach((node) => {
    nodeConnections.set(node.id, new Set());
    nodeIncomingEdges.set(node.id, []);
    nodeOutgoingEdges.set(node.id, []);
  });

  // エッジから接続関係を構築
  edges.forEach((edge) => {
    const sourceConnections = nodeConnections.get(edge.source);
    const targetConnections = nodeConnections.get(edge.target);

    if (sourceConnections && targetConnections) {
      sourceConnections.add(edge.target);
      targetConnections.add(edge.source);

      // 入ってくるエッジと出ていくエッジを記録
      const incomingEdges = nodeIncomingEdges.get(edge.target) ?? [];
      incomingEdges.push(edge.source);
      nodeIncomingEdges.set(edge.target, incomingEdges);

      const outgoingEdges = nodeOutgoingEdges.get(edge.source) ?? [];
      outgoingEdges.push(edge.target);
      nodeOutgoingEdges.set(edge.source, outgoingEdges);
    }
  });

  // グループを特定（接続されているノードの集合）
  const groups: string[][] = [];
  const visited = new Set<string>();

  function findGroup(startNodeId: string): string[] {
    const group: string[] = [];
    const queue: string[] = [startNodeId];
    const groupVisited = new Set<string>();

    while (queue.length > 0) {
      const nodeId = queue.shift();
      if (!nodeId) continue;
      if (groupVisited.has(nodeId)) continue;

      groupVisited.add(nodeId);
      group.push(nodeId);
      visited.add(nodeId);

      const connections = nodeConnections.get(nodeId);
      if (connections) {
        connections.forEach((connectedNodeId) => {
          if (!groupVisited.has(connectedNodeId)) {
            queue.push(connectedNodeId);
          }
        });
      }
    }

    return group;
  }

  // 未訪問のノードからグループを特定
  nodes.forEach((node) => {
    if (!visited.has(node.id)) {
      const group = findGroup(node.id);
      if (group.length > 0) {
        groups.push(group);
      }
    }
  });

  console.log(
    `Found ${String(groups.length)} groups:`,
    groups.map((g) => String(g.length))
  );

  // 各グループ内でノードを配置
  let currentGroupX = 0;
  groups.forEach((group) => {
    const groupNodes = group
      .map((id) => nodes.find((n) => n.id === id))
      .filter((node): node is NonNullable<typeof node> => node !== undefined);

    // グループ内のノードをタイプ別に分類
    const topicsInGroup = groupNodes.filter((node) => node.type === "topic");
    const endpointsInGroup = groupNodes.filter(
      (node) => node.type === "endpoint"
    );

    // 列のX座標を定義
    const columnX = {
      topics: currentGroupX,
      subscriptions: currentGroupX + columnSpacing,
      endpoints: currentGroupX + columnSpacing * 2,
    };

    // 配置済みノードを追跡
    const placedNodes = new Set<string>();
    const nodePositions = new Map<string, { x: number; y: number }>();
    const columnHeights = new Map<string, number>(); // 各列の現在の高さ

    // 列の高さを初期化
    columnHeights.set("topics", 0);
    columnHeights.set("subscriptions", 0);
    columnHeights.set("endpoints", 0);

    // トピックの入次数（APIエンドポイントからの接続数）を計算
    const topicIncomingCounts = new Map<string, number>();
    topicsInGroup.forEach((topic) => {
      const incomingFromEndpoints = edges.filter(
        (edge) =>
          edge.target === topic.id &&
          edge.data?.type === "publishing" &&
          endpointsInGroup.some((endpoint) => endpoint.id === edge.source)
      ).length;
      topicIncomingCounts.set(topic.id, incomingFromEndpoints);
    });

    // 入次数が少ない順にソート
    const sortedTopics = topicsInGroup.sort((a, b) => {
      const aCount = topicIncomingCounts.get(a.id) ?? 0;
      const bCount = topicIncomingCounts.get(b.id) ?? 0;
      return aCount - bCount;
    });

    // エッジを辿ってノードを配置する関数
    function placeNodeInColumn(
      columnType: "topics" | "subscriptions" | "endpoints"
    ): { x: number; y: number } {
      const currentHeight = columnHeights.get(columnType) ?? 0;
      const position = {
        x: columnX[columnType],
        y: currentHeight,
      };

      // 列の高さを更新
      columnHeights.set(columnType, currentHeight + nodeSpacing.y);
      return position;
    }

    // 最初のトピックから配置開始
    if (sortedTopics.length > 0) {
      const firstTopic = sortedTopics[0];
      const position = placeNodeInColumn("topics");
      nodePositions.set(firstTopic.id, position);
      placedNodes.add(firstTopic.id);
    }

    // エッジを辿って残りのノードを配置
    const maxIterations = nodes.length * 3; // 無限ループ防止
    let iteration = 0;

    while (placedNodes.size < groupNodes.length && iteration < maxIterations) {
      let placedInThisIteration = 0;

      groupNodes.forEach((node) => {
        if (placedNodes.has(node.id)) return;

        // このノードに接続されている配置済みノードを探す
        const connections = nodeConnections.get(node.id);
        if (!connections) return; // connectionsは必ず存在する（初期化済み）

        let columnType: "topics" | "subscriptions" | "endpoints" | undefined;

        // 接続されたノードをチェックして、配置すべきか判断
        connections.forEach((connectedNodeId) => {
          if (!placedNodes.has(connectedNodeId)) return;

          const connectedNode = groupNodes.find(
            (n) => n.id === connectedNodeId
          );
          if (!connectedNode) return;

          // エッジの方向を確認
          const edge = edges.find(
            (e) =>
              (e.source === connectedNodeId && e.target === node.id) ||
              (e.source === node.id && e.target === connectedNodeId)
          );

          if (!edge) return;

          // ノードタイプに応じて配置列を決定
          if (node.type === "topic") {
            // トピックは他のノードから接続されている場合のみ配置
            if (edge.target === node.id) {
              columnType = "topics";
            }
          } else if (node.type === "subscription") {
            // サブスクリプションはトピックから接続されている場合のみ配置
            if (
              edge.source === connectedNodeId &&
              connectedNode.type === "topic"
            ) {
              columnType = "subscriptions";
            }
          } else {
            // node.type === "endpoint"
            // エンドポイントはサブスクリプションから接続されている場合のみ配置
            if (
              edge.source === connectedNodeId &&
              connectedNode.type === "subscription"
            ) {
              columnType = "endpoints";
            }
          }
        });

        if (columnType) {
          const position = placeNodeInColumn(columnType);
          nodePositions.set(node.id, position);
          placedNodes.add(node.id);
          placedInThisIteration++;
        }
      });

      if (placedInThisIteration === 0) {
        // 配置できないノードがある場合、強制的に配置
        groupNodes.forEach((node) => {
          if (!placedNodes.has(node.id)) {
            let columnType: "topics" | "subscriptions" | "endpoints";
            if (node.type === "topic") {
              columnType = "topics";
            } else if (node.type === "subscription") {
              columnType = "subscriptions";
            } else {
              // node.type === "endpoint"
              columnType = "endpoints";
            }
            const position = placeNodeInColumn(columnType);
            nodePositions.set(node.id, position);
            placedNodes.add(node.id);
          }
        });
        break;
      }

      iteration++;
    }

    // 計算した位置をノードに適用
    groupNodes.forEach((node) => {
      const pos = nodePositions.get(node.id);
      if (pos) {
        node.position = pos;
      }
    });

    // 次のグループのためにX座標を調整
    currentGroupX += columnSpacing * 3 + 200; // 3列分 + 余白
  });

  console.log("Auto layout completed");
  return { nodes, edges };
}

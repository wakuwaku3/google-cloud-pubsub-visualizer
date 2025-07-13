import type {
  Topic,
  Subscription,
  TopicsResponse,
  SubscriptionsResponse,
} from "@/types";

// Topic一覧を取得
export async function getTopics(
  accessToken: string,
  projectId: string
): Promise<Topic[]> {
  console.log("Fetching topics for project:", projectId);

  const response = await fetch(
    `https://pubsub.googleapis.com/v1/projects/${projectId}/topics`,
    {
      headers: {
        Authorization: `Bearer ${String(accessToken)}`,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Topics request failed:", String(response.status), errorText);

    if (response.status === 403) {
      throw new Error(
        "Access denied. Please check if Pub/Sub API is enabled and you have proper permissions."
      );
    }

    throw new Error(`Failed to get topics: ${String(response.status)}`);
  }

  const data: unknown = await response.json();
  if (!data || typeof data !== "object" || !("topics" in data)) {
    throw new Error("Invalid topics response");
  }
  return (data as TopicsResponse).topics;
}

// Subscription一覧を取得
export async function getSubscriptions(
  accessToken: string,
  projectId: string
): Promise<Subscription[]> {
  console.log("Fetching subscriptions for project:", projectId);

  const response = await fetch(
    `https://pubsub.googleapis.com/v1/projects/${projectId}/subscriptions`,
    {
      headers: {
        Authorization: `Bearer ${String(accessToken)}`,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error(
      "Subscriptions request failed:",
      String(response.status),
      errorText
    );

    if (response.status === 403) {
      throw new Error(
        "Access denied. Please check if Pub/Sub API is enabled and you have proper permissions."
      );
    }

    throw new Error(`Failed to get subscriptions: ${String(response.status)}`);
  }

  const data: unknown = await response.json();
  if (!data || typeof data !== "object" || !("subscriptions" in data)) {
    throw new Error("Invalid subscriptions response");
  }
  return (data as SubscriptionsResponse).subscriptions;
}

// Topic名からプロジェクトIDとトピック名を抽出
export function extractTopicInfo(topicName: string): {
  projectId: string;
  topicName: string;
} {
  // 形式: projects/{projectId}/topics/{topicName}
  const parts = topicName.split("/");
  if (parts.length !== 4 || parts[0] !== "projects" || parts[2] !== "topics") {
    throw new Error(`Invalid topic name format: ${topicName}`);
  }
  return {
    projectId: parts[1],
    topicName: parts[3],
  };
}

// Subscription名からプロジェクトIDとサブスクリプション名を抽出
export function extractSubscriptionInfo(subscriptionName: string): {
  projectId: string;
  subscriptionName: string;
} {
  // 形式: projects/{projectId}/subscriptions/{subscriptionName}
  const parts = subscriptionName.split("/");
  if (
    parts.length !== 4 ||
    parts[0] !== "projects" ||
    parts[2] !== "subscriptions"
  ) {
    throw new Error(`Invalid subscription name format: ${subscriptionName}`);
  }
  return {
    projectId: parts[1],
    subscriptionName: parts[3],
  };
}

// TopicとSubscriptionを関連付けて返す
export function associateTopicsWithSubscriptions(
  topics: Topic[],
  subscriptions: Subscription[]
): { topic: Topic; subscriptions: Subscription[] }[] {
  return topics.map((topic) => {
    const topicSubscriptions = subscriptions.filter(
      (sub) => sub.topic === topic.name
    );
    return {
      topic,
      subscriptions: topicSubscriptions,
    };
  });
}

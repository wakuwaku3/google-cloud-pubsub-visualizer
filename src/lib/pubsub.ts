import type {
  Topic,
  Subscription,
  TopicsResponse,
  SubscriptionsResponse,
} from "@/types";

// トークンリフレッシュ関数の型定義
type RefreshTokenFunction = () => Promise<boolean>;

// Topic一覧を取得
export async function getTopics(
  accessToken: string,
  projectId: string,
  refreshTokenFn?: RefreshTokenFunction
): Promise<Topic[]> {
  const makeRequest = async (token: string): Promise<Response> => {
    const url = `https://pubsub.googleapis.com/v1/projects/${projectId}/topics`;
    return fetch(url, {
      headers: {
        Authorization: `Bearer ${String(token)}`,
      },
    });
  };

  let response = await makeRequest(accessToken);

  // 401エラーの場合、トークンリフレッシュを試行
  if (response.status === 401 && refreshTokenFn) {
    const refreshSuccess = await refreshTokenFn();
    if (refreshSuccess) {
      // リフレッシュ成功後、新しいトークンで再試行
      const newToken = sessionStorage.getItem("access_token");
      if (newToken) {
        response = await makeRequest(newToken);
      }
    }
  }

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error(
        "Access denied. Please check if Pub/Sub API is enabled and you have proper permissions."
      );
    }

    throw new Error(`Failed to get topics: ${String(response.status)}`);
  }

  // デバッグ用ログ削除済み
  const data: unknown = await response.json();
  if (!data || typeof data !== "object") {
    throw new Error("Invalid topics response: not an object");
  }
  const topics = "topics" in data ? (data as TopicsResponse).topics : [];
  return topics;
}

// Subscription一覧を取得
export async function getSubscriptions(
  accessToken: string,
  projectId: string,
  refreshTokenFn?: RefreshTokenFunction
): Promise<Subscription[]> {
  const makeRequest = async (token: string): Promise<Response> => {
    const url = `https://pubsub.googleapis.com/v1/projects/${projectId}/subscriptions`;
    return fetch(url, {
      headers: {
        Authorization: `Bearer ${String(token)}`,
      },
    });
  };

  let response = await makeRequest(accessToken);

  // 401エラーの場合、トークンリフレッシュを試行
  if (response.status === 401 && refreshTokenFn) {
    const refreshSuccess = await refreshTokenFn();
    if (refreshSuccess) {
      // リフレッシュ成功後、新しいトークンで再試行
      const newToken = sessionStorage.getItem("access_token");
      if (newToken) {
        response = await makeRequest(newToken);
      }
    }
  }

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error(
        "Access denied. Please check if Pub/Sub API is enabled and you have proper permissions."
      );
    }

    throw new Error(`Failed to get subscriptions: ${String(response.status)}`);
  }

  const data: unknown = await response.json();
  if (!data || typeof data !== "object") {
    throw new Error("Invalid subscriptions response: not an object");
  }
  const subscriptions =
    "subscriptions" in data
      ? (data as SubscriptionsResponse).subscriptions
      : [];
  return subscriptions;
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

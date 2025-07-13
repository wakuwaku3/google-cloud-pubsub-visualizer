// Topic名からトピック名のみを抽出
export function extractTopicName(topicName: string): { topicName: string } {
  const parts = topicName.split("/");
  return {
    topicName: parts[parts.length - 1],
  };
}

// Subscription名からサブスクリプション名のみを抽出
export function extractSubscriptionName(subscriptionName: string): {
  subscriptionName: string;
} {
  const parts = subscriptionName.split("/");
  return {
    subscriptionName: parts[parts.length - 1],
  };
}

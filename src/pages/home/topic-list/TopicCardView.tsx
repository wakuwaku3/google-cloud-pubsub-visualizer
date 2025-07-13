import { Collapsible } from "@/components/collapsible";
import type { Topic, Subscription } from "@/types";
import { extractTopicName, extractSubscriptionName } from "./utils";
import { SubscriptionItem } from "./SubscriptionItem";

interface TopicCardViewProps {
  topicsWithSubscriptions: {
    topic: Topic;
    subscriptions: Subscription[];
  }[];
}

export function TopicCardView({ topicsWithSubscriptions }: TopicCardViewProps) {
  return (
    <div className="topics-grid">
      {topicsWithSubscriptions.map(({ topic, subscriptions }) => (
        <TopicCardItem
          key={topic.name}
          topic={topic}
          subscriptions={subscriptions}
        />
      ))}
    </div>
  );
}

interface TopicCardItemProps {
  topic: Topic;
  subscriptions: Subscription[];
}

function TopicCardItem({ topic, subscriptions }: TopicCardItemProps) {
  const { topicName } = extractTopicName(topic.name);

  return (
    <div className="topic-card-item">
      <div className="topic-card-header">
        <h3 className="topic-card-name">{topicName}</h3>
        {topic.state && (
          <span
            className={`topic-state topic-state-${topic.state.toLowerCase()}`}
          >
            {topic.state}
          </span>
        )}
      </div>

      {topic.labels && Object.keys(topic.labels).length > 0 && (
        <div className="topic-card-labels">
          <span className="labels-label">ラベル:</span>
          <div className="labels-list">
            {Object.entries(topic.labels).map(([key, value]) => (
              <span key={key} className="label">
                {key}: {value}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="topic-card-subscriptions">
        <div className="subscriptions-count">
          <strong>サブスクリプション:</strong> {subscriptions.length}件
        </div>

        {subscriptions.length > 0 && (
          <div className="subscriptions-preview">
            {subscriptions.slice(0, 3).map((subscription) => {
              const { subscriptionName } = extractSubscriptionName(
                subscription.name
              );
              const isPush = !!subscription.pushConfig;
              const deliveryType = isPush ? "Push" : "Pull";

              return (
                <div
                  key={subscription.name}
                  className="subscription-preview-item"
                >
                  <span className="subscription-preview-name">
                    {subscriptionName}
                  </span>
                  <span
                    className={`delivery-type-badge ${
                      isPush ? "push" : "pull"
                    }`}
                  >
                    {deliveryType}
                  </span>
                </div>
              );
            })}
            {subscriptions.length > 3 && (
              <div className="subscriptions-more">
                他 {subscriptions.length - 3} 件...
              </div>
            )}
          </div>
        )}
      </div>

      <Collapsible title="詳細表示">
        {subscriptions.length === 0 ? (
          <p className="no-subscriptions">
            このTopicにはサブスクリプションがありません
          </p>
        ) : (
          <div className="subscriptions-list">
            {subscriptions.map((subscription) => (
              <SubscriptionItem
                key={subscription.name}
                subscription={subscription}
              />
            ))}
          </div>
        )}
      </Collapsible>
    </div>
  );
}

import { Collapsible } from "@/components/collapsible";
import type { Topic, Subscription } from "@/types";
import { extractTopicName } from "./utils";
import { SubscriptionItem } from "./SubscriptionItem";

interface TopicListViewProps {
  topicsWithSubscriptions: {
    topic: Topic;
    subscriptions: Subscription[];
  }[];
}

export function TopicListView({ topicsWithSubscriptions }: TopicListViewProps) {
  return (
    <div className="topics-list">
      {topicsWithSubscriptions.map(({ topic, subscriptions }) => (
        <TopicListItem
          key={topic.name}
          topic={topic}
          subscriptions={subscriptions}
        />
      ))}
    </div>
  );
}

interface TopicListItemProps {
  topic: Topic;
  subscriptions: Subscription[];
}

function TopicListItem({ topic, subscriptions }: TopicListItemProps) {
  const { topicName } = extractTopicName(topic.name);

  return (
    <div className="topic-list-item">
      <div className="topic-header">
        <h3 className="topic-name">{topicName}</h3>
        {topic.state && (
          <span
            className={`topic-state topic-state-${topic.state.toLowerCase()}`}
          >
            {topic.state}
          </span>
        )}
      </div>

      {topic.labels && Object.keys(topic.labels).length > 0 && (
        <div className="topic-labels">
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

      <Collapsible
        title={`サブスクリプション (${String(subscriptions.length)})`}
      >
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

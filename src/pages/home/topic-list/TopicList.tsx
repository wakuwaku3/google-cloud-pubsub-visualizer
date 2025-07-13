import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/useAuth";
import {
  getTopics,
  getSubscriptions,
  associateTopicsWithSubscriptions,
} from "@/lib/pubsub";
import { Loading } from "@/components/loading";
import { Collapsible } from "@/components/collapsible";
import type { Topic, Subscription } from "@/types";
import "./TopicList.css";

type ViewMode = "list" | "card";

export function TopicList() {
  const { selectedProject, accessToken } = useAuth();
  const [topicsWithSubscriptions, setTopicsWithSubscriptions] = useState<
    Array<{
      topic: Topic;
      subscriptions: Subscription[];
    }>
  >([]);
  const [filterText, setFilterText] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopicsAndSubscriptions = async () => {
      if (!selectedProject || !accessToken) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // TopicとSubscriptionを並行して取得
        const [topics, subscriptions] = await Promise.all([
          getTopics(accessToken, selectedProject.projectId),
          getSubscriptions(accessToken, selectedProject.projectId),
        ]);

        // TopicとSubscriptionを関連付ける
        const associated = associateTopicsWithSubscriptions(
          topics,
          subscriptions
        );

        // Topic名で昇順ソート
        const sorted = associated.sort((a, b) => {
          const topicNameA = extractTopicName(a.topic.name).topicName;
          const topicNameB = extractTopicName(b.topic.name).topicName;
          return topicNameA.localeCompare(topicNameB);
        });

        setTopicsWithSubscriptions(sorted);
      } catch (err) {
        console.error("Failed to fetch topics and subscriptions:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchTopicsAndSubscriptions();
  }, [selectedProject, accessToken]);

  if (!selectedProject) {
    return (
      <div className="topic-list-container">
        <p className="no-project-selected">プロジェクトを選択してください</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="topic-list-container">
        <Loading message="TopicとSubscriptionを取得中..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="topic-list-container">
        <div className="error">
          <h3>エラーが発生しました</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // フィルタリング処理
  const filteredTopics = topicsWithSubscriptions.filter(
    ({ topic, subscriptions }) => {
      if (!filterText) return true;
      const filterLower = filterText.toLowerCase();

      // トピック名でフィルタリング
      const topicName = extractTopicName(topic.name).topicName.toLowerCase();
      if (topicName.includes(filterLower)) return true;

      // トピックのラベルでフィルタリング
      if (topic.labels) {
        const topicLabelValues = Object.values(topic.labels).map((value) =>
          value.toLowerCase()
        );
        if (topicLabelValues.some((value) => value.includes(filterLower)))
          return true;
      }

      // サブスクリプション名でフィルタリング
      const subscriptionNames = subscriptions.map((sub) =>
        extractSubscriptionName(sub.name).subscriptionName.toLowerCase()
      );
      if (subscriptionNames.some((name) => name.includes(filterLower)))
        return true;

      // サブスクリプションのラベルでフィルタリング
      const subscriptionLabelValues = subscriptions
        .filter((sub) => sub.labels)
        .flatMap((sub) => Object.values(sub.labels || {}))
        .map((value) => value.toLowerCase());
      if (subscriptionLabelValues.some((value) => value.includes(filterLower)))
        return true;

      return false;
    }
  );

  if (topicsWithSubscriptions.length === 0) {
    return (
      <div className="topic-list-container">
        <div className="no-topics">
          <h3>Topicが見つかりません</h3>
          <p>このプロジェクトにはTopicが存在しません。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="topic-list-container">
      <div className="topic-list-header">
        <h2>Topic一覧</h2>
        <div className="view-mode-toggle">
          <button
            className={`view-mode-button ${
              viewMode === "list" ? "active" : ""
            }`}
            onClick={() => setViewMode("list")}
            aria-label="リスト表示"
          >
            📋 リスト
          </button>
          <button
            className={`view-mode-button ${
              viewMode === "card" ? "active" : ""
            }`}
            onClick={() => setViewMode("card")}
            aria-label="カード表示"
          >
            🃏 カード
          </button>
        </div>
      </div>

      <div className="filter-container">
        <div className="filter-input-wrapper">
          <span className="filter-icon">🔍</span>
          <input
            type="text"
            placeholder="Topic名、サブスクリプション名、ラベルでフィルタリング..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="filter-input"
          />
          {filterText && (
            <button
              onClick={() => setFilterText("")}
              className="clear-filter-button"
              aria-label="フィルターをクリア"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {filteredTopics.length === 0 && filterText && (
        <div className="no-results">
          <p>「{filterText}」に一致するTopicが見つかりません。</p>
        </div>
      )}

      <div
        className={`topics-container ${
          viewMode === "card" ? "topics-grid" : "topics-list"
        }`}
      >
        {filteredTopics.map(({ topic, subscriptions }) => (
          <TopicListItem
            key={topic.name}
            topic={topic}
            subscriptions={subscriptions}
            viewMode={viewMode}
          />
        ))}
      </div>
    </div>
  );
}

interface TopicListItemProps {
  topic: Topic;
  subscriptions: Subscription[];
  viewMode: ViewMode;
}

function TopicListItem({ topic, subscriptions, viewMode }: TopicListItemProps) {
  const { topicName } = extractTopicName(topic.name);

  if (viewMode === "card") {
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

  // リスト表示（既存のコード）
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

      <Collapsible title={`サブスクリプション (${subscriptions.length})`}>
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

interface SubscriptionItemProps {
  subscription: Subscription;
}

function SubscriptionItem({ subscription }: SubscriptionItemProps) {
  const { subscriptionName } = extractSubscriptionName(subscription.name);
  const isPush = !!subscription.pushConfig;
  const deliveryType = isPush ? "Push" : "Pull";

  return (
    <div className="subscription-item">
      <div className="subscription-header">
        <h5 className="subscription-name">{subscriptionName}</h5>
        {subscription.state && (
          <span
            className={`subscription-state subscription-state-${subscription.state.toLowerCase()}`}
          >
            {subscription.state}
          </span>
        )}
      </div>

      <div className="subscription-details">
        <div className="delivery-type">
          <strong>配信タイプ:</strong> {deliveryType}
        </div>

        {isPush && subscription.pushConfig?.pushEndpoint && (
          <div className="push-endpoint">
            <strong>エンドポイント:</strong>
            <div className="endpoint-url">
              {subscription.pushConfig.pushEndpoint}
            </div>
          </div>
        )}

        {subscription.ackDeadlineSeconds && (
          <div className="ack-deadline">
            <strong>Ack期限:</strong> {subscription.ackDeadlineSeconds}秒
          </div>
        )}

        {subscription.labels && Object.keys(subscription.labels).length > 0 && (
          <div className="subscription-labels">
            <strong>ラベル:</strong>
            <div className="labels-grid">
              {Object.entries(subscription.labels).map(([key, value]) => (
                <span key={key} className="label">
                  {key}: {value}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Topic名からトピック名のみを抽出
function extractTopicName(topicName: string): { topicName: string } {
  const parts = topicName.split("/");
  return {
    topicName: parts[parts.length - 1],
  };
}

// Subscription名からサブスクリプション名のみを抽出
function extractSubscriptionName(subscriptionName: string): {
  subscriptionName: string;
} {
  const parts = subscriptionName.split("/");
  return {
    subscriptionName: parts[parts.length - 1],
  };
}

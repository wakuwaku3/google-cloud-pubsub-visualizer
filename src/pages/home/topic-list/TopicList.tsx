import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/useAuth";
import {
  getTopics,
  getSubscriptions,
  associateTopicsWithSubscriptions,
} from "@/lib/pubsub";
import { Loading } from "@/components/loading";
import { TopicListView } from "./TopicListView";
import { TopicCardView } from "./TopicCardView";
import type { Topic, Subscription } from "@/types";
import "./TopicList.css";

type ViewMode = "list" | "card";

const VIEW_MODE_STORAGE_KEY = "topic-list-view-mode";

export function TopicList() {
  const { selectedProject, accessToken } = useAuth();
  const [topicsWithSubscriptions, setTopicsWithSubscriptions] = useState<
    {
      topic: Topic;
      subscriptions: Subscription[];
    }[]
  >([]);
  const [filterText, setFilterText] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const savedViewMode = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    if (savedViewMode === "list" || savedViewMode === "card") {
      return savedViewMode;
    }
    return "list";
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 表示モードが変更されたときにlocalStorageに保存
  useEffect(() => {
    localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode);
  }, [viewMode]);

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
        .flatMap((sub) => Object.values(sub.labels ?? {}))
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
            type="button"
            className={`view-mode-button ${
              viewMode === "list" ? "active" : ""
            }`}
            onClick={() => {
              setViewMode("list");
            }}
            aria-label="リスト表示"
          >
            📋 リスト
          </button>
          <button
            type="button"
            className={`view-mode-button ${
              viewMode === "card" ? "active" : ""
            }`}
            onClick={() => {
              setViewMode("card");
            }}
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
            onChange={(e) => {
              setFilterText(e.target.value);
            }}
            className="filter-input"
          />
          {filterText && (
            <button
              type="button"
              onClick={() => {
                setFilterText("");
              }}
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

      <div className="topics-container">
        {viewMode === "list" ? (
          <TopicListView topicsWithSubscriptions={filteredTopics} />
        ) : (
          <TopicCardView topicsWithSubscriptions={filteredTopics} />
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

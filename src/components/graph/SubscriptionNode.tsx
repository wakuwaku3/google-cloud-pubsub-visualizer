import { memo } from "react";
import { Handle, Position } from "reactflow";
import "./SubscriptionNode.css";

interface SubscriptionNodeProps {
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
  };
}

export const SubscriptionNode = memo(({ data }: SubscriptionNodeProps) => {
  const isPush = !!data.pushConfig;
  const deliveryType = isPush ? "Push" : "Pull";

  return (
    <div
      className={`subscription-node ${
        data.isEventPublisher ? "event-publisher" : ""
      }`}
    >
      <Handle type="target" position={Position.Left} />
      <div className="subscription-content">
        <div className="subscription-header">
          <div className="subscription-icon">
            {data.isEventPublisher ? "🚀" : "📥"}
          </div>
          <div className="subscription-label">{data.label}</div>
          {data.state && (
            <span
              className={`subscription-state subscription-state-${data.state.toLowerCase()}`}
            >
              {data.state}
            </span>
          )}
        </div>

        <div className="subscription-details">
          <div className="delivery-type">
            <strong>配信:</strong> {deliveryType}
          </div>

          {data.isEventPublisher && data.eventId && (
            <div className="event-id">Event {data.eventId}</div>
          )}
        </div>

        {data.labels && Object.keys(data.labels).length > 0 && (
          <div className="subscription-labels">
            {Object.entries(data.labels)
              .filter(([key]) => !key.startsWith("publishing_event_id"))
              .slice(0, 2)
              .map(([key, value]) => (
                <span key={key} className="label">
                  {key}: {value}
                </span>
              ))}
            {Object.entries(data.labels).filter(
              ([key]) => !key.startsWith("publishing_event_id")
            ).length > 2 && (
              <span className="label-more">
                +
                {Object.entries(data.labels).filter(
                  ([key]) => !key.startsWith("publishing_event_id")
                ).length - 2}
              </span>
            )}
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
});

SubscriptionNode.displayName = "SubscriptionNode";

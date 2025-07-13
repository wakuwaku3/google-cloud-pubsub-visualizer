import type { Subscription } from "@/types";
import { extractSubscriptionName } from "./utils";

interface SubscriptionItemProps {
  subscription: Subscription;
}

export function SubscriptionItem({ subscription }: SubscriptionItemProps) {
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

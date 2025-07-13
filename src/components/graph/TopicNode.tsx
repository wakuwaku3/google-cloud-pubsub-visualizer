import { memo } from "react";
import { Handle, Position } from "reactflow";
import "./TopicNode.css";

interface TopicNodeProps {
  data: {
    label: string;
    name: string;
    projectId: string;
    state?: string;
    labels?: Record<string, string>;
  };
}

export const TopicNode = memo(({ data }: TopicNodeProps) => {
  return (
    <div className="topic-node">
      <Handle type="target" position={Position.Left} />
      <div className="topic-content">
        <div className="topic-header">
          <div className="topic-icon">📢</div>
          <div className="topic-label">{data.label}</div>
          {data.state && (
            <span
              className={`topic-state topic-state-${data.state.toLowerCase()}`}
            >
              {data.state}
            </span>
          )}
        </div>
        {data.labels && Object.keys(data.labels).length > 0 && (
          <div className="topic-labels">
            {Object.entries(data.labels)
              .slice(0, 2)
              .map(([key, value]) => (
                <span key={key} className="label">
                  {key}: {value}
                </span>
              ))}
            {Object.keys(data.labels).length > 2 && (
              <span className="label-more">
                +{Object.keys(data.labels).length - 2}
              </span>
            )}
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
});

TopicNode.displayName = "TopicNode";

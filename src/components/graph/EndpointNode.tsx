import { memo } from "react";
import { Handle, Position } from "reactflow";
import "./EndpointNode.css";

interface EndpointNodeProps {
  data: {
    label: string;
    name: string;
    projectId: string;
    endpointUrl?: string;
    eventId?: string;
    eventIds?: string[];
    publishingTopics?: string[];
  };
}

export const EndpointNode = memo(({ data }: EndpointNodeProps) => {
  return (
    <div className="endpoint-node">
      <Handle type="target" position={Position.Left} />
      <div className="endpoint-content">
        <div className="endpoint-icon">🌐</div>
        <div className="endpoint-label">{data.label}</div>
        <div className="endpoint-url">{data.endpointUrl}</div>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
});

EndpointNode.displayName = "EndpointNode";

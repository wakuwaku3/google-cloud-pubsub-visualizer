import { useState } from "react";
import "./Collapsible.css";

export interface CollapsibleProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  className?: string;
}

export function Collapsible({
  title,
  children,
  defaultExpanded = false,
  className = "",
}: CollapsibleProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`collapsible ${className}`}>
      <div className="collapsible-header" onClick={toggleExpanded}>
        <h4 className="collapsible-title">{title}</h4>
        <button
          type="button"
          className={`expand-button ${isExpanded ? "expanded" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleExpanded();
          }}
          aria-label={isExpanded ? "折りたたむ" : "展開する"}
        >
          <span className="expand-icon">▼</span>
        </button>
      </div>
      <div className={`collapsible-content ${isExpanded ? "expanded" : ""}`}>
        {children}
      </div>
    </div>
  );
}

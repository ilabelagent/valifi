// Panels Component for Bot Interface
// Provides expandable information panels

import React, { useState } from 'react';

export interface Panel {
  id: string;
  title: string;
  icon?: string;
  type: 'info' | 'chart' | 'list' | 'stats' | 'form' | 'custom';
  content: any;
  expandable?: boolean;
  closable?: boolean;
  actions?: PanelAction[];
  metadata?: Record<string, any>;
}

export interface PanelAction {
  id: string;
  label: string;
  icon?: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

interface PanelsProps {
  panels: Panel[];
  onClose?: (panelId: string) => void;
  onAction?: (panelId: string, actionId: string) => void;
  layout?: 'grid' | 'stack' | 'masonry';
  className?: string;
}

export const Panels: React.FC<PanelsProps> = ({
  panels,
  onClose,
  onAction,
  layout = 'grid',
  className = '',
}) => {
  const [expandedPanels, setExpandedPanels] = useState<Set<string>>(new Set());
  const [closedPanels, setClosedPanels] = useState<Set<string>>(new Set());

  const togglePanel = (panelId: string) => {
    const newExpanded = new Set(expandedPanels);
    if (newExpanded.has(panelId)) {
      newExpanded.delete(panelId);
    } else {
      newExpanded.add(panelId);
    }
    setExpandedPanels(newExpanded);
  };

  const closePanel = (panelId: string) => {
    const newClosed = new Set(closedPanels);
    newClosed.add(panelId);
    setClosedPanels(newClosed);
    if (onClose) {
      onClose(panelId);
    }
  };

  const handleAction = (panelId: string, action: PanelAction) => {
    action.onClick();
    if (onAction) {
      onAction(panelId, action.id);
    }
  };

  const renderPanelContent = (panel: Panel) => {
    switch (panel.type) {
      case 'stats':
        return <StatsContent data={panel.content} />;
      case 'chart':
        return <ChartContent data={panel.content} />;
      case 'list':
        return <ListContent items={panel.content} />;
      case 'form':
        return <FormContent fields={panel.content} />;
      case 'info':
        return <InfoContent content={panel.content} />;
      case 'custom':
        return panel.content;
      default:
        return <div>{JSON.stringify(panel.content)}</div>;
    }
  };

  const visiblePanels = panels.filter(p => !closedPanels.has(p.id));

  return (
    <div className={`panels-container ${layout} ${className}`}>
      <style jsx>{`
        .panels-container {
          margin: 16px 0;
        }

        .panels-container.grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 16px;
        }

        .panels-container.stack {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .panels-container.masonry {
          column-count: 3;
          column-gap: 16px;
        }

        @media (max-width: 768px) {
          .panels-container.masonry {
            column-count: 1;
          }
          .panels-container.grid {
            grid-template-columns: 1fr;
          }
        }

        .panel {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          overflow: hidden;
          transition: all 0.3s ease;
          break-inside: avoid;
          margin-bottom: 16px;
        }

        .panel:hover {
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }

        .panel-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .panel-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          font-weight: 600;
        }

        .panel-controls {
          display: flex;
          gap: 8px;
        }

        .panel-control {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          border-radius: 8px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          color: white;
        }

        .panel-control:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .panel-body {
          padding: 16px;
          max-height: 400px;
          overflow-y: auto;
          transition: max-height 0.3s ease;
        }

        .panel-body.expanded {
          max-height: none;
        }

        .panel-body.collapsed {
          max-height: 0;
          padding: 0;
        }

        .panel-actions {
          padding: 12px 16px;
          background: #f8f9fa;
          display: flex;
          gap: 8px;
          justify-content: flex-end;
          border-top: 1px solid #e9ecef;
        }

        .panel-action {
          padding: 8px 16px;
          border-radius: 8px;
          border: none;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .panel-action.primary {
          background: #667eea;
          color: white;
        }

        .panel-action.primary:hover {
          background: #5a67d8;
        }

        .panel-action.secondary {
          background: #e9ecef;
          color: #495057;
        }

        .panel-action.secondary:hover {
          background: #dee2e6;
        }

        .panel-action.danger {
          background: #dc3545;
          color: white;
        }

        .panel-action.danger:hover {
          background: #c82333;
        }
      `}</style>

      {visiblePanels.map(panel => {
        const isExpanded = expandedPanels.has(panel.id);
        const isCollapsed = !isExpanded && panel.expandable;

        return (
          <div key={panel.id} className="panel">
            <div className="panel-header">
              <div className="panel-title">
                {panel.icon && <span>{panel.icon}</span>}
                <span>{panel.title}</span>
              </div>
              <div className="panel-controls">
                {panel.expandable && (
                  <button
                    className="panel-control"
                    onClick={() => togglePanel(panel.id)}
                    title={isExpanded ? 'Collapse' : 'Expand'}
                  >
                    {isExpanded ? '▼' : '▶'}
                  </button>
                )}
                {panel.closable && (
                  <button
                    className="panel-control"
                    onClick={() => closePanel(panel.id)}
                    title="Close"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            <div className={`panel-body ${isExpanded ? 'expanded' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
              {renderPanelContent(panel)}
            </div>

            {panel.actions && panel.actions.length > 0 && (
              <div className="panel-actions">
                {panel.actions.map(action => (
                  <button
                    key={action.id}
                    className={`panel-action ${action.variant || 'secondary'}`}
                    onClick={() => handleAction(panel.id, action)}
                  >
                    {action.icon && <span>{action.icon}</span>}
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Stats Content Component
const StatsContent: React.FC<{ data: any }> = ({ data }) => {
  return (
    <div className="stats-grid">
      <style jsx>{`
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 16px;
        }
        .stat-item {
          text-align: center;
        }
        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: #667eea;
        }
        .stat-label {
          font-size: 12px;
          color: #6c757d;
          margin-top: 4px;
        }
      `}</style>
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="stat-item">
          <div className="stat-value">{String(value)}</div>
          <div className="stat-label">{key}</div>
        </div>
      ))}
    </div>
  );
};

// Chart Content Component (Placeholder)
const ChartContent: React.FC<{ data: any }> = ({ data }) => {
  return (
    <div className="chart-container">
      <style jsx>{`
        .chart-container {
          height: 200px;
          background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6c757d;
        }
      `}</style>
      <div>📊 Chart Data: {JSON.stringify(data).substring(0, 50)}...</div>
    </div>
  );
};

// List Content Component
const ListContent: React.FC<{ items: any[] }> = ({ items }) => {
  return (
    <ul className="panel-list">
      <style jsx>{`
        .panel-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .panel-list li {
          padding: 8px 0;
          border-bottom: 1px solid #e9ecef;
        }
        .panel-list li:last-child {
          border-bottom: none;
        }
      `}</style>
      {items.map((item, index) => (
        <li key={index}>{typeof item === 'object' ? JSON.stringify(item) : item}</li>
      ))}
    </ul>
  );
};

// Form Content Component
const FormContent: React.FC<{ fields: any[] }> = ({ fields }) => {
  return (
    <div className="panel-form">
      <style jsx>{`
        .panel-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .form-field {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .form-label {
          font-size: 13px;
          color: #6c757d;
        }
        .form-input {
          padding: 8px;
          border: 1px solid #dee2e6;
          border-radius: 6px;
          font-size: 14px;
        }
      `}</style>
      {fields.map((field, index) => (
        <div key={index} className="form-field">
          <label className="form-label">{field.label}</label>
          <input
            type={field.type || 'text'}
            className="form-input"
            placeholder={field.placeholder}
            defaultValue={field.value}
          />
        </div>
      ))}
    </div>
  );
};

// Info Content Component
const InfoContent: React.FC<{ content: any }> = ({ content }) => {
  return (
    <div className="info-content">
      <style jsx>{`
        .info-content {
          color: #495057;
          line-height: 1.6;
        }
      `}</style>
      {typeof content === 'string' ? (
        <p>{content}</p>
      ) : (
        <div>{JSON.stringify(content, null, 2)}</div>
      )}
    </div>
  );
};

export default Panels;
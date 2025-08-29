// Suggestions Component for Bot Interface
// Provides quick action suggestions to users

import React, { useState, useEffect } from 'react';

export interface Suggestion {
  id: string;
  text: string;
  icon?: string;
  action: string;
  category?: string;
  data?: any;
  priority?: number;
}

export interface SuggestionCategory {
  id: string;
  name: string;
  icon?: string;
  suggestions: Suggestion[];
}

interface SuggestionsProps {
  suggestions?: Suggestion[];
  categories?: SuggestionCategory[];
  onSelect: (suggestion: Suggestion) => void;
  maxVisible?: number;
  showCategories?: boolean;
  className?: string;
}

export const Suggestions: React.FC<SuggestionsProps> = ({
  suggestions = [],
  categories = [],
  onSelect,
  maxVisible = 6,
  showCategories = false,
  className = '',
}) => {
  const [visibleSuggestions, setVisibleSuggestions] = useState<Suggestion[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (categories.length > 0 && showCategories) {
      const categorySuggestions = selectedCategory
        ? categories.find(c => c.id === selectedCategory)?.suggestions || []
        : categories.flatMap(c => c.suggestions);
      
      setVisibleSuggestions(
        isExpanded 
          ? categorySuggestions 
          : categorySuggestions.slice(0, maxVisible)
      );
    } else {
      setVisibleSuggestions(
        isExpanded 
          ? suggestions 
          : suggestions.slice(0, maxVisible)
      );
    }
  }, [suggestions, categories, selectedCategory, isExpanded, maxVisible, showCategories]);

  const handleSuggestionClick = (suggestion: Suggestion) => {
    onSelect(suggestion);
    setIsExpanded(false);
    setSelectedCategory(null);
  };

  return (
    <div className={`suggestions-container ${className}`}>
      <style jsx>{`
        .suggestions-container {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 16px;
          padding: 16px;
          margin: 16px 0;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .suggestions-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .suggestions-title {
          color: white;
          font-size: 16px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .category-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }

        .category-tab {
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 20px;
          padding: 6px 14px;
          color: white;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .category-tab:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-1px);
        }

        .category-tab.active {
          background: white;
          color: #667eea;
          font-weight: 600;
        }

        .suggestions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 10px;
        }

        .suggestion-card {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 12px;
          padding: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          min-height: 80px;
          position: relative;
          overflow: hidden;
        }

        .suggestion-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #667eea, #764ba2);
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }

        .suggestion-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        }

        .suggestion-card:hover::before {
          transform: scaleX(1);
        }

        .suggestion-icon {
          font-size: 24px;
          margin-bottom: 8px;
        }

        .suggestion-text {
          font-size: 13px;
          color: #333;
          font-weight: 500;
          line-height: 1.3;
        }

        .expand-button {
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 20px;
          padding: 6px 14px;
          color: white;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .expand-button:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        @media (max-width: 640px) {
          .suggestions-grid {
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          }
        }
      `}</style>

      <div className="suggestions-header">
        <div className="suggestions-title">
          <span>✨</span>
          <span>Quick Actions</span>
        </div>
        {visibleSuggestions.length < (suggestions.length || categories.flatMap(c => c.suggestions).length) && (
          <button 
            className="expand-button"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Show Less' : `Show All`}
          </button>
        )}
      </div>

      {showCategories && categories.length > 0 && (
        <div className="category-tabs">
          <button
            className={`category-tab ${!selectedCategory ? 'active' : ''}`}
            onClick={() => setSelectedCategory(null)}
          >
            All
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              className={`category-tab ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.icon && <span>{category.icon}</span>}
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      )}

      <div className="suggestions-grid">
        {visibleSuggestions.map(suggestion => (
          <div
            key={suggestion.id}
            className="suggestion-card"
            onClick={() => handleSuggestionClick(suggestion)}
          >
            {suggestion.icon && (
              <div className="suggestion-icon">{suggestion.icon}</div>
            )}
            <div className="suggestion-text">{suggestion.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Suggestions;
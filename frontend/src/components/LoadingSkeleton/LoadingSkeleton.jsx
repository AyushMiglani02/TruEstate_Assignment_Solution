import './LoadingSkeleton.css';

/**
 * LoadingSkeleton component for better loading UX
 * Shows skeleton placeholders while data is loading
 */
export function LoadingSkeleton({ type = 'table', count = 10 }) {
  if (type === 'table') {
    return (
      <div className="skeleton-container">
        <div className="skeleton-table">
          {/* Header */}
          <div className="skeleton-row skeleton-header">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="skeleton-cell skeleton-header-cell" />
            ))}
          </div>
          
          {/* Body rows */}
          {[...Array(count)].map((_, rowIndex) => (
            <div key={rowIndex} className="skeleton-row">
              {[...Array(10)].map((_, cellIndex) => (
                <div key={cellIndex} className="skeleton-cell">
                  <div className="skeleton-text" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'filter') {
    return (
      <div className="skeleton-filter">
        <div className="skeleton-filter-group">
          <div className="skeleton-title" />
          <div className="skeleton-checkbox-list">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton-checkbox">
                <div className="skeleton-checkbox-box" />
                <div className="skeleton-checkbox-label" />
              </div>
            ))}
          </div>
        </div>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton-filter-group">
            <div className="skeleton-title" />
            <div className="skeleton-checkbox-list">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="skeleton-checkbox">
                  <div className="skeleton-checkbox-box" />
                  <div className="skeleton-checkbox-label" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
}


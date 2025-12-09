import './StatsCards.css';

/**
 * StatsCards component displaying key metrics
 * @returns {JSX.Element}
 */
export function StatsCards({ stats }) {
  const { totalIncome, totalOrders, totalDiscount, totalRecords } = stats || {
    totalIncome: 0,
    totalOrders: 0,
    totalDiscount: 0,
    totalRecords: 0
  };

  const formatCurrency = (amount) => {
    return `₹${Math.round(amount).toLocaleString('en-IN')}`;
  };

  return (
    <div className="stats-cards">
      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-title">Total units sold</span>
          <button className="stat-info-icon" aria-label="More information">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10 14V10M10 7H10.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <div className="stat-value-large">{totalOrders.toLocaleString('en-IN')}</div>
      </div>

      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-title">Total Amount</span>
          <button className="stat-info-icon" aria-label="More information">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10 14V10M10 7H10.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <div className="stat-value-large">
          {formatCurrency(totalIncome)} <span className="stat-subtitle">({totalRecords} SRs)</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-title">Total Discount</span>
          <button className="stat-info-icon" aria-label="More information">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10 14V10M10 7H10.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <div className="stat-value-large">
          {formatCurrency(totalDiscount)} <span className="stat-subtitle">({totalRecords} SRs)</span>
        </div>
      </div>
    </div>
  );
}


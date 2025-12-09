import { useState } from 'react';
import './Sidebar.css';

/**
 * Sidebar component with navigation menu
 * @returns {JSX.Element}
 */
export function Sidebar() {
  const [expandedSections, setExpandedSections] = useState({
    services: false,
    invoices: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <aside className="sidebar" role="navigation" aria-label="Main navigation">
      {/* User Profile Section */}
      <div className="sidebar-profile">
        <div className="profile-avatar">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="8" fill="#6366F1"/>
            <path d="M16 16C18.2091 16 20 14.2091 20 12C20 9.79086 18.2091 8 16 8C13.7909 8 12 9.79086 12 12C12 14.2091 13.7909 16 16 16Z" fill="white"/>
            <path d="M16 18C12.134 18 9 19.79 9 22V24H23V22C23 19.79 19.866 18 16 18Z" fill="white"/>
          </svg>
        </div>
        <div className="profile-info">
          <div className="profile-name">Vault</div>
          <div className="profile-user">Anurag Yadav</div>
        </div>
        <button className="profile-dropdown" aria-label="Profile options">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        <a href="#dashboard" className="nav-item active">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 9L10 3L17 9V17C17 17.5304 16.7893 18.0391 16.4142 18.4142C16.0391 18.7893 15.5304 19 15 19H5C4.46957 19 3.96086 18.7893 3.58579 18.4142C3.21071 18.0391 3 17.5304 3 17V9Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Dashboard
        </a>

        <a href="#nexus" className="nav-item">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="10" cy="10" r="3" fill="currentColor"/>
          </svg>
          Nexus
        </a>

        <a href="#intake" className="nav-item">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M10 7V13M7 10H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Intake
        </a>

        {/* Services Section */}
        <div className="nav-section">
          <button 
            className={`nav-item nav-section-toggle ${expandedSections.services ? 'expanded' : ''}`}
            onClick={() => toggleSection('services')}
            aria-expanded={expandedSections.services}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
              <rect x="11" y="3" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
              <rect x="3" y="11" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
              <rect x="11" y="11" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            Services
            <svg className="expand-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {expandedSections.services && (
            <div className="nav-submenu">
              <a href="#pre-active" className="nav-subitem">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                Pre-active
              </a>
              <a href="#active" className="nav-subitem">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="2" width="12" height="12" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                Active
              </a>
              <a href="#blocked" className="nav-subitem">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M3 13L13 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                Blocked
              </a>
              <a href="#closed" className="nav-subitem">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                Closed
              </a>
            </div>
          )}
        </div>

        {/* Invoices Section */}
        <div className="nav-section">
          <button 
            className={`nav-item nav-section-toggle ${expandedSections.invoices ? 'expanded' : ''}`}
            onClick={() => toggleSection('invoices')}
            aria-expanded={expandedSections.invoices}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 3H15C16.1046 3 17 3.89543 17 5V17L10 14L3 17V5C3 3.89543 3.89543 3 5 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Invoices
            <svg className="expand-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {expandedSections.invoices && (
            <div className="nav-submenu">
              <a href="#proforma" className="nav-subitem">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 2H12L14 4V14H2V4L4 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
                Proforma Invoices
              </a>
              <a href="#final" className="nav-subitem">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 2H12L14 4V14H2V4L4 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
                Final Invoices
              </a>
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
}


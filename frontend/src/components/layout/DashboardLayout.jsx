import React from 'react';

export function DashboardLayout({ children }) {
  return (
    <div className="premium-layout">
      <div className="background-glows">
        <div className="glow glow-1"></div>
        <div className="glow glow-2"></div>
        <div className="glow glow-3"></div>
      </div>
      {children}
    </div>
  );
}

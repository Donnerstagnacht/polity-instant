import React from 'react';

interface ActionBarProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Reusable action bar component for displaying action buttons
 * Typically placed below the stats bar on entity pages
 */
export const ActionBar: React.FC<ActionBarProps> = ({ children, className = '' }) => (
  <div className={`mb-6 flex justify-center gap-2 ${className}`}>{children}</div>
);

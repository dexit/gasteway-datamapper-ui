
import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  color: 'blue' | 'green' | 'red' | 'yellow' | 'gray' | 'purple' | 'cyan';
}

export const Badge: React.FC<BadgeProps> = ({ children, color }) => {
  const colorClasses = {
    blue: 'bg-blue-900 text-blue-300',
    green: 'bg-green-900 text-green-300',
    red: 'bg-red-900 text-red-300',
    yellow: 'bg-yellow-900 text-yellow-300',
    gray: 'bg-slate-700 text-slate-300',
    purple: 'bg-purple-900 text-purple-300',
    cyan: 'bg-cyan-900 text-cyan-300',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses[color]}`}
    >
      {children}
    </span>
  );
};

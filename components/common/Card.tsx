
import React from 'react';

interface CardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
}

export const Card: React.FC<CardProps> = ({ title, value, icon, description }) => {
  return (
    <div className="bg-slate-900 p-6 rounded-lg shadow-lg border border-slate-800 flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-400 truncate">{title}</p>
          <p className="text-3xl font-semibold text-white mt-1">{value}</p>
        </div>
        <div className="bg-slate-800 p-3 rounded-lg">
          {icon}
        </div>
      </div>
      {description && <p className="text-xs text-slate-500 mt-4">{description}</p>}
    </div>
  );
};

import React, { useEffect } from 'react';
import { ToastMessage } from '../../contexts/ToastContext';
import { CloseIcon, AlertTriangleIcon, CheckCircleIcon, DashboardIcon } from '../icons';

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: number) => void;
}

const toastConfig = {
  success: {
    icon: <CheckCircleIcon className="h-6 w-6 text-green-400" />,
    style: 'bg-green-900/80 border-green-700',
  },
  error: {
    icon: <AlertTriangleIcon className="h-6 w-6 text-red-400" />,
    style: 'bg-red-900/80 border-red-700',
  },
  info: {
    icon: <DashboardIcon className="h-6 w-6 text-blue-400" />,
    style: 'bg-blue-900/80 border-blue-700',
  },
};

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  const { id, message, type } = toast;
  const config = toastConfig[type];

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 5000); // Auto-dismiss after 5 seconds

    return () => {
      clearTimeout(timer);
    };
  }, [id, onClose]);

  return (
    <div className={`w-full max-w-sm rounded-lg shadow-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden backdrop-blur-sm border ${config.style}`}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {config.icon}
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium text-slate-200">
              {message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={() => onClose(id)}
              className="inline-flex rounded-md text-slate-400 hover:text-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
            >
              <span className="sr-only">Close</span>
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

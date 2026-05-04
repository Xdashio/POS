import React from 'react';
import { X } from 'lucide-react';

const Dialog = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  showCloseButton = true 
}) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-lg shadow-xl w-full ${sizes[size]} animate-slide-up`}>
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            {title && (
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'default'
}) => {
  const typeStyles = {
    default: {
      confirm: 'btn-primary',
      icon: null
    },
    danger: {
      confirm: 'bg-red-600 text-white hover:bg-red-700',
      icon: null
    },
    warning: {
      confirm: 'bg-orange-600 text-white hover:bg-orange-700',
      icon: null
    }
  };

  const currentStyle = typeStyles[type] || typeStyles.default;

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        <p className="text-gray-700">{message}</p>
        <div className="flex space-x-3 justify-end">
          <button
            onClick={onClose}
            className="btn btn-outline btn-md"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`btn btn-md ${currentStyle.confirm}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export default Dialog;

import React from 'react';
import PropTypes from 'prop-types';

const ReusableModal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className={`relative bg-white rounded-2xl shadow-xl w-full ${maxWidth} p-6`}>
          <div className="flex justify-between items-center mb-6">
            {title && <h2 className="text-2xl font-bold text-gray-900">{title}</h2>}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

ReusableModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  maxWidth: PropTypes.string,
};

export default ReusableModal; 
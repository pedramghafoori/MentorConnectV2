import React from 'react';
import PropTypes from 'prop-types';
import ReusableModal from '../ReusableModal';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DeleteAccountModal = ({ isOpen, onClose, deletionDate }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleConfirm = async () => {
    await logout();
    navigate('/');
  };

  return (
    <ReusableModal
      isOpen={isOpen}
      onClose={onClose}
      title="Account Deletion Requested"
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Your account has been queued for deletion.
              </p>
            </div>
          </div>
        </div>

        <div className="text-gray-600 space-y-2">
          <p>
            Your account will be permanently deleted on <span className="font-semibold">{new Date(deletionDate).toLocaleDateString()}</span>.
          </p>
          <p>
            Until then, you can log back in with your existing credentials to restore your account and cancel the deletion.
          </p>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            onClick={handleConfirm}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#d33] hover:bg-[#c22] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d33]"
          >
            I Understand
          </button>
        </div>
      </div>
    </ReusableModal>
  );
};

DeleteAccountModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  deletionDate: PropTypes.string.isRequired
};

export default DeleteAccountModal; 
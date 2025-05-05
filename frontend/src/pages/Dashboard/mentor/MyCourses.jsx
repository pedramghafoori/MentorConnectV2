import React, { useEffect, useState } from 'react';
import api from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import CreateCourseModal from '../../../components/Course/CreateCourseModal';
import trashIcon from '../../../assets/icons/trash.svg';

const TrashModal = ({ isOpen, onClose, deletedOpportunities, onRecover }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
          <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={onClose}>&times;</button>
          <h2 className="text-xl font-bold mb-4">Recently Deleted Opportunities</h2>
          {deletedOpportunities.length === 0 ? (
            <div className="text-gray-500">No recently deleted opportunities.</div>
          ) : (
            <ul className="space-y-3">
              {deletedOpportunities.map(opp => (
                <li key={opp._id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <div className="font-semibold">{opp.title}</div>
                    <div className="text-gray-500 text-sm">Deleted: {new Date(opp.deletedAt).toLocaleString()}</div>
                  </div>
                  <button
                    onClick={() => onRecover(opp._id)}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Recover
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

const MyCourses = () => {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const navigate = useNavigate();
  const [showTrashModal, setShowTrashModal] = useState(false);
  const [deletedOpportunities, setDeletedOpportunities] = useState([]);

  // Function to fetch opportunities
  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/opportunities?mentor=${user._id}`);
      setOpportunities(res.data);
    } catch (err) {
      setError('Failed to fetch opportunities');
    } finally {
      setLoading(false);
    }
  };

  // Fetch deleted opportunities (within last 24h)
  const fetchDeletedOpportunities = async () => {
    try {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const res = await api.get(`/opportunities?mentor=${user._id}&deletedSince=${since}`);
      setDeletedOpportunities(res.data);
    } catch (err) {
      setDeletedOpportunities([]);
    }
  };

  useEffect(() => {
    if (user && user._id) {
      fetchOpportunities();
    }
  }, [user]);

  const handleEdit = (opportunity) => {
    setSelectedOpportunity(opportunity);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedOpportunity(null);
    fetchOpportunities(); // Refresh the list after edit
  };

  const handleDelete = async (opportunityId) => {
    if (!window.confirm('Are you sure you want to delete this opportunity? This action can be undone within 24 hours.')) return;
    try {
      await api.delete(`/opportunities/${opportunityId}`);
      fetchOpportunities();
    } catch (err) {
      alert('Failed to delete opportunity.');
    }
  };

  const handleOpenTrash = () => {
    fetchDeletedOpportunities();
    setShowTrashModal(true);
  };

  const handleRecover = async (opportunityId) => {
    try {
      await api.patch(`/opportunities/${opportunityId}`, { deletedAt: null });
      fetchOpportunities();
      fetchDeletedOpportunities();
    } catch (err) {
      alert('Failed to recover opportunity.');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Opportunities</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedOpportunity(null);
              setShowEditModal(true);
            }}
            className="p-2 rounded-full hover:bg-gray-200"
            title="Post an Opportunity"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#d33]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            onClick={handleOpenTrash}
            className="p-2 rounded-full hover:bg-gray-200"
            title="View Recently Deleted"
          >
            <img src={trashIcon} alt="Recently Deleted" className="w-6 h-6" />
          </button>
        </div>
      </div>
      <TrashModal
        isOpen={showTrashModal}
        onClose={() => setShowTrashModal(false)}
        deletedOpportunities={deletedOpportunities}
        onRecover={handleRecover}
      />
      {opportunities.length === 0 ? (
        <div>No opportunities found.</div>
      ) : (
        <ul className="space-y-4">
          {opportunities.map(opp => (
            <li
              key={opp._id}
              className="p-4 border rounded-lg shadow-sm bg-white hover:bg-gray-100 transition cursor-pointer"
            >
              <div className="font-semibold text-lg">{opp.title}</div>
              <div className="text-gray-600">Price: {opp.price ? `$${opp.price}` : 'N/A'}</div>
              <div className="text-gray-600">Status: {opp.status || 'N/A'}</div>
              <div className="text-gray-500 text-sm">
                Dates: {opp.schedule && opp.schedule.isExamOnly
                  ? (opp.schedule.examDate ? new Date(opp.schedule.examDate).toLocaleDateString() : 'N/A')
                  : (opp.schedule && opp.schedule.courseDates && opp.schedule.courseDates.length > 0
                      ? opp.schedule.courseDates.map(d => new Date(d).toLocaleDateString()).join(', ')
                      : 'N/A')}
              </div>
              {opp.deletedAt ? (
                <div className="mt-2 text-red-500 font-semibold">Pending Deletion (undo within 24h)</div>
              ) : (
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleEdit(opp)}
                    className="px-3 py-1 bg-[#d33] text-white rounded hover:bg-[#c22]"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(opp._id)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      <CreateCourseModal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        initialOpportunity={selectedOpportunity}
      />
    </div>
  );
};

export default MyCourses; 
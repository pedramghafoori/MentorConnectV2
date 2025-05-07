import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import ReusableModal from '../ReusableModal';
import './CertificationManager.css';

const SECTION_DEFS = [
  {
    key: 'INSTRUCTOR_TRAINER',
    title: 'Instructor Trainer Awards',
    level: 3,
  },
  {
    key: 'EXAMINER',
    title: 'Examiner Awards',
    level: 2,
  },
  {
    key: 'INSTRUCTOR',
    title: 'Instructor Awards',
    level: 1,
  },
];

const CertificationManager = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAward, setModalAward] = useState(null); // {categoryId, categoryName, award, hierarchy}
  const [modalAwardName, setModalAwardName] = useState('');
  const [modalAwardHierarchy, setModalAwardHierarchy] = useState(1);
  const [modalAwardCategoryId, setModalAwardCategoryId] = useState('');
  const [modalAwardCategoryName, setModalAwardCategoryName] = useState('');
  const [saving, setSaving] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [createSectionLevel, setCreateSectionLevel] = useState(null);

  const isDeveloper = user?.email === 'pedramghafoori@hotmail.com';

  useEffect(() => {
    if (isDeveloper) {
      fetchCategories();
    }
  }, [isDeveloper]);

  const fetchCategories = async () => {
    try {
      console.log('[CertificationManager] Fetching categories...');
      const response = await api.get('/certification-categories');
      setCategories(response.data);
      setLoading(false);
      console.log('[CertificationManager] Categories fetched:', response.data);
    } catch (err) {
      setError('Failed to fetch certification categories');
      setLoading(false);
      console.error('[CertificationManager] Error fetching categories:', err);
    }
  };

  // Helper: get all awards for a section, with their category name and hierarchy
  const getSectionAwards = (sectionLevel) => {
    const cats = categories.filter(c => c.level === sectionLevel);
    let result = [];
    cats.forEach(cat => {
      (cat.validAwards || []).forEach(awardObj => {
        if (typeof awardObj === 'string') {
          result.push({
            categoryId: cat._id,
            categoryName: cat.name,
            award: awardObj,
            hierarchy: 9999, // fallback if not set
          });
        } else {
          result.push({
            categoryId: cat._id,
            categoryName: cat.name,
            award: awardObj.name,
            hierarchy: awardObj.hierarchy ?? 9999,
          });
        }
      });
    });
    // Sort by hierarchy number ascending
    return result.sort((a, b) => a.hierarchy - b.hierarchy);
  };

  const getSectionCategories = (sectionLevel) => {
    return categories.filter(c => c.level === sectionLevel);
  };

  const handleAwardClick = (awardObj) => {
    setIsCreateMode(false);
    setModalAward(awardObj);
    setModalAwardName(awardObj.award);
    setModalAwardHierarchy(awardObj.hierarchy);
    setModalAwardCategoryId(awardObj.categoryId);
    setModalAwardCategoryName(awardObj.categoryName);
    setModalOpen(true);
  };

  const handleCreateAward = (sectionLevel) => {
    setIsCreateMode(true);
    setCreateSectionLevel(sectionLevel);
    setModalAward(null);
    setModalAwardName('');
    setModalAwardHierarchy(1);
    const sectionCats = getSectionCategories(sectionLevel);
    if (sectionCats.length === 1) {
      setModalAwardCategoryId(sectionCats[0]._id);
      setModalAwardCategoryName(sectionCats[0].name);
    } else {
      setModalAwardCategoryId('');
      setModalAwardCategoryName('');
    }
    setModalOpen(true);
  };

  const handleModalSave = async () => {
    setSaving(true);
    try {
      if (isCreateMode) {
        // Add new award to selected category
        const cat = categories.find(c => c._id === modalAwardCategoryId);
        console.log('[CertificationManager] Creating award:', { modalAwardName, modalAwardHierarchy, modalAwardCategoryId, cat });
        if (!cat) throw new Error('Category not found for creation');
        const newAwardObj = { name: modalAwardName, hierarchy: Number(modalAwardHierarchy) };
        const updatedAwards = [...(cat.validAwards || []), newAwardObj];
        const patchRes = await api.patch(`/certification-categories/${cat._id}`, { validAwards: updatedAwards });
        console.log('[CertificationManager] PATCH create response:', patchRes);
      } else {
        // Edit existing award
        const cat = categories.find(c => c._id === modalAward.categoryId);
        console.log('[CertificationManager] Editing award:', { modalAward, modalAwardName, modalAwardHierarchy, cat });
        if (!cat) throw new Error('Category not found for edit');
        const updatedAwards = (cat.validAwards || []).map(a => {
          if ((typeof a === 'string' && a === modalAward.award) || (a.name === modalAward.award)) {
            return { name: modalAwardName, hierarchy: Number(modalAwardHierarchy) };
          }
          return typeof a === 'string' ? { name: a, hierarchy: 9999 } : a;
        });
        const patchRes = await api.patch(`/certification-categories/${cat._id}`, { validAwards: updatedAwards });
        console.log('[CertificationManager] PATCH edit response:', patchRes);
      }
      setModalOpen(false);
      setModalAward(null);
      setIsCreateMode(false);
      fetchCategories();
    } catch (err) {
      setError('Failed to save award');
      console.error('[CertificationManager] Error saving award:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveAward = async (categoryId, awardToRemove) => {
    try {
      const category = categories.find(c => c._id === categoryId);
      console.log('[CertificationManager] Removing award:', { categoryId, awardToRemove, category });
      if (!category) throw new Error('Category not found for remove');
      const updatedCategory = {
        ...category,
        validAwards: (category.validAwards || []).filter(a => {
          if (typeof a === 'string') return a !== awardToRemove;
          return a.name !== awardToRemove;
        })
      };
      const patchRes = await api.patch(`/certification-categories/${categoryId}`, { validAwards: updatedCategory.validAwards });
      setCategories(categories.map(cat => 
        cat._id === categoryId ? updatedCategory : cat
      ));
      console.log('[CertificationManager] PATCH remove response:', patchRes);
    } catch (err) {
      setError('Failed to remove award');
      console.error('[CertificationManager] Error removing award:', err);
    }
  };

  if (!isDeveloper) {
    return <div className="access-denied">Access Denied</div>;
  }
  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="certification-manager">
      <h2>Certification Categories Management</h2>
      <div className="categories-list">
        {SECTION_DEFS.map(section => {
          const sectionAwards = getSectionAwards(section.level);
          const sectionCats = getSectionCategories(section.level);
          return (
            <div key={section.key} className="category-section">
              <h3 className="section-title">{section.title}</h3>
              <div className="category-card">
                <button
                  className="px-4 py-2 mb-4 rounded bg-[#d33] text-white font-semibold hover:bg-[#b32] transition"
                  onClick={() => handleCreateAward(section.level)}
                >
                  + Create New Award
                </button>
                <div className="awards-list">
                  {sectionAwards.map((item, index) => (
                    <div
                      key={item.categoryId + item.award}
                      className="award-item award-item-clickable"
                      onClick={() => handleAwardClick(item)}
                      style={{ cursor: 'pointer' }}
                    >
                      <span>
                        [<strong>{item.categoryName}</strong>] → {item.award}
                        <span style={{ color: '#888', fontSize: '0.9em', marginLeft: 8 }}>
                          (#{item.hierarchy})
                        </span>
                      </span>
                      <button
                        onClick={e => { e.stopPropagation(); handleRemoveAward(item.categoryId, item.award); }}
                        className="remove-award"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <ReusableModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setIsCreateMode(false); }} title={isCreateMode ? "Create Award" : "Edit Award"}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <label>
            Award Name:
            <input
              type="text"
              value={modalAwardName}
              onChange={e => setModalAwardName(e.target.value)}
              className="block w-full border border-gray-300 rounded px-2 py-1 mt-1"
            />
          </label>
          <label>
            Hierarchy Number:
            <input
              type="number"
              value={modalAwardHierarchy}
              onChange={e => setModalAwardHierarchy(e.target.value)}
              className="block w-full border border-gray-300 rounded px-2 py-1 mt-1"
            />
          </label>
          {isCreateMode && getSectionCategories(createSectionLevel).length > 1 && (
            <label>
              Category:
              <select
                value={modalAwardCategoryId}
                onChange={e => {
                  setModalAwardCategoryId(e.target.value);
                  const cat = categories.find(c => c._id === e.target.value);
                  setModalAwardCategoryName(cat ? cat.name : '');
                }}
                className="block w-full border border-gray-300 rounded px-2 py-1 mt-1"
              >
                <option value="">Select category...</option>
                {getSectionCategories(createSectionLevel).map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </label>
          )}
          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
            <button
              onClick={handleModalSave}
              disabled={saving || (isCreateMode && !modalAwardCategoryId) || !modalAwardName}
              className="px-4 py-2 rounded bg-[#d33] text-white font-semibold hover:bg-[#b32] transition disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={() => { setModalOpen(false); setIsCreateMode(false); }}
              className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </ReusableModal>
    </div>
  );
};

export default CertificationManager; 
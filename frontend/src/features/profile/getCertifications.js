import api from '../../lib/api';

export const getCertifications = async (lssId) => {
  const response = await api.post('/lss/certifications', { lssId });
  return response.data;
};

export const formatCertificationName = (name) => {
  // Handle Instructor Trainer certifications
  if (name.includes('INSTRUCTOR_TRAINER')) {
    if (name.includes('FIRST_AID')) return 'First Aid IT';
    if (name.includes('NL')) return 'NL IT';
    if (name.includes('LIFESAVING')) return 'Lifesaving IT';
    return 'IT';
  }
  
  // Handle other certifications
  return name
    .replace('FIRST_AID_INSTRUCTOR', 'First Aid Instructor')
    .replace('LIFESAVING_INSTRUCTOR', 'Lifesaving Instructor')
    .replace('NL_INSTRUCTOR', 'NL Instructor')
    .replace('EXAMINER_FIRST_AID', 'First Aid Examiner')
    .replace('EXAMINER_NL', 'NL Examiner')
    .replace('EXAMINER_BRONZE', 'Bronze Examiner')
    .replace(/_/g, ' ');
}; 
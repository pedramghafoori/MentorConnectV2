import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import MentorGrid from '../../../components/MentorGrid.jsx';
import OpportunityGrid from '../../../components/OpportunityGrid.jsx';
import '../../css/Dashboard.css';
import { useLocation } from 'react-router-dom';

export default function Dashboard() {
  console.log('Dashboard component mounted');
  
  const { user, loading } = useAuth();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const cityParam = params.get('city');
  const certParam = params.get('certification');

  const [opportunities, setOpportunities] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [activeTab, setActiveTab] = useState('mentors');
  const abortControllerRef = useRef(null);

  useEffect(() => {
    if (loading) return;

    // Allow fetch if cityParam exists, even if user is not logged in
    const cityToUse = cityParam || user?.city;
    if (!cityToUse) {
      setOpportunities([]);
      setMentors([]);
      return;
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    const fetchData = async () => {
      console.log('Fetching data for city:', cityToUse, 'certification:', certParam);
      try {
        // Fetch opportunities
        const opportunitiesRes = await fetch(
          `/api/opportunities?city=${encodeURIComponent(cityToUse)}`,
          { signal }
        );
        const opportunitiesData = await opportunitiesRes.json();
        setOpportunities(Array.isArray(opportunitiesData) ? opportunitiesData : []);

        // Build mentor query
        let mentorUrl = `/api/users?city=${encodeURIComponent(cityToUse)}`;
        if (certParam) {
          mentorUrl += `&certification=${encodeURIComponent(certParam)}`;
        }
        const mentorsRes = await fetch(mentorUrl, { signal });
        const mentorsData = await mentorsRes.json();
        setMentors(Array.isArray(mentorsData) ? mentorsData : []);
      } catch (err) {
        if (err.name === 'AbortError') {
          console.log('Fetch aborted');
        } else {
          console.error('Error fetching data:', err);
        }
      }
    };

    fetchData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loading, user, cityParam, certParam]);

  if (loading) return <div>Loading...</div>;

  // Only show login/search prompt if neither user nor city param
  if (!user && !cityParam) {
    return <div>Please search for a city or log in to view mentors and opportunities.</div>;
  }

  const showOpportunitiesTab = opportunities.length >= 1;

  // Build a mapping of mentorId -> array of opportunities
  const opportunitiesByMentor = {};
  opportunities.forEach(opp => {
    if (!opportunitiesByMentor[opp.mentor]) opportunitiesByMentor[opp.mentor] = [];
    opportunitiesByMentor[opp.mentor].push(opp);
  });

  return (
    <div className="dashboard-container">
      <div className="dashboard-tabs">
        <button
          className={activeTab === 'mentors' ? 'active' : ''}
          onClick={() => setActiveTab('mentors')}
        >
          Browse by Mentors
        </button>
        {showOpportunitiesTab && (
          <button
            className={activeTab === 'opportunities' ? 'active' : ''}
            onClick={() => setActiveTab('opportunities')}
          >
            Browse by Opportunities
          </button>
        )}
      </div>
      <div className="dashboard-content">
        {activeTab === 'mentors' && <MentorGrid mentors={mentors} opportunitiesByMentor={opportunitiesByMentor} />}
        {activeTab === 'opportunities' && showOpportunitiesTab && (
          <OpportunityGrid opportunities={opportunities} />
        )}
      </div>
      <div>
        Mentors: {mentors.length}, Opportunities: {opportunities.length}
      </div>
    </div>
  );
} 
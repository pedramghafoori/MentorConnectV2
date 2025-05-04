import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import MentorGrid from '../../../components/MentorGrid.jsx';
import OpportunityGrid from '../../../components/OpportunityGrid.jsx';
import '../../css/Dashboard.css';

export default function Dashboard() {
  console.log('Dashboard component mounted');
  
  const { user, loading } = useAuth();
  console.log('useAuth result:', { user, loading });
  
  const [opportunities, setOpportunities] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [activeTab, setActiveTab] = useState('mentors');
  const abortControllerRef = useRef(null);

  useEffect(() => {
    console.log('Dashboard useEffect triggered', { loading, user });
    
    if (loading) {
      console.log('Still loading, skipping fetch');
      return;
    }
    
    if (!user) {
      console.log('No user, skipping fetch');
      return;
    }
    
    if (!user.city) {
      console.log('No user city, skipping fetch');
      return;
    }

    // Create new AbortController for this fetch
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    const fetchData = async () => {
      console.log('Fetching data for city:', user.city);
      
      try {
        // Fetch opportunities
        const opportunitiesRes = await fetch(
          `/api/opportunities?city=${encodeURIComponent(user.city)}`,
          { signal }
        );
        const opportunitiesData = await opportunitiesRes.json();
        console.log('Fetched opportunities:', opportunitiesData);
        setOpportunities(Array.isArray(opportunitiesData) ? opportunitiesData : []);

        // Fetch mentors
        const mentorsRes = await fetch(
          `/api/users?city=${encodeURIComponent(user.city)}`,
          { signal }
        );
        const mentorsData = await mentorsRes.json();
        console.log('Raw mentors data:', mentorsData);
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

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loading, user]);

  if (loading) {
    console.log('Showing loading state');
    return <div>Loading...</div>;
  }

  if (!user) {
    console.log('No user, showing error state');
    return <div>Please log in to view the dashboard</div>;
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
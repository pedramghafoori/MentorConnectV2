import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../../css/Dashboard.css';
import { useLocation } from 'react-router-dom';
import OpportunityCard from '../../components/OpportunityCard';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const cityParam = params.get('city');
  const certParam = params.get('certification');

  const [opportunities, setOpportunities] = useState([]);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    if (loading) return;
    const cityToUse = cityParam || user?.city;
    if (!cityToUse) {
      setOpportunities([]);
      return;
    }
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    const fetchData = async () => {
      try {
        const opportunitiesRes = await fetch(
          `/api/opportunities?city=${encodeURIComponent(cityToUse)}`,
          { signal }
        );
        const opportunitiesData = await opportunitiesRes.json();
        setOpportunities(Array.isArray(opportunitiesData) ? opportunitiesData : []);
      } catch (err) {
        if (err.name !== 'AbortError') {
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
  if (!cityParam) {
    return <div>Please search for a city to view opportunities.</div>;
  }

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Opportunities</h1>
      <div className="dashboard-content">
        {opportunities.length === 0 ? (
          <div>No opportunities found.</div>
        ) : (
          <div className="opportunity-grid">
            {opportunities.map(opp => (
              <OpportunityCard key={opp._id} opportunity={opp} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 
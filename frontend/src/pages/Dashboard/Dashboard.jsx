import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../../css/Dashboard.css';
import { useLocation, useNavigate } from 'react-router-dom';
import OpportunityCard from '../../components/OpportunityCard';
import cities from '../../lib/cities.json';

const CityAutocomplete = ({ value, onChange, onSelect, inputStyle }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    onChange(inputValue);

    if (inputValue.length > 0) {
      const filteredCities = cities.filter(city =>
        city.label.toLowerCase().includes(inputValue.toLowerCase())
      );
      setSuggestions(filteredCities);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (city) => {
    onChange(city.label);
    onSelect(city.value);
    setShowSuggestions(false);
  };

  return (
    <div className="relative" ref={inputRef}>
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        placeholder="Enter city name"
        style={inputStyle}
        required
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {suggestions.map((city, index) => (
            <li
              key={index}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSuggestionClick(city)}
            >
              {city.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const OpportunitySearch = ({ onSearch }) => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialCity = params.get('city') || '';
  
  const [city, setCity] = useState(initialCity);
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Update city when URL parameter changes
    const newCity = params.get('city') || '';
    setCity(newCity);
    setSelectedCity(newCity);
  }, [location.search]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedCity) return;
    // Extract just the city name (before the comma)
    const cityName = selectedCity.split(',')[0].trim();
    onSearch({ city: cityName });
  };

  return (
    <div className="search-container mb-8">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <CityAutocomplete
            value={city}
            onChange={setCity}
            onSelect={setSelectedCity}
            inputStyle={{
              padding: '0.625rem 1rem',
              border: '1px solid rgb(229, 231, 235)',
              borderRadius: '9999px',
              fontSize: '0.875rem',
              color: 'rgb(75, 85, 99)',
              outline: 'none',
              transition: 'border-color 0.15s',
              width: '100%'
            }}
          />
        </div>
        <button
          type="submit"
          className="px-6 py-2 bg-[#d33] text-white rounded-full hover:bg-[#c22] transition-colors"
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>
    </div>
  );
};

export default function Dashboard() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const cityParam = params.get('city');
  const orgParam = params.get('organization');

  const [opportunities, setOpportunities] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const abortControllerRef = useRef(null);

  const fetchOpportunities = async (city, organization) => {
    if (!city) return;
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    
    setSearchLoading(true);
    try {
      let url = `/api/opportunities?city=${encodeURIComponent(city)}`;
      if (organization) {
        url += `&organization=${encodeURIComponent(organization)}`;
      }
      
      const opportunitiesRes = await fetch(url, { signal });
      const opportunitiesData = await opportunitiesRes.json();
      setOpportunities(Array.isArray(opportunitiesData) ? opportunitiesData : []);
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error fetching data:', err);
      }
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    if (loading) return;
    if (cityParam) {
      fetchOpportunities(cityParam, orgParam);
    }
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loading, cityParam, orgParam]);

  const handleSearch = (searchParams) => {
    const { city, organization } = searchParams;
    const newParams = new URLSearchParams();
    if (city) newParams.set('city', city);
    if (organization) newParams.set('organization', organization);
    navigate(`/dashboard?${newParams.toString()}`);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Find Opportunities</h1>
      <OpportunitySearch onSearch={handleSearch} />
      <div className="dashboard-content">
        {searchLoading ? (
          <div className="text-center py-8">Loading opportunities...</div>
        ) : opportunities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {cityParam ? 'No opportunities found.' : 'Enter a city to search for opportunities.'}
          </div>
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
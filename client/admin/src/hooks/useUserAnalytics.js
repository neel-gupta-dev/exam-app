import { useState, useEffect } from 'react';
import api from '../api';

/**
 * useUserAnalytics Hook
 * 
 * Custom hook to fetch detailed individual user analytics from the admin API.
 * Handles loading, error states, and data persistence.
 * 
 * @param {string} userId - The unique identifier for the student.
 * @returns {Object} - { analytics, loading, error, refetch }
 */
const useUserAnalytics = (userId) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data } = await api.get(`/admin/users/${userId}/analytics`);
      setAnalytics(data);
    } catch (err) {
      console.error(`[useUserAnalytics] Error fetching data for ${userId}:`, err);
      setError(err.response?.data?.message || 'Failed to load user analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [userId]);

  return { 
    analytics, 
    loading, 
    error, 
    refetch: fetchAnalytics 
  };
};

export default useUserAnalytics;

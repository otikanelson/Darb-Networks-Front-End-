// src/hooks/useCampaigns.js
import { useState, useEffect } from 'react';
import { campaignService } from '../services/campaignService';

export const useCampaigns = (initialFilters = {}) => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        const response = await campaignService.getCampaigns({
          ...filters,
          page,
          limit: 12 // Adjust based on your needs
        });
        setCampaigns(response.data);
        setTotalCount(response.total);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, [filters, page]);

  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1); // Reset to first page when filters change
  };

  return {
    campaigns,
    loading,
    error,
    filters,
    updateFilters,
    totalCount,
    page,
    setPage
  };
};

// src/hooks/useCampaignStats.js
export const useCampaignStats = (campaignId) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await campaignService.getCampaignStats(campaignId);
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (campaignId) {
      fetchStats();
    }
  }, [campaignId]);

  return { stats, loading, error };
};

// src/hooks/useCampaignActions.js
export const useCampaignActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const contribute = async (campaignId, amount) => {
    try {
      setLoading(true);
      const result = await campaignService.contributeToCampaign(campaignId, amount);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createCampaign = async (campaignData) => {
    try {
      setLoading(true);
      const result = await campaignService.createCampaign(campaignData);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCampaign = async (campaignId, campaignData) => {
    try {
      setLoading(true);
      const result = await campaignService.updateCampaign(campaignId, campaignData);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    contribute,
    createCampaign,
    updateCampaign,
    loading,
    error
  };
};
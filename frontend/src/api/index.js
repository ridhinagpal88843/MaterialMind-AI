import { apiClient } from './client';

export const getHealth = () => apiClient.get('/api/health');

export const getSummary = () => apiClient.get('/api/summary');

export const getPreprocessingReport = () => apiClient.get('/api/preprocessing-report');

export const getMaterials = ({ page = 1, pageSize = 20, cluster, search, sortBy, sortOrder = 'asc' } = {}) => {
  const params = {
    page,
    page_size: pageSize,
    sort_order: sortOrder,
  };
  if (cluster !== undefined && cluster !== null && cluster !== '') {
    params.cluster = cluster;
  }
  if (search && search.trim()) {
    params.search = search.trim();
  }
  if (sortBy) {
    params.sort_by = sortBy;
  }
  return apiClient.get('/api/materials', { params });
};

export const getMaterialDetail = (materialId) => {
  if (!materialId) throw new Error('materialId is required');
  return apiClient.get(`/api/material/${encodeURIComponent(materialId)}`);
};

export const getClusters = () => apiClient.get('/api/clusters');

export const getClusterDetail = (clusterId) => apiClient.get(`/api/cluster/${clusterId}`);

export const getPca = () => apiClient.get('/api/pca');

export const getSimilarMaterials = ({ materialId, formula, topN = 5 }) => {
  const payload = {
    top_n: topN,
  };
  if (materialId) payload.material_id = materialId;
  if (formula) payload.formula = formula;
  return apiClient.post('/api/similar-materials', payload);
};

export const getRecommendations = ({ applicationProfile, topN = 5 }) => {
  return apiClient.post('/api/recommend', {
    application_profile: applicationProfile,
    top_n: topN,
  });
};

export const compareMaterials = (materialIds) => {
  return apiClient.post('/api/compare', {
    material_ids: materialIds,
  });
};

import apiClient from './client';

export const fetchDashboardStats = async () => {
  try {
    const response = await apiClient.get('/dashboard/stats');
    return response.data.data;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return null;
  }
};

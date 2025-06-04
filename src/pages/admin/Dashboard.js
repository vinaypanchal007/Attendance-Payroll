import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  UsersIcon,
} from '@heroicons/react/24/outline';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    totalEmployees: 0,
  });

  const fetchAdminStats = useCallback(async () => {
    try {
      // Fetch employees
      const employees = await api.get('/employees');
      const activeEmployees = employees.data.filter(emp => emp.status === 'active');
      const totalEmployees = activeEmployees.length;

      setDashboardData({
        totalEmployees,
      });
    } catch (error) {
      console.error('Error in admin data fetch:', error);
      throw error;
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        await fetchAdminStats();
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch dashboard data';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [fetchAdminStats]);

  const getStats = () => [
    { 
      name: 'Total Employees', 
      value: dashboardData.totalEmployees, 
      icon: UsersIcon 
    }
  ];

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">Error loading dashboard data: {error}</div>
        <button
          onClick={() => fetchAdminStats()}
          className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-gray-700">
            Welcome back, {user?.name}! Here's your overview.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <div className="grid grid-cols-1">
          {getStats().map((stat) => (
            <div
              key={stat.name}
              className="relative overflow-hidden rounded-lg bg-white px-4 pt-5 pb-12 shadow sm:px-6 sm:pt-6"
            >
              <dt>
                <div className="absolute rounded-md bg-primary-500 p-3">
                  <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <p className="ml-16 truncate text-sm font-medium text-gray-500">
                  {stat.name}
                </p>
              </dt>
              <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
                <p className="text-2xl font-semibold text-gray-900">
                  {isLoading ? (
                    <div className="animate-pulse bg-gray-200 h-6 w-20 rounded"></div>
                  ) : (
                    stat.value
                  )}
                </p>
              </dd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 
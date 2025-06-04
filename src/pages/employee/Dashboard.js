import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ClockIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    hoursToday: 0,
    monthHours: 0,
    lastMonthHours: 0,
    lastMonthPay: 0,
    currentMonthPayroll: 0,
    daysWorkedCurrentMonth: 0,
    daysWorkedLastMonth: 0
  });

  const calculateMonthlyPay = (attendanceRecords, hourlyRate) => {
    return attendanceRecords.reduce((acc, record) => {
      const hours = (record.totalTimeInSeconds || 0) / 3600;
      const dailyHours = Math.round(hours * 10) / 10;
      
      // Calculate daily pay
      const regularHours = Math.min(dailyHours, 8); // Regular hours capped at 8
      const overtimeHours = Math.max(0, dailyHours - 8); // Hours beyond 8 are overtime
      
      const regularPay = regularHours * hourlyRate;
      const overtimePay = overtimeHours * (hourlyRate * 1.5); // 1.5x for overtime
      
      return {
        totalHours: acc.totalHours + dailyHours,
        totalPay: acc.totalPay + regularPay + overtimePay,
        daysWorked: acc.daysWorked + 1
      };
    }, { totalHours: 0, totalPay: 0, daysWorked: 0 });
  };

  const fetchEmployeeStats = useCallback(async () => {
    const now = new Date();
    const currentFirstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentLastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const lastMonthFirstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthLastDay = new Date(now.getFullYear(), now.getMonth(), 0);

    try {
      // Fetch all required data
      const [todayAttendance, currentMonthAttendance, lastMonthAttendance] = await Promise.all([
        api.get('/attendance/today'),
        api.get('/attendance/me', {
          params: {
            startDate: currentFirstDay.toISOString(),
            endDate: currentLastDay.toISOString()
          }
        }),
        api.get('/attendance/me', {
          params: {
            startDate: lastMonthFirstDay.toISOString(),
            endDate: lastMonthLastDay.toISOString()
          }
        })
      ]);

      // Calculate hours today
      const hoursToday = todayAttendance.data?.totalTimeInSeconds 
        ? Math.round((todayAttendance.data.totalTimeInSeconds / 3600) * 10) / 10 
        : 0;

      // Calculate current month details
      const currentMonthDetails = calculateMonthlyPay(currentMonthAttendance.data, user?.hourlyRate);
      const roundedMonthHours = Math.round(currentMonthDetails.totalHours * 10) / 10;

      // Calculate last month details
      const lastMonthDetails = calculateMonthlyPay(lastMonthAttendance.data, user?.hourlyRate);
      const roundedLastMonthHours = Math.round(lastMonthDetails.totalHours * 10) / 10;

      setDashboardData({
        hoursToday,
        monthHours: roundedMonthHours,
        currentMonthPayroll: currentMonthDetails.totalPay,
        daysWorkedCurrentMonth: currentMonthDetails.daysWorked,
        lastMonthHours: roundedLastMonthHours,
        lastMonthPay: lastMonthDetails.totalPay,
        daysWorkedLastMonth: lastMonthDetails.daysWorked
      });
    } catch (error) {
      console.error('Error in employee data fetch:', error);
      throw error;
    }
  }, [user?.hourlyRate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        await fetchEmployeeStats();
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
  }, [fetchEmployeeStats]);

  const getStats = () => [
    { 
      name: 'Current Month Hours', 
      value: `${dashboardData.monthHours}h (${dashboardData.daysWorkedCurrentMonth} days)`, 
      icon: ClockIcon 
    },
    { 
      name: 'Current Month Pay', 
      value: `$${dashboardData.currentMonthPayroll.toFixed(2)}`, 
      icon: BanknotesIcon 
    },
    { 
      name: "Last Month Hours", 
      value: `${dashboardData.lastMonthHours}h (${dashboardData.daysWorkedLastMonth} days)`, 
      icon: ClockIcon 
    },
    { 
      name: "Last Month Pay", 
      value: `$${dashboardData.lastMonthPay.toFixed(2)}`, 
      icon: CurrencyDollarIcon 
    }
  ];

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">Error loading dashboard data: {error}</div>
        <button
          onClick={() => fetchEmployeeStats()}
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
          <h1 className="text-2xl font-semibold text-gray-900">Employee Dashboard</h1>
          <p className="mt-2 text-sm text-gray-700">
            Welcome back, {user?.name}! Here's your overview.
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Your hourly Salary: ${user?.hourlyRate?.toFixed(2) || '0.00'}/hour
          </p>
        </div>
      </div>

      <div className="mt-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
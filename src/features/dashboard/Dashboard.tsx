import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import AuthGuard from '../../auth/guards/AuthGuard';
import { 
  HomeIcon, 
  UserIcon, 
  CogIcon, 
  BellIcon,
  ChartBarIcon,
  CreditCardIcon,
  DocumentTextIcon,
  ArrowLeftOnRectangleIcon as LogoutIcon 
} from '@heroicons/react/24/outline';

interface DashboardStats {
  totalTransactions: number;
  activeValidations: number;
  pendingApprovals: number;
  recentActivity: ActivityItem[];
}

interface ActivityItem {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  status: 'success' | 'pending' | 'error';
}

const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalTransactions: 0,
    activeValidations: 0,
    pendingApprovals: 0,
    recentActivity: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch dashboard statistics
      const response = await fetch('/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('valifi_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const navigationItems = [
    { name: 'Dashboard', icon: HomeIcon, href: '/dashboard', current: true },
    { name: 'Validations', icon: DocumentTextIcon, href: '/validations', current: false },
    { name: 'Transactions', icon: CreditCardIcon, href: '/transactions', current: false },
    { name: 'Analytics', icon: ChartBarIcon, href: '/analytics', current: false },
    { name: 'Profile', icon: UserIcon, href: '/profile', current: false },
    { name: 'Settings', icon: CogIcon, href: '/settings', current: false },
  ];

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-100">
        {/* Sidebar */}
        <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center justify-center h-16 bg-indigo-600">
              <h1 className="text-white text-2xl font-bold">Valifi</h1>
            </div>

            {/* User Info */}
            <div className="p-4 border-b">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center">
                    <span className="text-white font-medium">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-2 py-4 space-y-1">
              {navigationItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center px-2 py-2 text-sm font-medium rounded-md
                    ${item.current 
                      ? 'bg-indigo-100 text-indigo-700' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                  `}
                >
                  <item.icon 
                    className={`
                      mr-3 h-5 w-5 
                      ${item.current ? 'text-indigo-700' : 'text-gray-400 group-hover:text-gray-500'}
                    `} 
                  />
                  {item.name}
                </a>
              ))}
            </nav>

            {/* Sign Out */}
            <div className="p-4 border-t">
              <button
                onClick={signOut}
                className="group flex items-center w-full px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
              >
                <LogoutIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="pl-64">
          {/* Header */}
          <header className="bg-white shadow">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-6">
                <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
                <div className="flex items-center space-x-4">
                  <button className="relative p-2 text-gray-400 hover:text-gray-500">
                    <BellIcon className="h-6 w-6" />
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400"></span>
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <main className="p-6">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                        <CreditCardIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-5">
                        <p className="text-sm font-medium text-gray-500">Total Transactions</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {stats.totalTransactions.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                        <DocumentTextIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-5">
                        <p className="text-sm font-medium text-gray-500">Active Validations</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {stats.activeValidations.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                        <BellIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-5">
                        <p className="text-sm font-medium text-gray-500">Pending Approvals</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {stats.pendingApprovals.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b">
                    <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                  </div>
                  <div className="px-6 py-4">
                    {stats.recentActivity.length > 0 ? (
                      <div className="space-y-4">
                        {stats.recentActivity.map((activity) => (
                          <div key={activity.id} className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className={`
                                w-2 h-2 rounded-full mr-3
                                ${activity.status === 'success' ? 'bg-green-500' : ''}
                                ${activity.status === 'pending' ? 'bg-yellow-500' : ''}
                                ${activity.status === 'error' ? 'bg-red-500' : ''}
                              `}></div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {activity.description}
                                </p>
                                <p className="text-xs text-gray-500">{activity.timestamp}</p>
                              </div>
                            </div>
                            <span className={`
                              px-2 py-1 text-xs font-medium rounded-full
                              ${activity.status === 'success' ? 'bg-green-100 text-green-800' : ''}
                              ${activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                              ${activity.status === 'error' ? 'bg-red-100 text-red-800' : ''}
                            `}>
                              {activity.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No recent activity</p>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <button className="bg-indigo-600 text-white rounded-lg p-6 hover:bg-indigo-700 transition-colors">
                    <h4 className="text-lg font-semibold mb-2">New Validation</h4>
                    <p className="text-sm opacity-90">Start a new validation process</p>
                  </button>

                  <button className="bg-green-600 text-white rounded-lg p-6 hover:bg-green-700 transition-colors">
                    <h4 className="text-lg font-semibold mb-2">View Transactions</h4>
                    <p className="text-sm opacity-90">Review recent transactions</p>
                  </button>

                  <button className="bg-purple-600 text-white rounded-lg p-6 hover:bg-purple-700 transition-colors">
                    <h4 className="text-lg font-semibold mb-2">Generate Report</h4>
                    <p className="text-sm opacity-90">Create analytics report</p>
                  </button>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
};

export default Dashboard;
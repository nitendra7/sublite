import { AreaChartIcon, BarChart3Icon, ActivityIcon, TrendingUp, Download, Users } from 'lucide-react';
import SectionHeader from './SectionHeader';

const analytics = [
  {
    label: 'Active Users',
    value: 0,
    icon: Users,
    trend: 'No data',
    bgColor: 'bg-[#e0f7fa] dark:bg-[#263238]',
    iconColor: 'text-[#2bb6c4] dark:text-[#5ed1dc]'
  },
  {
    label: 'Total Visits',
    value: 0,
    icon: ActivityIcon,
    trend: 'No data',
    bgColor: 'bg-[#f3e5f5] dark:bg-[#1a1a1a]',
    iconColor: 'text-purple-600 dark:text-purple-400'
  },
  {
    label: 'Revenue (₹)',
    value: 0,
    icon: BarChart3Icon,
    trend: 'No data',
    bgColor: 'bg-[#e8f5e8] dark:bg-[#0f1a0f]',
    iconColor: 'text-green-600 dark:text-green-400'
  }
];

const Analytics = () => (
  <div className="p-4 sm:p-6 md:p-8 lg:p-10 min-h-full animate-fade-in">
    <SectionHeader
      icon={AreaChartIcon}
      title="Analytics Overview"
      actions={
        <button className="bg-[#2bb6c4] hover:bg-[#1ea1b0] text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
          <Download size={16} />
          Export Report
        </button>
      }
    />

    {/* Analytics Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {analytics.map(({ label, value, icon: Icon, bgColor, iconColor, trend }) => (
        <div key={label} className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-[#263238] hover:shadow-xl transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-100 mb-2">{label}</p>
              <p className="text-3xl font-bold text-[#2bb6c4] dark:text-gray-100">{value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{trend}</p>
            </div>
            <div className={`p-3 rounded-full ${bgColor}`}>
              <Icon className={`w-6 h-6 ${iconColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Charts and Data Sections */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Session Activity */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-[#263238]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Session Activity</h3>
          <ActivityIcon className="w-6 h-6 text-[#2bb6c4] dark:text-[#5ed1dc]" />
        </div>
        <div className="text-center py-12">
          <ActivityIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">No session data loaded yet.</p>
          <p className="text-gray-400 dark:text-gray-500 text-xs mt-2">Analytics data will appear here once available</p>
        </div>
      </div>

      {/* Recent Events */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-[#263238]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Recent Events</h3>
          <TrendingUp className="w-6 h-6 text-[#2bb6c4] dark:text-[#5ed1dc]" />
        </div>
        <div className="text-center py-12">
          <TrendingUp className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">No events available yet.</p>
          <p className="text-gray-400 dark:text-gray-500 text-xs mt-2">Event tracking will be displayed here</p>
        </div>
      </div>
    </div>

    {/* Additional Analytics Section */}
    <div className="mt-8 bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-[#263238]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Platform Insights</h3>
        <BarChart3Icon className="w-6 h-6 text-[#2bb6c4] dark:text-[#5ed1dc]" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-[#2bb6c4] dark:text-gray-100 mb-1">--</div>
          <p className="text-sm text-gray-600 dark:text-gray-300">Page Views</p>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-[#2bb6c4] dark:text-gray-100 mb-1">--</div>
          <p className="text-sm text-gray-600 dark:text-gray-300">Unique Visitors</p>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-[#2bb6c4] dark:text-gray-100 mb-1">--</div>
          <p className="text-sm text-gray-600 dark:text-gray-300">Bounce Rate</p>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-[#2bb6c4] dark:text-gray-100 mb-1">--</div>
          <p className="text-sm text-gray-600 dark:text-gray-300">Avg. Session</p>
        </div>
      </div>
    </div>
  </div>
);

export default Analytics;

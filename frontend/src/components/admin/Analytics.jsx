import React from 'react';
import { AreaChartIcon, BarChart3Icon, UsersIcon, ActivityIcon } from 'lucide-react';
import SectionHeader from './SectionHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

const analytics = [
  {
    label: 'Active Users',
    value: 0,
    icon: UsersIcon,
    trend: 'No data'
  },
  {
    label: 'Total Visits',
    value: 0,
    icon: ActivityIcon,
    trend: 'No data'
  },
  {
    label: 'Revenue (₹)',
    value: 0,
    icon: BarChart3Icon,
    trend: 'No data'
  }
];

const Analytics = () => (
  <div className="p-6">
    <SectionHeader
      icon={AreaChartIcon}
      title="Analytics Overview"
      actions={
        <button
          className="bg-blue-600 text-white rounded-lg px-4 py-2 font-medium shadow hover:bg-blue-700 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          disabled
          aria-disabled="true"
          title="Coming soon"
        >
          Export Report
        </button>
      }
    />
    <div className="grid gap-6 grid-cols-1 md:grid-cols-3 lg:grid-cols-3 mb-8">
      {analytics.map(({ label, value, icon: Icon }) => (
        <Card key={label}>
          <CardHeader>
            {Icon && <Icon className="text-blue-400 mr-2" size={22} aria-hidden="true" />}
            <CardTitle className="text-gray-700 text-sm font-medium">{label}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
      <div>
        <h3 className="font-semibold text-lg mb-2">Session Activity</h3>
        <div className="bg-gray-100 p-4 rounded text-gray-500 text-center">
          No session data loaded yet.
        </div>
      </div>
      <div>
        <h3 className="font-semibold text-lg mb-2">Recent Events</h3>
        <div className="bg-gray-100 p-4 rounded text-gray-500 text-center">
          No events available yet.
        </div>
      </div>
    </div>
  </div>
);

export default Analytics;
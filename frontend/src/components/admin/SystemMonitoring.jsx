import { ServerCogIcon, ActivityIcon, BatteryChargingIcon, AlertCircle, CheckCircle, Clock, Monitor } from 'lucide-react';
import SectionHeader from './SectionHeader';

const metrics = [
  {
    icon: ServerCogIcon,
    label: "Server Status",
    value: "Healthy",
    tip: "Servers operational",
    bgColor: 'bg-[#e8f5e8] dark:bg-[#0f1a0f]',
    iconColor: 'text-green-600 dark:text-green-400',
    statusColor: 'text-green-600 dark:text-green-400'
  },
  {
    icon: ActivityIcon,
    label: "API Response Time",
    value: "— ms",
    tip: "Awaiting data",
    bgColor: 'bg-[#e0f7fa] dark:bg-[#263238]',
    iconColor: 'text-[#2bb6c4] dark:text-[#5ed1dc]',
    statusColor: 'text-gray-500 dark:text-gray-400'
  },
  {
    icon: BatteryChargingIcon,
    label: "System Load",
    value: "—%",
    tip: "Awaiting data",
    bgColor: 'bg-[#f3e5f5] dark:bg-[#1a1a1a]',
    iconColor: 'text-purple-600 dark:text-purple-400',
    statusColor: 'text-gray-500 dark:text-gray-400'
  }
];

const SystemMonitoring = () => (
  <div className="p-4 sm:p-6 md:p-8 lg:p-10 min-h-full animate-fade-in">
    <SectionHeader
      icon={ServerCogIcon}
      title="System Monitoring"
      actions={
        <button className="bg-[#2bb6c4] hover:bg-[#1ea1b0] text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2">
          <Monitor size={16} />
          View Details
        </button>
      }/>

    {/* System Metrics */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {metrics.map(({ icon: Icon, label, value, tip, bgColor, iconColor, statusColor }) => (
        <div key={label} className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-[#263238] hover:shadow-xl transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-100 mb-2">{label}</p>
              <p className={`text-2xl font-bold ${statusColor} mb-1`}>{value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{tip}</p>
            </div>
            <div className={`p-3 rounded-full ${bgColor}`}>
              <Icon className={`w-6 h-6 ${iconColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* System Health Overview */}
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-[#263238] mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">System Health Overview</h3>
        <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Database</span>
          </div>
          <p className="text-xs text-green-600 dark:text-green-400">Operational</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">API</span>
          </div>
          <p className="text-xs text-green-600 dark:text-green-400">Healthy</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Clock className="w-5 h-5 text-[#2bb6c4] dark:text-[#5ed1dc] mr-2" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Uptime</span>
          </div>
          <p className="text-xs text-[#2bb6c4] dark:text-[#5ed1dc]">99.9%</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <ActivityIcon className="w-5 h-5 text-[#2bb6c4] dark:text-[#5ed1dc] mr-2" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Active</span>
          </div>
          <p className="text-xs text-[#2bb6c4] dark:text-[#5ed1dc]">Normal</p>
        </div>
      </div>
    </div>

    {/* System Logs */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* System Events */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-[#263238]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">System Events</h3>
          <ActivityIcon className="w-6 h-6 text-[#2bb6c4] dark:text-[#5ed1dc]" />
        </div>
        <div className="text-center py-12">
          <ActivityIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">No system events displayed yet.</p>
          <p className="text-gray-400 dark:text-gray-500 text-xs">System activity logs will appear here</p>
        </div>
      </div>

      {/* Incidents Log */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-[#263238]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Incidents Log</h3>
          <AlertCircle className="w-6 h-6 text-[#2bb6c4] dark:text-[#5ed1dc]" />
        </div>
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">No incidents logged yet.</p>
          <p className="text-gray-400 dark:text-gray-500 text-xs">System incidents and alerts will appear here</p>
        </div>
      </div>
    </div>
  </div>
);

export default SystemMonitoring;

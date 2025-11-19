import { KeyRoundIcon, UserCheckIcon, UserXIcon, ShieldCheckIcon, Users, Settings } from 'lucide-react';
import SectionHeader from './SectionHeader';

const permissionLevels = [
  {
    icon: UserCheckIcon,
    label: "Admin",
    desc: "Full access to all settings, user management, analytics, moderation, and system tools.",
    bgColor: 'bg-[#e0f7fa] dark:bg-[#263238]',
    iconColor: 'text-[#2bb6c4] dark:text-[#5ed1dc]',
    badgeColor: 'bg-[#2bb6c4] text-white'
  },
  {
    icon: ShieldCheckIcon,
    label: "Moderator",
    desc: "Can review and act on content reports and moderate user activity but cannot change site-wide settings.",
    bgColor: 'bg-[#fff3e0] dark:bg-[#2a1a0a]',
    iconColor: 'text-orange-600 dark:text-orange-400',
    badgeColor: 'bg-orange-500 text-white'
  },
  {
    icon: UserXIcon,
    label: "Restricted User",
    desc: "Limited or suspended permissions—for viewing only, or temporarily blocked from making changes.",
    bgColor: 'bg-[#ffebee] dark:bg-[#1a0a0a]',
    iconColor: 'text-red-600 dark:text-red-400',
    badgeColor: 'bg-red-500 text-white'
  }
];

const Permissions = () => (
  <div className="p-4 sm:p-6 md:p-8 lg:p-10 min-h-full animate-fade-in">
    <SectionHeader
      icon={KeyRoundIcon}
      title="Permissions Management"
      actions={
        <button className="bg-[#2bb6c4] hover:bg-[#1ea1b0] text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2">
          <Settings size={16} />
          Manage Roles
        </button>
      } />

    { /* Permission Stats */ }
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-[#263238]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-100">Total Admins</p>
            <p className="text-2xl font-bold text-[#2bb6c4] dark:text-gray-100">0</p>
          </div>
          <UserCheckIcon className="w-8 h-8 text-[#2bb6c4] dark:text-[#5ed1dc]" />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-[#263238]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-100">Total Moderators</p>
            <p className="text-2xl font-bold text-[#2bb6c4] dark:text-gray-100">0</p>
          </div>
          <ShieldCheckIcon className="w-8 h-8 text-[#2bb6c4] dark:text-[#5ed1dc]" />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-[#263238]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-100">Restricted Users</p>
            <p className="text-2xl font-bold text-[#2bb6c4] dark:text-gray-100">0</p>
          </div>
          <UserXIcon className="w-8 h-8 text-[#2bb6c4] dark:text-[#5ed1dc]" />
        </div>
      </div>
    </div>

    {/* Permission Levels */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {permissionLevels.map(({ icon: Icon, label, desc, bgColor, iconColor, badgeColor }) => (
        <div key={label} className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-[#263238] hover:shadow-xl transition-all duration-200">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-full ${bgColor} flex-shrink-0`}>
              <Icon className={`w-6 h-6 ${iconColor}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{label}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeColor}`}>
                  {label}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{desc}</p>
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* User Lists */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Admins/Moderators */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-[#263238]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Admins & Moderators</h3>
          <Users className="w-6 h-6 text-[#2bb6c4] dark:text-[#5ed1dc]" />
        </div>
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">No admins or moderators assigned yet.</p>
          <p className="text-gray-400 dark:text-gray-500 text-xs">Role assignments will appear here</p>
        </div>
      </div>

      {/* Restricted Users */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-[#263238]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Restricted Users</h3>
          <UserXIcon className="w-6 h-6 text-[#2bb6c4] dark:text-[#5ed1dc]" />
        </div>
        <div className="text-center py-12">
          <UserXIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">No restricted users at this time.</p>
          <p className="text-gray-400 dark:text-gray-500 text-xs">User restrictions will appear here</p>
        </div>
      </div>
    </div>
  </div>
);

export default Permissions;

import { ShieldCheckIcon, BanIcon, MessageSquareIcon, AlertTriangle, Eye } from 'lucide-react';
import SectionHeader from './SectionHeader';

const moderationGuidance = [
  {
    icon: MessageSquareIcon,
    title: "Monitor Comments & Reviews",
    desc: "Review and moderate user generated content for compliance and safety. Flagged submissions will appear here.",
    bgColor: 'bg-[#e0f7fa] dark:bg-[#263238]',
    iconColor: 'text-[#2bb6c4] dark:text-[#5ed1dc]'
  },
  {
    icon: ShieldCheckIcon,
    title: "Handle Reports",
    desc: "Manage reported content, investigate issues, and apply swift moderation decisions to uphold site policies.",
    bgColor: 'bg-[#fff3e0] dark:bg-[#2a1a0a]',
    iconColor: 'text-orange-600 dark:text-orange-400'
  },
  {
    icon: BanIcon,
    title: "User Restrictions",
    desc: "Easily ban or restrict abusers. Lists of currently restricted accounts and actions available soon.",
    bgColor: 'bg-[#ffebee] dark:bg-[#1a0a0a]',
    iconColor: 'text-red-600 dark:text-red-400'
  }
];

const Moderation = () => (
  <div className="p-4 sm:p-6 md:p-8 lg:p-10 min-h-full animate-fade-in">
    <SectionHeader
      icon={ShieldCheckIcon}
      title="Content Moderation"
      actions={
        <button className="bg-[#2bb6c4] hover:bg-[#1ea1b0] text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2">
          <Eye size={16} />
          View All Reports
        </button>
      }
    />

    {/* Moderation Stats */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-[#263238]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-100">Pending Reviews</p>
            <p className="text-2xl font-bold text-[#2bb6c4] dark:text-gray-100">0</p>
          </div>
          <AlertTriangle className="w-8 h-8 text-[#2bb6c4] dark:text-[#5ed1dc]" />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-[#263238]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-100">Active Reports</p>
            <p className="text-2xl font-bold text-[#2bb6c4] dark:text-gray-100">0</p>
          </div>
          <MessageSquareIcon className="w-8 h-8 text-[#2bb6c4] dark:text-[#5ed1dc]" />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-[#263238]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-100">Banned Users</p>
            <p className="text-2xl font-bold text-[#2bb6c4] dark:text-gray-100">0</p>
          </div>
          <BanIcon className="w-8 h-8 text-[#2bb6c4] dark:text-[#5ed1dc]" />
        </div>
      </div>
    </div>

    {/* Moderation Guidance Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {moderationGuidance.map(({ icon: Icon, title, desc, bgColor, iconColor }) => (
        <div key={title} className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-[#263238] hover:shadow-xl transition-all duration-200">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-full ${bgColor} flex-shrink-0`}>
              <Icon className={`w-6 h-6 ${iconColor}`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">{title}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{desc}</p>
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Content Sections */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Flagged Content */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-[#263238]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Flagged Content</h3>
          <AlertTriangle className="w-6 h-6 text-[#2bb6c4] dark:text-[#5ed1dc]" />
        </div>
        <div className="text-center py-12">
          <AlertTriangle className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">No flagged content for review yet.</p>
          <p className="text-gray-400 dark:text-gray-500 text-xs">Content moderation queue will appear here</p>
        </div>
      </div>

      {/* Banned Users */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-[#263238]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Banned Users</h3>
          <BanIcon className="w-6 h-6 text-[#2bb6c4] dark:text-[#5ed1dc]" />
        </div>
        <div className="text-center py-12">
          <BanIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">No banned users at this time.</p>
          <p className="text-gray-400 dark:text-gray-500 text-xs">User restriction list will appear here</p>
        </div>
      </div>
    </div>
  </div>
);

export default Moderation ;

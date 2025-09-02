import React from 'react';
import { ShieldCheckIcon, BanIcon, MessageSquareIcon } from 'lucide-react';
import SectionHeader from './SectionHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

const moderationGuidance = [
  {
    icon: MessageSquareIcon,
    title: "Monitor Comments & Reviews",
    desc: "Review and moderate user generated content for compliance and safety. Flagged submissions will appear here."
  },
  {
    icon: ShieldCheckIcon,
    title: "Handle Reports",
    desc: "Manage reported content, investigate issues, and apply swift moderation decisions to uphold site policies."
  },
  {
    icon: BanIcon,
    title: "User Restrictions",
    desc: "Easily ban or restrict abusers. Lists of currently restricted accounts and actions available soon."
  }
];

const Moderation = () => (
  <div className="p-6">
    <SectionHeader icon={ShieldCheckIcon} title="Content Moderation" />
    <div className="grid gap-6 grid-cols-1 md:grid-cols-3 lg:grid-cols-3 mb-8">
      {moderationGuidance.map(({ icon: Icon, title, desc }) => (
        <Card key={title}>
          <CardHeader>
            {Icon && <Icon className="text-blue-400 mr-2" size={22} aria-hidden="true" />}
            <CardTitle className="text-gray-700 text-sm font-medium">{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-900 font-semibold">{desc}</div>
          </CardContent>
        </Card>
      ))}
    </div>
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
      <div>
        <h3 className="font-semibold text-lg mb-2">Flagged Content</h3>
        <div className="bg-gray-100 p-4 rounded text-gray-500 text-center">
          No flagged content for review yet.
        </div>
      </div>
      <div>
        <h3 className="font-semibold text-lg mb-2">Banned Users</h3>
        <div className="bg-gray-100 p-4 rounded text-gray-500 text-center">
          No banned users at this time.
        </div>
      </div>
    </div>
  </div>
);

export default Moderation;
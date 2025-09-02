import React from 'react';
import { KeyRoundIcon, UserCheckIcon, UserXIcon, ShieldCheckIcon } from 'lucide-react';
import SectionHeader from './SectionHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

const permissionLevels = [
  {
    icon: UserCheckIcon,
    label: "Admin",
    desc: "Full access to all settings, user management, analytics, moderation, and system tools."
  },
  {
    icon: ShieldCheckIcon,
    label: "Moderator",
    desc: "Can review and act on content reports and moderate user activity but cannot change site-wide settings."
  },
  {
    icon: UserXIcon,
    label: "Restricted User",
    desc: "Limited or suspended permissions—for viewing only, or temporarily blocked from making changes."
  }
];

const Permissions = () => (
  <div className="p-6">
    <SectionHeader icon={KeyRoundIcon} title="Permissions Management" />
    <div className="grid gap-6 grid-cols-1 md:grid-cols-3 lg:grid-cols-3 mb-8">
      {permissionLevels.map(({ icon: Icon, label, desc }) => (
        <Card key={label}>
          <CardHeader>
            {Icon && <Icon className="text-blue-400 mr-2" size={22} aria-hidden="true" />}
            <CardTitle className="text-gray-700 text-sm font-medium">{label}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-900 font-semibold">{desc}</div>
          </CardContent>
        </Card>
      ))}
    </div>
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
      <div>
        <h3 className="font-semibold text-lg mb-2">Admins/Moderators</h3>
        <div className="bg-gray-100 p-4 rounded text-gray-500 text-center">
          No admins/moderators edited yet.
        </div>
      </div>
      <div>
        <h3 className="font-semibold text-lg mb-2">Restricted Users</h3>
        <div className="bg-gray-100 p-4 rounded text-gray-500 text-center">
          No restricted users at this time.
        </div>
      </div>
    </div>
  </div>
);

export default Permissions;
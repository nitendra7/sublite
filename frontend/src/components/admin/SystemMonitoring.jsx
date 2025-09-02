import React from 'react';
import { ServerCogIcon, ActivityIcon, BatteryChargingIcon } from 'lucide-react';
import SectionHeader from './SectionHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

const metrics = [
  {
    icon: ServerCogIcon,
    label: "Server Status",
    value: "Healthy",
    tip: "Servers operational"
  },
  {
    icon: ActivityIcon,
    label: "API Response Time",
    value: "— ms",
    tip: "Awaiting data"
  },
  {
    icon: BatteryChargingIcon,
    label: "System Load",
    value: "—%",
    tip: "Awaiting data"
  }
];

const SystemMonitoring = () => (
  <div className="p-6">
    <SectionHeader icon={ServerCogIcon} title="System Monitoring" />
    <div className="grid gap-6 grid-cols-1 md:grid-cols-3 lg:grid-cols-3 mb-8">
      {metrics.map(({ icon: Icon, label, value, tip }) => (
        <Card key={label}>
          <CardHeader>
            {Icon && <Icon className="text-blue-400 mr-2" size={22} aria-hidden="true" />}
            <CardTitle className="text-gray-700 text-sm font-medium">{label}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-blue-900 font-bold text-xl">{value}</div>
            <div className="text-gray-400 text-xs">{tip}</div>
          </CardContent>
        </Card>
      ))}
    </div>
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
      <div>
        <h3 className="font-semibold text-lg mb-2">System Events</h3>
        <div className="bg-gray-100 p-4 rounded text-gray-500 text-center">
          No system events displayed yet.
        </div>
      </div>
      <div>
        <h3 className="font-semibold text-lg mb-2">Incidents Log</h3>
        <div className="bg-gray-100 p-4 rounded text-gray-500 text-center">
          No incidents logged yet.
        </div>
      </div>
    </div>
  </div>
);

export default SystemMonitoring;
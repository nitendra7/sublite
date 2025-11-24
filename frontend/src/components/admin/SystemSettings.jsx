import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

const SystemSettings = () => {
  const [settings, setSettings] = useState({
    siteName: 'Service Platform',
    siteDescription: 'Professional service booking platform',
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: true,
    defaultCurrency: 'USD',
    timezone: 'UTC',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '24h',
    itemsPerPage: 10,
    sessionTimeout: 30,
    maxFileUploadSize: 5,
    enableCache: true,
    cacheExpiration: 3600,
    enableLogging: true,
    logLevel: 'info'
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // API call would go here
      // await api.put('/admin/settings/system', settings);
      
      setTimeout(() => {
        alert('System settings saved successfully!');
        setSaving(false);
      }, 1000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">System Settings</h2>
        <p className="text-gray-600">Configure global system preferences</p>
      </div>

      {/* General Settings */}
      <Card className="p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">General</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Site Name</label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => handleChange('siteName', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Site Description</label>
            <textarea
              value={settings.siteDescription}
              onChange={(e) => handleChange('siteDescription', e.target.value)}
              className="w-full p-2 border rounded"
              rows="3"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
              className="mr-2"
            />
            <label>Enable Maintenance Mode</label>
          </div>
        </div>
      </Card>

      {/* User Settings */}
      <Card className="p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">User Management</h3>
        <div className="space-y-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={settings.allowRegistration}
              onChange={(e) => handleChange('allowRegistration', e.target.checked)}
              className="mr-2"
            />
            <label>Allow User Registration</label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={settings.requireEmailVerification}
              onChange={(e) => handleChange('requireEmailVerification', e.target.checked)}
              className="mr-2"
            />
            <label>Require Email Verification</label>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Session Timeout (minutes)</label>
            <input
              type="number"
              value={settings.sessionTimeout}
              onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value))}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      </Card>

      {/* Localization */}
      <Card className="p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Localization</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Default Currency</label>
            <select
              value={settings.defaultCurrency}
              onChange={(e) => handleChange('defaultCurrency', e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="INR">INR - Indian Rupee</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Timezone</label>
            <select
              value={settings.timezone}
              onChange={(e) => handleChange('timezone', e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="Europe/London">London</option>
              <option value="Asia/Tokyo">Tokyo</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date Format</label>
            <select
              value={settings.dateFormat}
              onChange={(e) => handleChange('dateFormat', e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Time Format</label>
            <select
              value={settings.timeFormat}
              onChange={(e) => handleChange('timeFormat', e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="24h">24 Hour</option>
              <option value="12h">12 Hour (AM/PM)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Performance */}
      <Card className="p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Performance</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Items Per Page</label>
            <input
              type="number"
              value={settings.itemsPerPage}
              onChange={(e) => handleChange('itemsPerPage', parseInt(e.target.value))}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Max File Upload Size (MB)</label>
            <input
              type="number"
              value={settings.maxFileUploadSize}
              onChange={(e) => handleChange('maxFileUploadSize', parseInt(e.target.value))}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={settings.enableCache}
              onChange={(e) => handleChange('enableCache', e.target.checked)}
              className="mr-2"
            />
            <label>Enable Caching</label>
          </div>
          {settings.enableCache && (
            <div>
              <label className="block text-sm font-medium mb-1">Cache Expiration (seconds)</label>
              <input
                type="number"
                value={settings.cacheExpiration}
                onChange={(e) => handleChange('cacheExpiration', parseInt(e.target.value))}
                className="w-full p-2 border rounded"
              />
            </div>
          )}
        </div>
      </Card>

      {/* Logging */}
      <Card className="p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Logging</h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={settings.enableLogging}
              onChange={(e) => handleChange('enableLogging', e.target.checked)}
              className="mr-2"
            />
            <label>Enable System Logging</label>
          </div>
          {settings.enableLogging && (
            <div>
              <label className="block text-sm font-medium mb-1">Log Level</label>
              <select
                value={settings.logLevel}
                onChange={(e) => handleChange('logLevel', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="error">Error</option>
                <option value="warn">Warning</option>
                <option value="info">Info</option>
                <option value="debug">Debug</option>
              </select>
            </div>
          )}
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
};

export default SystemSettings;

import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

const EmailSettings = () => {
  const [settings, setSettings] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUser: '',
    smtpPassword: '',
    fromEmail: 'noreply@example.com',
    fromName: 'Platform Team',
    enableNotifications: true,
    enableBookingEmails: true,
    enablePaymentEmails: true,
    enableMarketingEmails: false
  });

  const [testEmail, setTestEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // API call would go here
      // await api.put('/admin/settings/email', settings);
      
      setTimeout(() => {
        alert('Email settings saved successfully!');
        setSaving(false);
      }, 1000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      alert('Please enter an email address');
      return;
    }

    setTesting(true);
    try {
      // API call would go here
      // await api.post('/admin/settings/email/test', { email: testEmail });
      
      setTimeout(() => {
        alert(`Test email sent to ${testEmail}`);
        setTesting(false);
      }, 1500);
    } catch (error) {
      console.error('Error sending test email:', error);
      setTesting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Email Settings</h2>
        <p className="text-gray-600">Configure email server and notification preferences</p>
      </div>

      {/* SMTP Configuration */}
      <Card className="p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">SMTP Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">SMTP Host</label>
            <input
              type="text"
              value={settings.smtpHost}
              onChange={(e) => handleChange('smtpHost', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">SMTP Port</label>
            <input
              type="text"
              value={settings.smtpPort}
              onChange={(e) => handleChange('smtpPort', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">SMTP Username</label>
            <input
              type="text"
              value={settings.smtpUser}
              onChange={(e) => handleChange('smtpUser', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">SMTP Password</label>
            <input
              type="password"
              value={settings.smtpPassword}
              onChange={(e) => handleChange('smtpPassword', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">From Email</label>
            <input
              type="email"
              value={settings.fromEmail}
              onChange={(e) => handleChange('fromEmail', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">From Name</label>
            <input
              type="text"
              value={settings.fromName}
              onChange={(e) => handleChange('fromName', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      </Card>

      {/* Email Notifications */}
      <Card className="p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Email Notifications</h3>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.enableNotifications}
              onChange={(e) => handleChange('enableNotifications', e.target.checked)}
              className="mr-2"
            />
            <span>Enable Email Notifications</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.enableBookingEmails}
              onChange={(e) => handleChange('enableBookingEmails', e.target.checked)}
              className="mr-2"
            />
            <span>Send Booking Confirmation Emails</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.enablePaymentEmails}
              onChange={(e) => handleChange('enablePaymentEmails', e.target.checked)}
              className="mr-2"
            />
            <span>Send Payment Confirmation Emails</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.enableMarketingEmails}
              onChange={(e) => handleChange('enableMarketingEmails', e.target.checked)}
              className="mr-2"
            />
            <span>Send Marketing Emails</span>
          </label>
        </div>
      </Card>

      {/* Test Email */}
      <Card className="p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Test Email Configuration</h3>
        <p className="text-gray-600 mb-4">Send a test email to verify your SMTP settings</p>
        <div className="flex gap-2">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="Enter test email address"
            className="flex-1 p-2 border rounded"
          />
          <Button
            onClick={handleTestEmail}
            disabled={testing}
            className="bg-green-600 text-white hover:bg-green-700"
          >
            {testing ? 'Sending...' : 'Send Test Email'}
          </Button>
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

export default EmailSettings;

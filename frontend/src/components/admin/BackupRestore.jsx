import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

const BackupRestore = () => {
  const [backups, setBackups] = useState([
    {
      id: 1,
      name: 'backup_2025_01_15',
      date: '2025-01-15T10:30:00',
      size: '250 MB',
      status: 'completed'
    },
    {
      id: 2,
      name: 'backup_2025_01_14',
      date: '2025-01-14T10:30:00',
      size: '248 MB',
      status: 'completed'
    }
  ]);
  const [creating, setCreating] = useState(false);

  const handleCreateBackup = async () => {
    setCreating(true);
    try {
      // API call would go here
      // await api.post('/admin/backup/create');
      
      // Simulate backup creation
      setTimeout(() => {
        const newBackup = {
          id: backups.length + 1,
          name: `backup_${new Date().toISOString().split('T')[0]}`,
          date: new Date().toISOString(),
          size: '251 MB',
          status: 'completed'
        };
        setBackups([newBackup, ...backups]);
        setCreating(false);
      }, 2000);
    } catch (error) {
      console.error('Error creating backup:', error);
      setCreating(false);
    }
  };

  const handleRestore = async (backupId) => {
    if (!confirm('Are you sure you want to restore this backup? This will overwrite current data.')) {
      return;
    }
    
    try {
      // API call would go here
      // await api.post(`/admin/backup/restore/${backupId}`);
      alert('Backup restored successfully!');
    } catch (error) {
      console.error('Error restoring backup:', error);
      alert('Failed to restore backup');
    }
  };

  const handleDownload = (backup) => {
    // In a real application, this would download the backup file
    alert(`Downloading ${backup.name}...`);
  };

  const handleDelete = async (backupId) => {
    if (!confirm('Are you sure you want to delete this backup?')) {
      return;
    }
    
    setBackups(backups.filter(b => b.id !== backupId));
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Backup & Restore</h2>
        <p className="text-gray-600">Manage system backups and restore data</p>
      </div>

      {/* Create Backup Section */}
      <Card className="p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Create New Backup</h3>
        <p className="text-gray-600 mb-4">
          Create a complete backup of your database and files. This process may take several minutes.
        </p>
        <Button
          onClick={handleCreateBackup}
          disabled={creating}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          {creating ? 'Creating Backup...' : 'Create Backup Now'}
        </Button>
      </Card>

      {/* Backup List */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Available Backups</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Backup Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {backups.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center">No backups available</td>
                </tr>
              ) : (
                backups.map((backup) => (
                  <tr key={backup.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium">{backup.name}</td>
                    <td className="px-6 py-4 text-sm">
                      {new Date(backup.date).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm">{backup.size}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs rounded bg-green-50 text-green-600">
                        {backup.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRestore(backup.id)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Restore
                        </button>
                        <button
                          onClick={() => handleDownload(backup)}
                          className="text-green-600 hover:text-green-800"
                        >
                          Download
                        </button>
                        <button
                          onClick={() => handleDelete(backup.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default BackupRestore;

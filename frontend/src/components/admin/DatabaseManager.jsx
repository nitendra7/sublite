import { useState } from 'react';
import { useToast } from '../../hooks/use-toast';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

function DatabaseManager() {
  const { toast } = useToast();
  const [stats] = useState({
    totalCollections: 12,
    totalDocuments: 45678,
    databaseSize: '2.5 GB',
    indexSize: '450 MB',
    lastBackup: '2025-01-15 10:30:00',
  });

  const [collections] = useState([
    {
      name: 'users', documents: 1234, size: '125 MB', indexes: 3,
    },
    {
      name: 'bookings', documents: 5678, size: '580 MB', indexes: 5,
    },
    {
      name: 'services', documents: 890, size: '95 MB', indexes: 4,
    },
    {
      name: 'payments', documents: 4567, size: '450 MB', indexes: 4,
    },
    {
      name: 'reviews', documents: 2345, size: '180 MB', indexes: 3,
    },
  ]);

  const [optimizing, setOptimizing] = useState(false);

  const handleOptimizeCollection = async (collectionName) => {
    // eslint-disable-next-line no-alert
    if (!window.confirm(`Optimize ${collectionName} collection?`)) {
      return;
    }

    toast({
      title: 'Optimization',
      description: `Optimizing ${collectionName}...`,
    });
  };

  const handleRepairDatabase = async () => {
    // eslint-disable-next-line no-alert
    if (!window.confirm('This will repair the database. Continue?')) {
      return;
    }

    setOptimizing(true);
    setTimeout(() => {
      toast({
        title: 'Success',
        description: 'Database repaired successfully!',
      });
      setOptimizing(false);
    }, 2000);
  };

  const handleRebuildIndexes = async (collectionName) => {
    toast({
      title: 'Rebuilding Indexes',
      description: `Rebuilding indexes for ${collectionName}...`,
    });
  };

  const handleViewIndexes = (collectionName) => {
    toast({
      title: 'Indexes',
      description: `Viewing indexes for ${collectionName}`,
    });
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Database Manager</h2>
        <p className="text-gray-600">Monitor and manage database operations</p>
      </div>

      {/* Database Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">Collections</div>
          <div className="text-2xl font-bold">{stats.totalCollections}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">Total Documents</div>
          <div className="text-2xl font-bold">{stats.totalDocuments.toLocaleString()}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">Database Size</div>
          <div className="text-2xl font-bold">{stats.databaseSize}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">Index Size</div>
          <div className="text-2xl font-bold">{stats.indexSize}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">Last Backup</div>
          <div className="text-sm font-bold">{stats.lastBackup}</div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={handleRepairDatabase}
            disabled={optimizing}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            {optimizing ? 'Repairing...' : 'Repair Database'}
          </Button>
          <Button className="bg-green-600 text-white hover:bg-green-700">
            Optimize All Collections
          </Button>
          <Button className="bg-purple-600 text-white hover:bg-purple-700">
            Analyze Database
          </Button>
          <Button className="bg-orange-600 text-white hover:bg-orange-700">
            Export Schema
          </Button>
        </div>
      </Card>

      {/* Collections Table */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Collections</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Collection</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Documents</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Indexes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {collections.map((collection) => (
                <tr key={collection.name} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium">{collection.name}</td>
                  <td className="px-6 py-4 text-sm">{collection.documents.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm">{collection.size}</td>
                  <td className="px-6 py-4 text-sm">{collection.indexes}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOptimizeCollection(collection.name)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Optimize
                      </button>
                      <button
                        onClick={() => handleRebuildIndexes(collection.name)}
                        className="text-green-600 hover:text-green-800"
                      >
                        Rebuild Indexes
                      </button>
                      <button
                        onClick={() => handleViewIndexes(collection.name)}
                        className="text-purple-600 hover:text-purple-800"
                      >
                        View Indexes
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default DatabaseManager;

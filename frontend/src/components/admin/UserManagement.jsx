import { useEffect, useState } from 'react';
import { useUser } from '../../context/UserContext';
import SectionHeader from './SectionHeader';
import { Users, Trash2, Shield, ShieldOff } from 'lucide-react';
import { API_BASE } from '../../utils/api';

const UserManagement = () => {
  const { token, user: currentUser } = useUser();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch users');
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [token]);

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
              const res = await fetch(`${API_BASE}/users/${userId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
              });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete user');
      setUsers(users.filter(u => u._id !== userId));
      alert('User deleted successfully.');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleAdmin = async (userId, currentIsAdmin) => {
    const action = currentIsAdmin ? 'remove admin rights from' : 'make admin' ;
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;
    try {
              const res = await fetch(`${API_BASE}/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isAdmin: !currentIsAdmin }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update admin status');
      setUsers(users.map(u => u._id === userId ? { ...u, isAdmin: data.isAdmin } : u));
      alert(`User is now ${data.isAdmin ? 'an admin' : 'a regular user'}.`);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-10 min-h-full animate-fade-in">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2bb6c4] mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 md:p-10 min-h-full animate-fade-in">
        <div className="text-center text-red-500 dark:text-red-400">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-10 min-h-full animate-fade-in">
      <SectionHeader
        icon={Users}
        title="User Management"
        actions={
          <button className="bg-[#2bb6c4] hover:bg-[#1ea1b0] text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2">
            <Users size={16} />
            Add User
          </button>
        }
      />

      {/* User Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-[#263238]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-100">Total Users</p>
              <p className="text-2xl font-bold text-[#2bb6c4] dark:text-gray-100">{users.length}</p>
            </div>
            <Users className="w-8 h-8 text-[#2bb6c4] dark:text-[#5ed1dc]" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-[#263238]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-100">Admins</p>
              <p className="text-2xl font-bold text-[#2bb6c4] dark:text-gray-100">
                {users.filter(u => u.isAdmin).length}
              </p>
            </div>
            <Shield className="w-8 h-8 text-[#2bb6c4] dark:text-[#5ed1dc]" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-[#263238]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-100">Regular Users</p>
              <p className="text-2xl font-bold text-[#2bb6c4] dark:text-gray-100">
                {users.filter(u => !u.isAdmin).length}
              </p>
            </div>
            <Users className="w-8 h-8 text-[#2bb6c4] dark:text-[#5ed1dc]" />
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">All Users</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Role</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {users.map(user => (
                <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 font-medium">{user.name || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{user.email || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      user.isAdmin
                        ? 'bg-[#e0f7fa] dark:bg-[#263238] text-[#2bb6c4] dark:text-[#5ed1dc]'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                    }`}>
                      {user.isAdmin ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {user._id !== currentUser?._id && (
                        <>
                          <button
                            onClick={() => handleToggleAdmin(user._id, user.isAdmin)}
                            className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                              user.isAdmin
                                ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800'
                                : 'bg-[#2bb6c4] hover:bg-[#1ea1b0] text-white'
                            }`}
                          >
                            {user.isAdmin ? <ShieldOff size={14} className="mr-1" /> : <Shield size={14} className="mr-1" />}
                            {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                          </button>

                          <button
                            onClick={() => handleDelete(user._id)}
                            className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition-all duration-200"
                          >
                            <Trash2 size={14} className="mr-1" />
                            Delete
                          </button>
                        </>
                      )}
                      {user._id === currentUser?._id && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 italic">Current User</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;

import React, { useEffect, useState } from 'react';
import { userManagementApi } from '../api';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [counts, setCounts] = useState({ totalUsers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersList, userCount] = await Promise.all([
        userManagementApi.getAll(),
        userManagementApi.getCount()
      ]);
      setUsers(usersList.data);
      setCounts(userCount.data);
    } catch (err) {
      console.error('Failed to fetch user data', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading User Management...</div>;

  return (
    <div className="user-management glass">
      <div className="analytics-header">
        <div className="stat-card">
          <h3>Total Users</h3>
          <div className="stat-value pulse">{counts.totalUsers}</div>
        </div>
        <div className="stat-card">
          <h3>Active Sessions</h3>
          <div className="stat-value">{users.length}</div>
        </div>
      </div>

      <div className="user-list-section">
        <h3>User Directory</h3>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Role</th>
                <th>Registered At</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td className="username-cell">{user.username}</td>
                  <td>
                    <span className={`role-badge ${user.role.toLowerCase()}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
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

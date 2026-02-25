import React, { useEffect, useState } from 'react';
import { Users, Activity, Calendar, TrendingUp, Clock, Package } from 'lucide-react';
import { userManagementApi, orderApi } from '../api';

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState({
        totalCustomers: 0,
        activeSessions: 0,
        salesWeek: 0,
        salesMonth: 0,
        salesYear: 0
    });
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const [
                    customersRes,
                    activeRes,
                    salesWeekRes,
                    salesMonthRes,
                    salesYearRes,
                    usersRes
                ] = await Promise.all([
                    userManagementApi.getCustomerCount(),
                    userManagementApi.getActiveSessions(),
                    orderApi.getSalesAnalytics('week'),
                    orderApi.getSalesAnalytics('month'),
                    orderApi.getSalesAnalytics('year'),
                    userManagementApi.getAll()
                ]);

                setStats({
                    totalCustomers: customersRes.data.customerCount,
                    activeSessions: activeRes.data.activeSessions,
                    salesWeek: salesWeekRes.data.count,
                    salesMonth: salesMonthRes.data.count,
                    salesYear: salesYearRes.data.count
                });
                setUsers(usersRes.data);
            } catch (error) {
                console.error("Dashboard data fetch failed", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const StatCard = ({ title, value, icon: Icon, color }: any) => (
        <div className="glass stat-card animate-in" style={{ borderTop: `4px solid ${color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ background: `${color}20`, padding: '0.75rem', borderRadius: '12px' }}>
                    <Icon size={24} color={color} />
                </div>
                {title === 'Active Sessions' && <div className="pulse" style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%', boxShadow: '0 0 10px #22c55e' }} />}
            </div>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{title}</h3>
            <div className="stat-value" style={{ fontSize: '2.5rem' }}>{value}</div>
        </div>
    );

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <div className="pulse" style={{ fontSize: '1.2rem', color: 'var(--accent)' }}>Synchronizing Analytics Stack...</div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <div className="grid" style={{ marginBottom: '2.5rem' }}>
                <StatCard title="Active Sessions" value={stats.activeSessions} icon={Activity} color="#22c55e" />
                <StatCard title="Total Customers" value={stats.totalCustomers} icon={Users} color="#38bdf8" />
                <StatCard title="Weekly Sales" value={stats.salesWeek} icon={TrendingUp} color="#a855f7" />
                <StatCard title="Monthly Sales" value={stats.salesMonth} icon={Calendar} color="#f59e0b" />
                <StatCard title="Yearly Aggregate" value={stats.salesYear} icon={Package} color="#ec4899" />
            </div>

            <div className="glass-card animate-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Clock className="accent-text" /> System User Directory
                    </h2>
                    <span className="status-badge" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        {users.length} Total Accounts
                    </span>
                </div>

                <div className="table-responsive" style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: '1rem' }}>Username</th>
                                <th style={{ padding: '1rem' }}>Role Access</th>
                                <th style={{ padding: '1rem' }}>Onboarding Date</th>
                                <th style={{ padding: '1rem' }}>Last Signal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '1rem' }} className="username-cell">{user.username}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span className={`role-badge ${user.role.toLowerCase()}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                                        {user.lastActiveAt ? new Date(user.lastActiveAt).toLocaleTimeString() : 'Never'}
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

export default AdminDashboard;

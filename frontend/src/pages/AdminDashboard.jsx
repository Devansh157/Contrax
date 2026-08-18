import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  ShieldCheck, 
  Users, 
  FileText, 
  IndianRupee, 
  Activity, 
  Search, 
  CheckCircle2, 
  ChevronRight, 
  UserCheck, 
  Briefcase, 
  Trash2, 
  Edit3, 
  ExternalLink,
  Zap,
  Sparkles,
  RefreshCw,
  X,
  Mail,
  Phone,
  Key,
  User
} from 'lucide-react';
import { AnalyticsLogo } from '../components/Logo';
import API from '../config';

const formatUsername = (name) => (name ? name.charAt(0).toUpperCase() + name.slice(1) : 'User');

const AdminDashboard = ({ token, user, onSelectContract, activeTab, setActiveTab, showToast, fetchCurrentUser }) => {
  const [stats, setStats] = useState({
    primary_stat: 0,
    primary_label: 'Total Escrow Volume (INR)',
    total_contracts: 0,
    completed_contracts: 0,
    active_contracts: 0,
    searching_contracts: 0,
    total_clients: 0,
    total_contractors: 0
  });

  const [contracts, setContracts] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminTab, setAdminTab] = useState('contracts'); // 'contracts', 'users', 'analytics'
  const [contractSearch, setContractSearch] = useState('');
  const [contractStatusFilter, setContractStatusFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');

  // Editing balance modal state
  const [editingUser, setEditingUser] = useState(null);
  const [newBalance, setNewBalance] = useState('');

  // Editing target user details modal state (Client & Contractor details)
  const [editingTargetUser, setEditingTargetUser] = useState(null);
  const [updatingTargetUser, setUpdatingTargetUser] = useState(false);
  const [targetUserForm, setTargetUserForm] = useState({
    username: '',
    email: '',
    phone_number: '',
    role: 'client',
    specialty: '',
    wallet_balance: 0,
    bio: '',
    profile_picture: '',
    password: ''
  });

  const handleOpenEditTargetUserModal = (targetUser) => {
    setEditingTargetUser(targetUser);
    setTargetUserForm({
      username: targetUser.username || '',
      email: targetUser.email || '',
      phone_number: targetUser.phone_number || '',
      role: targetUser.role || 'client',
      specialty: targetUser.specialty || '',
      wallet_balance: targetUser.wallet_balance || 0,
      bio: targetUser.bio || '',
      profile_picture: targetUser.profile_picture || '',
      password: ''
    });
  };

  const handleSaveTargetUserDetails = async (e) => {
    e.preventDefault();
    if (!editingTargetUser) return;
    setUpdatingTargetUser(true);
    try {
      const res = await fetch(`${API}/api/auth/admin/users/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({
          target_user_id: editingTargetUser.id,
          action: 'update_user_details',
          ...targetUserForm
        })
      });

      if (res.ok) {
        showToast(`User details for "${targetUserForm.username}" updated successfully!`, "success");
        fetchAdminData();
        setEditingTargetUser(null);
      } else {
        const err = await res.json();
        showToast(err.error || "Failed to update user details", "danger");
      }
    } catch (err) {
      console.error("Update target user error:", err);
      showToast("Server communication error", "danger");
    } finally {
      setUpdatingTargetUser(false);
    }
  };

  // Update admin profile modal state
  const [showUpdateDetailsModal, setShowUpdateDetailsModal] = useState(false);
  const [updatingDetails, setUpdatingDetails] = useState(false);
  const [adminForm, setAdminForm] = useState({
    username: '',
    email: '',
    phone_number: '',
    bio: '',
    specialty: '',
    profile_picture: '',
    password: ''
  });

  const handleOpenUpdateModal = () => {
    setAdminForm({
      username: user?.username || '',
      email: user?.email || '',
      phone_number: user?.phone_number || '',
      bio: user?.bio || '',
      specialty: user?.specialty || 'System Administrator',
      profile_picture: user?.profile_picture || '',
      password: ''
    });
    setShowUpdateDetailsModal(true);
  };

  const handleUpdateAdminDetails = async (e) => {
    e.preventDefault();
    setUpdatingDetails(true);
    try {
      const res = await fetch(`${API}/api/auth/user/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({
          action: 'update_profile',
          ...adminForm
        })
      });

      if (res.ok) {
        const updatedUser = await res.json();
        showToast("Admin profile details updated successfully!", "success");
        localStorage.setItem('contractgo_user', JSON.stringify(updatedUser));
        if (fetchCurrentUser) fetchCurrentUser();
        setShowUpdateDetailsModal(false);
      } else {
        const errData = await res.json();
        showToast(errData.error || "Failed to update admin details", "danger");
      }
    } catch (err) {
      console.error("Update admin details error:", err);
      showToast("Server communication error", "danger");
    } finally {
      setUpdatingDetails(false);
    }
  };

  const fetchAdminData = async () => {
    try {
      // Fetch admin stats
      const statsRes = await fetch(`${API}/api/contracts/stats/`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Fetch all contracts across system
      const contractsRes = await fetch(`${API}/api/contracts/`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      if (contractsRes.ok) {
        const contractsData = await contractsRes.json();
        setContracts(Array.isArray(contractsData) ? contractsData : []);
      }

      // Fetch all users list from admin endpoint
      const usersRes = await fetch(`${API}/api/auth/admin/users/`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsersList(Array.isArray(usersData) ? usersData : []);
      }
    } catch (error) {
      console.error("Error fetching admin dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 6000);
    return () => clearInterval(interval);
  }, [token]);

  // Admin user actions
  const handleUserAction = async (targetUserId, action, payload = {}) => {
    try {
      const res = await fetch(`${API}/api/auth/admin/users/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({
          target_user_id: targetUserId,
          action,
          ...payload
        })
      });

      if (res.ok) {
        showToast(`User update executed successfully (${action})`, "success");
        fetchAdminData();
        setEditingUser(null);
      } else {
        const err = await res.json();
        showToast(err.error || "Action failed", "danger");
      }
    } catch (err) {
      console.error("Admin user action error:", err);
      showToast("Server communication error", "danger");
    }
  };

  // CSV Analytics state
  const [csvAnalytics, setCsvAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const fetchCsvAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const res = await fetch(`${API}/api/contracts/csv-analytics/`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCsvAnalytics(data);
      }
    } catch (err) {
      console.error("Failed to fetch CSV analytics:", err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    if (adminTab === 'analytics') {
      fetchCsvAnalytics();
    }
  }, [adminTab, token]);

  // Filtered lists
  const filteredContracts = contracts.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(contractSearch.toLowerCase()) ||
      (c.client_detail?.username || '').toLowerCase().includes(contractSearch.toLowerCase()) ||
      (c.contractor_detail?.username || '').toLowerCase().includes(contractSearch.toLowerCase());
    
    const matchesStatus = contractStatusFilter === 'all' || c.status === contractStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredUsers = usersList.filter(u => {
    const matchesSearch = u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(userSearch.toLowerCase());
    
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading && contracts.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
        Loading Contrax Admin Operations Control Center...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* Admin Operations Control Banner */}
      <div className="glass-panel animate-fade-in-up" style={{
        padding: '1.75rem 2.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.25rem',
        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12), rgba(245, 158, 11, 0.08), rgba(99, 102, 241, 0.06))',
        border: '1.5px solid rgba(239, 68, 68, 0.35)',
        borderRadius: 'var(--radius-lg)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '14px',
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            color: 'var(--danger)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShieldCheck size={32} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                padding: '2px 8px',
                borderRadius: '12px',
                backgroundColor: 'var(--danger)',
                color: 'white'
              }}>
                SUPERUSER PORTAL
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                System User: <strong>{user?.username}</strong>
              </span>
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
              Contrax System Operations & Admin Control Center
            </h2>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Real-time platform oversight, user permissions management, contract escrow enforcement, and system metrics.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={handleOpenUpdateModal} 
            className="btn btn-primary"
            style={{ 
              padding: '0.6rem 1.15rem', 
              fontSize: '0.85rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.45rem', 
              backgroundColor: 'var(--primary)', 
              borderColor: 'var(--primary)', 
              color: '#0b0f19', 
              fontWeight: 800,
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)'
            }}
          >
            <UserCheck size={16} /> Update Details
          </button>

          <button 
            onClick={fetchAdminData} 
            className="btn btn-outline"
            style={{ padding: '0.6rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <RefreshCw size={15} /> Refresh System Feed
          </button>

          <a 
            href={`${API}/admin/`}
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', backgroundColor: 'var(--danger)', borderColor: 'var(--danger)', color: 'white' }}
          >
            <span>Django Native Admin Portal</span>
            <ExternalLink size={16} />
          </a>
        </div>
      </div>

      {/* Admin Stats Grid */}
      <div className="stats-row intel-stagger-list">
        <div className="glass-panel stat-card intel-stat-card glow-gold" style={{ display: 'flex', flexDirection: 'column', justify: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
            <div>
              <h3>Total Escrow Volume</h3>
              <div className="value primary-color intel-value-counter">₹{stats.primary_stat.toLocaleString()}</div>
            </div>
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IndianRupee size={24} />
            </div>
          </div>
          <div className="intel-mini-chart" title="System Escrow Telemetry">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((bar, i) => (
              <div key={i} className="intel-bar" style={{ background: 'var(--primary)', animationDelay: `${0.1 * i}s` }}></div>
            ))}
          </div>
        </div>

        <div className="glass-panel stat-card intel-stat-card glow-blue" style={{ display: 'flex', flexDirection: 'column', justify: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
            <div>
              <h3>Total System Contracts</h3>
              <div className="value intel-value-counter">{stats.total_contracts}</div>
            </div>
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: 'rgba(37, 99, 235, 0.15)', color: 'var(--info)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={24} />
            </div>
          </div>
          <div className="intel-mini-chart" title="System Contract Velocity">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((bar, i) => (
              <div key={i} className="intel-bar" style={{ background: 'var(--info)', animationDelay: `${0.14 * (8 - i)}s` }}></div>
            ))}
          </div>
        </div>

        <div className="glass-panel stat-card intel-stat-card glow-green" style={{ display: 'flex', flexDirection: 'column', justify: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
            <div>
              <h3>Registered Clients</h3>
              <div className="value intel-value-counter" style={{ color: 'var(--success)' }}>{stats.total_clients || usersList.filter(u => u.role === 'client').length}</div>
            </div>
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={24} />
            </div>
          </div>
          <div className="intel-mini-chart" title="Client Onboarding Rate">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((bar, i) => (
              <div key={i} className="intel-bar" style={{ background: 'var(--success)', animationDelay: `${0.12 * i}s` }}></div>
            ))}
          </div>
        </div>

        <div className="glass-panel stat-card intel-stat-card glow-cyan" style={{ display: 'flex', flexDirection: 'column', justify: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
            <div>
              <h3>Active Contractors</h3>
              <div className="value intel-value-counter" style={{ color: 'var(--secondary)' }}>{stats.total_contractors || usersList.filter(u => u.role === 'contractor').length}</div>
            </div>
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: 'rgba(8, 145, 178, 0.15)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Briefcase size={24} />
            </div>
          </div>
          <div className="intel-mini-chart" title="Contractor Availability Pulse">
            {[1, 2, 3, 4, 5, 6, 7].map((bar, i) => (
              <div key={i} className="intel-bar" style={{ background: 'var(--secondary)', animationDelay: `${0.18 * i}s` }}></div>
            ))}
          </div>
        </div>
      </div>

      {/* Admin Tab Navigation Bar */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
        {[
          { id: 'contracts', label: 'All Platform Contracts', icon: FileText, count: contracts.length },
          { id: 'users', label: 'User Directory & Roles', icon: Users, count: usersList.length },
          { id: 'analytics', label: 'Dataset & Spending Analytics', icon: Zap }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = adminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id)}
              className={`btn ${isActive ? 'btn-primary' : 'btn-outline'}`}
              style={{
                padding: '0.65rem 1.25rem',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                borderRadius: '12px',
                fontWeight: 700
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span style={{ fontSize: '0.75rem', padding: '1px 7px', borderRadius: '10px', backgroundColor: isActive ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.1)' }}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: ALL CONTRACTS SUPERVISORY BOARD */}
      {adminTab === 'contracts' && (
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800 }}>Master Contracts Registry</h2>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                System-wide overview of all active, offered, searching, and closed contract agreements.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Search contract title or user..."
                  value={contractSearch}
                  onChange={e => setContractSearch(e.target.value)}
                  className="form-control"
                  style={{ paddingLeft: '2.25rem', width: '240px', height: '38px', fontSize: '0.85rem' }}
                />
                <Search size={16} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--text-muted)' }} />
              </div>

              <select
                value={contractStatusFilter}
                onChange={e => setContractStatusFilter(e.target.value)}
                className="form-control"
                style={{ width: 'auto', height: '38px', fontSize: '0.85rem', padding: '0.25rem 1.75rem 0.25rem 0.75rem' }}
              >
                <option value="all">All Statuses ({contracts.length})</option>
                <option value="searching">Searching</option>
                <option value="offered">Offered</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="approved">Approved & Paid</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Contracts Data Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>ID</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Title & Category</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Client</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Assigned Contractor</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Escrow Budget</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredContracts.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                      No contract records match your search query.
                    </td>
                  </tr>
                ) : (
                  filteredContracts.map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }} className="table-row-hover">
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 'bold' }}>#{c.id}</td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{c.title}</div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>Category: {c.category}</span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <img src={c.client_detail?.profile_picture || `https://api.dicebear.com/7.x/initials/svg?seed=${c.client_detail?.username || 'Client'}`} alt="" style={{ width: '26px', height: '26px', borderRadius: '50%' }} />
                          <span>{formatUsername(c.client_detail?.username)}</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        {c.contractor_detail ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <img src={c.contractor_detail.profile_picture || `https://api.dicebear.com/7.x/initials/svg?seed=${c.contractor_detail.username}`} alt="" style={{ width: '26px', height: '26px', borderRadius: '50%' }} />
                            <span>{formatUsername(c.contractor_detail.username)}</span>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            {c.accepted_contractors_details?.length > 0 ? `${c.accepted_contractors_details.length} Accepted (Pending Selection)` : 'Unassigned'}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: 'var(--primary)' }}>₹{c.budget?.toLocaleString()}</td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span className={`status-badge ${c.status}`} style={{ fontSize: '0.75rem', padding: '3px 8px' }}>
                          {c.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        <button 
                          className="btn btn-outline" 
                          onClick={() => onSelectContract(c.id)}
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                        >
                          Inspect Document
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: USER DIRECTORY & ROLE MANAGEMENT */}
      {adminTab === 'users' && (
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800 }}>Registered Users Directory</h2>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                System user accounts, role configuration, wallet balance edits, and access permissions.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Search user name or email..."
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  className="form-control"
                  style={{ paddingLeft: '2.25rem', width: '240px', height: '38px', fontSize: '0.85rem' }}
                />
                <Search size={16} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--text-muted)' }} />
              </div>

              <select
                value={userRoleFilter}
                onChange={e => setUserRoleFilter(e.target.value)}
                className="form-control"
                style={{ width: 'auto', height: '38px', fontSize: '0.85rem', padding: '0.25rem 1.75rem 0.25rem 0.75rem' }}
              >
                <option value="all">All Roles ({usersList.length})</option>
                <option value="client">Client</option>
                <option value="contractor">Contractor</option>
                <option value="admin">Admin / Superuser</option>
              </select>
            </div>
          </div>

          {/* User Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>User</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Mobile No. (OTP)</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Email</th>
                  <th style={{ padding: '0.75rem 1rem' }}>System Role</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Contractor Specialty</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Escrow Balance</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Online Status</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Rating</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Delete</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Update Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="10" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                      No user accounts found matching query.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img src={u.profile_picture || `https://api.dicebear.com/7.x/initials/svg?seed=${u.username}`} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1.5px solid var(--border-color)' }} />
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                              {formatUsername(u.username)}
                              {u.is_superuser && <span style={{ fontSize: '0.65rem', marginLeft: '6px', color: 'var(--danger)', fontWeight: 800 }}>[Superuser]</span>}
                            </div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ID: #{u.id}</span>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '0.85rem 1rem' }}>
                        {u.phone_number ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-primary)' }}>{u.phone_number}</span>
                            <span style={{ fontSize: '0.65rem', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '1px 5px', borderRadius: '4px', fontWeight: 800 }}>✓ Verified</span>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Not Provided</span>
                        )}
                      </td>

                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>{u.email || 'N/A'}</td>


                      <td style={{ padding: '0.85rem 1rem' }}>
                        <select
                          value={u.role}
                          onChange={e => handleUserAction(u.id, 'update_role', { role: e.target.value })}
                          className="form-control"
                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.78rem', width: 'auto', height: 'auto' }}
                        >
                          <option value="client">Client</option>
                          <option value="contractor">Contractor</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>

                      <td style={{ padding: '0.85rem 1rem' }}>
                        <select
                          value={u.specialty || 'Client'}
                          onChange={e => handleUserAction(u.id, 'update_specialty', { specialty: e.target.value })}
                          className="form-control"
                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.78rem', width: 'auto', height: 'auto', border: '1px solid var(--primary-glow)' }}
                        >
                          <option value="Painting">Painting</option>
                          <option value="Cleaning">Cleaning</option>
                          <option value="Plumbing">Plumbing</option>
                          <option value="Electrical">Electrical</option>
                          <option value="HVAC">HVAC / AC Repair</option>
                          <option value="Landscaping">Landscaping</option>
                          <option value="Security">Security Guard</option>
                          <option value="Pest Control">Pest Control</option>
                          <option value="Water Tank Cleaning">Tank Cleaning</option>
                          <option value="Furniture">Furniture / Carpenter</option>
                          <option value="Courier">Courier / Logistics</option>
                          <option value="Web Development">Web & Tech Dev</option>
                          <option value="General">General Contractor</option>
                          <option value="Client">Client</option>
                        </select>
                      </td>

                      <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: 'var(--success)' }}>
                        ₹{u.wallet_balance?.toLocaleString()}
                        <button 
                          onClick={() => {
                            const val = prompt(`Enter new wallet balance for ${u.username}:`, u.wallet_balance);
                            if (val !== null) handleUserAction(u.id, 'adjust_balance', { wallet_balance: val });
                          }}
                          style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', marginLeft: '6px', fontSize: '0.72rem', textDecoration: 'underline' }}
                        >
                          Edit
                        </button>
                      </td>

                      <td style={{ padding: '0.85rem 1rem' }}>
                        <button
                          onClick={() => handleUserAction(u.id, 'toggle_online')}
                          style={{
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            border: 'none',
                            cursor: 'pointer',
                            backgroundColor: u.is_online ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.05)',
                            color: u.is_online ? '#10b981' : 'var(--text-muted)'
                          }}
                        >
                          {u.is_online ? '● Online' : '○ Offline'}
                        </button>
                      </td>

                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: u.role === 'contractor' ? '#f59e0b' : 'var(--text-muted)', fontWeight: u.role === 'contractor' ? 800 : 400 }}>
                        {u.role === 'contractor' ? `★ ${u.rating || 5.0}` : 'N/A'}
                      </td>

                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete user account ${u.username}? This action cannot be undone.`)) {
                              handleUserAction(u.id, 'delete_user');
                            }
                          }}
                          className="btn btn-outline"
                          style={{ padding: '0.35rem 0.65rem', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                          title="Delete User Account"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>

                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                        <button
                          onClick={() => handleOpenEditTargetUserModal(u)}
                          className="btn btn-primary"
                          style={{
                            padding: '0.35rem 0.85rem',
                            fontSize: '0.78rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            backgroundColor: 'var(--primary)',
                            borderColor: 'var(--primary)',
                            color: '#0b0f19',
                            fontWeight: 800,
                            borderRadius: '8px',
                            boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)'
                          }}
                          title={`Update all details for ${u.username}`}
                        >
                          <UserCheck size={14} /> Update Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: DATASET & SPENDING ANALYTICS */}
      {adminTab === 'analytics' && (
        <div className="dashboard-grid">
          <div className="glass-panel" style={{ gridColumn: '1 / -1', padding: '1.75rem 2.25rem', background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.09), rgba(0, 114, 255, 0.04))', border: '1px solid rgba(0, 229, 255, 0.22)', borderRadius: 'var(--radius-lg)' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
              System Dataset Intelligence & Corporate Metrics
            </h2>
            <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Real-time analysis computed across 100,000 contract records and live system telemetry.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '2.5rem', minHeight: '400px' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Platform Expenditure Distribution by Category (INR)
            </h2>
            {loadingAnalytics ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '240px', color: 'var(--text-secondary)' }}>
                Recalculating 100,000 corporate records index...
              </div>
            ) : (() => {
              const categoryTotals = csvAnalytics || { delivery: 25103635499, maintenance: 175061953265, creative: 0, legal: 50544520734 };
              const maxSpend = Math.max(...Object.values(categoryTotals), 100);
              return (
                <div style={{ position: 'relative', width: '100%', height: '260px', marginTop: '2.5rem', display: 'flex', flexDirection: 'column' }}>
                  <div style={{
                    position: 'absolute',
                    left: '40px',
                    right: 0,
                    bottom: '40px',
                    height: '200px',
                    display: 'flex',
                    justify: 'space-around',
                    alignItems: 'flex-end',
                    zIndex: 2
                  }}>
                    {Object.entries(categoryTotals).map(([cat, amount]) => {
                      const heightPercent = (amount / maxSpend) * 100;
                      const formattedAmount = amount >= 1e9 
                        ? `₹${(amount / 1e9).toFixed(2)}B` 
                        : (amount >= 1e6 ? `₹${(amount / 1e6).toFixed(1)}M` : `₹${amount.toLocaleString()}`);
                      
                      return (
                        <div key={cat} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, height: '100%', justifyContent: 'flex-end', position: 'relative' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--secondary)', marginBottom: '0.5rem' }}>
                            {formattedAmount}
                          </span>
                          <div style={{ 
                            width: '45px', 
                            height: `${heightPercent}%`, 
                            background: 'linear-gradient(180deg, var(--secondary) 0%, rgba(6,182,212,0.15) 100%)', 
                            border: '1px solid rgba(6,182,212,0.3)', 
                            borderRadius: '6px 6px 0 0'
                          }} />
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, position: 'absolute', bottom: '-30px', textTransform: 'uppercase', color: 'var(--text-primary)' }}>
                            {cat}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* UPDATE ADMIN DETAILS MODAL */}
      {showUpdateDetailsModal && createPortal(
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.82)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999999,
            padding: '1.5rem',
            overflowY: 'auto'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowUpdateDetailsModal(false);
          }}
        >
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '580px',
            borderRadius: 'var(--radius-lg)',
            border: '1.5px solid rgba(245, 158, 11, 0.4)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
            overflow: 'hidden',
            background: 'var(--bg-secondary)',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1.25rem 1.75rem',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.18), rgba(239, 68, 68, 0.1))',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(245, 158, 11, 0.25)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <UserCheck size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Update Admin Account Details
                  </h3>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    Modify your administrator username, email, phone number, and credentials
                  </span>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setShowUpdateDetailsModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleUpdateAdminDetails} style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto' }}>
              
              {/* Profile Avatar & Image Link */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <img 
                  src={adminForm.profile_picture || `https://api.dicebear.com/7.x/initials/svg?seed=${adminForm.username || 'Admin'}`} 
                  alt="Admin Avatar" 
                  style={{ width: '56px', height: '56px', borderRadius: '50%', border: '2px solid var(--primary)', objectFit: 'cover' }}
                  onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${adminForm.username || 'Admin'}`; }}
                />
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                    Profile Picture URL (Optional)
                  </label>
                  <input 
                    type="text"
                    placeholder="https://example.com/avatar.jpg"
                    value={adminForm.profile_picture}
                    onChange={e => setAdminForm(prev => ({ ...prev, profile_picture: e.target.value }))}
                    className="form-control"
                    style={{ fontSize: '0.82rem', height: '36px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                    Admin Username *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="text"
                      required
                      value={adminForm.username}
                      onChange={e => setAdminForm(prev => ({ ...prev, username: e.target.value }))}
                      className="form-control"
                      style={{ paddingLeft: '2.25rem', height: '38px', fontSize: '0.85rem' }}
                    />
                    <User size={15} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--text-muted)' }} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                    Email Address *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="email"
                      required
                      value={adminForm.email}
                      onChange={e => setAdminForm(prev => ({ ...prev, email: e.target.value }))}
                      className="form-control"
                      style={{ paddingLeft: '2.25rem', height: '38px', fontSize: '0.85rem' }}
                    />
                    <Mail size={15} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--text-muted)' }} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                    Mobile Number
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="text"
                      placeholder="e.g. +91 9876543210"
                      value={adminForm.phone_number}
                      onChange={e => setAdminForm(prev => ({ ...prev, phone_number: e.target.value }))}
                      className="form-control"
                      style={{ paddingLeft: '2.25rem', height: '38px', fontSize: '0.85rem' }}
                    />
                    <Phone size={15} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--text-muted)' }} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                    Specialty / Designation
                  </label>
                  <input 
                    type="text"
                    placeholder="System Administrator"
                    value={adminForm.specialty}
                    onChange={e => setAdminForm(prev => ({ ...prev, specialty: e.target.value }))}
                    className="form-control"
                    style={{ height: '38px', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Admin Bio / Operations Summary
                </label>
                <textarea 
                  rows="2"
                  placeholder="Superuser administrator managing platform operations and escrow integrity..."
                  value={adminForm.bio}
                  onChange={e => setAdminForm(prev => ({ ...prev, bio: e.target.value }))}
                  className="form-control"
                  style={{ fontSize: '0.85rem', padding: '0.6rem 0.75rem', resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  New Password (Optional)
                </label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="password"
                    placeholder="Leave blank to keep existing password"
                    value={adminForm.password}
                    onChange={e => setAdminForm(prev => ({ ...prev, password: e.target.value }))}
                    className="form-control"
                    style={{ paddingLeft: '2.25rem', height: '38px', fontSize: '0.85rem' }}
                  />
                  <Key size={15} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--text-muted)' }} />
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
                  Must be at least 6 characters long if changing.
                </span>
              </div>

              {/* Form Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <button 
                  type="button" 
                  onClick={() => setShowUpdateDetailsModal(false)}
                  className="btn btn-outline"
                  style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={updatingDetails}
                  className="btn btn-primary"
                  style={{ padding: '0.6rem 1.5rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--primary)', borderColor: 'var(--primary)', color: '#0b0f19', fontWeight: 800 }}
                >
                  {updatingDetails ? 'Saving...' : 'Save Changes'}
                </button>
              </div>

            </form>
          </div>
        </div>,
        document.body
      )}

      {/* EDIT TARGET USER DETAILS MODAL (FOR CLIENTS, CONTRACTORS, ADMINS) */}
      {editingTargetUser && createPortal(
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.82)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999999,
            padding: '1.5rem',
            overflowY: 'auto'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingTargetUser(null);
          }}
        >
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '580px',
            borderRadius: 'var(--radius-lg)',
            border: '1.5px solid rgba(245, 158, 11, 0.4)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
            overflow: 'hidden',
            background: 'var(--bg-secondary)',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1.25rem 1.75rem',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.18), rgba(239, 68, 68, 0.1))',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(245, 158, 11, 0.25)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <UserCheck size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Update User Details ({targetUserForm.username})
                  </h3>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    Modify account info, role, balance, specialty, and credentials for User ID #{editingTargetUser.id}
                  </span>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setEditingTargetUser(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveTargetUserDetails} style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto' }}>
              
              {/* Profile Avatar & Image Link */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <img 
                  src={targetUserForm.profile_picture || `https://api.dicebear.com/7.x/initials/svg?seed=${targetUserForm.username || 'User'}`} 
                  alt="User Avatar" 
                  style={{ width: '56px', height: '56px', borderRadius: '50%', border: '2px solid var(--primary)', objectFit: 'cover' }}
                  onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${targetUserForm.username || 'User'}`; }}
                />
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                    Profile Picture URL (Optional)
                  </label>
                  <input 
                    type="text"
                    placeholder="https://example.com/avatar.jpg"
                    value={targetUserForm.profile_picture}
                    onChange={e => setTargetUserForm(prev => ({ ...prev, profile_picture: e.target.value }))}
                    className="form-control"
                    style={{ fontSize: '0.82rem', height: '36px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                    Username *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="text"
                      required
                      value={targetUserForm.username}
                      onChange={e => setTargetUserForm(prev => ({ ...prev, username: e.target.value }))}
                      className="form-control"
                      style={{ paddingLeft: '2.25rem', height: '38px', fontSize: '0.85rem' }}
                    />
                    <User size={15} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--text-muted)' }} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                    Email Address *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="email"
                      required
                      value={targetUserForm.email}
                      onChange={e => setTargetUserForm(prev => ({ ...prev, email: e.target.value }))}
                      className="form-control"
                      style={{ paddingLeft: '2.25rem', height: '38px', fontSize: '0.85rem' }}
                    />
                    <Mail size={15} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--text-muted)' }} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                    Mobile Number
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="text"
                      placeholder="e.g. +91 9876543210"
                      value={targetUserForm.phone_number}
                      onChange={e => setTargetUserForm(prev => ({ ...prev, phone_number: e.target.value }))}
                      className="form-control"
                      style={{ paddingLeft: '2.25rem', height: '38px', fontSize: '0.85rem' }}
                    />
                    <Phone size={15} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--text-muted)' }} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                    System Role *
                  </label>
                  <select 
                    value={targetUserForm.role}
                    onChange={e => setTargetUserForm(prev => ({ ...prev, role: e.target.value }))}
                    className="form-control"
                    style={{ height: '38px', fontSize: '0.85rem' }}
                  >
                    <option value="client">Client</option>
                    <option value="contractor">Contractor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                    Specialty / Designation
                  </label>
                  <input 
                    type="text"
                    placeholder="e.g. Plumbing / Client"
                    value={targetUserForm.specialty}
                    onChange={e => setTargetUserForm(prev => ({ ...prev, specialty: e.target.value }))}
                    className="form-control"
                    style={{ height: '38px', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                    Wallet / Escrow Balance (₹)
                  </label>
                  <input 
                    type="number"
                    step="0.01"
                    value={targetUserForm.wallet_balance}
                    onChange={e => setTargetUserForm(prev => ({ ...prev, wallet_balance: e.target.value }))}
                    className="form-control"
                    style={{ height: '38px', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Bio / Profile Summary
                </label>
                <textarea 
                  rows="2"
                  placeholder="Short bio or operations summary..."
                  value={targetUserForm.bio}
                  onChange={e => setTargetUserForm(prev => ({ ...prev, bio: e.target.value }))}
                  className="form-control"
                  style={{ fontSize: '0.85rem', padding: '0.6rem 0.75rem', resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Reset User Password (Optional)
                </label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="password"
                    placeholder="Leave blank to keep existing password"
                    value={targetUserForm.password}
                    onChange={e => setTargetUserForm(prev => ({ ...prev, password: e.target.value }))}
                    className="form-control"
                    style={{ paddingLeft: '2.25rem', height: '38px', fontSize: '0.85rem' }}
                  />
                  <Key size={15} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--text-muted)' }} />
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
                  Must be at least 6 characters long if changing.
                </span>
              </div>

              {/* Form Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <button 
                  type="button" 
                  onClick={() => setEditingTargetUser(null)}
                  className="btn btn-outline"
                  style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={updatingTargetUser}
                  className="btn btn-primary"
                  style={{ padding: '0.6rem 1.5rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--primary)', borderColor: 'var(--primary)', color: '#0b0f19', fontWeight: 800 }}
                >
                  {updatingTargetUser ? 'Saving...' : 'Save User Details'}
                </button>
              </div>

            </form>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default AdminDashboard;

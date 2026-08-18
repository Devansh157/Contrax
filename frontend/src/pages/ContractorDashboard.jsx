import React, { useState, useEffect } from 'react';
import { Briefcase, IndianRupee, Bell, CheckCircle2, ChevronRight, Play, Activity, Zap, Sparkles, Clock } from 'lucide-react';
import { AnalyticsLogo } from '../components/Logo';
import API from '../config';

const formatUsername = (name) => (name ? name.charAt(0).toUpperCase() + name.slice(1) : 'User');

const ContractorDashboard = ({ token, user, onSelectContract, activeTab, setActiveTab, showToast, fetchCurrentUser }) => {

  const [contracts, setContracts] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');

  const handleCardClick = (status) => {
    setStatusFilter(status);
    if (setActiveTab) {
      setActiveTab('history');
    }
  };

  const [stats, setStats] = useState({
    primary_stat: 0,
    primary_label: 'Total Earnings (INR)',
    total_contracts: 0,
    completed_contracts: 0,
    active_contracts: 0
  });
  const [loading, setLoading] = useState(true);

  // Timed Uber-style Offer Modal state
  const [activeOffer, setActiveOffer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [ignoredOffers, setIgnoredOffers] = useState(new Set());

  // Contractor coordinate state
  const [lat, setLat] = useState(user?.latitude || 23.0225);
  const [lng, setLng] = useState(user?.longitude || 72.5714);

  // Sync coords state with user prop changes
  useEffect(() => {
    if (user) {
      setLat(user.latitude || 23.0225);
      setLng(user.longitude || 72.5714);
    }
  }, [user?.latitude, user?.longitude]);

  // Auto-set online status for contractor on dashboard mount if offline
  useEffect(() => {
    if (user && user.is_online === false && token) {
      fetch(`${API}/api/auth/user/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({
          action: 'update_status',
          is_online: true
        })
      }).then(() => {
        if (fetchCurrentUser) fetchCurrentUser();
      }).catch(err => console.error("Auto online error:", err));
    }
  }, [user?.id, token]);

  // Helper to check if contractor's specialty matches the requested contract work
  const isSpecialtyMatch = (userObj, contractObj) => {
    if (!userObj || !userObj.specialty) return true;
    const userSpec = userObj.specialty.trim().toLowerCase();
    if (!userSpec || ['general', 'general contractor', 'all', 'all services'].includes(userSpec)) {
      return true;
    }

    const titleLower = (contractObj.title || '').toLowerCase();
    const catLower = (contractObj.category || '').toLowerCase();
    const subLower = (contractObj.sub_service || '').toLowerCase();
    const blob = `${titleLower} ${catLower} ${subLower}`;

    if (blob.includes(userSpec)) return true;

    const specKeywords = {
      plumbing: ['plumb', 'pipe', 'faucet', 'leak', 'water', 'toilet', 'drain', 'geyser', 'tap'],
      painting: ['paint', 'wall', 'putty', 'coat', 'finish', 'color'],
      electrical: ['electr', 'wire', 'switch', 'mcb', 'light', 'fan', 'fuse', 'socket'],
      hvac: ['hvac', 'ac', 'air condition', 'cooler', 'compressor', 'split ac'],
      cleaning: ['clean', 'housekeep', 'wash', 'tank', 'sanitize', 'vacuum', 'scrub'],
      furniture: ['furnit', 'carpent', 'wood', 'cabinet', 'table', 'chair', 'sofa', 'door'],
      delivery: ['deliver', 'cargo', 'courier', 'transport', 'parcel', 'logistics', 'ship', 'landscap', 'lawn'],
      legal: ['legal', 'tax', 'security', 'guard', 'audit', 'contract', 'nda', 'agreement', 'compliance'],
      creative: ['design', 'video', 'web', 'app', 'dev', 'logo', 'ui', 'vfx']
    };

    for (const [domain, kws] of Object.entries(specKeywords)) {
      if (userSpec.includes(domain) || kws.some(kw => userSpec.includes(kw))) {
        if (kws.some(kw => blob.includes(kw))) {
          return true;
        }
      }
    }

    return false;
  };

  // Financial Goal Tracker States
  const [earningsGoal, setEarningsGoal] = useState(parseFloat(localStorage.getItem('contractgo_goal') || '15000'));
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(localStorage.getItem('contractgo_goal') || '15000');

  const handleUpdateGoal = (e) => {
    e.preventDefault();
    const val = parseFloat(tempGoal);
    if (!val || isNaN(val) || val <= 0) {
      showToast("Please enter a valid positive goal target.", "error");
      return;
    }
    setEarningsGoal(val);
    localStorage.setItem('contractgo_goal', val.toString());
    setIsEditingGoal(false);
    showToast(`Savings target updated to ₹${val.toLocaleString()}!`, "success");
  };



  // Idle movement simulation loop when Online
  useEffect(() => {
    if (!user?.is_online || !token) return;

    const simInterval = setInterval(async () => {
      // Simulate minor idle cruising drift (e.g. ±0.0004 degrees lat/lng)
      const offsetLat = (Math.random() - 0.5) * 0.0008;
      const offsetLng = (Math.random() - 0.5) * 0.0008;

      let nextLat, nextLng;
      setLat(prevLat => {
        nextLat = prevLat + offsetLat;
        return nextLat;
      });
      setLng(prevLng => {
        nextLng = prevLng + offsetLng;
        return nextLng;
      });

      // Sync coordinate updates with backend
      try {
        await fetch(`${API}/api/auth/user/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`
          },
          body: JSON.stringify({
            action: 'update_status',
            is_online: true,
            latitude: nextLat,
            longitude: nextLng
          })
        });
      } catch (err) {
        console.error("Failed to update idle coords:", err);
      }
    }, 8000); // every 8 seconds

    return () => clearInterval(simInterval);
  }, [user?.is_online, token]);

  const fetchDashboardData = async () => {
    try {
      // Stats
      const statsRes = await fetch(`${API}/api/contracts/stats/`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Contracts
      const contractsRes = await fetch(`${API}/api/contracts/`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      if (contractsRes.ok) {
        const contractsData = await contractsRes.json();
        const safeData = Array.isArray(contractsData) ? contractsData : [];
        setContracts(safeData);

        // Find if there is an open "searching" contract request targeted to us or open to dispatch that matches our specialty and we haven't accepted or ignored yet
        const openOffer = safeData.find(c =>
          c.status === 'searching' &&
          (c.current_matching_contractor === user?.id || !c.current_matching_contractor) &&
          (!c.accepted_contractors || !c.accepted_contractors.includes(user?.id)) &&
          !ignoredOffers.has(c.id) &&
          isSpecialtyMatch(user, c)
        );
        if (openOffer) {
          if (!activeOffer || activeOffer.id !== openOffer.id) {
            setActiveOffer(openOffer);
            setTimeLeft(60); // Reset 60s accept timer
          }
        } else {
          setActiveOffer(null);
        }
      }
    } catch (error) {
      console.error("Error fetching contractor dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Poll for new available contract offers every 4 seconds (simulating dispatch center)
    const interval = setInterval(fetchDashboardData, 4000);
    return () => clearInterval(interval);
  }, [token, ignoredOffers]);

  // CSV Analytics States
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
    if (activeTab === 'analytics') {
      fetchCsvAnalytics();
    }
  }, [activeTab, token]);

  // Timed accept timer handler (decrement every 1 second when active offer exists)
  useEffect(() => {
    if (!activeOffer) return;

    if (timeLeft <= 0) {
      // Ignore offer automatically when timer expires
      handleIgnore(activeOffer.id);
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, activeOffer]);

  const handleAccept = async (contractId) => {
    try {
      const res = await fetch(`${API}/api/contracts/${contractId}/accept/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      if (res.ok) {
        setActiveOffer(null);
        showToast("Contract accepted! Directing to signature phase.", "success");
        onSelectContract(contractId);
      } else {
        showToast("This contract is no longer available.", "danger");
        handleIgnore(contractId);
      }
    } catch (err) {
      console.error("Error accepting request:", err);
      showToast("Error accepting contract request.", "danger");
    }
  };

  const handleIgnore = async (contractId) => {
    setIgnoredOffers(prev => {
      const copy = new Set(prev);
      copy.add(contractId);
      return copy;
    });
    setActiveOffer(null);

    // Call backend decline to route to next contractor immediately
    try {
      await fetch(`${API}/api/contracts/${contractId}/decline/`, {
        method: 'POST',
        headers: { 'Authorization': `Token ${token}` }
      });
    } catch (err) {
      console.error("Failed to decline contract request:", err);
    }
  };

  const [updatingOnline, setUpdatingOnline] = useState(false);

  const toggleOnlineStatus = async () => {
    setUpdatingOnline(true);
    const newStatus = !user?.is_online;
    try {
      const res = await fetch(`${API}/api/auth/user/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({
          action: 'update_status',
          is_online: newStatus
        })
      });
      if (res.ok) {
        showToast(newStatus ? "You are now ONLINE and active in dispatch!" : "You are now OFFLINE.", newStatus ? "success" : "info");
        fetchCurrentUser();
      } else {
        showToast("Failed to update online status.", "danger");
      }
    } catch (err) {
      console.error(err);
      showToast("Error updating online status.", "danger");
    } finally {
      setUpdatingOnline(false);
    }
  };

  // Filter lists
  const safeContracts = Array.isArray(contracts) ? contracts : [];
  const myContracts = safeContracts.filter(c => c.contractor === user?.id);
  const availableContracts = safeContracts.filter(c =>
    c.status === 'searching' &&
    (!c.accepted_contractors || !c.accepted_contractors.includes(user?.id)) &&
    isSpecialtyMatch(user, c)
  );

  if (loading && contracts.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
        Loading Contractor Dashboard...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* Contractor Status & Dispatch Control Banner */}
      <div className="glass-panel animate-fade-in-up" style={{
        padding: '1.25rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        background: user?.is_online
          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(6, 182, 212, 0.06))'
          : 'linear-gradient(135deg, rgba(239, 68, 68, 0.12), rgba(245, 158, 11, 0.06))',
        border: user?.is_online
          ? '1px solid rgba(16, 185, 129, 0.3)'
          : '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: 'var(--radius-lg)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            backgroundColor: user?.is_online ? '#10b981' : '#ef4444',
            boxShadow: user?.is_online ? '0 0 12px #10b981' : '0 0 8px #ef4444'
          }}></div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              {user?.is_online ? 'ONLINE - Active Dispatch Engine' : 'OFFLINE - Not Receiving Live Offers'}
              <span style={{ fontSize: '0.75rem', padding: '2px 10px', borderRadius: '12px', backgroundColor: 'rgba(250,204,21,0.15)', color: 'var(--primary)', border: '1px solid rgba(250,204,21,0.3)', fontWeight: 700 }}>
                {user?.specialty || 'General Contractor'}
              </span>
            </h3>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {user?.is_online
                ? 'You are active in the matching queue. Incoming contract requests will auto-dispatch to your dashboard.'
                : 'Turn ON your online status so clients and the dispatch engine can assign incoming contracts to you.'}
            </p>
          </div>
        </div>

        <button
          onClick={toggleOnlineStatus}
          disabled={updatingOnline}
          className="btn"
          style={{
            padding: '0.6rem 1.5rem',
            fontWeight: 700,
            fontSize: '0.9rem',
            borderRadius: '30px',
            backgroundColor: user?.is_online ? 'rgba(239,68,68,0.15)' : '#10b981',
            borderColor: user?.is_online ? '#ef4444' : '#10b981',
            color: user?.is_online ? '#ef4444' : '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            boxShadow: user?.is_online ? 'none' : '0 4px 14px rgba(16, 185, 129, 0.4)'
          }}
        >
          <Zap size={16} />
          {updatingOnline ? 'Updating...' : (user?.is_online ? 'Go Offline' : 'GO ONLINE NOW')}
        </button>
      </div>

      {/* Contractor Pro Wallet & Payout Portal */}
      <div className="glass-panel animate-fade-in-up delay-1" style={{ padding: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', flexWrap: 'wrap' }}>

        {/* Left Column: Escrow Wallet Card, Milestone Goal Tracker & Recent Credits */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', justifyContent: 'center', borderRight: '1px solid var(--border-color)', paddingRight: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Contractor Escrow Wallet
              </span>
              <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--success)', margin: '0.15rem 0' }}>
                ₹{user?.wallet_balance ? Number(user.wallet_balance).toLocaleString() : '0'}
              </h2>
            </div>

            {/* Savings target goal tracker */}
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                🎯 Target: <strong>₹{earningsGoal.toLocaleString()}</strong>
                <button
                  onClick={() => {
                    setIsEditingGoal(!isEditingGoal);
                    setTempGoal(earningsGoal.toString());
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    padding: '2px 4px',
                    borderRadius: '4px',
                    textDecoration: 'underline'
                  }}
                >
                  Edit
                </button>
              </span>

              {isEditingGoal ? (
                <form onSubmit={handleUpdateGoal} style={{ display: 'flex', gap: '0.25rem', marginTop: '0.25rem', alignItems: 'center' }}>
                  <input
                    type="number"
                    value={tempGoal}
                    onChange={e => setTempGoal(e.target.value)}
                    className="form-control"
                    style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem', width: '80px', height: 'auto' }}
                    required
                    min="100"
                  />
                  <button type="submit" className="btn btn-primary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', color: 'black' }}>Save</button>
                  <button type="button" className="btn btn-outline" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }} onClick={() => setIsEditingGoal(false)}>X</button>
                </form>
              ) : (
                <span style={{ fontSize: '0.65rem', color: 'var(--success)', fontWeight: 'bold' }}>
                  {Math.min(Math.round((user.wallet_balance / earningsGoal) * 100), 100)}% Milestone Reached
                </span>
              )}
            </div>
          </div>

          {/* Goal progress indicator bar */}
          <div style={{ width: '100%' }}>
            <div style={{ height: '8px', width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${Math.min((user.wallet_balance / earningsGoal) * 100, 100)}%`,
                backgroundColor: 'var(--success)',
                borderRadius: '4px',
                boxShadow: '0 0 8px var(--success)',
                transition: 'width 0.8s ease-out'
              }}></div>
            </div>
          </div>

          {/* Recent Earnings Credits Ledger */}
          <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>
              📜 Recent Credits Ledger
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {(() => {
                const completedJobs = contracts.filter(c => c.contractor === user.id && ['approved', 'completed'].includes(c.status));
                if (completedJobs.length > 0) {
                  return completedJobs.slice(0, 2).map((job, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '0.35rem 0.5rem', backgroundColor: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.15)', borderRadius: 'var(--radius-sm)' }}>
                      <span style={{ color: 'var(--text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '160px' }}>
                        {job.title}
                      </span>
                      <strong style={{ color: 'var(--success)' }}>+ ₹{job.budget.toLocaleString()}</strong>
                    </div>
                  ));
                } else {
                  return (
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      💡 Complete active contracts to add earnings credit transactions.
                    </span>
                  );
                }
              })()}
            </div>
          </div>

        </div>

        {/* Right Column: Performance & Completion Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', justifyContent: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Quality & Performance Scorecard
            </h3>
            <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Maintain high ratings to gain priority ranking in matching suggestions.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ padding: '0.85rem', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Client Rating</span>
              <strong style={{ fontSize: '1.15rem', color: 'var(--primary)' }}>
                {user.rating && user.rating > 0 ? `★ ${user.rating.toFixed(1)} / 5.0` : '★ 0.0 (New Contractor)'}
              </strong>
            </div>

            <div style={{ padding: '0.85rem', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Job Specialty</span>
              <strong style={{ fontSize: '1.15rem', color: 'var(--text-primary)', textTransform: 'capitalize' }}>{user.specialty || 'General'}</strong>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              <span>Job Completion Rate</span>
              <strong>
                {stats.total_contracts > 0 ? Math.round((stats.completed_contracts / stats.total_contracts) * 100) : 0}%
              </strong>
            </div>
            <div className="intel-progress-container">
              <div className="intel-progress-fill" style={{
                width: `${stats.total_contracts > 0 ? (stats.completed_contracts / stats.total_contracts) * 100 : 0}%`
              }}></div>
            </div>
          </div>
        </div>

      </div>

      {/* Stats row */}
      <div className="stats-row intel-stagger-list">
        <div className="glass-panel stat-card intel-stat-card clickable glow-gold" onClick={() => handleCardClick('completed')} style={{ display: 'flex', flexDirection: 'column', justify: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
            <div>
              <h3>{stats.primary_label}</h3>
              <div className="value primary-color intel-value-counter">₹{stats.primary_stat.toLocaleString()}</div>
            </div>
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IndianRupee size={24} />
            </div>
          </div>
          <div className="intel-mini-chart" title="Earnings Velocity Waveform">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((bar, i) => (
              <div key={i} className="intel-bar" style={{ background: 'var(--primary)', animationDelay: `${0.12 * i}s` }}></div>
            ))}
          </div>
        </div>

        <div className="glass-panel stat-card intel-stat-card clickable glow-green" onClick={() => handleCardClick('completed')} style={{ display: 'flex', flexDirection: 'column', justify: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
            <div>
              <h3>Jobs Completed</h3>
              <div className="value intel-value-counter" style={{ color: 'var(--success)' }}>{stats.completed_contracts}</div>
            </div>
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={24} />
            </div>
          </div>
          <div className="intel-mini-chart" title="Completion Telemetry Pulse">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((bar, i) => (
              <div key={i} className="intel-bar" style={{ background: 'var(--success)', animationDelay: `${0.15 * i}s` }}></div>
            ))}
          </div>
        </div>

        <div className="glass-panel stat-card intel-stat-card clickable glow-blue" onClick={() => handleCardClick('all')} style={{ display: 'flex', flexDirection: 'column', justify: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
            <div>
              <h3>Total Assignments</h3>
              <div className="value intel-value-counter">{stats.total_contracts}</div>
            </div>
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: 'rgba(37, 99, 235, 0.15)', color: 'var(--info)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Briefcase size={24} />
            </div>
          </div>
          <div className="intel-mini-chart" title="Assignments Distribution Chart">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((bar, i) => (
              <div key={i} className="intel-bar" style={{ background: 'var(--info)', animationDelay: `${0.1 * (9 - i)}s` }}></div>
            ))}
          </div>
        </div>

        <div className="glass-panel stat-card intel-stat-card clickable glow-cyan" onClick={() => handleCardClick('active')} style={{ display: 'flex', flexDirection: 'column', justify: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
            <div>
              <h3>Active Contracts</h3>
              <div className="value intel-value-counter" style={{ color: 'var(--secondary)' }}>{stats.active_contracts}</div>
            </div>
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: 'rgba(8, 145, 178, 0.15)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={24} />
            </div>
          </div>
          <div className="intel-mini-chart" title="Active Delivery Telemetry">
            {[1, 2, 3, 4, 5, 6, 7].map((bar, i) => (
              <div key={i} className="intel-bar" style={{ background: 'var(--secondary)', animationDelay: `${0.18 * i}s` }}></div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Panel Content - Conditionally Rendered by Active Tab */}
      {activeTab === 'history' ? (
        <div className="dashboard-grid full-width">
          {/* Full Width Assigned Contracts */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h2 style={{ margin: 0 }}>Your Active Jobs & Deliveries</h2>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Filter status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="form-control"
                  style={{ width: 'auto', padding: '0.25rem 1.75rem 0.25rem 0.5rem', fontSize: '0.85rem', height: 'auto' }}
                >
                  <option value="all">All ({myContracts.length})</option>
                  <option value="active">Active ({myContracts.filter(c => c.status === 'active').length})</option>
                  <option value="offered">Pending Signatures ({myContracts.filter(c => c.status === 'offered').length})</option>
                  <option value="completed">Completed ({myContracts.filter(c => ['completed', 'approved'].includes(c.status)).length})</option>
                </select>
              </div>
            </div>

            {myContracts.filter(c => ['offered', 'active', 'completed', 'approved'].includes(c.status)).length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                You do not have any active contracts. Select 'Find Jobs' in the navigation bar to find open contract requests.
              </p>
            ) : (() => {
              const filteredList = myContracts.filter(c => {
                if (statusFilter === 'all') return ['offered', 'active', 'completed','approved'].includes(c.status);
                if (statusFilter === 'completed') return ['completed', 'approved'].includes(c.status);
                return c.status === statusFilter;
              });

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {filteredList.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                      No contracts match the selected filter.
                    </p>
                  ) : (
                    filteredList.map(contract => (
                      <div
                        key={contract.id}
                        className="glass-panel"
                        style={{
                          padding: '1.25rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          borderLeft: contract.status === 'active' ? '4px solid var(--primary)' : '1px solid var(--border-color)'
                        }}
                        onClick={() => onSelectContract(contract.id)}
                      >
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            backgroundColor: 'rgba(250,204,21,0.06)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--primary)'
                          }}>
                            <Briefcase size={20} />
                          </div>
                          <div>
                            <h4 style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}>
                              {contract.title}
                            </h4>
                            <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center', marginTop: '0.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                              <span>Payout: ₹{contract.budget}</span>
                              <span>•</span>
                              <span>Client: {formatUsername(contract.client_detail?.username)}</span>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <span className={`status-badge ${contract.status}`}>
                            {contract.status === 'offered' ? 'Pending Signatures' : contract.status}
                          </span>
                          <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      ) : activeTab === 'analytics' ? (
        <div className="dashboard-grid">
          {/* ContraX Analytics Header Banner */}
          <div className="glass-panel" style={{ gridColumn: '1 / -1', padding: '1.75rem 2.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.09), rgba(0, 114, 255, 0.04))', border: '1px solid rgba(0, 229, 255, 0.22)', borderRadius: 'var(--radius-lg)' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.75rem', borderRadius: '20px', background: 'rgba(0, 229, 255, 0.14)', color: '#00e5ff', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.65rem' }}>
                <Zap size={13} /> Performance Intelligence
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.025em' }}>
                ContraX Earning Analytics
              </h2>
              <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '580px' }}>
                Contractor revenue distribution, category payout breakdown, and real-time performance tracking.
              </p>
            </div>
            <div style={{ padding: '0.25rem 0.5rem' }}>
              <AnalyticsLogo size={75} />
            </div>
          </div>

          {/* Left Side: Rating & Earning breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="glass-panel" style={{ padding: '2.5rem', minHeight: '400px' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
                  Earning Analytics by Category (INR)
                </h2>
                <p style={{ margin: '0.25rem 0 1.5rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Total historical revenue aggregates computed across 100,000 corporate records.
                </p>
              </div>

              {loadingAnalytics ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '240px', color: 'var(--text-secondary)' }}>
                  Recalculating million-record database index...
                </div>
              ) : (() => {
                const categoryTotals = csvAnalytics || { delivery: 25103635499, maintenance: 175061953265, creative: 0, legal: 50544520734 };
                const maxSpend = Math.max(...Object.values(categoryTotals), 100);
                return (
                  <div style={{ position: 'relative', width: '100%', height: '260px', marginTop: '2.5rem', display: 'flex', flexDirection: 'column' }}>

                    {/* Horizontal scale gridlines */}
                    {[0, 25, 50, 75, 100].map(percent => {
                      const gridVal = (maxSpend * percent) / 100;
                      const label = gridVal >= 1e9
                        ? `₹${(gridVal / 1e9).toFixed(1)}B`
                        : (gridVal >= 1e6 ? `₹${(gridVal / 1e6).toFixed(0)}M` : `₹${gridVal.toLocaleString()}`);

                      return (
                        <div key={percent} style={{
                          position: 'absolute',
                          left: 0,
                          right: 0,
                          bottom: `${(percent / 100) * 200 + 40}px`,
                          borderBottom: '1px dashed rgba(255, 255, 255, 0.05)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '0.7rem',
                          color: 'var(--text-muted)',
                          pointerEvents: 'none',
                          paddingBottom: '2px'
                        }}>
                          <span>{label}</span>
                          <span style={{ width: '40px' }}></span>
                        </div>
                      );
                    })}

                    {/* Bars Container */}
                    <div style={{
                      position: 'absolute',
                      left: '40px',
                      right: 0,
                      bottom: '40px',
                      height: '200px',
                      display: 'flex',
                      justifyContent: 'space-around',
                      alignItems: 'flex-end',
                      zIndex: 2
                    }}>
                      {Object.entries(categoryTotals).map(([cat, amount]) => {
                        const heightPercent = (amount / maxSpend) * 100;
                        const formattedAmount = amount >= 1e9
                          ? `₹${(amount / 1e9).toFixed(2)}B`
                          : (amount >= 1e6 ? `₹${(amount / 1e6).toFixed(1)}M` : `₹${amount.toLocaleString()}`);

                        return (
                          <div key={cat} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            flex: 1,
                            height: '100%',
                            justifyContent: 'flex-end',
                            position: 'relative'
                          }}>
                            {/* Value overlay badge */}
                            <span style={{
                              fontSize: '0.8rem',
                              fontWeight: 800,
                              color: 'var(--primary)',
                              marginBottom: '0.5rem',
                              textShadow: '0 0 10px rgba(250,204,21,0.2)'
                            }}>
                              {formattedAmount}
                            </span>

                            {/* Premium Bar with Gradient and Box Shadow Glow */}
                            <div style={{
                              width: '45px',
                              height: `${heightPercent}%`,
                              background: 'linear-gradient(180deg, var(--primary) 0%, rgba(250,204,21,0.15) 100%)',
                              border: '1px solid rgba(250,204,21,0.3)',
                              borderRadius: '6px 6px 0 0',
                              boxShadow: amount > 0 ? '0 0 15px rgba(250,204,21,0.15)' : 'none',
                              transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                              cursor: 'pointer',
                              position: 'relative'
                            }}
                              className="premium-chart-bar"
                              title={`${cat.toUpperCase()}: ${formattedAmount}`}>
                              {/* Inner highlight */}
                              <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '4px',
                                backgroundColor: 'rgba(255,255,255,0.4)',
                                borderRadius: '6px 6px 0 0'
                              }}></div>
                            </div>

                            {/* Category label */}
                            <span style={{
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              position: 'absolute',
                              bottom: '-30px',
                              textTransform: 'uppercase',
                              color: 'var(--text-primary)',
                              letterSpacing: '0.05em'
                            }}>
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

            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h2 style={{ marginBottom: '1.5rem' }}>Ratings & Performance Summary</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>Rating Distribution</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                      <span style={{ width: '50px' }}>5 Star</span>
                      <div style={{ flex: 1, height: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: '85%', height: '100%', background: 'var(--primary)' }}></div>
                      </div>
                      <span style={{ width: '30px', textAlign: 'right' }}>85%</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                      <span style={{ width: '50px' }}>4 Star</span>
                      <div style={{ flex: 1, height: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: '10%', height: '100%', background: 'var(--primary)' }}></div>
                      </div>
                      <span style={{ width: '30px', textAlign: 'right' }}>10%</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                      <span style={{ width: '50px' }}>3 Star</span>
                      <div style={{ flex: 1, height: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: '5%', height: '100%', background: 'var(--primary)' }}></div>
                      </div>
                      <span style={{ width: '30px', textAlign: 'right' }}>5%</span>
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', fontSize: '0.9rem' }}>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    Your average contractor rating is <strong style={{ color: 'var(--text-primary)' }}>{user.rating && user.rating > 0 ? `${user.rating}★` : '0.0★ (New Contractor)'}</strong>. Keep delivering excellent service. Better ratings directly increase your contract matching weight in the dispatch queue.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Contractor Guidelines */}
          <div>
            <div className="glass-panel" style={{ padding: '2rem', position: 'sticky', top: '100px' }}>
              <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Contractor Scorecard</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '1rem' }}>
                Ensure high service quality. Clients review your performance. Your average rating affects matching priority in the platform. Remember to capture client digital signatures before starting the job mapping.
              </p>
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Total Payout:</span>
                  <strong style={{ color: 'var(--text-primary)' }}>₹{stats.primary_stat.toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Jobs Completed:</span>
                  <strong style={{ color: 'var(--success)' }}>{stats.completed_contracts}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Active Assignments:</span>
                  <strong style={{ color: 'var(--secondary)' }}>{stats.active_contracts}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="dashboard-grid">

          {/* Left Side: Available Jobs Feed */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Open Contract Job Board</h2>

            {availableContracts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-secondary)' }}>
                <p style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  No open contract requests available at the moment.
                </p>
                <p style={{ fontSize: '0.88rem', maxWidth: '450px', margin: '0 auto 1.25rem auto' }}>
                  {!user?.is_online
                    ? 'You are currently OFFLINE. Switch your status to GO ONLINE NOW to receive job dispatches!'
                    : 'The automated dispatch engine is actively checking for new client job requests...'}
                </p>
                {!user?.is_online && (
                  <button onClick={toggleOnlineStatus} className="btn btn-primary" style={{ padding: '0.55rem 1.35rem', borderRadius: '24px' }}>
                    <Zap size={14} /> GO ONLINE NOW
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {availableContracts.map(contract => (
                  <div
                    key={contract.id}
                    className="glass-panel"
                    style={{
                      padding: '1.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.2rem' }}>
                          <span className="role-badge client" style={{ fontSize: '0.65rem' }}>{contract.category}</span>
                          <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem', backgroundColor: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(16,185,129,0.2)' }}>
                            <Clock size={12} /> Duration: {contract.duration || '1 Day'}
                          </span>
                        </div>
                        <h3 style={{ marginTop: '0.5rem', fontWeight: 700 }}>{contract.title}</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                          {contract.description}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-hover)' }}>₹{contract.budget}</div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Fixed Payout</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Posted by: {formatUsername(contract.client_detail?.username)}</span>
                      {contract.accepted_contractors?.includes(user?.id) ? (
                        <span style={{ fontSize: '0.78rem', padding: '4px 12px', borderRadius: '16px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: 800, border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <CheckCircle2 size={14} /> Accepted - Awaiting Client Selection
                        </span>
                      ) : (
                        <button className="btn btn-primary" style={{ padding: '0.45rem 1.25rem', fontSize: '0.85rem' }} onClick={() => handleAccept(contract.id)}>
                          <Play size={12} fill="#0f172a" /> Accept Request
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Side: Contractor Guidelines */}
          <div>
            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '100px' }}>
              <div>
                <h3 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>Contractor Guidelines</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  Ensure high service quality. Clients review your performance. Your average rating affects matching priority in the platform.
                </p>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>Rating Distribution</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                    <span style={{ width: '40px' }}>5 Star</span>
                    <div style={{ flex: 1, height: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: '85%', height: '100%', background: 'var(--primary)' }}></div>
                    </div>
                    <span style={{ width: '25px', textAlign: 'right' }}>85%</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                    <span style={{ width: '40px' }}>4 Star</span>
                    <div style={{ flex: 1, height: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: '10%', height: '100%', background: 'var(--primary)' }}></div>
                    </div>
                    <span style={{ width: '25px', textAlign: 'right' }}>10%</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                    <span style={{ width: '40px' }}>3 Star</span>
                    <div style={{ flex: 1, height: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: '5%', height: '100%', background: 'var(--primary)' }}></div>
                    </div>
                    <span style={{ width: '25px', textAlign: 'right' }}>5%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TIMED INCOMING REQUEST SCREEN (Uber style flashing modal) */}
      {activeOffer && (
        <div className="glass-panel accept-card animate-pulse-glow" style={{ border: '2px solid var(--primary)', backgroundColor: 'var(--bg-secondary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>

            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem' }}>
              <Bell size={16} className="animate-bounce" />
              INCOMING CONTRACT OFFER
            </span>
            <span style={{
              backgroundColor: 'rgba(250,204,21,0.15)',
              color: 'var(--primary)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.9rem'
            }}>
              {timeLeft}
            </span>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span className="role-badge client" style={{ fontSize: '0.6rem' }}>{activeOffer.category}</span>
              <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem', backgroundColor: 'rgba(16,185,129,0.12)', padding: '2px 8px', borderRadius: '6px' }}>
                <Clock size={12} /> Expected Duration: {activeOffer.duration || '1 Day'}
              </span>
            </div>
            <h3 style={{ marginTop: '0.35rem', fontWeight: 800 }}>{activeOffer.title}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              {activeOffer.description.length > 80 ? `${activeOffer.description.substring(0, 80)}...` : activeOffer.description}
            </p>
            <div style={{ marginTop: '0.75rem', fontSize: '1.3rem', fontWeight: 850, color: 'var(--primary)' }}>
              ₹{activeOffer.budget}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              Client: {formatUsername(activeOffer.client_detail?.username)} • Acceptance Window: <strong>{timeLeft} seconds remaining</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => handleIgnore(activeOffer.id)}>
              Decline
            </button>
            <button className="btn btn-primary" style={{ flex: 2 }} onClick={() => handleAccept(activeOffer.id)}>
              Accept Contract
            </button>
          </div>

          {/* Animated countdown progress bar */}
          <div className="timer-bar" style={{ width: `${(timeLeft / 60) * 100}%` }}></div>
        </div>
      )}

    </div>
  );
};

export default ContractorDashboard;

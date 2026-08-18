import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ShieldCheck, ClipboardList, Star, Award, X, CheckCircle2, Clock, Sparkles, Phone, MessageSquare, Copy, Check, AlertTriangle } from 'lucide-react';

import SignaturePad from '../components/SignaturePad';
import API from '../config';

const formatUsername = (name) => (name ? name.charAt(0).toUpperCase() + name.slice(1) : 'User');

const ContractDetails = ({ contractId, user, token, onBack, showToast, fetchCurrentUser }) => {
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [submittingWork, setSubmittingWork] = useState(false);
  const [approving, setApproving] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);

  // Review state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const fetchContractDetails = async () => {
    try {
      const response = await fetch(`${API}/api/contracts/${contractId}/`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setContract(data);
      } else {
        showToast("Failed to load contract details.", "danger");
        onBack();
      }
    } catch (error) {
      console.error("Error fetching contract details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContractDetails();

    // Poll updates every 4 seconds when contract is in a live workflow state
    let interval;
    if (contract && ['searching', 'offered', 'active', 'completed'].includes(contract.status)) {
      interval = setInterval(fetchContractDetails, 4000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [contractId, contract?.status]);

  const handleSign = async (signatureData) => {
    setSigning(true);
    try {
      const response = await fetch(`${API}/api/contracts/${contractId}/sign/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({ signature: signatureData })
      });

      if (response.ok) {
        showToast("Digital signature recorded successfully!", "success");
        fetchCurrentUser();
        fetchContractDetails();
      } else {
        showToast("Signing failed.", "danger");
      }
    } catch (error) {
      console.error("Error signing contract:", error);
      showToast("Error signing contract.", "danger");
    } finally {
      setSigning(false);
    }
  };

  const handleCompleteWork = async () => {
    setSubmittingWork(true);
    try {
      const response = await fetch(`${API}/api/contracts/${contractId}/submit_work/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        }
      });

      if (response.ok) {
        showToast("Work marked as completed. Awaiting client release of escrow funds.", "success");
        fetchContractDetails();
      } else {
        showToast("Submission failed.", "danger");
      }
    } catch (error) {
      console.error("Error submitting work:", error);
      showToast("Error submitting work.", "danger");
    } finally {
      setSubmittingWork(false);
    }
  };

  const handleApproveAndPay = async () => {
    setApproving(true);
    try {
      const response = await fetch(`${API}/api/contracts/${contractId}/approve_and_pay/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        }
      });

      if (response.ok) {
        showToast("Escrow funds released successfully! Project closed.", "success");
        fetchCurrentUser();
        fetchContractDetails();
      } else {
        showToast("Payment release failed.", "danger");
      }
    } catch (error) {
      console.error("Error approving contract:", error);
      showToast("Error releasing payment.", "danger");
    } finally {
      setApproving(false);
    }
  };

  const handleCancelContract = async () => {
    setCancelling(true);
    try {
      const response = await fetch(`${API}/api/contracts/${contractId}/cancel/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        }
      });

      if (response.ok) {
        showToast("Contract cancelled. Escrow refund deposited.", "success");
        fetchCurrentUser();
        onBack();
      } else {
        showToast("Failed to cancel contract.", "danger");
      }
    } catch (error) {
      console.error("Error cancelling contract:", error);
      showToast("Error cancelling contract.", "danger");
    } finally {
      setCancelling(false);
      setCancelModalOpen(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewSubmitting(true);
    try {
      const response = await fetch(`${API}/api/contracts/${contractId}/submit_review/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({ rating, comment })
      });

      if (response.ok) {
        setReviewSubmitted(true);
        showToast("Rating submitted successfully! Returning to dashboard...", "success");
        if (fetchCurrentUser) fetchCurrentUser();
        fetchContractDetails();
        setTimeout(() => {
          if (onBack) onBack();
        }, 1000);
      } else {
        showToast("Failed to submit rating.", "danger");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      showToast("Error submitting review.", "danger");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const [finalizing, setFinalizing] = useState(false);

  const handleFinalizeContractor = async (contractorId, contractorName) => {
    setFinalizing(true);
    try {
      const response = await fetch(`${API}/api/contracts/${contractId}/finalize_contractor/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({ contractor_id: contractorId })
      });
      if (response.ok) {
        showToast(`Contract finalized with ${formatUsername(contractorName)}!`, "success");
        fetchCurrentUser();
        fetchContractDetails();
      } else {
        const errorData = await response.json();
        showToast(errorData.error || "Failed to finalize contractor.", "danger");
      }
    } catch (err) {
      console.error("Error finalizing contractor:", err);
      showToast("Error finalizing contractor.", "danger");
    } finally {
      setFinalizing(false);
    }
  };

  if (loading || !contract) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
        Loading Contract details...
      </div>
    );
  }

  // Determine if signature is required for current user
  const isClient = user?.role === 'client';
  const isContractor = user?.role === 'contractor';
  const needsClientSignature = isClient && contract && !contract.client_signature;
  const needsContractorSignature = isContractor && contract && !contract.contractor_signature;
  const showSignPad = contract && (needsClientSignature || needsContractorSignature) && contract.status === 'offered';

  return (
    <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Header Panel */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-outline" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }} onClick={onBack}>
            <ChevronLeft size={16} /> Back to Dashboard
          </button>

          {isClient && ['searching', 'offered'].includes(contract.status) && (
            <button
              className="btn btn-danger"
              style={{ padding: '0.45rem 1.25rem', fontSize: '0.85rem', backgroundColor: 'var(--danger)', color: 'white' }}
              onClick={() => setCancelModalOpen(true)}
              disabled={cancelling}
            >
              {cancelling ? 'Cancelling...' : 'Cancel Request'}
            </button>
          )}

          {contract.status === 'approved' && (
            <button
              className="btn btn-secondary"
              style={{ padding: '0.45rem 1.25rem', fontSize: '0.85rem', backgroundColor: 'var(--success)', color: 'white' }}
              onClick={() => setInvoiceOpen(true)}
            >
              View Invoice Receipt
            </button>
          )}
        </div>

        <span className={`status-badge ${contract.status}`} style={{ fontSize: '0.9rem', padding: '0.4rem 1rem' }}>
          {contract.status === 'offered' ? 'Awaiting Signatures' : contract.status}
        </span>
      </div>

      <div style={{ marginTop: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span className="role-badge client" style={{ fontSize: '0.7rem' }}>{contract.category}</span>
          <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.35rem', backgroundColor: 'rgba(16,185,129,0.12)', padding: '2px 8px', borderRadius: '6px' }}>
            <Clock size={14} /> Expected Duration: {contract.duration || '1 Day'}
          </span>
        </div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.35rem' }}>{contract.title}</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Contract ID: #{contract.id} • Budget: ₹{contract.budget} {contract.start_date && contract.end_date ? `• Timeline: ${contract.start_date} to ${contract.end_date}` : `• Duration: ${contract.duration || '1 Day'}`}
        </p>
      </div>

      {/* Dataset Machine Learning Model Prediction Card on Booked Contract */}
      <div style={{
        padding: '1rem 1.25rem',
        borderRadius: '14px',
        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12), rgba(0, 114, 255, 0.08))',
        border: '1.5px solid rgba(6, 182, 212, 0.35)',
        boxShadow: '0 8px 24px rgba(6, 182, 212, 0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Model Predicted Amount:
          </div>
          <strong style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--text-primary)' }}>
            ₹{(contract.predicted_amount || contract.budget)?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </strong>
        </div>
      </div>

      {/* Dynamic Service Attributes & Requirements Card */}
      {(contract.sub_service || (contract.dynamic_attributes && Object.keys(contract.dynamic_attributes).length > 0)) && (
        <div className="glass-panel" style={{
          padding: '1.25rem 1.5rem',
          borderRadius: '14px',
          border: '1.5px dashed rgba(99, 102, 241, 0.4)',
          backgroundColor: 'rgba(99, 102, 241, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} style={{ color: 'var(--secondary)' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--secondary)' }}>
              Specific Service Requirements {contract.sub_service && `(${contract.sub_service.replace('_', ' ').toUpperCase()})`}
            </h3>
          </div>

          {contract.dynamic_attributes && Object.keys(contract.dynamic_attributes).length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginTop: '0.25rem' }}>
              {Object.entries(contract.dynamic_attributes).map(([key, value]) => {
                const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                let displayVal = value;
                if (typeof value === 'boolean') {
                  displayVal = value ? '✓ Yes' : '✗ No';
                }

                return (
                  <div key={key} style={{
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.15rem'
                  }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{formattedKey}</span>
                    <strong style={{ fontSize: '0.9rem', color: typeof value === 'boolean' ? (value ? '#10b981' : '#ef4444') : 'var(--text-primary)' }}>
                      {String(displayVal)}
                    </strong>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Finalized or Accepted Contractor & Client Contact & Discussion Panel */}
      {(contract.contractor_detail || (contract.status === 'searching' && contract.accepted_contractors_details?.length > 0) || contract.client_detail) && (
        <div className="glass-panel" style={{
          padding: '1.25rem 1.5rem',
          borderRadius: '14px',
          border: '1.5px solid rgba(16, 185, 129, 0.35)',
          backgroundColor: 'rgba(16, 185, 129, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Phone size={16} />
              Contract Discussion
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Message to discuss project terms, timelines & requirements
            </span>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {/* Contractor Contact Card(s) */}
            {(contract.status === 'searching' && contract.accepted_contractors_details?.length > 0
              ? contract.accepted_contractors_details
              : contract.contractor_detail ? [contract.contractor_detail] : []
            ).map(pro => (
              <div key={pro.id} style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                padding: '1rem 1.25rem',
                borderRadius: '12px',
                backgroundColor: 'var(--bg-primary)',
                border: '1.5px solid rgba(16, 185, 129, 0.25)',
                flex: 1,
                minWidth: '300px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img
                      src={pro.profile_picture || `https://api.dicebear.com/7.x/initials/svg?seed=${pro.username}`}
                      alt={pro.username}
                      style={{ width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover', border: '2.5px solid #10b981' }}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{formatUsername(pro.username)}</strong>
                        <span className="role-badge contractor" style={{ fontSize: '0.65rem' }}>Contractor</span>
                        <span style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: '0.8rem' }}>★ {pro.rating && pro.rating > 0 ? pro.rating : '0.0'}</span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Specialty: {pro.specialty || 'General Service'}</span>
                    </div>
                  </div>

                  {isClient && contract.status === 'searching' && (
                    <button
                      className="btn btn-primary"
                      onClick={() => handleFinalizeContractor(pro.id, pro.username)}
                      disabled={finalizing}
                      style={{ padding: '0.45rem 0.85rem', fontSize: '0.78rem', backgroundColor: '#10b981', borderColor: '#10b981', color: 'white', fontWeight: 700 }}
                    >
                      Finalize & Select
                    </button>
                  )}
                </div>

                {/* Mobile Contact row */}
                <div style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}>
                  

                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    
                    <a
                      href={`https://wa.me/${(pro.phone_number || '919876543210').replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline"
                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none', color: '#25D366' }}
                    >
                      <MessageSquare size={13} /> WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            ))}

            {/* Client Contact Card (Visible when contractor is viewing) */}
            {isContractor && contract.client_detail && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                padding: '1rem 1.25rem',
                borderRadius: '12px',
                backgroundColor: 'var(--bg-primary)',
                border: '1.5px solid rgba(59, 130, 246, 0.25)',
                flex: 1,
                minWidth: '300px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <img
                    src={contract.client_detail.profile_picture || `https://api.dicebear.com/7.x/initials/svg?seed=${contract.client_detail.username}`}
                    alt={contract.client_detail.username}
                    style={{ width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover', border: '2.5px solid #3b82f6' }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{formatUsername(contract.client_detail.username)}</strong>
                      <span className="role-badge client" style={{ fontSize: '0.65rem' }}>Client / Employer</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Contract Publisher</span>
                  </div>
                </div>

                <div style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}>
                  

                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <a
                      href={`https://wa.me/${(contract.client_detail.phone_number || '919876512345').replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline"
                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none', color: '#25D366' }}
                    >
                      <MessageSquare size={13} /> WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}


      {/* Two Column Layout */}
      <div className="dashboard-grid">

        {/* Left Side: Legal Document Viewer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={20} style={{ color: 'var(--secondary)' }} />
              Legal Contract Agreement
            </h3>

            <div className="contract-document">
              {contract.terms_text}

              {/* Render signatures in document */}
              <div className="signature-row">
                <div className="signature-box">
                  {contract.client_signature ? (
                    <img src={contract.client_signature} alt="Client Signature" />
                  ) : (
                    <div style={{ height: '40px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>Awaiting Signature</div>
                  )}
                  <strong>Client Signature</strong>
                  <div>Date: {contract.signed_at ? new Date(contract.signed_at).toLocaleDateString() : 'Pending'}</div>
                </div>
                <div className="signature-box">
                  {contract.contractor_signature ? (
                    <img src={contract.contractor_signature} alt="Contractor Signature" />
                  ) : (
                    <div style={{ height: '40px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>Awaiting Signature</div>
                  )}
                  <strong>Contractor Signature</strong>
                  <div>Date: {contract.signed_at ? new Date(contract.signed_at).toLocaleDateString() : 'Pending'}</div>
                </div>
              </div>
            </div>

            {/* Signature Draw pad overlay */}
            {showSignPad && (
              <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '2rem', paddingTop: '1.5rem' }}>
                <h4 style={{ marginBottom: '0.75rem', color: 'var(--primary)' }}>
                  Provide Your Digital Signature to Accept Terms
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                  Use your mouse or touch screen to draw your signature in the field below:
                </p>
                <SignaturePad
                  onSave={handleSign}
                  onClear={() => { }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Map & Actions Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>



          {/* Execution actions status card */}
          <div className="glass-panel intel-scan-box intel-stat-card" style={{ padding: '1.5rem', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ClipboardList size={18} style={{ color: 'var(--secondary)' }} />
                Contract Status Timeline
              </h4>
              <span className="intel-live-badge"><span className="intel-live-dot"></span>LIVE TELEMETRY</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

              {/* Step 1: Matching */}
              <div style={{ display: 'flex', gap: '0.75rem', opacity: contract.status === 'searching' ? 1 : 0.6 }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: ['offered', 'active', 'completed', 'approved'].includes(contract.status) ? 'var(--success)' : 'var(--info)',
                  color: 'black',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '0.8rem'
                }}>✓</div>
                <div>
                  <h5 style={{ fontWeight: 600 }}>Matched with Contractor</h5>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {contract.contractor_detail ? `Matched with ${formatUsername(contract.contractor_detail.username)} (${contract.contractor_detail.rating}★)` : 'Searching dispatch database...'}
                  </p>
                </div>
              </div>

              {/* Step 2: Signatures */}
              <div style={{ display: 'flex', gap: '0.75rem', opacity: ['offered', 'active'].includes(contract.status) ? 1 : 0.6 }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: ['active', 'completed', 'approved'].includes(contract.status) ? 'var(--success)' : 'var(--warning)',
                  color: 'black',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '0.8rem'
                }}>2</div>
                <div>
                  <h5 style={{ fontWeight: 600 }}>Double Digital Signing</h5>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {contract.client_signature ? 'Client Signed (OK)' : 'Client pending'} • {contract.contractor_signature ? 'Contractor Signed (OK)' : 'Contractor pending'}
                  </p>
                </div>
              </div>

              {/* Step 3: Active execution */}
              <div style={{ display: 'flex', gap: '0.75rem', opacity: ['active', 'completed'].includes(contract.status) ? 1 : 0.6 }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: ['completed', 'approved'].includes(contract.status) ? 'var(--success)' : 'var(--secondary)',
                  color: 'black',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '0.8rem'
                }}>3</div>
                <div>
                  <h5 style={{ fontWeight: 600 }}>Service Execution</h5>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Contract is active. Contractor is performing the requested service.
                  </p>

                  {/* Contractor action */}
                  {contract.status === 'active' && isContractor && (
                    <button className="btn btn-secondary" style={{ marginTop: '0.75rem', padding: '0.45rem 1rem', fontSize: '0.8rem' }} onClick={handleCompleteWork} disabled={submittingWork}>
                      {submittingWork ? 'Submitting...' : 'Mark Job Completed'}
                    </button>
                  )}
                </div>
              </div>

              {/* Step 4: Pay & Approve */}
              <div style={{ display: 'flex', gap: '0.75rem', opacity: ['completed', 'approved'].includes(contract.status) ? 1 : 0.6 }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: contract.status === 'approved' ? 'var(--success)' : 'var(--primary)',
                  color: 'black',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '0.8rem'
                }}>4</div>
                <div>
                  <h5 style={{ fontWeight: 600 }}>Approval & Escrow Release</h5>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Client verifies work quality. Releasing funds terminates contract successfully.
                  </p>

                  {/* Client action */}
                  {contract.status === 'completed' && isClient && (
                    <button className="btn btn-primary" style={{ marginTop: '0.75rem', padding: '0.65rem 1.25rem', fontSize: '0.9rem', backgroundColor: '#10b981', borderColor: '#10b981', color: 'white', fontWeight: 800, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} onClick={handleApproveAndPay} disabled={approving}>
                      <CheckCircle2 size={18} />
                      <span>{approving ? 'Processing Payment...' : `Approve Work & Release Escrow Payment (₹${contract.budget})`}</span>
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Rating / Review panel after contract completed or approved */}
          {['completed', 'approved'].includes(contract.status) && isClient && (
            <div className="glass-panel" style={{ padding: '1.5rem', border: '1.5px solid rgba(16,185,129,0.35)', backgroundColor: 'rgba(16,185,129,0.04)' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#10b981', fontWeight: 800 }}>
                <Award size={18} />
                Rate & Review Contractor ({formatUsername(contract.contractor_detail?.username)})
              </h4>

              {(reviewSubmitted || contract.has_reviewed) ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <p style={{ color: '#10b981', fontSize: '0.9rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CheckCircle2 size={18} />
                    <span>Rating & Review submitted successfully for {formatUsername(contract.contractor_detail?.username)}. Thank you!</span>
                  </p>
                  <button
                    onClick={onBack}
                    className="btn btn-primary"
                    style={{ padding: '0.6rem 1.35rem', fontSize: '0.85rem', backgroundColor: '#10b981', borderColor: '#10b981', fontWeight: 700, width: 'fit-content' }}
                  >
                    Return to Main Dashboard
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview}>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0' }}>
                    Select a rating (1 to 5 stars) to evaluate the contractor's work quality:
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', margin: '0.75rem 0' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={28}
                        style={{ cursor: 'pointer', fill: star <= rating ? '#f59e0b' : 'none', color: '#f59e0b', transition: 'transform 0.15s' }}
                        onClick={() => setRating(star)}
                      />
                    ))}
                  </div>

                  <div className="form-group">
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="Write a brief comment on the contractor's performance..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    ></textarea>
                  </div>

                  <button type="submit" className="btn btn-primary btn-block" style={{ padding: '0.55rem', fontSize: '0.85rem', backgroundColor: '#10b981', borderColor: '#10b981', fontWeight: 700 }} disabled={reviewSubmitting}>
                    {reviewSubmitting ? 'Submitting Rating ' : 'Sort'}
                  </button>
                </form>
              )}
            </div>
          )}

        </div>

      </div>

      {/* Printable Invoice Modal */}
      {invoiceOpen && (
        <div className="invoice-modal-overlay" onClick={() => setInvoiceOpen(false)}>
          <div className="invoice-modal" onClick={e => e.stopPropagation()}>
            <div className="invoice-header">
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900 }}>INVOICE / ESCROW RECEIPT</h2>
                <span style={{ fontSize: '0.8rem', opacity: 0.85 }}>Contrax Escrow Verification Service</span>
              </div>
              <button
                onClick={() => setInvoiceOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="invoice-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h4 style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>Contrax Systems Inc.</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Semester 4 Project Execution Platform</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '0.25rem' }}>Release TX Hash: ctx_tx_{contract.id}_{Math.floor(Math.random() * 100000)}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h4 style={{ fontWeight: 850, fontSize: '1rem', color: 'var(--text-primary)' }}>INVOICE #: CTX-2026-0{contract.id}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Date: {contract.completed_at ? new Date(contract.completed_at).toLocaleDateString() : new Date().toLocaleDateString()}</p>
                  <span className="status-badge approved" style={{ fontSize: '0.75rem', padding: '2px 8px', marginTop: '0.35rem' }}>PAID & ESCROW RELEASED</span>
                </div>
              </div>

              <div className="invoice-detail-grid">
                <div>
                  <strong style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Client Details</strong>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{contract.client_detail ? formatUsername(contract.client_detail.username) : 'Client User'}</span>
                </div>
                <div>
                  <strong style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Contractor Details</strong>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{contract.contractor_detail ? formatUsername(contract.contractor_detail.username) : 'Assigned Contractor'}</span>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Rating: {contract.contractor_detail?.rating || 5}★</p>
                </div>
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <strong style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Job Details</strong>
                <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>{contract.title}</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{contract.description}</p>
              </div>

              <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                      <th style={{ paddingBottom: '0.5rem' }}>Escrow Allocation Description</th>
                      <th style={{ paddingBottom: '0.5rem', textAlign: 'right' }}>Amount (INR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.75rem 0', color: 'var(--text-primary)' }}>
                        <strong>Escrow Service Payout ({contract.category})</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>Satisfactory execution & digital signature verified escrow release</div>
                      </td>
                      <td style={{ padding: '0.75rem 0', textAlign: 'right', fontWeight: 700, color: 'var(--text-primary)' }}>₹{contract.budget.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '0.75rem 0', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>Total Settled</td>
                      <td style={{ padding: '0.75rem 0', textAlign: 'right', fontWeight: 800, fontSize: '1.1rem', color: 'var(--success)' }}>₹{contract.budget.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Base64 signatures in receipt */}
              <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem', justifyContent: 'space-between', borderTop: '1px dashed var(--border-color)', paddingTop: '1.5rem' }}>
                {contract.client_signature && (
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <img src={contract.client_signature} alt="Client Sig" style={{ maxHeight: '40px', display: 'block', margin: '0 auto 0.25rem auto' }} />
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', display: 'block', width: '80%', margin: '0 auto', paddingTop: '2px' }}>Client Authorized</span>
                  </div>
                )}
                {contract.contractor_signature && (
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <img src={contract.contractor_signature} alt="Contractor Sig" style={{ maxHeight: '40px', display: 'block', margin: '0 auto 0.25rem auto' }} />
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', display: 'block', width: '80%', margin: '0 auto', paddingTop: '2px' }}>Contractor Confirmed</span>
                  </div>
                )}
              </div>

              <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                This is a secure system-generated receipt verifying escrow allocation and final payout settlement.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', padding: '1rem 2rem', backgroundColor: 'var(--bg-primary)', borderTop: '1px solid var(--border-color)' }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setInvoiceOpen(false)}>
                Close
              </button>
              <button
                className="btn btn-secondary"
                style={{ flex: 1, backgroundColor: 'var(--success)', color: 'white' }}
                onClick={() => window.print()}
              >
                Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM CONFIRMATION MODAL FOR CANCEL CONTRACT */}
      {cancelModalOpen && createPortal(
        <div className="confirm-modal-overlay" onClick={() => setCancelModalOpen(false)}>
          <div className="glass-panel confirm-modal-card" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', flexShrink: 0 }}>
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Cancel Contract?
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Action cannot be undone</span>
              </div>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              Are you sure you want to cancel this contract? Your escrow budget will be immediately refunded to your wallet balance.
            </p>

            <div className="confirm-modal-actions" style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', alignItems: 'center' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setCancelModalOpen(false)}
                disabled={cancelling}
                style={{ padding: '0.5rem 1.25rem', fontWeight: 700, minWidth: '90px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleCancelContract}
                disabled={cancelling}
                style={{ backgroundColor: '#ef4444', borderColor: '#ef4444', color: '#ffffff', fontWeight: 800, padding: '0.5rem 1.5rem', minWidth: '90px' }}
              >
                {cancelling ? 'Refunding...' : 'OK'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ContractDetails;

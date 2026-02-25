
import React, { useState, useEffect } from 'react';

// Centralized RBAC Configuration
const ROLES = {
  ADMIN: {
    screens: ['DASHBOARD', 'CLAIMS_LIST', 'POLICIES_LIST', 'AUDIT_LOGS', 'USER_MANAGEMENT', 'CLAIM_DETAIL', 'CLAIM_FORM'],
    actions: ['createClaim', 'editClaim', 'approveClaim', 'rejectClaim', 'settleClaim', 'deleteClaim', 'manageUsers', 'viewAuditLogs', 'exportData'],
    dashboardWidgets: ['totalClaims', 'claimsByStatus', 'recentActivities', 'openClaimsAging', 'userActivity'],
  },
  CLAIMS_OFFICER: {
    screens: ['DASHBOARD', 'CLAIMS_LIST', 'CLAIM_DETAIL', 'CLAIM_FORM', 'POLICIES_LIST'],
    actions: ['createClaim', 'editClaim', 'approveClaim', 'rejectClaim', 'viewClaimDetail', 'uploadDocuments'],
    dashboardWidgets: ['claimsAwaitingReview', 'myClaims', 'claimsByStatus', 'recentActivities'],
  },
  FINANCE_TEAM: {
    screens: ['DASHBOARD', 'CLAIMS_LIST', 'CLAIM_DETAIL', 'AUDIT_LOGS'],
    actions: ['viewClaimDetail', 'settleClaim', 'exportFinancialReports'],
    dashboardWidgets: ['claimsAwaitingSettlement', 'claimsPaid', 'recentActivities'],
  },
  POLICYHOLDER: {
    screens: ['DASHBOARD', 'CLAIMS_LIST', 'CLAIM_DETAIL', 'CLAIM_FORM'],
    actions: ['createClaim', 'viewMyClaims', 'uploadDocuments'],
    dashboardWidgets: ['myClaimsStatus', 'myRecentClaims', 'claimSubmissionGuide'],
  },
};

// Standardized Status Keys and UI Mapping
const STATUS_MAPPING = {
  SUBMITTED: { label: 'Submitted', color: 'var(--status-submitted)' },
  UNDER_REVIEW: { label: 'Under Review', color: 'var(--status-under-review)' },
  APPROVED: { label: 'Approved', color: 'var(--status-approved)' },
  REJECTED: { label: 'Rejected', color: 'var(--status-rejected)' },
  SETTLED: { label: 'Settled', color: 'var(--status-settled)' },
  PENDING_DOCS: { label: 'Pending Docs', color: 'var(--status-pending)' },
  AWAITING_PAYMENT: { label: 'Awaiting Payment', color: 'var(--status-info)' },
};

// Dummy Data
const DUMMY_CLAIMS = [
  { id: 'CLM001', policyId: 'POL987', type: 'Auto Accident', description: 'Rear-end collision on highway.', status: 'APPROVED', amount: 5200.00, submittedBy: 'John Doe', submittedDate: '2023-10-26', lastUpdate: '2023-11-01', slaBreach: false, workflowStage: 'Settlement', documents: [{ name: 'Police Report.pdf', url: '#', type: 'pdf' }, { name: 'Repair Estimate.docx', url: '#', type: 'doc' }], relatedRecords: [{id: 'POL987', type: 'Policy'}] },
  { id: 'CLM002', policyId: 'POL123', type: 'Home Damage', description: 'Roof damage from recent storm.', status: 'SUBMITTED', amount: 0.00, submittedBy: 'Jane Smith', submittedDate: '2023-10-27', lastUpdate: '2023-10-27', slaBreach: false, workflowStage: 'Submission', documents: [{ name: 'Damage Photos.zip', url: '#', type: 'zip' }], relatedRecords: [] },
  { id: 'CLM003', policyId: 'POL456', type: 'Health', description: 'Hospitalization for emergency appendectomy.', status: 'UNDER_REVIEW', amount: 15000.00, submittedBy: 'Alice Johnson', submittedDate: '2023-10-20', lastUpdate: '2023-10-28', slaBreach: true, workflowStage: 'Verification', documents: [{ name: 'Medical Bill.pdf', url: '#', type: 'pdf' }, { name: 'Discharge Summary.pdf', url: '#', type: 'pdf' }], relatedRecords: [] },
  { id: 'CLM004', policyId: 'POL789', type: 'Travel', description: 'Lost luggage on international flight.', status: 'REJECTED', amount: 800.00, submittedBy: 'Bob Williams', submittedDate: '2023-10-15', lastUpdate: '2023-10-20', slaBreach: false, workflowStage: 'Resolution', documents: [], relatedRecords: [] },
  { id: 'CLM005', policyId: 'POL101', type: 'Auto Accident', description: 'Minor fender bender, no injuries.', status: 'SETTLED', amount: 1200.00, submittedBy: 'Charlie Brown', submittedDate: '2023-09-01', lastUpdate: '2023-09-15', slaBreach: false, workflowStage: 'Settlement', documents: [{ name: 'Invoice.pdf', url: '#', type: 'pdf' }], relatedRecords: [] },
  { id: 'CLM006', policyId: 'POL112', type: 'Property Theft', description: 'Electronics stolen from apartment.', status: 'UNDER_REVIEW', amount: 3500.00, submittedBy: 'Diana Prince', submittedDate: '2023-11-02', lastUpdate: '2023-11-02', slaBreach: false, workflowStage: 'Verification', documents: [{ name: 'Police Report.pdf', url: '#', type: 'pdf' }], relatedRecords: [] },
  { id: 'CLM007', policyId: 'POL131', type: 'Life Insurance', description: 'Claim due to policyholder demise.', status: 'APPROVED', amount: 100000.00, submittedBy: 'Bruce Wayne', submittedDate: '2023-10-01', lastUpdate: '2023-10-10', slaBreach: false, workflowStage: 'Settlement', documents: [{ name: 'Death Certificate.pdf', url: '#', type: 'pdf' }], relatedRecords: [] },
  { id: 'CLM008', policyId: 'POL141', type: 'Business Interruption', description: 'Loss of income due to power outage.', status: 'PENDING_DOCS', amount: 0.00, submittedBy: 'Clark Kent', submittedDate: '2023-11-03', lastUpdate: '2023-11-03', slaBreach: false, workflowStage: 'Submission', documents: [], relatedRecords: [] },
];

const DUMMY_POLICIES = [
  { id: 'POL987', type: 'Auto Insurance', holder: 'John Doe', status: 'Active', effectiveDate: '2023-01-01', expiryDate: '2024-01-01', premium: 1200, coveredAmount: 100000 },
  { id: 'POL123', type: 'Homeowner Insurance', holder: 'Jane Smith', status: 'Active', effectiveDate: '2022-05-15', expiryDate: '2025-05-15', premium: 1800, coveredAmount: 300000 },
  { id: 'POL456', type: 'Health Insurance', holder: 'Alice Johnson', status: 'Active', effectiveDate: '2023-03-01', expiryDate: '2024-03-01', premium: 6000, coveredAmount: 500000 },
  { id: 'POL789', type: 'Travel Insurance', holder: 'Bob Williams', status: 'Expired', effectiveDate: '2023-10-01', expiryDate: '2023-10-10', premium: 150, coveredAmount: 5000 },
  { id: 'POL101', type: 'Auto Insurance', holder: 'Charlie Brown', status: 'Active', effectiveDate: '2023-02-01', expiryDate: '2024-02-01', premium: 1000, coveredAmount: 80000 },
];

const DUMMY_AUDIT_LOGS = [
  { id: 'AUD001', timestamp: '2023-11-03 14:30', user: 'AdminUser', action: 'CLAIM_UPDATE', details: 'Claim CLM003 status updated from UNDER_REVIEW to APPROVED.', recordId: 'CLM003' },
  { id: 'AUD002', timestamp: '2023-11-03 14:25', user: 'ClaimsOfficer1', action: 'CLAIM_DOCUMENT_UPLOAD', details: 'Uploaded Damage Report for Claim CLM002.', recordId: 'CLM002' },
  { id: 'AUD003', timestamp: '2023-11-03 14:15', user: 'PolicyholderP', action: 'CLAIM_SUBMITTED', details: 'Policyholder submitted new Claim CLM008.', recordId: 'CLM008' },
  { id: 'AUD004', timestamp: '2023-11-02 10:00', user: 'AdminUser', action: 'USER_LOGIN', details: 'User AdminUser logged in.', recordId: null },
  { id: 'AUD005', timestamp: '2023-11-01 09:45', user: 'FinanceTeamMember', action: 'CLAIM_SETTLED', details: 'Claim CLM001 settled with payment of $5200.00.', recordId: 'CLM001' },
  { id: 'AUD006', timestamp: '2023-10-28 16:00', user: 'ClaimsOfficer1', action: 'CLAIM_REVIEWED', details: 'Initial review completed for Claim CLM003. SLA Breach flagged.', recordId: 'CLM003' },
  { id: 'AUD007', timestamp: '2023-10-20 11:30', user: 'ClaimsOfficer2', action: 'CLAIM_REJECTED', details: 'Claim CLM004 rejected due to expired policy.', recordId: 'CLM004' },
];

const DUMMY_USERS = [
  { id: 'USR001', name: 'John Doe', email: 'john.doe@example.com', role: 'POLICYHOLDER' },
  { id: 'USR002', name: 'Jane Smith', email: 'jane.smith@example.com', role: 'CLAIMS_OFFICER' },
  { id: 'USR003', name: 'Alice Admin', email: 'alice.admin@example.com', role: 'ADMIN' },
  { id: 'USR004', name: 'Bob Finance', email: 'bob.finance@example.com', role: 'FINANCE_TEAM' },
];

const WORKFLOW_STAGES = ['Submission', 'Verification', 'Approval', 'Settlement', 'Resolution'];

function App() {
  const [view, setView] = useState({ screen: 'LOGIN', params: {} });
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [claims, setClaims] = useState(DUMMY_CLAIMS); // State for claims to allow edits
  const [policies, setPolicies] = useState(DUMMY_POLICIES);
  const [auditLogs, setAuditLogs] = useState(DUMMY_AUDIT_LOGS);
  const [selectedClaimIds, setSelectedClaimIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Handlers defined within functional component scope
  const navigate = (screen, params = {}) => {
    setView({ screen, params });
    window.scrollTo(0, 0); // Scroll to top on navigation
  };

  const handleLogin = (role) => {
    setCurrentUserRole(role);
    navigate('DASHBOARD');
  };

  const handleLogout = () => {
    setCurrentUserRole(null);
    navigate('LOGIN');
  };

  const getBreadcrumbs = () => {
    const crumbs = [{ label: 'Home', screen: 'DASHBOARD' }];
    switch (view.screen) {
      case 'DASHBOARD': return [{ label: 'Dashboard', screen: 'DASHBOARD' }];
      case 'CLAIMS_LIST': crumbs.push({ label: 'Claims', screen: 'CLAIMS_LIST' }); break;
      case 'CLAIM_DETAIL':
        crumbs.push({ label: 'Claims', screen: 'CLAIMS_LIST' });
        crumbs.push({ label: `Claim ${view.params?.id || 'Detail'}`, screen: 'CLAIM_DETAIL', params: view.params });
        break;
      case 'CLAIM_FORM':
        crumbs.push({ label: 'Claims', screen: 'CLAIMS_LIST' });
        crumbs.push({ label: view.params?.id ? `Edit Claim ${view.params.id}` : 'New Claim', screen: 'CLAIM_FORM', params: view.params });
        break;
      case 'POLICIES_LIST': crumbs.push({ label: 'Policies', screen: 'POLICIES_LIST' }); break;
      case 'AUDIT_LOGS': crumbs.push({ label: 'Audit Logs', screen: 'AUDIT_LOGS' }); break;
      case 'USER_MANAGEMENT': crumbs.push({ label: 'User Management', screen: 'USER_MANAGEMENT' }); break;
      default: break;
    }
    return crumbs;
  };

  const canAccess = (screen) => currentUserRole && ROLES[currentUserRole]?.screens?.includes(screen);
  const canPerform = (action) => currentUserRole && ROLES[currentUserRole]?.actions?.includes(action);

  const getStatusStyle = (statusKey) => {
    const statusInfo = STATUS_MAPPING[statusKey];
    return statusInfo ? { backgroundColor: statusInfo.color } : { backgroundColor: 'var(--color-secondary)' };
  };

  const getStatusLabel = (statusKey) => {
    return STATUS_MAPPING[statusKey]?.label || statusKey;
  };

  const handleClaimStatusChange = (claimId, newStatus) => {
    setClaims(prevClaims => prevClaims.map(claim =>
      claim.id === claimId ? { ...claim, status: newStatus, lastUpdate: new Date().toISOString().slice(0, 10) } : claim
    ));
    setAuditLogs(prevLogs => [
      ...prevLogs,
      { id: `AUD${String(prevLogs.length + 1).padStart(3, '0')}`, timestamp: new Date().toLocaleString(), user: currentUserRole, action: 'CLAIM_UPDATE', details: `Claim ${claimId} status updated to ${newStatus}.`, recordId: claimId }
    ]);
  };

  const handleFormSubmit = (formData) => {
    if (formData.id) { // Edit existing claim
      setClaims(prevClaims => prevClaims.map(claim =>
        claim.id === formData.id ? { ...formData, lastUpdate: new Date().toISOString().slice(0, 10) } : claim
      ));
      setAuditLogs(prevLogs => [
        ...prevLogs,
        { id: `AUD${String(prevLogs.length + 1).padStart(3, '0')}`, timestamp: new Date().toLocaleString(), user: currentUserRole, action: 'CLAIM_EDIT', details: `Claim ${formData.id} details updated.`, recordId: formData.id }
      ]);
    } else { // Create new claim
      const newId = `CLM${String(claims.length + 1).padStart(3, '0')}`;
      const newClaim = {
        ...formData,
        id: newId,
        status: 'SUBMITTED',
        submittedBy: DUMMY_USERS.find(u => u.role === currentUserRole)?.name || 'Unknown',
        submittedDate: new Date().toISOString().slice(0, 10),
        lastUpdate: new Date().toISOString().slice(0, 10),
        slaBreach: false,
        workflowStage: 'Submission',
        documents: [],
        relatedRecords: [{id: formData.policyId, type: 'Policy'}],
      };
      setClaims(prevClaims => [...prevClaims, newClaim]);
      setAuditLogs(prevLogs => [
        ...prevLogs,
        { id: `AUD${String(prevLogs.length + 1).padStart(3, '0')}`, timestamp: new Date().toLocaleString(), user: currentUserRole, action: 'CLAIM_SUBMITTED', details: `New Claim ${newId} submitted.`, recordId: newId }
      ]);
    }
    navigate('CLAIMS_LIST');
  };

  const handleSelectClaim = (id) => {
    setSelectedClaimIds(prev => (
      prev.includes(id) ? prev.filter(claimId => claimId !== id) : [...prev, id]
    ));
  };

  const handleSelectAllClaims = (e) => {
    if (e.target.checked) {
      setSelectedClaimIds(filteredClaims.map(claim => claim.id));
    } else {
      setSelectedClaimIds([]);
    }
  };

  const handleBulkAction = (action) => {
    if (selectedClaimIds.length === 0) return;
    const confirmation = window.confirm(`Are you sure you want to ${action} ${selectedClaimIds.length} claims?`);
    if (!confirmation) return;

    if (action === 'approve') {
      const updatedClaims = claims.map(claim =>
        selectedClaimIds.includes(claim.id) ? { ...claim, status: 'APPROVED', lastUpdate: new Date().toISOString().slice(0, 10) } : claim
      );
      setClaims(updatedClaims);
    } else if (action === 'reject') {
      const updatedClaims = claims.map(claim =>
        selectedClaimIds.includes(claim.id) ? { ...claim, status: 'REJECTED', lastUpdate: new Date().toISOString().slice(0, 10) } : claim
      );
      setClaims(updatedClaims);
    }
    setSelectedClaimIds([]);
    setAuditLogs(prevLogs => [
      ...prevLogs,
      { id: `AUD${String(prevLogs.length + 1).padStart(3, '0')}`, timestamp: new Date().toLocaleString(), user: currentUserRole, action: `BULK_${action.toUpperCase()}`, details: `Bulk action: ${action} on ${selectedClaimIds.length} claims.`, recordId: null }
    ]);
  };

  const filteredClaims = claims?.filter(claim => {
    const matchesSearch = claim?.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          claim?.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          claim?.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          claim?.submittedBy?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          claim?.status?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || claim?.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Simplified chart data for placeholders
  const claimsByStatusData = Object.entries(
    claims.reduce((acc, claim) => {
      acc[claim.status] = (acc[claim.status] || 0) + 1;
      return acc;
    }, {})
  );

  const totalClaims = claims.length;
  const approvedClaims = claims.filter(c => c.status === 'APPROVED').length;
  const pendingReviewClaims = claims.filter(c => c.status === 'UNDER_REVIEW').length;
  const claimsAwaitingPayment = claims.filter(c => c.status === 'APPROVED' && c.workflowStage === 'Settlement').length;

  // Components for different screens (rendered inline based on view state)

  const LoginPage = () => (
    <div className="full-screen-page" style={{ maxWidth: '400px', margin: '100px auto', padding: 'var(--spacing-xl)', backgroundColor: 'var(--color-card-bg)', borderRadius: 'var(--border-radius-lg)', boxShadow: 'var(--shadow-lg)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>Login to Insurance Platform</h2>
      <div className="flex-col">
        <button className="button button-primary" style={{ marginBottom: 'var(--spacing-md)' }} onClick={() => handleLogin('POLICYHOLDER')}>Login as Policyholder</button>
        <button className="button button-primary" style={{ marginBottom: 'var(--spacing-md)' }} onClick={() => handleLogin('CLAIMS_OFFICER')}>Login as Claims Officer</button>
        <button className="button button-primary" style={{ marginBottom: 'var(--spacing-md)' }} onClick={() => handleLogin('FINANCE_TEAM')}>Login as Finance Team</button>
        <button className="button button-primary" onClick={() => handleLogin('ADMIN')}>Login as Admin</button>
      </div>
    </div>
  );

  const DashboardPage = () => (
    <div className="full-screen-page">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="breadcrumbs">Home</p>
      </div>

      <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Key Performance Indicators</h3>
      <div className="grid-3-col" style={{ marginBottom: 'var(--spacing-lg)' }}>
        {canPerform('viewTotalClaims') && (
          <div className="card card-dashboard pulse-animation">
            <div className="label">Total Claims</div>
            <div className="value">{totalClaims}</div>
          </div>
        )}
        {(canPerform('viewClaimsAwaitingReview') || canPerform('viewMyClaims')) && (
          <div className="card card-dashboard">
            <div className="label">Claims Under Review</div>
            <div className="value">{pendingReviewClaims}</div>
          </div>
        )}
        {canPerform('viewClaimsAwaitingSettlement') && (
          <div className="card card-dashboard">
            <div className="label">Claims Awaiting Settlement</div>
            <div className="value">{claimsAwaitingPayment}</div>
          </div>
        )}
        {canPerform('viewApprovedClaims') && (
          <div className="card card-dashboard" style={{borderLeft: '5px solid var(--status-approved)'}}>
            <div className="label">Approved Claims</div>
            <div className="value">{approvedClaims}</div>
          </div>
        )}
      </div>

      <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Claims Overview</h3>
      <div className="grid-2-col" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <div className="chart-container">
          <h4>Claims by Status (Donut Chart)</h4>
          <ul>
            {claimsByStatusData.map(([status, count]) => (
              <li key={status} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', marginBottom: 'var(--spacing-xxs)' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: STATUS_MAPPING[status]?.color || 'gray' }}></span>
                {getStatusLabel(status)}: {count}
              </li>
            ))}
          </ul>
        </div>
        <div className="chart-container">
          <h4>Claims Processing Timeline (Line Chart)</h4>
          <p>Placeholder for historical data visualization</p>
        </div>
        <div className="chart-container">
          <h4>Claims Aging (Bar Chart)</h4>
          <p>Placeholder for claims aging by status</p>
        </div>
        <div className="chart-container">
          <h4>SLA Adherence (Gauge Chart)</h4>
          <p>Placeholder for real-time SLA adherence</p>
        </div>
      </div>

      <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Recent Activities</h3>
      <div className="card-list">
        {auditLogs?.slice(0, 5).map(log => (
          <div key={log?.id} className="audit-log-item" style={{ borderBottom: '1px solid var(--color-border)', padding: 'var(--spacing-sm)' }}>
            <span className="timestamp">{log?.timestamp}</span>
            <span className="details">
              <span className="user">{log?.user}</span>: {log?.details}
            </span>
            {log?.recordId && (
              <button className="button-icon" onClick={() => navigate('CLAIM_DETAIL', { id: log?.recordId })} title="View Record">
                <i className="icon icon-view"></i>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const ClaimsListPage = () => (
    <div className="full-screen-page">
      <div className="page-header">
        <h1 className="page-title">Claims</h1>
        <p className="breadcrumbs">
          <a href="#" onClick={() => navigate('DASHBOARD')}>Home</a>
          <span>/</span>
          <span>Claims</span>
        </p>
        <div className="flex-row justify-between align-center">
          <h4 style={{ margin: 0 }}>All Claims</h4>
          <div className="flex-row">
            <div className="filter-controls">
              <select className="filter-dropdown" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="ALL">All Statuses</option>
                {Object.keys(STATUS_MAPPING).map(statusKey => (
                  <option key={statusKey} value={statusKey}>{STATUS_MAPPING[statusKey]?.label}</option>
                ))}
              </select>
              <button className="button button-outline"><i className="icon icon-export"></i> Export</button>
            </div>
            {canPerform('createClaim') && (
              <button className="button button-primary" onClick={() => navigate('CLAIM_FORM')}>
                <i className="icon icon-add"></i> New Claim
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search claims by ID, type, status, or description..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {canPerform('editClaim') && selectedClaimIds.length > 0 && (
        <div className="bulk-actions card-list">
          <span style={{ fontWeight: 'var(--font-weight-medium)' }}>{selectedClaimIds.length} claims selected:</span>
          <button className="button button-primary" onClick={() => handleBulkAction('approve')}>Approve Selected</button>
          <button className="button button-danger" onClick={() => handleBulkAction('reject')}>Reject Selected</button>
        </div>
      )}

      <div className="grid-2-col">
        {(filteredClaims?.length > 0) ? filteredClaims?.map(claim => (
          <div key={claim?.id} className="card card-list-item" data-status={claim?.status}>
             <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                <input
                  type="checkbox"
                  className="checkbox-item"
                  checked={selectedClaimIds.includes(claim?.id)}
                  onChange={() => handleSelectClaim(claim?.id)}
                  onClick={(e) => e.stopPropagation()} // Prevent card click when clicking checkbox
                  style={{marginRight: 'var(--spacing-sm)'}}
                />
                <div onClick={() => navigate('CLAIM_DETAIL', { id: claim?.id })} style={{flexGrow: 1, cursor: 'pointer'}}>
                  <div className="card-title">
                    {claim?.id}: {claim?.type}
                    {claim?.slaBreach && <span className="sla-breach"><i className="icon icon-alert"></i> SLA Breached</span>}
                  </div>
                  <p className="card-meta">Submitted by: {claim?.submittedBy} on {claim?.submittedDate}</p>
                  <p className="card-meta">Last Update: {claim?.lastUpdate}</p>
                  <span className="card-status" style={getStatusStyle(claim?.status)}>{getStatusLabel(claim?.status)}</span>
                </div>
                <div className="card-actions-hover">
                  {canPerform('editClaim') && (
                    <button className="button-icon" onClick={(e) => { e.stopPropagation(); navigate('CLAIM_FORM', { id: claim?.id }); }} title="Edit Claim">
                      <i className="icon icon-edit"></i>
                    </button>
                  )}
                  <button className="button-icon" onClick={(e) => { e.stopPropagation(); navigate('CLAIM_DETAIL', { id: claim?.id }); }} title="View Claim">
                    <i className="icon icon-view"></i>
                  </button>
                </div>
             </div>
          </div>
        )) : (
          <div className="empty-state" style={{gridColumn: '1 / -1'}}>
            <i className="icon icon-empty empty-state-icon"></i>
            <h3 className="empty-state-title">No Claims Found</h3>
            <p className="empty-state-description">Adjust your search or filters, or start by creating a new claim.</p>
            {canPerform('createClaim') && (
              <button className="button button-primary" onClick={() => navigate('CLAIM_FORM')}>
                <i className="icon icon-add"></i> Create New Claim
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const ClaimDetailPage = () => {
    const claim = claims?.find(c => c.id === view.params?.id);
    const policy = policies?.find(p => p.id === claim?.policyId);
    const relevantAuditLogs = auditLogs?.filter(log => log.recordId === claim?.id);

    const currentStageIndex = WORKFLOW_STAGES.indexOf(claim?.workflowStage);

    if (!claim) {
      return (
        <div className="full-screen-page">
          <div className="page-header">
            <h1 className="page-title">Claim Not Found</h1>
            <p className="breadcrumbs">
              <a href="#" onClick={() => navigate('DASHBOARD')}>Home</a>
              <span>/</span>
              <a href="#" onClick={() => navigate('CLAIMS_LIST')}>Claims</a>
              <span>/</span>
              <span>Not Found</span>
            </p>
          </div>
          <p>The requested claim could not be found.</p>
        </div>
      );
    }

    return (
      <div className="full-screen-page">
        <div className="page-header">
          <p className="breadcrumbs">
            <a href="#" onClick={() => navigate('DASHBOARD')}>Home</a>
            <span>/</span>
            <a href="#" onClick={() => navigate('CLAIMS_LIST')}>Claims</a>
            <span>/</span>
            <span>Claim {claim?.id}</span>
          </p>
          <div className="flex-row justify-between align-center">
            <h1 className="page-title">Claim {claim?.id} - {claim?.type}</h1>
            <div className="flex-row">
              {canPerform('editClaim') && (
                <button className="button button-secondary" onClick={() => navigate('CLAIM_FORM', { id: claim?.id })}>
                  <i className="icon icon-edit"></i> Edit Claim
                </button>
              )}
              {canPerform('approveClaim') && claim?.status !== 'APPROVED' && (
                <button className="button button-success" onClick={() => handleClaimStatusChange(claim?.id, 'APPROVED')}>
                  <i className="icon icon-check"></i> Approve
                </button>
              )}
              {canPerform('rejectClaim') && claim?.status !== 'REJECTED' && (
                <button className="button button-danger" onClick={() => handleClaimStatusChange(claim?.id, 'REJECTED')}>
                  <i className="icon icon-cross"></i> Reject
                </button>
              )}
              {canPerform('settleClaim') && claim?.status === 'APPROVED' && claim?.workflowStage === 'Settlement' && (
                <button className="button button-primary" onClick={() => handleClaimStatusChange(claim?.id, 'SETTLED')}>
                  <i className="icon icon-money"></i> Settle Payment
                </button>
              )}
            </div>
          </div>
          <span className="status-indicator" style={getStatusStyle(claim?.status)}>{getStatusLabel(claim?.status)}</span>
          {claim?.slaBreach && <span className="sla-breach" style={{marginLeft: 'var(--spacing-md)'}}><i className="icon icon-alert"></i> SLA Breached</span>}
        </div>

        <div className="detail-section">
          <h3 className="section-title"><i className="icon icon-workflow"></i> Workflow Progress</h3>
          <div className="workflow-tracker">
            {WORKFLOW_STAGES.map((stage, index) => (
              <div
                key={stage}
                className={`workflow-stage ${index < currentStageIndex ? 'completed' : ''} ${index === currentStageIndex ? 'active' : ''}`}
              >
                <div className="workflow-stage-dot">
                  {index < currentStageIndex ? <i className="icon icon-check"></i> : (index === currentStageIndex ? <i className="icon icon-progress"></i> : index + 1)}
                </div>
                {stage}
              </div>
            ))}
          </div>
        </div>

        <div className="grid-2-col">
          <div className="detail-section">
            <h3 className="section-title"><i className="icon icon-info"></i> Claim Details</h3>
            <div className="detail-item">
              <span className="detail-label">ID:</span>
              <span className="detail-value">{claim?.id}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Type:</span>
              <span className="detail-value">{claim?.type}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Status:</span>
              <span className="detail-value">{getStatusLabel(claim?.status)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Description:</span>
              <span className="detail-value">{claim?.description}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Amount Claimed:</span>
              <span className="detail-value">${claim?.amount?.toFixed(2)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Submitted By:</span>
              <span className="detail-value">{claim?.submittedBy}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Submitted Date:</span>
              <span className="detail-value">{claim?.submittedDate}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Last Updated:</span>
              <span className="detail-value">{claim?.lastUpdate}</span>
            </div>
          </div>

          <div className="detail-section">
            <h3 className="section-title"><i className="icon icon-policies"></i> Policy Information</h3>
            {policy ? (
              <>
                <div className="detail-item">
                  <span className="detail-label">Policy ID:</span>
                  <span className="detail-value">
                    <a href="#" onClick={() => navigate('POLICIES_LIST', { id: policy?.id })} style={{ textDecoration: 'underline', color: 'var(--color-primary)' }}>{policy?.id}</a>
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Policy Type:</span>
                  <span className="detail-value">{policy?.type}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Policy Holder:</span>
                  <span className="detail-value">{policy?.holder}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Status:</span>
                  <span className="detail-value">{policy?.status}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Effective Date:</span>
                  <span className="detail-value">{policy?.effectiveDate}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Expiry Date:</span>
                  <span className="detail-value">{policy?.expiryDate}</span>
                </div>
              </>
            ) : (
              <p>Policy details not found for ID: {claim?.policyId}</p>
            )}

            <h3 className="section-title" style={{ marginTop: 'var(--spacing-lg)' }}><i className="icon icon-document"></i> Supporting Documents</h3>
            {claim?.documents?.length > 0 ? (
              <div className="document-list">
                {claim?.documents?.map((doc, index) => (
                  <a key={index} href={doc?.url} target="_blank" rel="noopener noreferrer" className="document-item">
                    <i className="icon icon-document"></i>
                    <span className="document-name">{doc?.name}</span>
                  </a>
                ))}
              </div>
            ) : (
              <p>No documents uploaded.</p>
            )}
            {canPerform('uploadDocuments') && (
              <div style={{ marginTop: 'var(--spacing-md)' }}>
                <label htmlFor="file-upload" className="file-upload-area">
                  <i className="icon icon-upload" style={{ marginBottom: 'var(--spacing-sm)' }}></i>
                  <p>Drag & drop files here or click to upload</p>
                  <input type="file" id="file-upload" multiple />
                </label>
              </div>
            )}
          </div>
        </div>

        <div className="detail-section">
          <h3 className="section-title"><i className="icon icon-history"></i> Audit Log</h3>
          {canPerform('viewAuditLogs') ? (
            relevantAuditLogs?.length > 0 ? (
              <div className="card-list" style={{ boxShadow: 'none' }}>
                {relevantAuditLogs?.map(log => (
                  <div key={log?.id} className="audit-log-item" style={{ borderBottom: '1px solid var(--color-border)', padding: 'var(--spacing-sm) 0' }}>
                    <span className="timestamp">{log?.timestamp}</span>
                    <span className="details">
                      <span className="user">{log?.user}</span>: {log?.details}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p>No audit logs available for this claim.</p>
            )
          ) : (
            <p>You do not have permission to view audit logs.</p>
          )}
        </div>
      </div>
    );
  };

  const ClaimFormPage = () => {
    const isEdit = !!view.params?.id;
    const claimToEdit = isEdit ? claims?.find(c => c.id === view.params?.id) : {};

    const [formData, setFormData] = useState({
      policyId: claimToEdit?.policyId || '',
      type: claimToEdit?.type || '',
      description: claimToEdit?.description || '',
      amount: claimToEdit?.amount || 0,
      id: claimToEdit?.id || '', // Keep ID for edit mode
      documents: claimToEdit?.documents || [],
    });

    const [formErrors, setFormErrors] = useState({});

    const handleFieldChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
      if (formErrors[name]) { // Clear error on change
        setFormErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    };

    const validateForm = () => {
      const errors = {};
      if (!formData.policyId) errors.policyId = 'Policy ID is mandatory.';
      if (!formData.type) errors.type = 'Claim Type is mandatory.';
      if (!formData.description?.trim()) errors.description = 'Description is mandatory.';
      if (formData.amount <= 0) errors.amount = 'Amount must be greater than 0.';
      setFormErrors(errors);
      return Object.keys(errors).length === 0;
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      if (validateForm()) {
        handleFormSubmit(formData);
      } else {
        alert('Please correct the errors in the form.');
      }
    };

    return (
      <div className="full-screen-page">
        <div className="page-header">
          <p className="breadcrumbs">
            <a href="#" onClick={() => navigate('DASHBOARD')}>Home</a>
            <span>/</span>
            <a href="#" onClick={() => navigate('CLAIMS_LIST')}>Claims</a>
            <span>/</span>
            <span>{isEdit ? `Edit Claim ${claimToEdit?.id}` : 'New Claim'}</span>
          </p>
          <h1 className="page-title">{isEdit ? `Edit Claim: ${claimToEdit?.id}` : 'Submit New Claim'}</h1>
        </div>

        <form onSubmit={handleSubmit} className="detail-section">
          <h3 className="section-title">Claim Information</h3>
          <div className="grid-2-col">
            <div className="form-group">
              <label htmlFor="policyId" className="form-label">Policy ID <span style={{color: 'var(--color-danger)'}}>*</span></label>
              <input
                type="text"
                id="policyId"
                name="policyId"
                className="form-input"
                value={formData.policyId}
                onChange={handleFieldChange}
                required
                list="policy-ids"
                placeholder="e.g., POL123"
              />
              <datalist id="policy-ids">
                {policies.map(p => <option key={p.id} value={p.id} />)}
              </datalist>
              {formErrors.policyId && <p style={{ color: 'var(--color-danger)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--spacing-xxs)' }}>{formErrors.policyId}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="type" className="form-label">Claim Type <span style={{color: 'var(--color-danger)'}}>*</span></label>
              <select
                id="type"
                name="type"
                className="form-select"
                value={formData.type}
                onChange={handleFieldChange}
                required
              >
                <option value="">Select Type</option>
                <option value="Auto Accident">Auto Accident</option>
                <option value="Home Damage">Home Damage</option>
                <option value="Health">Health</option>
                <option value="Travel">Travel</option>
                <option value="Property Theft">Property Theft</option>
                <option value="Life Insurance">Life Insurance</option>
                <option value="Business Interruption">Business Interruption</option>
              </select>
              {formErrors.type && <p style={{ color: 'var(--color-danger)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--spacing-xxs)' }}>{formErrors.type}</p>}
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="description" className="form-label">Description <span style={{color: 'var(--color-danger)'}}>*</span></label>
            <textarea
              id="description"
              name="description"
              className="form-textarea"
              value={formData.description}
              onChange={handleFieldChange}
              required
              placeholder="Provide a detailed description of the claim event..."
            ></textarea>
            {formErrors.description && <p style={{ color: 'var(--color-danger)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--spacing-xxs)' }}>{formErrors.description}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="amount" className="form-label">Amount Claimed (USD) <span style={{color: 'var(--color-danger)'}}>*</span></label>
            <input
              type="number"
              id="amount"
              name="amount"
              className="form-input"
              value={formData.amount}
              onChange={handleFieldChange}
              required
              min="0.01"
              step="0.01"
              placeholder="e.g., 5000.00"
            />
            {formErrors.amount && <p style={{ color: 'var(--color-danger)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--spacing-xxs)' }}>{formErrors.amount}</p>}
          </div>

          <h3 className="section-title" style={{ marginTop: 'var(--spacing-lg)' }}>Supporting Documents</h3>
          <div className="form-group">
            <label htmlFor="file-upload" className="file-upload-area">
              <i className="icon icon-upload" style={{ marginBottom: 'var(--spacing-sm)' }}></i>
              <p>Drag & drop files here or click to upload</p>
              <input type="file" id="file-upload" multiple />
            </label>
            {formData.documents?.length > 0 && (
              <div style={{marginTop: 'var(--spacing-md)'}}>
                <p style={{fontWeight: 'var(--font-weight-medium)'}}>Uploaded Files:</p>
                <ul style={{listStyle: 'none', padding: 0}}>
                  {formData.documents.map((doc, index) => (
                    <li key={index} style={{display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xs)'}}>
                      <i className="icon icon-document"></i> {doc.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex-row justify-between" style={{ marginTop: 'var(--spacing-xl)' }}>
            <button type="button" className="button button-secondary" onClick={() => navigate('CLAIMS_LIST')}>Cancel</button>
            <button type="submit" className="button button-primary">{isEdit ? 'Save Changes' : 'Submit Claim'}</button>
          </div>
        </form>
      </div>
    );
  };

  const PoliciesListPage = () => (
    <div className="full-screen-page">
      <div className="page-header">
        <h1 className="page-title">Policies</h1>
        <p className="breadcrumbs">
          <a href="#" onClick={() => navigate('DASHBOARD')}>Home</a>
          <span>/</span>
          <span>Policies</span>
        </p>
        <div className="flex-row justify-between align-center">
          <h4 style={{ margin: 0 }}>All Policies</h4>
          <button className="button button-outline"><i className="icon icon-export"></i> Export</button>
        </div>
      </div>

      <div className="search-bar">
        <input type="text" placeholder="Search policies by ID, type, or holder..." className="search-input" />
      </div>

      <div className="grid-3-col">
        {policies?.length > 0 ? policies?.map(policy => (
          <div key={policy?.id} className="card" onClick={() => navigate('POLICIES_LIST', { id: policy?.id })}>
            <div className="card-title">{policy?.id}: {policy?.type}</div>
            <p className="card-meta">Holder: {policy?.holder}</p>
            <p className="card-meta">Status: {policy?.status}</p>
            <p className="card-meta">Expires: {policy?.expiryDate}</p>
          </div>
        )) : (
          <div className="empty-state" style={{gridColumn: '1 / -1'}}>
            <i className="icon icon-empty empty-state-icon"></i>
            <h3 className="empty-state-title">No Policies Found</h3>
            <p className="empty-state-description">There are no policies registered in the system.</p>
          </div>
        )}
      </div>
    </div>
  );

  const AuditLogsPage = () => (
    <div className="full-screen-page">
      <div className="page-header">
        <h1 className="page-title">Audit Logs</h1>
        <p className="breadcrumbs">
          <a href="#" onClick={() => navigate('DASHBOARD')}>Home</a>
          <span>/</span>
          <span>Audit Logs</span>
        </p>
        <div className="flex-row justify-between align-center">
          <h4 style={{ margin: 0 }}>All System Activities</h4>
          <button className="button button-outline"><i className="icon icon-export"></i> Export Logs</button>
        </div>
      </div>

      {canPerform('viewAuditLogs') ? (
        auditLogs?.length > 0 ? (
          <div className="card-list">
            <div style={{ padding: 'var(--spacing-sm) var(--spacing-md)', fontWeight: 'var(--font-weight-bold)', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', gap: 'var(--spacing-md)' }}>
              <span style={{ minWidth: '150px' }}>Timestamp</span>
              <span style={{ flexGrow: 1 }}>Details</span>
              <span style={{ width: '100px', textAlign: 'right' }}>Record ID</span>
            </div>
            {auditLogs?.map(log => (
              <div key={log?.id} className="audit-log-item" style={{ padding: 'var(--spacing-sm) var(--spacing-md)' }}>
                <span className="timestamp">{log?.timestamp}</span>
                <span className="details">
                  <span className="user">{log?.user}</span>: {log?.details}
                </span>
                <span style={{ minWidth: '100px', textAlign: 'right', color: 'var(--color-primary)' }}>
                  {log?.recordId ? (
                    <a href="#" onClick={() => navigate('CLAIM_DETAIL', { id: log?.recordId })} style={{ textDecoration: 'underline' }}>{log?.recordId}</a>
                  ) : 'N/A'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <i className="icon icon-empty empty-state-icon"></i>
            <h3 className="empty-state-title">No Audit Logs</h3>
            <p className="empty-state-description">No system activity has been recorded yet.</p>
          </div>
        )
      ) : (
        <div className="empty-state">
          <i className="icon icon-info empty-state-icon"></i>
          <h3 className="empty-state-title">Access Denied</h3>
          <p className="empty-state-description">You do not have permission to view audit logs.</p>
        </div>
      )}
    </div>
  );

  const UserManagementPage = () => (
    <div className="full-screen-page">
      <div className="page-header">
        <h1 className="page-title">User Management</h1>
        <p className="breadcrumbs">
          <a href="#" onClick={() => navigate('DASHBOARD')}>Home</a>
          <span>/</span>
          <span>User Management</span>
        </p>
        <div className="flex-row justify-between align-center">
          <h4 style={{ margin: 0 }}>System Users</h4>
          {canPerform('manageUsers') && (
             <button className="button button-primary"><i className="icon icon-add"></i> Add New User</button>
          )}
        </div>
      </div>

      {canPerform('manageUsers') ? (
        <div className="grid-3-col">
          {DUMMY_USERS?.map(user => (
            <div key={user?.id} className="card">
              <div className="card-title">{user?.name}</div>
              <p className="card-meta">Email: {user?.email}</p>
              <p className="card-meta">Role: {user?.role}</p>
              <div className="card-actions-hover" style={{opacity: 1, position: 'relative', top: 'auto', right: 'auto', display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--spacing-sm)'}}>
                <button className="button-icon" title="Edit User"><i className="icon icon-edit"></i></button>
                <button className="button-icon" title="Delete User"><i className="icon icon-delete"></i></button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <i className="icon icon-info empty-state-icon"></i>
          <h3 className="empty-state-title">Access Denied</h3>
          <p className="empty-state-description">You do not have permission to manage users.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="app-container">
      {currentUserRole && (
        <header className="header">
          <a href="#" className="header-title" onClick={() => navigate('DASHBOARD')}>Insurance Platform</a>
          <nav className="nav-menu">
            {canAccess('DASHBOARD') && <a href="#" className={`nav-item ${view.screen === 'DASHBOARD' ? 'active' : ''}`} onClick={() => navigate('DASHBOARD')}><i className="icon icon-dashboard"></i> Dashboard</a>}
            {canAccess('CLAIMS_LIST') && <a href="#" className={`nav-item ${['CLAIMS_LIST', 'CLAIM_DETAIL', 'CLAIM_FORM'].includes(view.screen) ? 'active' : ''}`} onClick={() => navigate('CLAIMS_LIST')}><i className="icon icon-claims"></i> Claims</a>}
            {canAccess('POLICIES_LIST') && <a href="#" className={`nav-item ${view.screen === 'POLICIES_LIST' ? 'active' : ''}`} onClick={() => navigate('POLICIES_LIST')}><i className="icon icon-policies"></i> Policies</a>}
            {canAccess('AUDIT_LOGS') && <a href="#" className={`nav-item ${view.screen === 'AUDIT_LOGS' ? 'active' : ''}`} onClick={() => navigate('AUDIT_LOGS')}><i className="icon icon-history"></i> Audit Logs</a>}
            {canAccess('USER_MANAGEMENT') && <a href="#" className={`nav-item ${view.screen === 'USER_MANAGEMENT' ? 'active' : ''}`} onClick={() => navigate('USER_MANAGEMENT')}><i className="icon icon-admin"></i> Admin</a>}
          </nav>
          <div className="user-info">
            <span className="user-role">Welcome, <span style={{fontWeight: 'var(--font-weight-bold)'}}>{DUMMY_USERS.find(u => u.role === currentUserRole)?.name || currentUserRole}</span></span>
            <button className="button button-secondary" onClick={handleLogout}><i className="icon icon-logout"></i> Logout</button>
          </div>
        </header>
      )}

      <main className="main-content">
        {(currentUserRole === null || view.screen === 'LOGIN') && <LoginPage />}
        {currentUserRole && view.screen === 'DASHBOARD' && <DashboardPage />}
        {currentUserRole && view.screen === 'CLAIMS_LIST' && <ClaimsListPage />}
        {currentUserRole && view.screen === 'CLAIM_DETAIL' && <ClaimDetailPage />}
        {currentUserRole && view.screen === 'CLAIM_FORM' && <ClaimFormPage />}
        {currentUserRole && view.screen === 'POLICIES_LIST' && <PoliciesListPage />}
        {currentUserRole && view.screen === 'AUDIT_LOGS' && <AuditLogsPage />}
        {currentUserRole && view.screen === 'USER_MANAGEMENT' && <UserManagementPage />}
      </main>
    </div>
  );
}

export default App;
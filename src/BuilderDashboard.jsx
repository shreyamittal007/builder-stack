import { useState } from 'react';

const BuilderDashboard = ({ jobs, currentBuilder, handleCreateProject, addSupplierToJob, handleApproveRequest, handleDenyRequest }) => {
  const [activeJobId, setActiveJobId] = useState(jobs[0]?.id || '');
  const [showNewJob, setShowNewJob] = useState(false);
  
  const [newJob, setNewJob] = useState({
    jobName: '', startDate: '', endDate: '', totalAmount: ''
  });

  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [newSupplier, setNewSupplier] = useState({
    name: '', type: '', amountAllocated: ''
  });

  // Calculate Global Financial Overview
  const globalCommitted = jobs.reduce((sum, j) => sum + j.suppliers.reduce((sSum, s) => sSum + s.amountAllocated, 0), 0);
  const globalPaid = jobs.reduce((sum, j) => sum + j.suppliers.reduce((sSum, s) => sSum + s.amountPaid, 0), 0);

  // Extract all pending requests
  const pendingRequests = [];
  jobs.forEach(job => {
    job.suppliers.forEach(supplier => {
      supplier.paymentRequests.forEach(req => {
        pendingRequests.push({ job, supplier, req });
      });
    });
  });

  const activeJob = jobs.find(j => j.id === activeJobId);

  const onCreateProject = (e) => {
    e.preventDefault();
    if (!newJob.jobName || !newJob.startDate || !newJob.endDate || !newJob.totalAmount) return;
    handleCreateProject({ ...newJob, totalAmount: Number(newJob.totalAmount) });
    setNewJob({ jobName: '', startDate: '', endDate: '', totalAmount: '' });
    setShowNewJob(false);
  };

  const onAddSupplier = (e) => {
    e.preventDefault();
    if (!newSupplier.name || !newSupplier.type || !newSupplier.amountAllocated) return;
    
    addSupplierToJob(activeJobId, {
      ...newSupplier,
      id: `c_${Date.now()}`,
      supplierId: `sup_${Date.now()}`, // mock
      amountAllocated: Number(newSupplier.amountAllocated),
      amountPaid: 0,
      paymentStatus: 'Pending',
    });
    setNewSupplier({ name: '', type: '', amountAllocated: '' });
    setShowAddSupplier(false);
  };

  const totalAllocated = activeJob ? activeJob.suppliers.reduce((sum, s) => sum + s.amountAllocated, 0) : 0;
  const totalPaid = activeJob ? activeJob.suppliers.reduce((sum, s) => sum + s.amountPaid, 0) : 0;

  return (
    <div className="animate-fade-in delay-100">
      <div className="dashboard-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '1.5rem' }}>
        <div>
          <h2 className="landing-title" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Builder Admin</h2>
          <p className="landing-subtitle" style={{ marginBottom: 0 }}>Review workflows and manage automated math for projects.</p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
          <select 
            style={{ width: '300px' }}
            value={activeJobId} 
            onChange={(e) => setActiveJobId(e.target.value)}
          >
            {jobs.map(j => (
               <option key={j.id} value={j.id}>{j.jobName}</option>
            ))}
          </select>
          <button className="btn-secondary" onClick={() => setShowNewJob(!showNewJob)}>
             {showNewJob ? 'Cancel Creation' : '+ New Project'}
          </button>
        </div>
      </div>

      {showNewJob && (
        <div className="glass-card" style={{ marginBottom: '2rem' }}>
          <h3>Create New Construction Project</h3>
          <form style={{ marginTop: '1rem' }} onSubmit={onCreateProject}>
             <div className="form-row">
                <div className="form-group">
                  <label>Project Name</label>
                  <input type="text" value={newJob.jobName} onChange={e => setNewJob({...newJob, jobName: e.target.value})} required/>
                </div>
                <div className="form-group">
                  <label>Total Budget ($)</label>
                  <input type="number" value={newJob.totalAmount} onChange={e => setNewJob({...newJob, totalAmount: e.target.value})} required/>
                </div>
             </div>
             <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input type="date" value={newJob.startDate} onChange={e => setNewJob({...newJob, startDate: e.target.value})} required/>
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input type="date" value={newJob.endDate} onChange={e => setNewJob({...newJob, endDate: e.target.value})} required/>
                </div>
             </div>
             <button type="submit" className="btn-primary">Initialize Project Environment</button>
          </form>
        </div>
      )}

      {/* Global & Project Financial Overview */}
      <div className="metrics-grid">
         <div className="glass-card metric-card" style={{ background: 'rgba(99, 102, 241, 0.05)' }}>
          <div className="metric-label">All-Time Committed Funds</div>
          <div className="metric-value">${globalCommitted.toLocaleString()}</div>
        </div>
        <div className="glass-card metric-card" style={{ background: 'rgba(16, 185, 129, 0.05)' }}>
          <div className="metric-label">All-Time Payments Made</div>
          <div className="metric-value" style={{color: 'var(--success)'}}>${globalPaid.toLocaleString()}</div>
        </div>
        <div className="glass-card metric-card">
          <div className="metric-label">Current Project Budget</div>
          <div className="metric-value">${activeJob ? activeJob.totalAmount.toLocaleString() : '0'}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
             Start: {activeJob?.startDate} | End: {activeJob?.endDate}
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Suppliers Section (Onboarding) */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
             <h3>{activeJob?.jobName} Contracts</h3>
             <button className="btn-primary" onClick={() => setShowAddSupplier(!showAddSupplier)}>
                {showAddSupplier ? 'Cancel' : '+ Onboard User'}
             </button>
          </div>

          {showAddSupplier && (
            <div style={{ background: 'var(--bg-color)', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
              <form onSubmit={onAddSupplier}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Supplier/Worker Name</label>
                    <input type="text" value={newSupplier.name} onChange={e => setNewSupplier({...newSupplier, name: e.target.value})} placeholder="e.g. Max Power" required/>
                  </div>
                  <div className="form-group">
                    <label>Role</label>
                    <input type="text" value={newSupplier.type} onChange={e => setNewSupplier({...newSupplier, type: e.target.value})} placeholder="e.g. Electrician" required/>
                  </div>
                </div>
                <div className="form-group">
                  <label>Total Contract Value ($)</label>
                  <input type="number" value={newSupplier.amountAllocated} onChange={e => setNewSupplier({...newSupplier, amountAllocated: e.target.value})} placeholder="0.00" required/>
                </div>
                <button type="submit" className="btn-primary" style={{width: '100%'}}>Save Engagement</button>
              </form>
            </div>
          )}

          <div className="data-table-container">
             <table className="data-table">
                <thead>
                  <tr>
                    <th>Worker Info</th>
                    <th>Remaining Bal.</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {activeJob?.suppliers.map(s => (
                    <tr key={s.id}>
                      <td>
                         <div style={{fontWeight: 500, color: 'var(--text-main)'}}>{s.name}</div>
                         <div style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>{s.type}</div>
                      </td>
                      <td>
                         <div style={{ color: 'var(--text-main)' }}>${ (s.amountAllocated - s.amountPaid).toLocaleString() }</div>
                         <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>of ${s.amountAllocated.toLocaleString()}</div>
                      </td>
                      <td>
                         <span className={`status-badge status-${s.paymentStatus.toLowerCase()}`}>
                           {s.paymentStatus}
                         </span>
                      </td>
                    </tr>
                  ))}
                  {(!activeJob || activeJob.suppliers.length === 0) && (
                    <tr>
                      <td colSpan="3" style={{textAlign: 'center', padding: '2rem', color: 'var(--text-muted)'}}>
                        No contractors assigned to this project.
                      </td>
                    </tr>
                  )}
                </tbody>
             </table>
          </div>
        </div>

        {/* Approval System & Audit Trail Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Approval System */}
          <div className="glass-card" style={{ border: pendingRequests.length > 0 ? '1px solid var(--warning)' : undefined }}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
               Approval Notifications
               {pendingRequests.length > 0 && <span style={{ background: 'var(--warning)', color: '#000', padding: '2px 8px', borderRadius: '8px', fontSize: '0.9rem' }}>{pendingRequests.length} Pending</span>}
            </h3>
            
            {pendingRequests.length === 0 ? (
               <p style={{ color: 'var(--text-muted)' }}>✅ No pending payment requests.</p>
            ) : (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {pendingRequests.map((pr, i) => (
                    <div key={i} style={{ background: 'var(--bg-color)', padding: '1rem', borderRadius: '12px' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ fontWeight: '500' }}>{pr.supplier.name}</span>
                          <span style={{ color: 'var(--warning)' }}>${pr.req.amount.toLocaleString()}</span>
                       </div>
                       <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                          <p><strong>Job:</strong> {pr.job.jobName}</p>
                          <p><strong>Note:</strong> {pr.req.notes}</p>
                          {pr.req.proofDoc && <p><strong>Proof:</strong> 📎 <a href="#" style={{ color: 'var(--primary)' }}>{pr.req.proofDoc}</a></p>}
                       </div>
                       <div style={{ display: 'flex', gap: '0.8rem' }}>
                          <button 
                             className="btn-primary" 
                             style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', background: 'var(--success)', boxShadow: 'none' }}
                             onClick={() => handleApproveRequest(pr.job.id, pr.supplier.id, pr.req.id)}
                          >
                             Approve
                          </button>
                          <button 
                             className="btn-secondary" 
                             style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                             onClick={() => handleDenyRequest(pr.job.id, pr.supplier.id, pr.req.id)}
                          >
                             Deny
                          </button>
                       </div>
                    </div>
                  ))}
               </div>
            )}
          </div>

          {/* Real-time Audit Trail for Active Project */}
          <div className="glass-card">
              <h3 style={{ marginBottom: '1.5rem' }}>Project Audit Trail</h3>
              <div style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '1rem' }}>
                {activeJob?.suppliers.flatMap(s => s.historyLog)
                   .sort((a,b) => new Date(b.date) - new Date(a.date)) // Sort newest first
                   .map((log, i) => (
                   <div key={i} style={{ padding: '0.8rem 0', borderBottom: '1px solid var(--surface-border)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{log.date} | {log.actor}</div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{log.action}</div>
                   </div>
                ))}
                {(!activeJob || activeJob.suppliers.length === 0) && (
                   <div style={{ color: 'var(--text-muted)' }}>No historical logs found for this project.</div>
                )}
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuilderDashboard;

import { useState } from 'react';

const BuilderDashboard = ({ jobs, addSupplierToJob, updateJob, updateSupplierPaymentStatus }) => {
  const [activeJobId, setActiveJobId] = useState(jobs[0].id);
  const activeJob = jobs.find(j => j.id === activeJobId);

  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [newSupplier, setNewSupplier] = useState({
    name: '', type: '', amountAllocated: ''
  });

  const handleAddSupplier = (e) => {
    e.preventDefault();
    if (!newSupplier.name || !newSupplier.type || !newSupplier.amountAllocated) return;
    
    addSupplierToJob(activeJobId, {
      ...newSupplier,
      id: `s_${Math.random().toString(36).substr(2, 9)}`,
      amountAllocated: Number(newSupplier.amountAllocated),
      amountPaid: 0,
      paymentStatus: 'Pending',
      paymentRequested: false,
      requestedAmount: 0
    });
    setNewSupplier({ name: '', type: '', amountAllocated: '' });
    setShowAddSupplier(false);
  };

  const handleJobUpdate = (field, value) => {
    updateJob(activeJobId, field, value);
  };

  const paySupplier = (supplierId, amount) => {
    const supplier = activeJob.suppliers.find(s => s.id === supplierId);
    const newPaid = supplier.amountPaid + amount;
    const status = newPaid >= supplier.amountAllocated ? 'Completed' : 'Partial';
    
    updateSupplierPaymentStatus(activeJobId, supplierId, {
      amountPaid: newPaid,
      paymentStatus: status,
      paymentRequested: false, // Clear request after payment
      requestedAmount: 0
    });
  };

  const totalAllocated = activeJob.suppliers.reduce((sum, s) => sum + s.amountAllocated, 0);
  const totalPaid = activeJob.suppliers.reduce((sum, s) => sum + s.amountPaid, 0);

  return (
    <div className="animate-fade-in delay-100">
      <div className="dashboard-header">
        <div>
          <h2 className="landing-title" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Builder Workspace</h2>
          <p className="landing-subtitle" style={{ marginBottom: 0 }}>Manage your projects and contractor payouts natively.</p>
        </div>
        <select 
          style={{ width: 'auto' }}
          value={activeJobId} 
          onChange={(e) => setActiveJobId(e.target.value)}
        >
          {jobs.map(j => (
             <option key={j.id} value={j.id}>Job: {j.id} - In Progress</option>
          ))}
        </select>
      </div>

      <div className="metrics-grid">
        <div className="glass-card metric-card">
          <div className="metric-label">Job Budget</div>
          <div className="metric-value">${activeJob.totalAmount.toLocaleString()}</div>
        </div>
        <div className="glass-card metric-card">
          <div className="metric-label">Total Allocated</div>
          <div className="metric-value" style={{color: totalAllocated > activeJob.totalAmount ? 'var(--secondary)' : 'var(--primary)'}}>
            ${totalAllocated.toLocaleString()}
          </div>
        </div>
        <div className="glass-card metric-card">
          <div className="metric-label">Amount Paid</div>
          <div className="metric-value" style={{color: 'var(--success)'}}>${totalPaid.toLocaleString()}</div>
        </div>
      </div>

      <div className="grid-2">
        {/* Job Details Section */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '1.5rem' }}>Job Details</h3>
          <div className="form-group">
            <label>Overall Duration</label>
            <input 
              type="text" 
              value={activeJob.duration} 
              onChange={(e) => handleJobUpdate('duration', e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label>Total Job Valuation ($)</label>
            <input 
              type="number" 
              value={activeJob.totalAmount} 
              onChange={(e) => handleJobUpdate('totalAmount', Number(e.target.value))} 
            />
          </div>
          <div className="form-group">
            <label>Builder</label>
            <input type="text" value={activeJob.builderName} disabled />
          </div>
        </div>

        {/* Suppliers Section */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3>Suppliers & Contractors ({activeJob.suppliers.length})</h3>
            <button className="btn-primary" onClick={() => setShowAddSupplier(!showAddSupplier)}>
              {showAddSupplier ? 'Cancel' : '+ Onboard Supplier'}
            </button>
          </div>

          {showAddSupplier && (
            <div style={{ background: 'var(--bg-color)', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
              <form onSubmit={handleAddSupplier}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Supplier/Worker Name</label>
                    <input type="text" value={newSupplier.name} onChange={e => setNewSupplier({...newSupplier, name: e.target.value})} placeholder="e.g. Max Power" required/>
                  </div>
                  <div className="form-group">
                    <label>Role / Type</label>
                    <input type="text" value={newSupplier.type} onChange={e => setNewSupplier({...newSupplier, type: e.target.value})} placeholder="e.g. Electrician" required/>
                  </div>
                </div>
                <div className="form-group">
                  <label>Total Contract Amount ($)</label>
                  <input type="number" value={newSupplier.amountAllocated} onChange={e => setNewSupplier({...newSupplier, amountAllocated: e.target.value})} placeholder="0.00" required/>
                </div>
                <button type="submit" className="btn-primary" style={{width: '100%'}}>Save Contractor</button>
              </form>
            </div>
          )}

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Supplier Info</th>
                  <th>Contract ($)</th>
                  <th>Paid ($)</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {activeJob.suppliers.map(s => (
                  <tr key={s.id}>
                    <td>
                      <div style={{fontWeight: 500, color: 'var(--text-main)'}}>{s.name}</div>
                      <div style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>{s.type}</div>
                      {s.paymentRequested && (
                        <div style={{fontSize: '0.75rem', color: 'var(--warning)', marginTop: '4px'}}>
                          Requested: ${s.requestedAmount}
                        </div>
                      )}
                    </td>
                    <td>${s.amountAllocated.toLocaleString()}</td>
                    <td>${s.amountPaid.toLocaleString()}</td>
                    <td>
                      <span className={`status-badge status-${s.paymentStatus.toLowerCase()}`}>
                        {s.paymentStatus}
                      </span>
                    </td>
                    <td>
                      {s.amountPaid < s.amountAllocated ? (
                        <button 
                          className="btn-secondary" 
                          style={{padding: '0.4rem 1rem', fontSize: '0.85rem'}}
                          onClick={() => {
                            const payAmt = s.paymentRequested ? s.requestedAmount : (s.amountAllocated - s.amountPaid);
                            paySupplier(s.id, payAmt);
                          }}
                        >
                          {s.paymentRequested ? `Pay Req $${s.requestedAmount}` : 'Pay Final'}
                        </button>
                      ) : (
                        <span style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>Settled</span>
                      )}
                    </td>
                  </tr>
                ))}
                {activeJob.suppliers.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{textAlign: 'center', padding: '2rem', color: 'var(--text-muted)'}}>
                      No contractors added to this job yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuilderDashboard;

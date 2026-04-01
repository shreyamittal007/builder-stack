import { useState } from 'react';

const SupplierDashboard = ({ jobs, currentSupplier, updateSupplierPaymentStatus }) => {
  const [requestAmounts, setRequestAmounts] = useState({});

  // Get all assignments for the current supplier across all jobs
  // For demo, we assume the supplier name matches exactly, or they log in as 'ElectroPro Inc'
  // But let's build a mock selector to "Login as" for demonstration
  const [viewSupplierName, setViewSupplierName] = useState('ElectroPro Inc');
  
  // All unique suppliers existing in system
  const allSuppliers = [...new Set(jobs.flatMap(j => j.suppliers.map(s => s.name)))];

  const myAssignments = jobs.flatMap(job => {
    const supplier = job.suppliers.find(s => s.name === viewSupplierName);
    if (!supplier) return [];
    return [{
      jobId: job.id,
      builderName: job.builderName,
      status: job.status,
      duration: job.duration,
      contract: supplier
    }];
  });

  const handleRequestPayment = (jobId, supplierId, amount) => {
    if (!amount || amount <= 0) return;
    
    updateSupplierPaymentStatus(jobId, supplierId, {
      paymentRequested: true,
      requestedAmount: Number(amount)
    });
    
    setRequestAmounts({ ...requestAmounts, [supplierId]: '' });
  };

  const totalContractValue = myAssignments.reduce((acc, curr) => acc + curr.contract.amountAllocated, 0);
  const totalReceived = myAssignments.reduce((acc, curr) => acc + curr.contract.amountPaid, 0);
  const totalPending = totalContractValue - totalReceived;

  return (
    <div className="animate-fade-in delay-100">
      <div className="dashboard-header" style={{ alignItems: 'flex-start', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <h2 className="landing-title" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Supplier Portal</h2>
          <p className="landing-subtitle" style={{ marginBottom: '1rem' }}>Track jobs and request payouts from your builders.</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Viewing As:</span>
          <select 
            value={viewSupplierName} 
            onChange={e => setViewSupplierName(e.target.value)}
            style={{ width: 'auto', padding: '0.5rem 1rem' }}
          >
            {allSuppliers.map((name, i) => (
              <option key={i} value={name}>{name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="glass-card metric-card">
          <div className="metric-label">Total Contract Value</div>
          <div className="metric-value">${totalContractValue.toLocaleString()}</div>
        </div>
        <div className="glass-card metric-card">
          <div className="metric-label">Pending Receivable</div>
          <div className="metric-value" style={{color: totalPending > 0 ? 'var(--warning)' : 'inherit'}}>
            ${totalPending.toLocaleString()}
          </div>
        </div>
        <div className="glass-card metric-card">
          <div className="metric-label">Received to Date</div>
          <div className="metric-value" style={{color: 'var(--success)'}}>${totalReceived.toLocaleString()}</div>
        </div>
      </div>

      <div className="glass-card" style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Active Contracts & Builders</h3>
        
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Builder / Job</th>
                <th>Contract Status</th>
                <th>Contract Amount</th>
                <th>Paid Amount</th>
                <th>Payment Status</th>
                <th>Action - Request Pay</th>
              </tr>
            </thead>
            <tbody>
              {myAssignments.length > 0 ? myAssignments.map(assignment => (
                <tr key={`${assignment.jobId}-${assignment.contract.id}`}>
                  <td>
                    <div style={{fontWeight: 500, color: 'var(--text-main)'}}>{assignment.builderName}</div>
                    <div style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>Job ID: {assignment.jobId} - {assignment.duration}</div>
                  </td>
                  <td>
                    <span style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>{assignment.status}</span>
                  </td>
                  <td>${assignment.contract.amountAllocated.toLocaleString()}</td>
                  <td>${assignment.contract.amountPaid.toLocaleString()}</td>
                  <td>
                    <span className={`status-badge status-${assignment.contract.paymentStatus.toLowerCase()}`}>
                      {assignment.contract.paymentStatus}
                    </span>
                  </td>
                  <td>
                    {assignment.contract.amountPaid < assignment.contract.amountAllocated ? (
                      assignment.contract.paymentRequested ? (
                         <div style={{ fontSize: '0.85rem', color: 'var(--warning)' }}>
                           Requested ${assignment.contract.requestedAmount}
                         </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <input 
                            type="number" 
                            placeholder="Amt"
                            style={{ width: '80px', padding: '0.4rem', border: '1px solid var(--surface-border)' }}
                            value={requestAmounts[assignment.contract.id] || ''}
                            onChange={(e) => setRequestAmounts({
                              ...requestAmounts,
                              [assignment.contract.id]: e.target.value
                            })}
                          />
                          <button 
                            className="btn-primary" 
                            style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                            onClick={() => handleRequestPayment(assignment.jobId, assignment.contract.id, requestAmounts[assignment.contract.id])}
                          >
                            Request
                          </button>
                        </div>
                      )
                    ) : (
                      <span style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>Fully Paid</span>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" style={{textAlign: 'center', padding: '2rem', color: 'var(--text-muted)'}}>
                    No active assignments found for this profile.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SupplierDashboard;

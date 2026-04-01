import { useState } from 'react';

const SupplierDashboard = ({ jobs, handleCreatePaymentRequest }) => {
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
      duration: `${job.startDate} to ${job.endDate}`,
      jobName: job.jobName,
      contract: supplier
    }];
  });

  const totalContractValue = myAssignments.reduce((acc, curr) => acc + curr.contract.amountAllocated, 0);
  const totalReceived = myAssignments.reduce((acc, curr) => acc + curr.contract.amountPaid, 0);
  const totalPending = totalContractValue - totalReceived;

  // Local state for request forms per assignment
  const [forms, setForms] = useState({});

  const updateForm = (contractId, field, value) => {
     setForms({
       ...forms,
       [contractId]: {
         ...forms[contractId],
         [field]: value
       }
     });
  };

  const submitRequest = (jobId, contractId) => {
     const formData = forms[contractId] || {};
     if (!formData.amount || formData.amount <= 0) return;
     
     handleCreatePaymentRequest(jobId, contractId, {
        amount: Number(formData.amount),
        type: formData.type || 'Part',
        notes: formData.notes || '',
        proofDoc: formData.proofDoc || null
     }, viewSupplierName);

     setForms({ ...forms, [contractId]: { amount: '', type: 'Part', notes: '', proofDoc: null } });
  };

  return (
    <div className="animate-fade-in delay-100">
      <div className="dashboard-header" style={{ alignItems: 'flex-start', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <h2 className="landing-title" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Supplier / Contractor</h2>
          <p className="landing-subtitle" style={{ marginBottom: '1rem' }}>Builder Directory and Invoicing Tracker.</p>
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
          <div className="metric-label">Directory Value ($)</div>
          <div className="metric-value">${totalContractValue.toLocaleString()}</div>
        </div>
        <div className="glass-card metric-card">
          <div className="metric-label">Remaining Balance</div>
          <div className="metric-value" style={{color: totalPending > 0 ? 'var(--warning)' : 'inherit'}}>
            ${totalPending.toLocaleString()}
          </div>
        </div>
        <div className="glass-card metric-card">
          <div className="metric-label">Paid to Date</div>
          <div className="metric-value" style={{color: 'var(--success)'}}>${totalReceived.toLocaleString()}</div>
        </div>
      </div>

      <div className="glass-card" style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Builder Directory & Project Tracking</h3>
        
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Builder / Project</th>
                <th>Financials</th>
                <th>Status Tracker</th>
                <th>Request Payment Module</th>
              </tr>
            </thead>
            <tbody>
              {myAssignments.length > 0 ? myAssignments.map(assignment => {
                 const remaining = assignment.contract.amountAllocated - assignment.contract.amountPaid;
                 const pct = Math.round((assignment.contract.amountPaid / assignment.contract.amountAllocated) * 100);
                 const pendingReqs = assignment.contract.paymentRequests.filter(r => r.status === 'Pending');
                 
                 return (
                 <tr key={`${assignment.jobId}-${assignment.contract.id}`}>
                  <td>
                    <div style={{fontWeight: 500, color: 'var(--text-main)', fontSize: '1.1rem'}}>{assignment.builderName}</div>
                    <div style={{color: 'var(--text-main)', marginTop: '0.2rem'}}>{assignment.jobName}</div>
                    <div style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>Role: {assignment.contract.type}</div>
                    <div style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>{assignment.duration}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Contract: <strong style={{color: 'var(--text-main)'}}>${assignment.contract.amountAllocated.toLocaleString()}</strong></span>
                      <span style={{ fontSize: '0.9rem', color: 'var(--success)' }}>Paid: <strong>${assignment.contract.amountPaid.toLocaleString()}</strong></span>
                      <span style={{ fontSize: '0.9rem', color: 'var(--warning)' }}>Bal: <strong>${remaining.toLocaleString()}</strong></span>
                    </div>
                  </td>
                  <td>
                    {/* Visual Progress Bar */}
                    <div style={{ width: '150px', background: 'var(--surface-border)', height: '8px', borderRadius: '4px', marginBottom: '0.5rem', overflow: 'hidden' }}>
                       <div style={{ width: `${pct}%`, background: 'var(--success)', height: '100%' }}></div>
                    </div>
                    <span className={`status-badge status-${assignment.contract.paymentStatus.toLowerCase()}`}>
                      {pct}% {assignment.contract.paymentStatus}
                    </span>
                    {pendingReqs.length > 0 && (
                       <div style={{ marginTop: '0.8rem', fontSize: '0.8rem', color: 'var(--warning)' }}>
                          ⏳ {pendingReqs.length} pending requests
                       </div>
                    )}
                  </td>
                  <td>
                    {remaining > 0 ? (
                      <div style={{ background: 'var(--bg-color)', padding: '1rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.8rem', width: '320px' }}>
                         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                            <select 
                               style={{ padding: '0.5rem' }} 
                               value={forms[assignment.contract.id]?.type || 'Part'}
                               onChange={e => updateForm(assignment.contract.id, 'type', e.target.value)}
                            >
                               <option value="Part">Part Payment</option>
                               <option value="Full">Full Payment</option>
                            </select>
                            <input 
                               type="number" 
                               placeholder="Amt ($)" 
                               style={{ padding: '0.5rem' }}
                               value={forms[assignment.contract.id]?.amount || ''}
                               onChange={e => updateForm(assignment.contract.id, 'amount', e.target.value)}
                            />
                         </div>
                         <input 
                             type="text" 
                             placeholder="Notes (e.g., Placed dry wall)" 
                             style={{ padding: '0.5rem', width: '100%' }}
                             value={forms[assignment.contract.id]?.notes || ''}
                             onChange={e => updateForm(assignment.contract.id, 'notes', e.target.value)}
                         />
                         <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <button className="btn-secondary" style={{ padding: '0.5rem', fontSize: '0.8rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                               📎 Attach Proof
                               <input 
                                   type="file" 
                                   style={{ opacity: 0, position: 'absolute', width: '10px' }} 
                                   onChange={e => updateForm(assignment.contract.id, 'proofDoc', e.target.files[0]?.name)}
                               />
                            </button>
                            <button 
                               className="btn-primary" 
                               style={{ padding: '0.5rem 1rem', width: '100%' }}
                               onClick={() => submitRequest(assignment.jobId, assignment.contract.id)}
                            >
                               Submit Request
                            </button>
                         </div>
                         {forms[assignment.contract.id]?.proofDoc && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>File: {forms[assignment.contract.id].proofDoc} ready.</div>
                         )}
                      </div>
                    ) : (
                      <span style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>Contract Fully Settled</span>
                    )}
                  </td>
                </tr>
              )}) : (
                <tr>
                  <td colSpan="4" style={{textAlign: 'center', padding: '2rem', color: 'var(--text-muted)'}}>
                    No active assignments found for this profile.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Supplier Personal Audit Trail */}
      <div className="glass-card" style={{ marginTop: '2rem' }}>
         <h3 style={{ marginBottom: '1.5rem' }}>Personal History Log</h3>
         <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {myAssignments.flatMap(a => a.contract.historyLog.map(l => ({...l, job: a.jobName})))
               .sort((a,b) => new Date(b.date) - new Date(a.date)) // newest first
               .map((log, i) => (
               <div key={i} style={{ padding: '0.8rem 0', borderBottom: '1px solid var(--surface-border)', display: 'grid', gridTemplateColumns: '150px 1fr 200px' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{log.date}</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}><strong>{log.job}</strong> - {log.action}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'right' }}>Actor: {log.actor}</div>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default SupplierDashboard;

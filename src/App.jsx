import { useState } from 'react';
import './App.css';
import BuilderDashboard from './BuilderDashboard';
import SupplierDashboard from './SupplierDashboard';

function App() {
  const [viewMode, setViewMode] = useState('landing'); // 'landing', 'builder', 'supplier'
  
  // Shared State Mock with robust Data Model
  const [jobs, setJobs] = useState([
    {
      id: 'j1',
      builderId: 'b1',
      builderName: 'Acme Builders',
      jobName: 'Downtown Highrise Phase 1',
      startDate: '2026-05-01',
      endDate: '2026-11-01',
      totalAmount: 150000,
      status: 'In Progress',
      suppliers: [
        {
          id: 'c1', // Contract ID
          supplierId: 'sup1',
          name: 'John Doe Plumbing',
          type: 'Plumber',
          amountAllocated: 25000,
          amountPaid: 10000,
          paymentStatus: 'Partial',
          paymentRequests: [],
          historyLog: [
            { id: 'h1', date: new Date(Date.now() - 86400000 * 5).toLocaleString(), action: 'Contract Initiated - $25,000', actor: 'Acme Builders' },
            { id: 'h2', date: new Date(Date.now() - 86400000 * 2).toLocaleString(), action: 'Requested $10,000 Milestone 1', actor: 'John Doe Plumbing' },
            { id: 'h3', date: new Date(Date.now() - 86400000 * 1).toLocaleString(), action: 'Approved & Paid $10,000', actor: 'Acme Builders' }
          ]
        },
        {
          id: 'c2',
          supplierId: 'sup2',
          name: 'ElectroPro Inc',
          type: 'Electrician',
          amountAllocated: 30000,
          amountPaid: 0,
          paymentStatus: 'Pending',
          paymentRequests: [
            {
              id: 'req1',
              amount: 5000,
              type: 'Part',
              status: 'Pending',
              notes: 'Finished rough-in wiring.',
              proofDoc: 'wiring_proof.pdf',
              date: new Date().toLocaleString()
            }
          ],
          historyLog: [
             { id: 'h4', date: new Date(Date.now() - 86400000 * 3).toLocaleString(), action: 'Contract Initiated - $30,000', actor: 'Acme Builders' },
             { id: 'h5', date: new Date().toLocaleString(), action: 'Requested $5,000 Part Payment', actor: 'ElectroPro Inc' }
          ]
        }
      ]
    }
  ]);

  const [currentBuilder] = useState('Acme Builders');

  // --- BUILDER ACTIONS ---
  const handleCreateProject = (newJob) => {
    setJobs([{...newJob, id: `j_${Date.now()}`, builderName: currentBuilder, status: 'In Progress', suppliers: []}, ...jobs]);
  };

  const addSupplierToJob = (jobId, newSupplier) => {
    setJobs(jobs.map(job => {
      if (job.id === jobId) {
        return { 
          ...job, 
          suppliers: [...job.suppliers, {
            ...newSupplier,
            paymentRequests: [],
            historyLog: [{ id: `h_${Date.now()}`, date: new Date().toLocaleString(), action: `Contract Initiated - $${newSupplier.amountAllocated}`, actor: currentBuilder }]
          }] 
        };
      }
      return job;
    }));
  };

  const handleApproveRequest = (jobId, contractId, reqId) => {
    setJobs(jobs.map(job => {
      if (job.id === jobId) {
        return {
          ...job,
          suppliers: job.suppliers.map(s => {
            if (s.id === contractId) {
              const req = s.paymentRequests.find(r => r.id === reqId);
              const newAmountPaid = s.amountPaid + req.amount;
              const newStatus = newAmountPaid >= s.amountAllocated ? 'Completed' : 'Partial';
              
              return {
                ...s,
                amountPaid: newAmountPaid,
                paymentStatus: newStatus,
                paymentRequests: s.paymentRequests.filter(r => r.id !== reqId),
                historyLog: [...s.historyLog, { id: `h_${Date.now()}`, date: new Date().toLocaleString(), action: `Approved & Paid $${req.amount.toLocaleString()}`, actor: currentBuilder }]
              };
            }
            return s;
          })
        };
      }
      return job;
    }));
  };

  const handleDenyRequest = (jobId, contractId, reqId) => {
    setJobs(jobs.map(job => {
      if (job.id === jobId) {
         return {
          ...job,
          suppliers: job.suppliers.map(s => {
            if (s.id === contractId) {
              const req = s.paymentRequests.find(r => r.id === reqId);
              return {
                ...s,
                paymentRequests: s.paymentRequests.filter(r => r.id !== reqId),
                historyLog: [...s.historyLog, { id: `h_${Date.now()}`, date: new Date().toLocaleString(), action: `Denied Request for $${req.amount.toLocaleString()}`, actor: currentBuilder }]
              };
            }
            return s;
          })
        };
      }
      return job;
    }));
  };

  // --- SUPPLIER ACTIONS ---
  const handleCreatePaymentRequest = (jobId, contractId, requestDetails, actorName) => {
     setJobs(jobs.map(job => {
      if (job.id === jobId) {
         return {
          ...job,
          suppliers: job.suppliers.map(s => {
            if (s.id === contractId) {
              const newReq = { ...requestDetails, id: `req_${Date.now()}`, status: 'Pending', date: new Date().toLocaleString() };
              return {
                ...s,
                paymentRequests: [...s.paymentRequests, newReq],
                historyLog: [...s.historyLog, { id: `h_${Date.now()}`, date: new Date().toLocaleString(), action: `Requested $${requestDetails.amount.toLocaleString()} ${requestDetails.type} Payment`, actor: actorName }]
              };
            }
            return s;
          })
        };
      }
      return job;
    }));
  };

  return (
    <div className="app-container">
      <header className="header animate-fade-in">
        <div className="logo-main" onClick={() => setViewMode('landing')} style={{cursor: 'pointer'}}>
          BuilderStack.
        </div>
        <nav className="nav-actions">
          {viewMode !== 'landing' && (
            <button className="btn-secondary" onClick={() => setViewMode('landing')}>
              Switch Role
            </button>
          )}
        </nav>
      </header>

      <main>
        {viewMode === 'landing' && (
          <div className="landing-hero animate-fade-in delay-100">
            <h1 className="landing-title">Connect. Build. Pay.</h1>
            <p className="landing-subtitle">
              The modern operating system for construction professionals. Seamlessly manage projects, contractors, workflows, and automated payments.
            </p>
            
            <div className="role-cards">
              <div className="glass-card role-card" onClick={() => setViewMode('builder')}>
                <div className="role-icon">🏗️</div>
                <h3 className="role-title">I am a Builder</h3>
                <p style={{color: 'var(--text-muted)'}}>Manage projects, audit contractor activity, and approve real-time payout requests.</p>
              </div>

              <div className="glass-card role-card delay-200" onClick={() => setViewMode('supplier')}>
                <div className="role-icon">🔧</div>
                <h3 className="role-title">I am a Supplier</h3>
                <p style={{color: 'var(--text-muted)'}}>Directory of Builders, milestone proof document uploads, and automated invoicing.</p>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'builder' && (
          <BuilderDashboard 
            jobs={jobs} 
            currentBuilder={currentBuilder}
            handleCreateProject={handleCreateProject}
            addSupplierToJob={addSupplierToJob} 
            handleApproveRequest={handleApproveRequest}
            handleDenyRequest={handleDenyRequest}
          />
        )}

        {viewMode === 'supplier' && (
           <SupplierDashboard 
            jobs={jobs} 
            handleCreatePaymentRequest={handleCreatePaymentRequest}
          />
        )}
      </main>
    </div>
  );
}

export default App;

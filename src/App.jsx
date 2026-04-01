import { useState } from 'react';
import './App.css';
import BuilderDashboard from './BuilderDashboard';
import SupplierDashboard from './SupplierDashboard';

function App() {
  const [viewMode, setViewMode] = useState('landing'); // 'landing', 'builder', 'supplier'
  
  // Shared State Mock
  const [jobs, setJobs] = useState([
    {
      id: 'j1',
      builderName: 'Acme Builders',
      duration: '6 Months',
      totalAmount: 150000,
      status: 'In Progress',
      suppliers: [
        {
          id: 's1',
          name: 'John Doe Plumbing',
          type: 'Plumber',
          amountAllocated: 25000,
          amountPaid: 10000,
          paymentStatus: 'Partial', // Pending, Partial, Completed
          paymentRequested: false,
          requestedAmount: 0
        },
        {
          id: 's2',
          name: 'ElectroPro Inc',
          type: 'Electrician',
          amountAllocated: 30000,
          amountPaid: 0,
          paymentStatus: 'Pending',
          paymentRequested: true,
          requestedAmount: 5000
        }
      ]
    }
  ]);

  const [currentSupplier] = useState('John Doe Plumbing');

  const addSupplierToJob = (jobId, newSupplier) => {
    setJobs(jobs.map(job => {
      if (job.id === jobId) {
        return { ...job, suppliers: [...job.suppliers, newSupplier] };
      }
      return job;
    }));
  };

  const updateJob = (jobId, field, value) => {
    setJobs(jobs.map(job => job.id === jobId ? { ...job, [field]: value } : job));
  };

  const updateSupplierPaymentStatus = (jobId, supplierId, updates) => {
    setJobs(jobs.map(job => {
      if (job.id === jobId) {
        const updatedSuppliers = job.suppliers.map(s => 
          s.id === supplierId ? { ...s, ...updates } : s
        );
        return { ...job, suppliers: updatedSuppliers };
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
              The modern operating system for construction professionals. Seamlessly manage projects, contractors, and payments all in one place.
            </p>
            
            <div className="role-cards">
              <div className="glass-card role-card" onClick={() => setViewMode('builder')}>
                <div className="role-icon">🏗️</div>
                <h3 className="role-title">I am a Builder</h3>
                <p style={{color: 'var(--text-muted)'}}>Onboard contractors, track job duration, and manage payouts.</p>
              </div>

              <div className="glass-card role-card delay-200" onClick={() => setViewMode('supplier')}>
                <div className="role-icon">🔧</div>
                <h3 className="role-title">I am a Supplier</h3>
                <p style={{color: 'var(--text-muted)'}}>View active jobs, request payments, and track history.</p>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'builder' && (
          <BuilderDashboard 
            jobs={jobs} 
            addSupplierToJob={addSupplierToJob} 
            updateJob={updateJob}
            updateSupplierPaymentStatus={updateSupplierPaymentStatus}
          />
        )}

        {viewMode === 'supplier' && (
          <SupplierDashboard 
            jobs={jobs} 
            currentSupplier={currentSupplier}
            updateSupplierPaymentStatus={updateSupplierPaymentStatus}
          />
        )}
      </main>
    </div>
  );
}

export default App;

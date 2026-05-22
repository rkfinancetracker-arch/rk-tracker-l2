import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import SubjectForm from '../components/SubjectForm';
import { ArrowLeft } from 'lucide-react';

export default function SubjectPage() {
  const { subjectName } = useParams();
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main className="app-container" style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column' }}>
        <button 
          onClick={() => navigate('/dashboard')} 
          className="btn btn-outline"
          style={{ alignSelf: 'flex-start', marginBottom: '1.5rem' }}
        >
          <ArrowLeft size={18} /> Back to Dashboard
        </button>
        <SubjectForm subjectName={subjectName} />
      </main>
    </div>
  );
}

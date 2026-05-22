import React, { useState, useEffect } from 'react';
import { SUBJECTS, getChapters, getQuestions } from '../config/constants';
import { LayoutDashboard, CheckCircle2, CircleDashed, User } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export default function DashboardSummary() {
  const [stats, setStats] = useState({ totalCompleted: 0, totalPending: 0, subjects: {} });
  const [details] = useLocalStorage('generalDetails', { fullName: '', uniqueId: '', mobile: '', exam: '' });

  const calculateStats = () => {
    let completed = 0;
    let pending = 0;
    const subs = {};

    SUBJECTS.forEach(sub => {
      let subCompleted = 0;
      let subPending = 0;
      const chapters = getChapters(sub);

      chapters.forEach(ch => {
        const storageKey = `trackpro_${sub}_${ch.replace(/\s+/g, '')}`;
        const data = window.localStorage.getItem(storageKey);
        const questions = getQuestions(sub, ch);
        
        let isChapterDone = false;
        if (data && questions.length > 0) {
          try {
            const parsed = JSON.parse(data);
            isChapterDone = questions.every(q => parsed[q.id] && parsed[q.id] !== '');
          } catch (e) {
            console.warn(e);
          }
        }

        if (isChapterDone) {
          completed++;
          subCompleted++;
        } else {
          pending++;
          subPending++;
        }
      });

      subs[sub] = { completed: subCompleted, total: chapters.length };
    });

    setStats({ totalCompleted: completed, totalPending: pending, subjects: subs });
  };

  useEffect(() => {
    calculateStats();
    window.addEventListener("local-storage", calculateStats);
    window.addEventListener("storage", calculateStats);
    return () => {
      window.removeEventListener("local-storage", calculateStats);
      window.removeEventListener("storage", calculateStats);
    };
  }, []);

  const totalChapters = stats.totalCompleted + stats.totalPending;
  const overallPercentage = totalChapters > 0 ? Math.round((stats.totalCompleted / totalChapters) * 100) : 0;

  return (
    <div className="glass-card mb-6" id="dashboard-summary">
      <div className="flex items-center gap-2 mb-4 border-b pb-2" style={{ borderBottom: '1px solid var(--card-border)' }}>
        <LayoutDashboard size={24} color="var(--accent-primary)" />
        <h2>Progress Summary</h2>
      </div>

      <div className="flex flex-col gap-4">
        {(details.fullName || details.uniqueId) && (
           <div style={{ padding: '1rem', border: '1px solid var(--card-border)', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)', marginBottom: '0.5rem' }}>
             <div className="flex items-center gap-2 mb-2">
               <User size={18} color="var(--accent-primary)" />
               <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{details.fullName || "Unnamed Student"}</h3>
             </div>
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
               <div><strong>ID:</strong> {details.uniqueId || "N/A"}</div>
               <div><strong>Mobile:</strong> {details.mobile || "N/A"}</div>
               <div><strong>Exam:</strong> {details.exam || "N/A"}</div>
             </div>
           </div>
        )}
        
        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px' }}>
          <div className="flex justify-between items-center mb-2">
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Overall Progress</h3>
            <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-primary)' }}>{overallPercentage}%</span>
          </div>
          <div className="progress-container mb-2">
            <div className={`progress-bar ${overallPercentage === 100 ? 'complete' : ''}`} style={{ width: `${overallPercentage}%` }}></div>
          </div>
          <div className="flex justify-between text-sm" style={{ color: 'var(--text-muted)' }}>
            <span className="flex items-center gap-1"><CheckCircle2 size={16} color="var(--success)"/> {stats.totalCompleted} Completed</span>
            <span className="flex items-center gap-1"><CircleDashed size={16} /> {stats.totalPending} Pending</span>
          </div>
        </div>

        <div className="grid mt-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {SUBJECTS.map(sub => {
            const sStats = stats.subjects[sub];
            if (!sStats) return null;
            const pct = sStats.total > 0 ? Math.round((sStats.completed / sStats.total) * 100) : 0;
            return (
              <div key={sub} style={{ padding: '0.8rem', border: '1px solid var(--card-border)', borderRadius: '8px' }}>
                <div className="flex justify-between items-center mb-2">
                  <span style={{ fontWeight: 600 }}>{sub}</span>
                  <span style={{ fontSize: '0.9rem', color: pct === 100 ? 'var(--success)' : 'var(--text-secondary)' }}>{sStats.completed}/{sStats.total}</span>
                </div>
                <div className="progress-container" style={{ height: '6px' }}>
                  <div className={`progress-bar ${pct === 100 ? 'complete' : ''}`} style={{ width: `${pct}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

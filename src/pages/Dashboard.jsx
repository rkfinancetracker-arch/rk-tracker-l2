import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import TalkWithSirButton from '../components/TalkWithSirButton';
import { SUBJECTS, getChapters, getQuestions } from '../config/constants';
import { BookOpen, ChevronRight, User, CheckCircle2, X } from 'lucide-react';
import subjectFullName from '../config/Subject';

function useChapterStats() {
  const [stats, setStats] = useState({});

  const calculate = () => {
    const result = {};
    SUBJECTS.forEach(sub => {
      const chapters = getChapters(sub);
      let filled = 0;
      chapters.forEach(ch => {
        const key = `trackpro_${sub}_${ch.replace(/\s+/g, '')}`;
        const raw = window.localStorage.getItem(key);
        const qs = getQuestions(sub, ch);
        if (raw && qs.length > 0) {
          try {
            const parsed = JSON.parse(raw);
            if (qs.every(q => parsed[q.id] && parsed[q.id] !== '')) filled++;
          } catch {}
        }
      });
      result[sub] = { filled, total: chapters.length };
    });
    setStats(result);
  };

  useEffect(() => {
    calculate();
    window.addEventListener('local-storage', calculate);
    window.addEventListener('storage', calculate);
    return () => {
      window.removeEventListener('local-storage', calculate);
      window.removeEventListener('storage', calculate);
    };
  }, []);

  return stats;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const chapterStats = useChapterStats();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [completedInClass, setCompletedInClass] = useState([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('completedInClass')) || [];
      setCompletedInClass(saved);
    } catch {
      setCompletedInClass([]);
    }
  }, []);

  const toggleCompletedSubject = (subject) => {
    let updated = [];

    if (completedInClass.includes(subject)) {
      updated = completedInClass.filter(item => item !== subject);
    } else {
      updated = [...completedInClass, subject];
    }

    setCompletedInClass(updated);
    localStorage.setItem('completedInClass', JSON.stringify(updated));
    window.dispatchEvent(new Event('local-storage'));
  };

  const resetAllForms = () => {
    if (window.confirm("WARNING: This will delete ALL progress, including general details and all subjects. Are you sure you want to proceed?")) {
      window.localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main
        className="app-container"
        style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column' }}
      >
        <div className="flex justify-between items-center mb-6" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.8rem', color: 'var(--text-primary)' }}>L2 Student Tracker Dashboard</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Track your academic progress across all subjects</p>
          </div>
          <button
            className="btn btn-danger"
            onClick={resetAllForms}
            title="Reset Everything"
          >
            Reset All Data
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            maxWidth: '800px',
            margin: '0 auto',
            width: '100%'
          }}
        >
          <div className="glass-card">
            <div className="flex items-center gap-2 mb-4 border-b pb-2" style={{ borderBottom: '1px solid var(--card-border)' }}>
              <User size={20} color="var(--accent-primary)" />
              <h3 style={{ margin: 0 }}>Student Profile</h3>
            </div>
            <button
              className="btn btn-outline"
              style={{
                width: '100%',
                padding: '1.2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '1.1rem',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--card-border)',
                borderRadius: 'var(--radius-md)'
              }}
              onClick={() => navigate('/details')}
            >
              Edit General Details
              <ChevronRight size={18} color="var(--accent-primary)" />
            </button>
          </div>

          {/* New Section After Student Profile */}
          <div className="glass-card">
            <div className="flex items-center gap-2 mb-4 border-b pb-2" style={{ borderBottom: '1px solid var(--card-border)' }}>
              <CheckCircle2 size={20} color="var(--accent-primary)" />
              <h3 style={{ margin: 0 }}>Completed in Class</h3>
            </div>

            <button
              className="btn btn-outline"
              style={{
                width: '100%',
                padding: '1.2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '1.05rem',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--card-border)',
                borderRadius: 'var(--radius-md)'
              }}
              onClick={() => setIsModalOpen(true)}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.35rem' }}>
                <span>Subject completed in the class since you have</span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {completedInClass.length > 0
                    ? `${completedInClass.length} subject${completedInClass.length > 1 ? 's' : ''} selected`
                    : 'No subjects selected'}
                </span>
              </div>
              <ChevronRight size={18} color="var(--accent-primary)" />
            </button>

            {completedInClass.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.6rem',
                  marginTop: '1rem'
                }}
              >
                {completedInClass.map((subject) => (
                  <span
                    key={subject}
                    style={{
                      padding: '0.45rem 0.8rem',
                      borderRadius: '999px',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--card-border)',
                      fontSize: '0.85rem',
                      color: 'var(--text-primary)'
                    }}
                  >
                    {subjectFullName[subject]}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="glass-card mb-6">
            <div className="flex items-center gap-2 mb-4 border-b pb-2" style={{ borderBottom: '1px solid var(--card-border)' }}>
              <BookOpen size={20} color="var(--accent-primary)" />
              <h3 style={{ margin: 0 }}>Subject</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              {SUBJECTS.map(subject => {
                const s = chapterStats[subject];
                const filled = s ? s.filled : 0;
                const total = s ? s.total : 0;
                const allDone = total > 0 && filled === total;

                return (
                  <button
                    key={subject}
                    className="btn btn-outline"
                    style={{
                      padding: '1rem 1.2rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '1.05rem',
                      backgroundColor: 'var(--bg-secondary)',
                      border: allDone ? '1px solid var(--success)' : '1px solid var(--card-border)',
                      borderRadius: 'var(--radius-md)',
                    }}
                    onClick={() => navigate(`/subject/${encodeURIComponent(subject)}`)}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.25rem' }}>
                      <span>{subjectFullName[subject]}</span>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: allDone ? 'var(--success)' : 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                        }}
                      >
                        {allDone && <CheckCircle2 size={12} />}
                        {filled}/{total} chapters filled
                      </span>
                    </div>
                    <ChevronRight size={18} color={allDone ? 'var(--success)' : 'var(--accent-primary)'} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <TalkWithSirButton />

        {isModalOpen && (
          <div
            onClick={() => setIsModalOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.55)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 9999,
              padding: '1rem'
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '650px',
                maxHeight: '85vh',
                overflowY: 'auto',
                background: 'var(--bg-primary)',
                border: '1px solid var(--card-border)',
                borderRadius: '20px',
                padding: '1.5rem',
                boxShadow: '0 20px 60px rgba(0,0,0,0.25)'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem'
                }}
              >
                <div>
                  <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Completed in Class</h3>
                  <p style={{ margin: '0.35rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                   Subject completed in the class since you have
                  </p>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <X size={22} />
                </button>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '0.9rem',
                  marginTop: '1rem'
                }}
              >
                {SUBJECTS.map((subject) => {
                  const isSelected = completedInClass.includes(subject);

                  return (
                    <button
                      key={subject}
                      type="button"
                      onClick={() => toggleCompletedSubject(subject)}
                      style={{
                        padding: '1rem',
                        borderRadius: '16px',
                        border: isSelected
                          ? '1.5px solid var(--accent-primary)'
                          : '1px solid var(--card-border)',
                        background: isSelected ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-secondary)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '0.8rem'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {subjectFullName[subject]}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {subject}
                        </span>
                      </div>

                      <div
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          border: isSelected
                            ? '6px solid var(--accent-primary)'
                            : '2px solid var(--card-border)',
                          backgroundColor: isSelected ? 'transparent' : 'transparent',
                          flexShrink: 0
                        }}
                      />
                    </button>
                  );
                })}
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginTop: '1.5rem'
                }}
              >
                <button
                  className="btn btn-outline"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '0.9rem 1.4rem',
                    borderRadius: '12px'
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
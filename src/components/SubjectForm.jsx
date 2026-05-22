import React, { useEffect, useState } from 'react';
import { getChapters } from '../config/constants';
import ChapterAccordion from './ChapterAccordion';
import { BookOpen, RefreshCw } from 'lucide-react';
import PQBTOTAL from '../config/PQB';
import { useNavigate } from 'react-router-dom';

export default function SubjectForm({ subjectName }) {
  const chapters = getChapters(subjectName);
  const premiumQBKey = `trackpro_${subjectName}_premiumQuestionBank`;
  const forthis = PQBTOTAL[subjectName] ;
  const navigate = useNavigate();
 
  const keys = Object.keys(PQBTOTAL);

const nextSubject =
  keys.indexOf(subjectName) !== -1
    ? keys[keys.indexOf(subjectName) + 1]
    : null;

  const [premiumQBValue, setPremiumQBValue] = useState(() => {
    try {
      return window.localStorage.getItem(premiumQBKey) || '';
    } catch {
      return '';
    }
  });

  useEffect(() => {
    const handleOpenNext = (event) => {
      if (event.detail?.subjectName !== subjectName) return;

      const currentChapter = event.detail?.chapterName;
      const currentIndex = chapters.findIndex((ch) => ch === currentChapter);

      if (currentIndex === -1) return;

      const nextChapter = chapters[currentIndex + 1];
      if (!nextChapter) return;

      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent('openChapterAccordion', {
            detail: { subjectName, chapterName: nextChapter },
          })
        );
      }, 380);
    };

    window.addEventListener('openNextChapterAccordion', handleOpenNext);
    return () => window.removeEventListener('openNextChapterAccordion', handleOpenNext);
  }, [subjectName, chapters]);

  useEffect(() => {
  try {
    const stored = window.localStorage.getItem(premiumQBKey);
    setPremiumQBValue(stored || '');
  } catch {
    setPremiumQBValue('0');
  }
}, [subjectName]);

  const handlePremiumQBChange = (e) => {
    const value = e.target.value;
  if (value > forthis) {

  input.value = "";
  input.focus();
  return;
}
    setPremiumQBValue(value);

    try {
      window.localStorage.setItem(premiumQBKey, value);
    } catch {}
  };

  const resetSubject = () => {
    if (
      window.confirm(
        `Are you sure you want to reset all progress for ${subjectName}? This cannot be undone.`
      )
    ) {
      chapters.forEach((ch) => {
        const storageKey = `trackpro_${subjectName}_${ch.replace(/\s+/g, '')}`;
        window.localStorage.removeItem(storageKey);
      });

      window.localStorage.removeItem(premiumQBKey);
      window.location.reload();
    }
  };

  return (
    <div className="glass-card mb-6 mb-8 pt-4">
      <div
        className="flex justify-between items-center mb-4 border-b pb-2"
        style={{ borderBottom: '1px solid var(--card-border)' }}
      >
        <h2
          className="flex items-center gap-2"
          style={{ fontSize: '1.5rem', margin: 0 }}
        >
          <BookOpen size={24} color="var(--accent-primary)" />
          {subjectName}
        </h2>

        <button
          className="btn btn-outline flex items-center gap-1"
          style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
          onClick={resetSubject}
          title={`Reset ${subjectName}`}
        >
          <RefreshCw size={14} /> Reset Subject
        </button>
      </div>

   

      <div className="flex flex-col gap-3">
        {chapters.length === 0 && (
          <p style={{ color: 'var(--text-muted)' }}>
            No chapters added for this subject yet.
          </p>
        )}

        {chapters.map((chapterName) => (
          <ChapterAccordion
          key={`${subjectName}-${chapterName}`}
            subjectName={subjectName}
            chapterName={chapterName}
          />
        ))}
      </div>

         <div
        style={{
          marginBottom: '1rem',
          padding: '0.9rem 1rem',
          border: '1px solid var(--card-border)',
          borderRadius: '12px',
          background: 'var(--bg-secondary)',
        }}
      >
        <label
          htmlFor={`premium-qb-${subjectName}`}
          style={{
            display: 'block',
            fontWeight: 600,
            marginBottom: '0.5rem',
            color: 'var(--text-primary)',
          }}
        >
        Prem QB questions practiced : {premiumQBValue === '' ? 'X' : premiumQBValue}/{forthis}
        </label>

        <input
          id={`premium-qb-${subjectName}`}
          type="number"
          min="0"
          step="1"
          value={premiumQBValue}
          onChange={handlePremiumQBChange}
          placeholder="Enter value"
          style={{
            width: '100%',
            maxWidth: '240px',
            padding: '0.65rem 0.8rem',
            borderRadius: '10px',
            border: '1px solid var(--card-border)',
            background: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            outline: 'none',
            fontSize: '0.95rem',
          }}
        />

{nextSubject && (
  <button
    onClick={() =>
      navigate(`/subject/${encodeURIComponent(nextSubject)}`)
    }
    style={{
      marginTop: "0.8rem",
      padding: "0.6rem 1rem",
      borderRadius: "10px",
      border: "1px solid var(--accent-primary)",
      background: "var(--accent-primary)",
      color: "#fff",
      fontWeight: 600,
      fontSize: "0.9rem",
      cursor: "pointer",
      transition: "all 0.2s ease",
      boxShadow: "0 4px 10px rgba(0,0,0,0.08)"
    }}
    onMouseEnter={(e) => {
      e.target.style.transform = "translateY(-1px)";
      e.target.style.boxShadow = "0 6px 14px rgba(0,0,0,0.12)";
    }}
    onMouseLeave={(e) => {
      e.target.style.transform = "translateY(0)";
      e.target.style.boxShadow = "0 4px 10px rgba(0,0,0,0.08)";
    }}
  >
    Next Subject → {nextSubject}
  </button>
)}

  <button
    onClick={() => navigate('/dashboard')}
    style={{
      marginTop: "0.8rem",
      padding: "0.6rem 1rem",
      borderRadius: "10px",
      border: "1px solid var(--success)",
      background: "var(--success)",
      color: "#fff",
      fontWeight: 600,
      fontSize: "0.9rem",
      cursor: "pointer",
      transition: "all 0.2s ease",
      boxShadow: "0 4px 10px rgba(0,0,0,0.08)"
    }}
    onMouseEnter={(e) => {
      e.target.style.transform = "translateY(-1px)";
      e.target.style.boxShadow = "0 6px 14px rgba(0,0,0,0.12)";
    }}
    onMouseLeave={(e) => {
      e.target.style.transform = "translateY(0)";
      e.target.style.boxShadow = "0 4px 10px rgba(0,0,0,0.08)";
    }}
  >
    ✓ Submit & Go to Dashboard
  </button>

         </div>
    </div>
  );
}
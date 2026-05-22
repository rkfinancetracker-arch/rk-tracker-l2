import React, { useEffect, useRef, useState } from 'react';
import { getQuestions } from '../config/constants';
import { CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export default function ChapterAccordion({ subjectName, chapterName }) {
  const questions = getQuestions(subjectName, chapterName);
  const storageKey = `trackpro_${subjectName}_${chapterName.replace(/\s+/g, '')}`;

  const defaultState = questions.reduce((acc, q) => {
    acc[q.id] = 'No';
    return acc;
  }, {});

  const [answers, setAnswers] = useLocalStorage(storageKey, defaultState);
  const [isOpen, setIsOpen] = useState(false);

  const [hasAutoClosed, setHasAutoClosed] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (!stored) return false;
      const parsed = JSON.parse(stored);
      return questions.length > 0 && questions.every(q => parsed[q.id] === 'Yes');
    } catch {
      return false;
    }
  });

  const closeTimerRef = useRef(null);
  const accordionRef = useRef(null);
  const hasMountedRef = useRef(false);

  const handleChange = (qId, value) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  // Chapter is completed only when all answers are "Yes"
  const isCompleted =
    questions.length > 0 &&
    questions.every(q => answers[q.id] === 'Yes');

  const openAccordion = () => setIsOpen(true);
  const closeAccordion = () => setIsOpen(false);
  const toggleAccordion = () => setIsOpen(prev => !prev);

  useEffect(() => {
    const openCurrentChapter = (event) => {
      if (
        event.detail?.subjectName === subjectName &&
        event.detail?.chapterName === chapterName
      ) {
        openAccordion();

        setTimeout(() => {
          const el = accordionRef.current;
          if (!el) return;
          const rect = el.getBoundingClientRect();
          const bottomOfAccordion = rect.bottom;

          if (bottomOfAccordion > window.innerHeight) {
            window.scrollBy({
              top: bottomOfAccordion - window.innerHeight + 24,
              behavior: 'smooth',
            });
          }
        }, 750);
      }
    };

    window.addEventListener('openChapterAccordion', openCurrentChapter);
    return () => window.removeEventListener('openChapterAccordion', openCurrentChapter);
  }, [subjectName, chapterName]);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    if (isCompleted && !hasAutoClosed) {
      closeTimerRef.current = setTimeout(() => {
        closeAccordion();
        setHasAutoClosed(true);

        window.dispatchEvent(
          new CustomEvent('openNextChapterAccordion', {
            detail: { subjectName, chapterName },
          })
        );
      }, 450);
    }

    if (!isCompleted) {
      setHasAutoClosed(false);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    }

    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, [isCompleted, hasAutoClosed, subjectName, chapterName]);

  return (
    <div className="accordion-item" ref={accordionRef}>
      <div
        className="accordion-header"
        onClick={toggleAccordion}
        style={{
          borderLeft: isCompleted ? '4px solid var(--success)' : '4px solid transparent',
        }}
      >
        <div className="flex items-center gap-2">
          {isCompleted && <CheckCircle2 size={18} color="var(--success)" />}
          <h4 style={{ margin: 0, fontWeight: isCompleted ? 600 : 500 }}>
            {chapterName}
          </h4>
        </div>

        <div className="flex items-center gap-4">
          <span
            style={{
              fontSize: '0.85rem',
              color: isCompleted ? 'var(--success)' : 'var(--text-muted)',
            }}
          >
            {isCompleted ? 'Completed' : `${questions.length} Qs`}
          </span>
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateRows: isOpen ? '1fr' : '0fr',
          transition: 'grid-template-rows 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div style={{ overflow: 'hidden' }}>
          <div
            style={{
              opacity: isOpen ? 1 : 0,
              transform: isOpen ? 'translateY(0)' : 'translateY(-6px)',
              transition:
                'opacity 0.28s cubic-bezier(0.4, 0, 0.2, 1) 0.04s, transform 0.28s cubic-bezier(0.4, 0, 0.2, 1) 0.04s',
              paddingTop: '1rem',
              paddingBottom: '1rem',
            }}
          >
            {questions.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                No questions in this chapter yet.
              </p>
            )}

            <div className="flex flex-col gap-4">
              {questions.map((q, idx) => (
                <div key={q.id} className="form-group mb-0" style={{ marginBottom: 0 }}>
                  <label
                    className="form-label"
                    style={{
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      paddingLeft: '0.75rem',
                    }}
                  >
                    Q{idx + 1}. {q.question}
                  </label>

                  <div style={{ display: 'flex', gap: '0.5rem', paddingLeft: '0.75rem' }}>
                    {q.options.map((opt, optIdx) => {
                      const isSelected = answers[q.id] === opt;

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleChange(q.id, opt)}
                          style={{
                            padding: '0.6rem 1rem',
                            borderRadius: '8px',
                            border: isSelected
                              ? '2px solid var(--accent-primary)'
                              : '1px solid var(--card-border)',
                            backgroundColor: isSelected
                              ? 'var(--accent-primary)'
                              : 'var(--bg-secondary)',
                            color: isSelected ? 'white' : 'var(--text-primary)',
                            cursor: 'pointer',
                            fontWeight: isSelected ? 600 : 400,
                            fontSize: '0.9rem',
                            textAlign: 'left',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div
              className="flex justify-end gap-2 mt-4 pt-4"
              style={{ borderTop: '1px dashed var(--card-border)' }}
            >
                <button
    className="btn btn-outline "
    style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}
    onClick={(e) => {
      e.stopPropagation();
      window.dispatchEvent(
        new CustomEvent('openNextChapterAccordion', {
          detail: { subjectName, chapterName },
        })
      );
      closeAccordion();
    }}
  >
    Next Reading →
  </button>
              <button
                className="btn btn-outline "
                style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`Clear answers for ${chapterName}?`)) {
                    setAnswers(defaultState);
                    setIsOpen(true);
                    setHasAutoClosed(false);
                  }
                }}
              >
                Clear Chapter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
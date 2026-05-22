import React, { useState, useEffect } from 'react';
import QUESTION_DATA, { SUBJECTS, getChapters } from '../config/questionData';

/* ───────────────────────────────────────────────────────
 *  Question-ID → Chart mapping
 *  q1 = Lectures, q2 = Reading, q3 = Practice, q4 = Revision
 * ─────────────────────────────────────────────────────── */
const CHART_QUESTIONS = [
  { id: 'q1', label: 'Lectures Completion', color: '#6366f1', bg: 'rgba(99,102,241,0.10)' },
  { id: 'q2', label: 'Reading Completion', color: '#10b981', bg: 'rgba(16,185,129,0.10)' },
  { id: 'q3', label: 'Practice Completion', color: '#f59e0b', bg: 'rgba(245,158,11,0.10)' },
  { id: 'q4', label: 'Revision Completion', color: '#ef4444', bg: 'rgba(239,68,68,0.10)' },
];

/**
 * For a given question ID (q1-q4), compute the "Yes" count per subject.
 * Returns an array aligned with SUBJECTS: [count_FSA, count_Ethics, ...]
 */
function computeYesCounts(questionId) {
  return SUBJECTS.map(sub => {
    const chapters = getChapters(sub);
    let yesCount = 0;

    chapters.forEach(ch => {
      const storageKey = `trackpro_${sub}_${ch.replace(/\s+/g, '')}`;
      try {
        const raw = window.localStorage.getItem(storageKey);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (parsed[questionId] === 'Yes') yesCount += 1;
      } catch {
        /* skip corrupted entries */
      }
    });

    return yesCount;
  });
}

/**
 * Max possible Y value per subject = number of chapters for that subject.
 */
function maxChapterCounts() {
  return SUBJECTS.map(sub => getChapters(sub).length);
}

/* ─── Truncate long subject names for X-axis labels ──── */
const SHORT_NAMES = {
  'Corp Issuers': 'Corp Iss.',
  'Portfolio Mgmt': 'Port. Mgmt',
  'Fixed Income': 'Fixed Inc.',
  'Derivatives': 'Deriv.',
  'Alt Inv': 'Alt Inv',
};

function shortName(name) {
  return SHORT_NAMES[name] || name;
}

/* ─────────────────────────── Single Bar Chart ─────────────────────────── */
function QuestionChart({ qInfo }) {
  const yesCounts = computeYesCounts(qInfo.id);
  const maxCounts = maxChapterCounts();
  const globalMax = Math.max(...maxCounts, 1);

  // Bigger logical SVG size
  const chartWidth = 900;
  const chartHeight = 320;
  const leftPad = 70;
  const bottomPad = 130;
  const topPad = 30;
  const rightPad = 30;
  const barWidth = 46;
  const totalBars = SUBJECTS.length;
  const usableWidth = chartWidth - leftPad - rightPad;
  const gap = Math.max(12, (usableWidth - barWidth * totalBars) / (totalBars + 1));

  const svgHeight = chartHeight + bottomPad + topPad;
  const yTicks = globalMax;

  return (
    <div
      style={{
        padding: '1.25rem 1.25rem 0.75rem',
        border: '1px solid var(--card-border)',
        borderRadius: '16px',
        backgroundColor: qInfo.bg,
        overflowX: 'auto',
      }}
    >
      <h4
        style={{
          margin: '0 0 0.85rem 0',
          fontSize: '1.4rem',
          fontWeight: 800,
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            width: 14,
            height: 14,
            borderRadius: 4,
            backgroundColor: qInfo.color,
            flexShrink: 0,
          }}
        />
        {qInfo.label}
      </h4>

      <svg
        width={chartWidth * 2}
        height={svgHeight * 2}
        viewBox={`0 0 ${chartWidth} ${svgHeight}`}
        style={{
          display: 'block',
          width: '100%',
          height: 'auto',
          minWidth: `${chartWidth}px`,
        }}
        shapeRendering="geometricPrecision"
        textRendering="geometricPrecision"
      >
        {/* Y-axis grid lines & labels */}
        {Array.from({ length: yTicks + 1 }, (_, i) => {
          const y = topPad + chartHeight - (i / globalMax) * chartHeight;
          return (
            <g key={`y-${i}`}>
              <text
                x={leftPad - 12}
                y={y + 6}
                textAnchor="end"
                fontSize="18"
                fontWeight="700"
                fill="var(--text-muted)"
              >
                {i}
              </text>
              <line
                x1={leftPad}
                y1={y}
                x2={chartWidth - rightPad}
                y2={y}
                stroke="var(--card-border)"
                strokeWidth="1"
                strokeDasharray="4,4"
                vectorEffect="non-scaling-stroke"
              />
            </g>
          );
        })}

        {/* Bars */}
        {yesCounts.map((count, idx) => {
          const x = leftPad + gap + idx * (barWidth + gap);
          const barH = globalMax > 0 ? (count / globalMax) * chartHeight : 0;
          const y = topPad + chartHeight - barH;

          return (
            <g key={idx}>
              {/* Background track */}
              <rect
                x={x}
                y={topPad}
                width={barWidth}
                height={chartHeight}
                rx={8}
                fill="var(--bg-secondary)"
                opacity={0.45}
              />

              {/* Filled bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barH}
                rx={8}
                fill={qInfo.color}
              >
                <animate
                  attributeName="height"
                  from="0"
                  to={barH}
                  dur="0.5s"
                  fill="freeze"
                />
                <animate
                  attributeName="y"
                  from={topPad + chartHeight}
                  to={y}
                  dur="0.5s"
                  fill="freeze"
                />
              </rect>

              {/* Count label above bar */}
              {count > 0 && (
                <text
                  x={x + barWidth / 2}
                  y={y - 10}
                  textAnchor="middle"
                  fontSize="18"
                  fontWeight="800"
                  fill={qInfo.color}
                >
                  {count}
                </text>
              )}

              {/* Subject label */}
              <text
                x={x + barWidth / 2}
                y={topPad + chartHeight + 30}
                textAnchor="end"
                fontSize="18"
                fontWeight="800"
                fill="var(--text-primary)"
                transform={`rotate(-35, ${x + barWidth / 2}, ${topPad + chartHeight + 30})`}
              >
                {shortName(SUBJECTS[idx])}
              </text>
            </g>
          );
        })}

        {/* Axes */}
        <line
          x1={leftPad}
          y1={topPad + chartHeight}
          x2={chartWidth - rightPad}
          y2={topPad + chartHeight}
          stroke="var(--card-border)"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
        <line
          x1={leftPad}
          y1={topPad}
          x2={leftPad}
          y2={topPad + chartHeight}
          stroke="var(--card-border)"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <div
        style={{
          textAlign: 'center',
          fontSize: '1rem',
          fontWeight: 600,
          color: 'var(--text-muted)',
          marginTop: '0.2rem',
          paddingBottom: '0.2rem',
        }}
      >
        Yes = 1 &nbsp;|&nbsp; No = 0 &nbsp;· counted per chapter
      </div>
    </div>
  );
}

/* ──────────────────── Exported wrapper ──────────────────── */
export default function SubjectBarCharts() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const refresh = () => setTick(t => t + 1);
    window.addEventListener('local-storage', refresh);
    window.addEventListener('storage', refresh);

    return () => {
      window.removeEventListener('local-storage', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  return (
    <div className="glass-card mb-6" style={{ pageBreakInside: 'avoid' }}>
      <div
        className="flex items-center gap-2 mb-4 border-b pb-2"
        style={{ borderBottom: '1px solid var(--card-border)' }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--accent-primary)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="12" width="4" height="9" rx="1" />
          <rect x="10" y="7" width="4" height="14" rx="1" />
          <rect x="17" y="3" width="4" height="18" rx="1" />
        </svg>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>
          Subject-wise Completion
        </h2>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(560px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {CHART_QUESTIONS.map(q => (
          <QuestionChart key={q.id} qInfo={q} />
        ))}
      </div>
    </div>
  );
}
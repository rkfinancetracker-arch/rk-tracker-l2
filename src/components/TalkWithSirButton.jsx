import React, { useState } from 'react';
import html2pdf from 'html2pdf.js';
import { MessageCircle, X, Download, FileText, Loader2 } from 'lucide-react';
import PQBTOTAL from '../config/PQB';
import {
  WHATSAPP_NUMBER,
  WHATSAPP_TEMPLATE,
  SUBJECTS,
  getChapters,
  getQuestions,
} from '../config/constants';
import subjectFullName from '../config/Subject';

// ─── Helpers ───────────────────────────────────────────────────────────
function getOptionScore(options, answer) {
  if (!answer || !options || options.length === 0) return 0;
  const idx = options.indexOf(answer);
  if (idx === -1) return 0;
  if (idx === 0) return 1;
  if (idx === options.length - 1) return 0;
  return 0.5;
}

function getChapterStorage(subjectName, chapterName) {
  const key = `trackpro_${subjectName}_${chapterName.replace(/\s+/g, '')}`;
  const raw = localStorage.getItem(key);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function getChapterScore(subjectName, chapterName) {
  const parsed = getChapterStorage(subjectName, chapterName);
  if (!parsed) return 0;

  const questions = getQuestions(subjectName, chapterName) || [];
  return questions.reduce(
    (sum, q) => sum + getOptionScore(q.options, parsed[q.id]),
    0
  );
}

function getChapterYesPercentage(subjectName, chapterName) {
  const parsed = getChapterStorage(subjectName, chapterName) || {};
  const questions = getQuestions(subjectName, chapterName) || [];

  if (questions.length === 0) {
    return { yesCount: 0, total: 0, percent: 0 };
  }

  let yesCount = 0;
  questions.forEach((q) => {
    if (parsed[q.id] === 'Yes') yesCount += 1;
  });

  return {
    yesCount,
    total: questions.length,
    percent: Math.round((yesCount / questions.length) * 100),
  };
}
function getPremonth(date) {
  // input: "2026-04-08"

  const [year, month] = date.split("-");

  const monthNames = [
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December"
  ];

  return `${monthNames[parseInt(month, 10) - 1]} ${year}`;
}
// ─── Constants ─────────────────────────────────────────────────────────
const COLORS = {
  Physics: '#6366f1',
  Chemistry: '#10b981',
  Mathematics: '#f59e0b',
  Biology: '#ef4444',
};

const QUESTION_CHARTS = [
  { id: 'q1', label: 'Video Lecture Status', color: '#6366f1' },
  { id: 'q2', label: 'Reading Status', color: '#10b981' },
  { id: 'q5', label: 'Revision Status', color: '#ef4444' },
  { id: 'q6', label: 'Test Taken Status', color: '#ef4444' },
  { id: 'q3', label: 'Schweser QB Status', color: '#f59e0b' },
  { id: 'q4', label: 'Institute End QB Status', color: '#f59e0b' },
  
];

const SHORT_NAMES = {
  'Corp Issuers': 'Corp Iss.',
  'Portfolio Mgmt': 'Port. Mgmt',
  'Fixed Income': 'Fixed Inc.',
  Derivatives: 'Deriv.',
  'Alt Inv': 'Alt Inv',
};

const LOGO_URL = 'https://res.cloudinary.com/dzl0crskt/image/upload/v1774970092/RK-Finance-Classes-Logo-ed-1_eauuxw.png';
const WATER_MARK = 'https://res.cloudinary.com/dzl0crskt/image/upload/v1776862972/WhatsApp_Image_2026-04-22_at_6.13.09_PM_-_Edited_yjxvzk.png'

// ─── SVG Chart Builders ────────────────────────────────────────────────
function buildChartSVG(subjectName, isDark) {
  const chapters = getChapters(subjectName);
  if (!chapters || chapters.length === 0) {
    return '<p style="color:#888;font-size:0.8rem;">No chapters</p>';
  }

  const scores = chapters.map((ch) => getChapterScore(subjectName, ch));
  const maxScores = chapters.map((ch) => (getQuestions(subjectName, ch) || []).length);
  const maxScore = Math.max(...maxScores, 1);

  const color = COLORS[subjectName] || '#6366f1';
  const W = Math.max(360, chapters.length * 40);
  const H = 140;
  const barW = Math.min(28, (W - 40) / chapters.length - 4);
  const gap = (W - barW * chapters.length) / (chapters.length + 1);
  const textCol = isDark ? '#a0aec0' : '#718096';
  const gridCol = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

  let yLabels = '';
  for (let i = 0; i <= maxScore; i++) {
    const y = H - (i / maxScore) * H + 10;
    yLabels += `<text x="18" y="${y + 3}" text-anchor="end" font-size="8" fill="${textCol}">${i}</text>`;
    yLabels += `<line x1="22" y1="${y}" x2="${W + 25}" y2="${y}" stroke="${gridCol}" stroke-width="0.5" stroke-dasharray="3,3"/>`;
  }

  let bars = '';
  scores.forEach((score, idx) => {
    const x = 25 + gap + idx * (barW + gap);
    const barH = maxScore > 0 ? (score / maxScore) * H : 0;
    const y = H - barH + 10;

    bars += `<rect x="${x}" y="10" width="${barW}" height="${H}" rx="4" fill="${isDark ? '#2d3748' : '#e2e8f0'}" opacity="0.5"/>`;
    bars += `<rect x="${x}" y="${y}" width="${barW}" height="${barH}" rx="4" fill="${color}"/>`;

    if (score > 0) {
      bars += `<text x="${x + barW / 2}" y="${y - 4}" text-anchor="middle" font-size="8" font-weight="700" fill="${color}">${score % 1 === 0 ? score : score.toFixed(1)}</text>`;
    }

    bars += `<text x="${x + barW / 2}" y="${H + 22}" text-anchor="middle" font-size="7" fill="${textCol}">Ch${idx + 1}</text>`;
  });

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 ${W + 40} ${H + 35}">
      ${yLabels}
      ${bars}
      <line x1="22" y1="${H + 10}" x2="${W + 25}" y2="${H + 10}" stroke="${gridCol}" stroke-width="1"/>
      <line x1="22" y1="10" x2="22" y2="${H + 10}" stroke="${gridCol}" stroke-width="1"/>
    </svg>
  `;
}

function getPerformanceColor(percent) {
if (percent >= 80) return '#22c55e';   // green
  if (percent >= 50) return '#f59e0b';  // yellowish orange
  return '#ad1750';  
}

function isInCompletedInClass(sub) {
  const all = JSON.parse(localStorage.getItem("completedInClass")) || [];

  return all.includes(sub);
}

function buildQuestionChartSVG(qId, qColor, isDark) {
  const yesCounts = SUBJECTS.map((sub) => {
    const chapters = getChapters(sub) || [];
    let count = 0;

    chapters.forEach((ch) => {
      const key = `trackpro_${sub}_${ch.replace(/\s+/g, '')}`;
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed[qId] === 'Yes') count += 1;
        }
      } catch {}
    });

    return count;
  });

  const maxCounts = SUBJECTS.map((sub) => (getChapters(sub) || []).length);

  const percentages = yesCounts.map((count, idx) => {
    const max = maxCounts[idx] || 0;
    if (!max) return 0;
    return Math.round((count / max) * 100);
  });

  const totalBars = SUBJECTS.length;
  const W = Math.max(460, totalBars * 44);
  const H = 130;
  const barW = 26;
  const gap = (W - 30 - barW * totalBars) / (totalBars + 1);

  const textCol = isDark ? '#a0aec0' : '#718096';
  const gridCol = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const trackFill = isDark ? '#2d3748' : '#e2e8f0';

  let yLabels = '';
  for (let i = 0; i <= 100; i += 20) {
    const y = H - (i / 100) * H + 10;
    yLabels += `<text x="18" y="${y + 3}" text-anchor="end" font-size="8" fill="${textCol}">${i}%</text>`;
    yLabels += `<line x1="22" y1="${y}" x2="${W + 5}" y2="${y}" stroke="${gridCol}" stroke-width="0.5" stroke-dasharray="3,3"/>`;
  }

  let bars = '';
  yesCounts.forEach((count, idx) => {
    const max = maxCounts[idx] || 0;
    const percent = percentages[idx];
    const x = 25 + gap + idx * (barW + gap);
    const barH = (percent / 100) * H;
    const y = H - barH + 10;

    const barColor = getPerformanceColor(percent);

    bars += `<rect x="${x}" y="10" width="${barW}" height="${H}" rx="4" fill="${trackFill}" opacity="0.5"/>`;
    bars += `<rect x="${x}" y="${y}" width="${barW}" height="${barH}" rx="4" fill="${barColor}"/>`;

    if (max > 0) {
      bars += `
        <text x="${x + barW / 2}" y="${y - 4}" text-anchor="middle" font-size="8" font-weight="700" fill="${barColor}">
         ${percent}%
        </text>
      `;
    }

    const label = SHORT_NAMES[SUBJECTS[idx]] || SUBJECTS[idx];
    const words = label.split(' ');
    const line1 = words[0];
    const line2 = words.slice(1).join(' ');

    if (words.length > 1) {
      bars += `
        <text x="${x + barW / 2}" y="${H + 18}" text-anchor="middle" font-size="12px" font-weight="900" fill="${textCol}">
          <tspan x="${x + barW / 2}" dy="0">${line1}</tspan>
          <tspan x="${x + barW / 2}" dy="9">${line2}</tspan>
        </text>
      `;
    } else {
      bars += `
        <text x="${x + barW / 2}" y="${H + 22}" text-anchor="middle" font-size="12px" font-weight="900" fill="${textCol}">
          ${label}
        </text>
      `;
    }
  });

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 ${W + 10} ${H + 35}">
      ${yLabels}
      ${bars}
      <line x1="22" y1="${H + 10}" x2="${W + 5}" y2="${H + 10}" stroke="${gridCol}" stroke-width="1"/>
      <line x1="22" y1="10" x2="22" y2="${H + 10}" stroke="${gridCol}" stroke-width="1"/>
    </svg>
  `;
}

// ─── Subject-wise chapter tables ───────────────────────────────────────
function buildSubjectChapterTables(isDark, txt2, accent, bdr) {
  const tableBg = isDark ? '#1f2937' : '#ffffff';
  const headBg = isDark ? '#2d3748' : '#e2e8f0';
  const rowAlt = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';

  return SUBJECTS.map((subject, subjectIndex) => {
    const chapters = getChapters(subject) || [];

    const rows = chapters.map((chapter, index) => {
      const { percent } = getChapterYesPercentage(subject, chapter);

      const color = getPerformanceColor(percent);

      return `
        <tr style="background:${index % 2 === 0 ? 'transparent' : rowAlt};">
          <td style="padding:10px;border:1px solid ${bdr};text-align:left;">
            ${chapter}
          </td>
          <td style="padding:10px;border:1px solid ${bdr};text-align:center;font-weight:700;color:${color};">
         ${Math.round(percent / 100 * 6)}/6
          </td>
        </tr>
      `;
    }).join('');

 const PQBdone = Number(
  localStorage.getItem(`trackpro_${subject}_premiumQuestionBank`) || 0
);

const PQBpercentage = (PQBdone / PQBTOTAL[subject]) * 100;
const PQBcolor = getPerformanceColor(PQBpercentage);

const extraRow = `
  <tr style="background:${rowAlt};">
    <td style="padding:10px;border:1px solid ${bdr};text-align:left;">
      Premium QB completion progress
    </td>
    <td style="padding:10px;border:1px solid ${bdr};text-align:center;color:${PQBcolor};">
      ${PQBdone} / ${PQBTOTAL[subject]}
    </td>
  </tr>
`;

    const finalRows = rows + extraRow;

    return `
      <div
        class="subject-page"
        style="
          page-break-before:${subjectIndex === 0 ? 'auto' : 'always'};
          break-before:${subjectIndex === 0 ? 'auto' : 'page'};
          page-break-inside:avoid;
          break-inside:avoid;
          min-height:260mm;
          padding-top:8mm;
        "
      >
        <div
          class="subject-table-block"
          style="
            margin-top:0;
            page-break-inside:avoid;
            break-inside:avoid;
          "
        >
          <h3 style="margin:0 0 12px 0;font-size:1.1rem;color:${accent};">
            ${subjectFullName[subject]}
          </h3>

          <div
            style="
              overflow:hidden;
              border:1px solid ${bdr};
              border-radius:10px;
              background:${tableBg};
              page-break-inside:avoid;
              break-inside:avoid;
            "
          >
            <table style="width:100%;border-collapse:collapse;font-size:0.88rem;">
              <thead>
                <tr style="background:${headBg};">
                  <th style="padding:10px;border:1px solid ${bdr};text-align:left;">Readings</th>
                  <th style="padding:10px;border:1px solid ${bdr};text-align:center;">PROGRESS</th>
                </tr>
              </thead>
              <tbody>
                ${finalRows || `
                  <tr>
                    <td colspan="2" style="padding:12px;border:1px solid ${bdr};text-align:center;color:${txt2};">
                      No chapter data available
                    </td>
                  </tr>
                `}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function buildSubjectSummaryChartSVG(yesCounts, isDark) {
  const values = yesCounts.map((sub) =>
    sub.max ? Math.round((sub.total / sub.max) * 100) : 0
  );

  const W = Math.max(460, SUBJECTS.length * 70);
  const H = 180;
  const barW = 38;
  const gap = (W - 40 - barW * SUBJECTS.length) / (SUBJECTS.length + 1);

  const textCol = isDark ? '#a0aec0' : '#718096';
  const gridCol = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const trackFill = isDark ? '#2d3748' : '#e2e8f0';

  let yLabels = '';
  for (let i = 0; i <= 100; i += 20) {
    const y = H - (i / 100) * H + 10;
    yLabels += `<text x="24" y="${y + 3}" text-anchor="end" font-size="9" fill="${textCol}">${i}%</text>`;
    yLabels += `<line x1="30" y1="${y}" x2="${W + 5}" y2="${y}" stroke="${gridCol}" stroke-width="0.6" stroke-dasharray="3,3"/>`;
  }

  let bars = '';
  values.forEach((percent, idx) => {
    const x = 35 + gap + idx * (barW + gap);
    const barH = (percent / 100) * H;
    const y = H - barH + 10;

    const color = getPerformanceColor(percent);

    const label = SHORT_NAMES[SUBJECTS[idx]] || SUBJECTS[idx];
    const words = label.split(' ');
    const line1 = words[0];
    const line2 = words.slice(1).join(' ');

    bars += `<rect x="${x}" y="10" width="${barW}" height="${H}" rx="6" fill="${trackFill}" opacity="0.5"/>`;
    bars += `<rect x="${x}" y="${y}" width="${barW}" height="${barH}" rx="6" fill="${color}"/>`;

    bars += `
      <text x="${x + barW / 2}" y="${y - 6}" text-anchor="middle" font-size="10" font-weight="700" fill="${color}">
        ${percent}%
      </text>
    `;

    if (words.length > 1) {
      bars += `
        <text x="${x + barW / 2}" y="${H + 24}" text-anchor="middle" font-size="10" font-weight="700" fill="${textCol}">
          <tspan x="${x + barW / 2}" dy="0">${line1}</tspan>
          <tspan x="${x + barW / 2}" dy="11">${line2}</tspan>
        </text>
      `;
    } else {
      bars += `
        <text x="${x + barW / 2}" y="${H + 28}" text-anchor="middle" font-size="10" font-weight="700" fill="${textCol}">
          ${label}
        </text>
      `;
    }
  });

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 ${W + 10} ${H + 55}">
      ${yLabels}
      ${bars}
      <line x1="30" y1="${H + 10}" x2="${W + 5}" y2="${H + 10}" stroke="${gridCol}" stroke-width="1"/>
      <line x1="30" y1="10" x2="30" y2="${H + 10}" stroke="${gridCol}" stroke-width="1"/>
    </svg>
  `;
}

function getTimeRemaining(examMonthYear) {
  if (!examMonthYear) return '';

  try {
    const [monthStr, yearStr] = examMonthYear.split(' ');
    const targetDate = new Date(`${monthStr} 1, ${yearStr}`);
    const today = new Date();

    const diff = targetDate - today;
    if (diff <= 0) return 'Exam time reached';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const months = Math.floor(days / 30);
    const remainingDays = days % 30;

    return `${months} months ${remainingDays} days left`;
  } catch {
    return '';
  }
}

function buildPremiumQBChart() {
  const pqbData = SUBJECTS.map((sub) => {
    const premiumQBKey = `trackpro_${sub}_premiumQuestionBank`;
    const premiumQBCount = localStorage.getItem(premiumQBKey) ? parseInt(localStorage.getItem(premiumQBKey)) : 0;
    const thisChapterPremiumCount = PQBTOTAL[sub];
    const percent = thisChapterPremiumCount > 0 ? Math.round((premiumQBCount / thisChapterPremiumCount) * 100) : 0;

    return { subject: sub, count: premiumQBCount, percent };
  });

  const W = Math.max(460, SUBJECTS.length * 44);
  const H = 130;
  const barW = 26;
  const gap = (W - 30 - barW * SUBJECTS.length) / (SUBJECTS.length + 1);
  const textCol = '#718096';
  const gridCol = 'rgba(0,0,0,0.06)';
  const trackFill = '#e2e8f0';

  let yLabels = '';
  for (let i = 0; i <= 100; i += 20) {
    const y = H - (i / 100) * H + 10;
    yLabels += `<text x="18" y="${y + 3}" text-anchor="end" font-size="8" fill="${textCol}">${i}%</text>`;
    yLabels += `<line x1="22" y1="${y}" x2="${W + 5}" y2="${y}" stroke="${gridCol}" stroke-width="0.5" stroke-dasharray="3,3"/>`;
  }

  let bars = '';
  pqbData.forEach((data, idx) => {
    const x = 25 + gap + idx * (barW + gap);
    const barH = (data.percent / 100) * H;
    const y = H - barH + 10;
    const color = getPerformanceColor(data.percent);

    bars += `<rect x="${x}" y="10" width="${barW}" height="${H}" rx="4" fill="${trackFill}" opacity="0.5"/>`;
    bars += `<rect x="${x}" y="${y}" width="${barW}" height="${barH}" rx="4" fill="${color}"/>`;
    bars += `<text x="${x + barW / 2}" y="${y - 4}" text-anchor="middle" font-size="8" font-weight="700" fill="${color}">${data.percent}%</text>`;

    const label = SHORT_NAMES[data.subject] || data.subject;
    const words = label.split(' ');
    const line1 = words[0];
    const line2 = words.slice(1).join(' ');

    if (words.length > 1) {
      bars += `
        <text x="${x + barW / 2}" y="${H + 18}" text-anchor="middle" font-size="12px" font-weight="900" fill="${textCol}">
          <tspan x="${x + barW / 2}" dy="0">${line1}</tspan>
          <tspan x="${x + barW / 2}" dy="9">${line2}</tspan>
        </text>
      `;
    } else {
      bars += `
        <text x="${x + barW / 2}" y="${H + 22}" text-anchor="middle" font-size="12px" font-weight="900" fill="${textCol}">
          ${label}
        </text>
      `;
    }
  });

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 ${W + 10} ${H + 35}">
      ${yLabels}
      ${bars}
      <line x1="22" y1="${H + 10}" x2="${W + 5}" y2="${H + 10}" stroke="${gridCol}" stroke-width="1"/>
      <line x1="22" y1="10" x2="22" y2="${H + 10}" stroke="${gridCol}" stroke-width="1"/>
    </svg>
  `;
}

// ─── Build full report HTML ────────────────────────────────────────────
function buildReportHTML() {
  let details = { fullName: '', uniqueId: '', mobile: '', exam: '' };
  try {
    details = JSON.parse(localStorage.getItem('generalDetails')) || details;
  } catch {}

  const timeLeft = getTimeRemaining(details.exam);

  const yesCounts = SUBJECTS.map((sub) => {
    const chapters = getChapters(sub) || [];
    const counts = { q1: 0, q2: 0, q3: 0, q4: 0, q5: 0 , q6:0 };
    chapters.forEach((ch) => {
      const key = `trackpro_${sub}_${ch.replace(/\s+/g, '')}`;
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.q1 === 'Yes') counts.q1++;
          if (parsed.q2 === 'Yes') counts.q2++;
          if (parsed.q3 === 'Yes') counts.q3++;
          if (parsed.q4 === 'Yes') counts.q4++;
          if (parsed.q5 === 'Yes') counts.q5++;
          if (parsed.q6 === 'Yes') counts.q6++;
        }
      } catch {}
    });

    const totalCount = Object.values(counts).reduce((a, b) => a + b, 0);

    const premiumQBKey = `trackpro_${sub}_premiumQuestionBank`;
    const premiumQBCount = localStorage.getItem(premiumQBKey) ? parseInt(localStorage.getItem(premiumQBKey)) : 0;

    const thisChapterPremiumCount = PQBTOTAL[sub];
    const toAdd = Math.round(((premiumQBCount / thisChapterPremiumCount) * chapters.length));

    console.log(toAdd, premiumQBCount, thisChapterPremiumCount, chapters.length);

    return { subject: sub, total: totalCount + toAdd, max: chapters.length * 6 + chapters.length };
  });

  const isDark = false;
  const bg = isDark ? '#1a202c' : '#f0f4f8';
  const txt = isDark ? '#e2e8f0' : '#1a202c';
  const txt2 = isDark ? '#a0aec0' : '#4a5568';
  const accent = '#3182ce';
  const bdr = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
  const cardBg = isDark ? '#1f2937' : '#ffffff';
  const logoUrl = LOGO_URL;
  const nameColor = 'red';

  return `
    <div style="font-family:'Segoe UI',system-ui,-apple-system,sans-serif;background:${bg};padding:28px;color:${txt};width:800px;position:relative;">
      <style>
        * { box-sizing: border-box; }

        @media print {
          @page {
            margin: 24mm 14mm 18mm 14mm;
          }

          body {
            margin: 0;
            padding: 0;
          }

          .print-logo-header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 78px;
            background: ${bg};
            display: flex;
            align-items: center;
            justify-content: center;
            border-bottom: 1px solid ${bdr};
            z-index: 9999;
          }

          .report-content {
            padding-top: 95px;
          }
        }

        .page-break-avoid,
        .subject-table-block,
        .chart-card,
        .summary-table-wrap,
        .report-header {
          page-break-inside: avoid;
          break-inside: avoid;
        }

        h1, h2, h3, h4 {
          page-break-after: avoid;
          break-after: avoid;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        thead {
          display: table-header-group;
        }

        tr, td, th {
          page-break-inside: avoid;
          break-inside: avoid;
        }
      </style>

      <div class="print-logo-header">
        <img
          src="${logoUrl}"
          alt="RKClasses"
          style="max-height:52px;width:auto;object-fit:contain;"
        />
      </div>

<div class="report-content">
  <div class="report-header" style="
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:16px;
    margin-bottom:20px;
  ">

    <!-- LEFT: BIG PHOTO -->
    ${details.photo ? `
      <div>
        <img 
          src="${details.photo}" 
          alt="Profile"
          style="
            width:200px;
            height:200px;
           border-radius:6px;
            object-fit:cover;
           
          "
        />
      </div>
    ` : '<div style="width:100px;"></div>'}

    <!-- CENTER: NAME + DATE -->
    <div style="flex:1;text-align:left;">
      <h1 style="
        font-size:1.5rem;
        margin:0 0 6px 0;
        color:${nameColor};
      ">
        ${details.fullName} L2 Progress Tracker
      </h1>

     

    <p style="margin:4px 0 0 0;font-size:0.8rem;color:${txt2};font-weight:bold;">
  Generated on ${new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })}
</p>
    </div>

    <!-- RIGHT: EXAM + TIME -->
    <div style="text-align:right;min-width:140px;">
      
      ${details.exam ? `
        <p style="
          margin:0;
          font-size:0.95rem;
          font-weight:700;
          color:${txt2};
        ">
        L2 ${details.exam} exam
        </p>
      ` : ''}

      ${timeLeft ? `
        <p style="
          margin:6px 0 0 0;
          font-size:0.85rem;
          color:${nameColor};
        ">
          ⏳ ${timeLeft}
        </p>
      ` : ''}
      ${details.prepStartDate ? `
  <p style="
    margin:6px 0 0 0;
    font-size:0.95rem;
    color:blue;
    font-weight:bold;

  ">
    Prep Start: ${getPremonth(details.prepStartDate)}
  </p>
` : ''}

${details.attendingClass ? `
  <p style="
    margin:6px 0 0 0;
   font-size:0.95rem;
          font-weight:700;
          color:${txt2};
  ">
    Mode of Classes: ${details.attendingClass}
  </p>
` : ''}

    </div>

    

  </div>
</div>

        <div class="page-break-avoid">
          <h3 style="margin:0 0 12px 0;font-size:1.1rem;color:${accent};">📊 Subject-wise Completion Status</h3>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            ${QUESTION_CHARTS.map((q) => {
              const chartBg = isDark ? `${q.color}15` : `${q.color}12`;
              return `
                <div class="chart-card" style="padding:12px;border:1px solid ${bdr};border-radius:10px;background:${chartBg};">
                  <h4 style="margin:0 0 6px 0;font-size:0.9rem;color:${txt};display:flex;align-items:center;gap:6px;">
                    ${q.label}
                  </h4>
                  ${buildQuestionChartSVG(q.id, q.color, isDark)}
                </div>
              `;
            }).join('')}

            <div class="chart-card" style="padding:12px;border:1px solid ${bdr};border-radius:10px;background:#f59e0b12;">
              <h4 style="margin:0 0 6px 0;font-size:0.9rem;color:${txt};display:flex;align-items:center;gap:6px;">
                Premium QB Practice Status
              </h4>
              ${buildPremiumQBChart()}
            </div>
          </div>
        </div>

        <div class="summary-table-wrap" style="margin-top:20px;">
         

          <h3 style="margin:0 0 12px 0;font-size:1.1rem;color:${accent};">
            Subject Level Summary Table
          </h3>

          <div
            class="chart-card"
            style="
              padding:14px;
              border:1px solid ${bdr};
              border-radius:10px;
              background:${cardBg};
              overflow:hidden;
            "
          >
            <table style="width:100%;border-collapse:collapse;font-size:0.9rem;">
            <thead>
  <tr style="background:${isDark ? '#111827' : '#f8fafc'};">
    <th style="padding:10px;border:1px solid ${bdr};text-align:left;">Subject</th>

 ${yesCounts.map(sub => `
  <th
    style="
      padding:10px;
      border:1px solid ${bdr};
      text-align:center;
      white-space:nowrap;
      font-weight:700;
    "
  >
    <span
      style="
        color:${isInCompletedInClass(sub.subject) ? 'blue' : 'inherit'};
        padding-bottom:${isInCompletedInClass(sub.subject) ? '4px' : '0'};
        border-bottom:${isInCompletedInClass(sub.subject) ? '2px solid blue' : 'none'};
        display:inline-block;
      "
    >
      ${sub.subject}
    </span>
  </th>
`).join('')}
    
  </tr>
</thead>

              <tbody>
                <tr>
                  <td style="padding:10px;border:1px solid ${bdr};font-weight:600;">Score</td>
                  ${yesCounts.map((sub) => {
                    const percent = sub.max ? Math.round((sub.total / sub.max) * 100) : 0;
                    const color = getPerformanceColor(percent);
                    return `
                      <td style="padding:10px;border:1px solid ${bdr};text-align:center;color:${color};font-weight:700;">
                        ${percent}%
                      </td>
                    `;
                  }).join('')}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        ${buildSubjectChapterTables(isDark, txt2, accent, bdr)}
      </div>
    </div>
  `;
}

// ─── Watermark stamper — draws logo centered on every PDF page ─────────
async function stampWatermarkOnAllPages(pdf) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;

        const ctx = canvas.getContext('2d');

        // increase visibility
        ctx.globalAlpha = 0.03;
        ctx.drawImage(img, 0, 0);

        const dataUrl = canvas.toDataURL('image/png');

        const totalPages = pdf.internal.getNumberOfPages();
        const pageW = pdf.internal.pageSize.getWidth();
        const pageH = pdf.internal.pageSize.getHeight();

        const wmW = 140;
        const aspectRatio = img.naturalHeight / img.naturalWidth;
        const wmH = wmW * aspectRatio;

        const x = (pageW - wmW) / 2;
        const y = (pageH - wmH) / 2;

        for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i);
          pdf.addImage(dataUrl, 'PNG', x, y, wmW, wmH);
        }

        resolve(pdf);
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => reject(new Error('Failed to load watermark image'));
    img.src = WATER_MARK;
  });
}

// ─── PDF Generator ─────────────────────────────────────────────────────
async function createPdfFromElement(element) {
  let name = localStorage.getItem('generalDetails') || '';
  let fullName = name ? JSON.parse(name).fullName || '' : 'Progress';
  let number = name ? JSON.parse(name).mobile : '';
  console.log(name);
  const fileName = `${fullName}_${number}_${new Date().toISOString().split('T')[0]}.pdf`;

  const opt = {
    margin: [1, 1, 1, 1],
    filename: fileName,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      scrollY: 0,
      backgroundColor: null,
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
    },
    pagebreak: {
      mode: ['css', 'avoid-all', 'legacy'],
      avoid: ['.subject-table-block', '.summary-table-wrap', '.chart-card', 'table', 'tr', 'h3', 'h4'],
    },
  };

  // Step 1: render HTML → jsPDF object (do NOT auto-save yet)
  const worker = html2pdf().set(opt).from(element);
  const pdf = await worker.toPdf().get('pdf');

  // Step 2: stamp watermark on every page
  await stampWatermarkOnAllPages(pdf);

  // Step 3: output as blob
  const pdfBlob = pdf.output('blob');
  const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });
  const pdfUrl = URL.createObjectURL(pdfBlob);

  return {
    pdfBlob,
    pdfFile,
    pdfUrl,
    pdfFileName: fileName,
  };
}

// ─── Component ─────────────────────────────────────────────────────────
export default function TalkWithSirButton() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfFileName, setPdfFileName] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [shareError, setShareError] = useState('');

  // ── Phase 1: Generate only, no sharing ──────────────────────────────
  const handleGenerate = async () => {
   
const generalDetails = localStorage.getItem('generalDetails');

if (generalDetails === null) {
  alert('Please fill in your general details first!');
  return;
}

const details = JSON.parse(generalDetails);

// Check required fields (photo is optional)
if (
  !details.fullName ||
  !details.mobile ||
  !details.exam ||
  !details.prepStartDate ||
  !details.attendingClass
) {
  alert('Please complete all required general details first!');
  return;
}


    let wrapper = null;
    try {
      setIsGenerating(true);
      setShareError('');

      // Clean up any previous blob URL
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
      setPdfFile(null);

      wrapper = document.createElement('div');
      wrapper.style.cssText =
        'position:fixed;left:-99999px;top:0;width:800px;z-index:-1;';
      wrapper.innerHTML = buildReportHTML();
      document.body.appendChild(wrapper);

      await new Promise((r) => setTimeout(r, 300));

      const target = wrapper.firstElementChild;
      if (!target) throw new Error('Report element not found');

      const { pdfFile: file, pdfUrl: url, pdfFileName: name } =
        await createPdfFromElement(target);

      setPdfFile(file);
      setPdfUrl(url);
      setPdfFileName(name);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert(`Failed to generate PDF: ${err.message}`);
    } finally {
      if (wrapper) wrapper.remove();
      setIsGenerating(false);
    }
  };

  // ── Phase 2: Share — called from a FRESH click handler ──────────────
  const handleShare = () => {
    if (!pdfFile) return;

    const canShare =
      navigator.share &&
      navigator.canShare &&
      navigator.canShare({ files: [pdfFile] });

    if (canShare) {
      navigator.share({
        title: 'Student Progress Report',
        text: 'Please find my progress report attached.',
        files: [pdfFile],
      }).catch((err) => {
        if (err?.name === 'AbortError') return;
        setShareError(
          'Sharing failed. Download the PDF and attach it manually in WhatsApp.'
        );
        setIsOpen(true);
      });
    } else {
      setShareError(
        'Direct file sharing is not supported here. Download the PDF and attach it in WhatsApp.'
      );
      setIsOpen(true);
    }
  };

  const downloadPDF = () => {
    if (!pdfUrl) return;
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = pdfFileName || 'Student_Progress.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const openWhatsApp = () => {
    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_TEMPLATE)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const closeModal = () => {
    setIsOpen(false);
    setShareError('');
  };

  // ── Render ───────────────────────────────────────────────────────────
  const pdfReady = !!pdfFile;

  return (
    <>
      <div
        className="mt-6 mb-8 text-center glass-panel"
        style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}
      >
        <h3 style={{ marginBottom: '1rem' }}>Ready to share your progress?</h3>
        <p style={{ color: 'var(--text-secondary)', margin: '0 auto 1.5rem auto', maxWidth: '600px' }}>
          {pdfReady
            ? 'PDF is ready! Tap "Share PDF" to send it.'
            : 'Click on "Send PDF to Sir" your PDF will be generated and sent automatically'}
        </p>

        {/* Step 1 — Generate */}
        <button
          className="btn"
          onClick={handleGenerate}
          disabled={isGenerating}
          style={{
            maxWidth: 400, margin: '0 auto 12px auto', width: '100%',
            padding: '1rem', fontSize: '1.1rem',
            background: pdfReady
              ? 'linear-gradient(135deg,#38a169,#276749)'
              : 'linear-gradient(135deg,#3182ce,#2c5282)',
            color: 'white', border: 'none', borderRadius: 'var(--radius-md)',
            cursor: isGenerating ? 'not-allowed' : 'pointer',
            opacity: isGenerating ? 0.8 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          {isGenerating ? (
            <><Loader2 className="animate-spin" /> Generating…</>
          ) : pdfReady ? (
            <><FileText /> ✓ PDF Ready — Regenerate</>
          ) : (
            <><MessageCircle /> Send PDF to Sir</>
          )}
        </button>

        {/* Step 2 — Share (only shown when PDF exists) */}
        {pdfReady && (
          <button
            className="btn"
            onClick={handleShare}
            style={{
              maxWidth: 400, margin: '0 auto', width: '100%',
              padding: '1rem', fontSize: '1.1rem',
              background: 'linear-gradient(135deg,#25D366,#128C7E)',
              color: 'white', border: 'none', borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <MessageCircle /> Share PDF to sir
          </button>
        )}
      </div>

      {/* Fallback modal */}
      {isOpen && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* … your existing modal JSX … */}
          </div>
        </div>
      )}
    </>
  );
}













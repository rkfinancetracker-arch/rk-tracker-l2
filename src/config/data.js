// 1. Define the shared set of questions used by all chapters
const COMMON_QUESTIONS = {
  "q1": { "type": "mcq", "question": "Have you watched the lectures?", "options": ["Yes", "No"] },
  "q2": { "type": "mcq", "question": "Have you completed the reading through Schweser Textbook?", "options": ["Yes", "No"] },
  "q3": { "type": "mcq", "question": "Have you completed schwser QB ?", "options": ["Yes", "No"] },
  "q4": { "type": "mcq", "question": "Have you completed practice with Institute End of chapter QB ?", "options": ["Yes", "No"] },
  "q5": { "type": "mcq", "question": "Have u completed the revision ?", "options": ["Yes", "No"] },
  "q6": { "type": "mcq", "question": "Have you taken the Chapterwise test ?", "options": ["Yes", "No"] }
};

// 2. Helper function to apply these questions to an array of chapter titles
const createSubject = (chapters) => {
  return chapters.reduce((acc, title) => {
    acc[title] = { ...COMMON_QUESTIONS };
    return acc;
  }, {});
};

// 3. Combined Data Structure (Level 1 + Level 2 chapters based on your comments)
const QUESTION_DATA = {
  "Quants": createSubject([
    "1. Multiple Regression",
    "2. Time-Series Analysis",
    "3. Machine Learning",
    "4. Big Data"
  ]),

  "ECO": createSubject([
    "5. Currency Exchange Rates",
    "6. Economic Growth"
  ]),

  "FSA": createSubject([
    "7. Intercorporate investments",
    "8. Employee Compensation",
    "9. Multinational Operations",
    "10. Financial Institutions",
    "11. Quality of Financial Reports",
    "12. FSAT"
  ]),

  "CI": createSubject([
    "12. Dividends and Share Repurchases",
    "13. ESG",
    "14. Cost of Capital",
    "15. Corporate Restructuring"
  ]),

  "Equity": createSubject([
    "16. Valuation",
    "17. Discounted Dividend Valuation",
    "18. Free Cash Flow Valuation",
    "19. Market-Based Valuation",
    "20. Residual Income Valuation",
    "21. Private Company Valuation"
  ]),

  "FI": createSubject([
    "22. Term Structure",
    "23. Arbitrage-Free Valuation",
    "24. Embedded Options",
    "25. Credit Analysis",
    "26. Credit Default Swaps"
  ]),

  "DI": createSubject([
    "27. Forwards",
    "28. Contingent Claims"
  ]),

  "AI": createSubject([
    "29. Commodities",
    "30. Overview of Real Estate",
    "31. Real Estate - Publicly Traded",
    "32. Hedge Fund"
  ]),

  "PM": createSubject([
    "33. Economics and Investment Markets",
    "34. Active Portfolio Management",
    "35. ETF",
    "36. Multifactor Models",
    "37. Market Risk",
    "38. Backtesting and Simulation"
  ]),

  "Ethics": createSubject([
    "39. Code of Ethics",
    "40. Guidance for Standards: 1AB",
    "40.1 Guidance for Standards: 1CD",
    "40.2 Guidance for Standards: 2AB",
    "40.3 Guidance for Standards: 3A",
    "40.4 Guidance for Standards: 3BC",
    "40.5 Guidance for Standards: 3DE",
    "40.6 Guidance for Standards: 4ABC",
    "40.7 Guidance for Standards: 5",
    "40.8 Guidance for Standards: 6",
    "40.9 Guidance for Standards: 7",
    "41. Application"
  ])
};

export default QUESTION_DATA;
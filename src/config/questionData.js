/**
 * ====================================================================
 *  QUESTION DATA FILE — EDIT THIS TO CUSTOMIZE YOUR CURRICULUM
 * ====================================================================
 * 
 * Structure:
 *   { subjectName: { chapterName: { questionId: { type, question, options } } } }
 * 
 * Each question is an MCQ with exactly 4 options.
 * The student selects one option per question. 
 * 
 * Scoring for bar charts:
 *   - 1st option = 1 point (correct / best)
 *   - 2nd option = 0.5 points
 *   - 3rd option = 0.5 points
 *   - 4th option = 0 points (worst)
 * 
 * To add a new subject:   Add a new key at the top level.
 * To add a new chapter:   Add a new key inside a subject.
 * To add a new question:  Add a new qN key inside a chapter.
 * ====================================================================
 */


import QUESTION_DATA from './data.js';
import EXAM_OPTIONS from './exam_option.js';

export { EXAM_OPTIONS };




export const SUBJECTS = Object.keys(QUESTION_DATA);

// Get chapters for a subject → ["Chapter 1", "Chapter 2", ...]
export function getChapters(subjectName) {
  return Object.keys(QUESTION_DATA[subjectName] || {});
}

// Get questions for a chapter → [{ id: "q1", question: "...", options: [...] }, ...]
export function getQuestions(subjectName, chapterName) {
  const chap = (QUESTION_DATA[subjectName] || {})[chapterName] || {};
  return Object.entries(chap).map(([id, data]) => ({
    id,
    ...data
  }));
}

// Count total questions in a chapter
export function getQuestionCount(subjectName, chapterName) {
  return getQuestions(subjectName, chapterName).length;
}

export default QUESTION_DATA;
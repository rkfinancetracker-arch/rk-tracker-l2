import React, { createContext, useContext } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { SUBJECTS, CHAPTERS_PER_SUBJECT, QUESTIONS } from '../config/constants';

// Organize defaults into a structured format
const defaultSubjectsList = SUBJECTS.map(sub => ({
  id: sub,
  name: sub,
  chapters: [...CHAPTERS_PER_SUBJECT]
}));

const defaultConfig = {
  subjects: defaultSubjectsList,
  questions: QUESTIONS
};

const ConfigContext = createContext();

export const ConfigProvider = ({ children }) => {
  const [config, setConfig] = useLocalStorage('appConfig', defaultConfig);

  // Helper methods to modify config
  const addSubject = (name) => {
    setConfig(prev => ({
      ...prev,
      subjects: [...prev.subjects, { id: name, name, chapters: [] }]
    }));
  };

  const removeSubject = (subjectId) => {
    setConfig(prev => ({
      ...prev,
      subjects: prev.subjects.filter(s => s.id !== subjectId)
    }));
  };

  const addChapter = (subjectId, chapterName) => {
    setConfig(prev => ({
      ...prev,
      subjects: prev.subjects.map(s => 
        s.id === subjectId ? { ...s, chapters: [...s.chapters, chapterName] } : s
      )
    }));
  };

  const removeChapter = (subjectId, chapterName) => {
    setConfig(prev => ({
      ...prev,
      subjects: prev.subjects.map(s => 
        s.id === subjectId ? { ...s, chapters: s.chapters.filter(c => c !== chapterName) } : s
      )
    }));
  };
  
  const addQuestion = (question) => {
    setConfig(prev => ({
      ...prev,
      questions: [...prev.questions, question]
    }));
  };
  
  const removeQuestion = (qId) => {
    setConfig(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== qId)
    }));
  };

  return (
    <ConfigContext.Provider value={{ config, setConfig, addSubject, removeSubject, addChapter, removeChapter, addQuestion, removeQuestion }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => useContext(ConfigContext);

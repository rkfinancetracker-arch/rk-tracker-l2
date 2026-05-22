import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Dashboard from './pages/Dashboard';
import SubjectPage from './pages/SubjectPage';
import GeneralDetailsPage from './pages/GeneralDetailsPage';


function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/subject/:subjectName" element={<SubjectPage />} />
          <Route path="/details" element={<GeneralDetailsPage />} />
        

        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

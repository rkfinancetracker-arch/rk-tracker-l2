import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useConfig } from '../context/ConfigContext';
import { ArrowLeft, Plus, Trash2, Settings as SettingsIcon } from 'lucide-react';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { config, addSubject, removeSubject, addChapter, removeChapter, addQuestion, removeQuestion } = useConfig();
  
  const [newSubName, setNewSubName] = useState('');
  const [newChapData, setNewChapData] = useState({}); // { subjectId: "chapterName" }
  const [newQuestion, setNewQuestion] = useState({ id: '', label: '', type: 'dropdown', options: 'Done,Pending', points: 1 });

  const handleAddSub = () => {
    if (newSubName.trim() && !config.subjects.find(s => s.id === newSubName.trim())) {
      addSubject(newSubName.trim());
      setNewSubName('');
    }
  };

  const handleAddChap = (subId) => {
    const chapName = newChapData[subId];
    if (chapName?.trim()) {
      addChapter(subId, chapName.trim());
      setNewChapData(prev => ({ ...prev, [subId]: '' }));
    }
  };

  const handleAddQues = () => {
    if (newQuestion.id.trim() && newQuestion.label.trim()) {
      addQuestion({
        id: newQuestion.id.trim(),
        label: newQuestion.label.trim(),
        type: newQuestion.type,
        options: newQuestion.options.split(',').map(s => s.trim()),
        points: parseInt(newQuestion.points) || 1
      });
      setNewQuestion({ id: '', label: '', type: 'dropdown', options: 'Done,Pending', points: 1 });
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main className="app-container" style={{ flex: 1, width: '100%', maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '3rem' }}>
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="btn-icon">
              <ArrowLeft size={24} />
            </button>
            <h2 className="flex items-center gap-2 m-0" style={{ fontSize: '1.8rem' }}>
              <SettingsIcon color="var(--accent-primary)" size={28} /> Curriculum Settings
            </h2>
          </div>
        </div>

        {/* Subjects & Chapters Config */}
        <section className="glass-card">
          <h3 className="border-b pb-2 mb-4" style={{ borderColor: 'var(--card-border)' }}>Manage Subjects & Chapters</h3>
          
          <div className="flex gap-2 mb-6">
            <input 
              type="text" 
              className="form-input flex-1" 
              placeholder="New Subject Name (e.g. History)" 
              value={newSubName} 
              onChange={e => setNewSubName(e.target.value)} 
            />
            <button className="btn" onClick={handleAddSub}><Plus size={18}/> Add Subject</button>
          </div>

          <div className="flex flex-col gap-4">
            {config.subjects.map(sub => (
              <div key={sub.id} style={{ padding: '1rem', border: '1px solid var(--card-border)', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)' }}>
                <div className="flex justify-between items-center mb-3">
                  <h4 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--accent-primary)' }}>{sub.name}</h4>
                  <button className="btn-icon" onClick={() => removeSubject(sub.id)} style={{ color: 'var(--danger)' }}>
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <div className="pl-4 border-l-2" style={{ borderColor: 'var(--card-border)' }}>
                  {sub.chapters.length > 0 ? (
                    <ul style={{ listStyleType: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                      {sub.chapters.map((chap, idx) => (
                        <li key={idx} className="flex justify-between items-center p-2 rounded" style={{ backgroundColor: 'var(--bg-primary)' }}>
                          <span>{chap}</span>
                          <button className="btn-icon" onClick={() => removeChapter(sub.id, chap)} style={{ color: 'var(--danger)' }}><Trash2 size={14}/></button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>No chapters added.</p>
                  )}
                  
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      className="form-input flex-1" 
                      placeholder="Add Chapter (e.g. Chapter 1)" 
                      value={newChapData[sub.id] || ''} 
                      onChange={e => setNewChapData(prev => ({ ...prev, [sub.id]: e.target.value }))}
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}
                    />
                    <button className="btn btn-outline" onClick={() => handleAddChap(sub.id)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>Add</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Global Questions Config */}
        <section className="glass-card mb-8">
          <h3 className="border-b pb-2 mb-4" style={{ borderColor: 'var(--card-border)' }}>Global Chapter Questions</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>These questions appear inside every chapter accordion.</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem', marginBottom: '2rem' }}>
            {config.questions.map(q => (
              <div key={q.id} className="flex justify-between items-center p-3 rounded border" style={{ borderColor: 'var(--card-border)', backgroundColor: 'var(--bg-secondary)' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{q.label} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({q.id})</span></div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Type: {q.type} | Options: {q.options?.join(', ')} | Points: {q.points}</div>
                </div>
                <button className="btn-icon" onClick={() => removeQuestion(q.id)} style={{ color: 'var(--danger)' }}><Trash2 size={18}/></button>
              </div>
            ))}
          </div>

          <div style={{ padding: '1rem', border: '1px dashed var(--card-border)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ margin: 0 }}>Add New Question Form</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
               <input type="text" className="form-input" placeholder="Question ID (e.g. q7)" value={newQuestion.id} onChange={e => setNewQuestion(prev=>({...prev, id: e.target.value}))} />
               <input type="text" className="form-input" placeholder="Label (e.g. Watched Video?)" value={newQuestion.label} onChange={e => setNewQuestion(prev=>({...prev, label: e.target.value}))} />
               <select className="form-select" value={newQuestion.type} onChange={e => setNewQuestion(prev=>({...prev, type: e.target.value}))}>
                 <option value="dropdown">Dropdown</option>
                 <option value="text">Input Text</option>
               </select>
               <input type="text" className="form-input" placeholder="Options (comma separated)" value={newQuestion.options} onChange={e => setNewQuestion(prev=>({...prev, options: e.target.value}))} />
               <input type="number" className="form-input" placeholder="Points" value={newQuestion.points} onChange={e => setNewQuestion(prev=>({...prev, points: e.target.value}))} />
            </div>
            <button className="btn" onClick={handleAddQues} style={{ alignSelf: 'flex-start' }}><Plus size={18}/> Add Question</button>
          </div>
        </section>

      </main>
    </div>
  );
}

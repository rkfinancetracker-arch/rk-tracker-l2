import React, { useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { exportData, importData } from '../utils/exportImportHelper';
import { Moon, Sun, Download, Upload, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const fileInputRef = useRef(null);

  const logo_url = 'https://res.cloudinary.com/dzl0crskt/image/upload/v1779268139/RK-Finance-Classes-Logo-ed-1_wa28ms.png'

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      importData(file, () => {
        alert("Data imported successfully! The dashboard will now reload.");
        window.location.reload();
      });
    }
  };

  return (
    <header className="glass-panel" style={{ padding: '1rem', position: 'sticky', top: 0, zIndex: 50 }}>
      <div className="flex justify-between items-center" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Link to="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="flex items-center gap-2 cursor-pointer">
            <div style={{  padding: '0.5rem', borderRadius: '8px', color: 'white' }}>
             <img src={logo_url} alt="RKClasses" style={{ width: '100%', height: 'auto' }} />
            </div>
           
          </div>
        </Link>
        
        <div className="flex items-center gap-2">
          <input 
            type="file" 
            accept=".json" 
            style={{ display: 'none' }} 
            ref={fileInputRef}
            onChange={handleImport}
          />
          <button 
            onClick={() => fileInputRef.current?.click()} 
            className="btn-icon" 
            title="Import Data"
          >
            <Upload size={20} />
          </button>
          <button 
            onClick={exportData} 
            className="btn-icon" 
            title="Export Data"
          >
            <Download size={20} />
          </button>
          
          <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--card-border)', margin: '0 0.5rem' }}></div>
          
          <button onClick={toggleTheme} className="btn-icon" title="Toggle Theme">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
}

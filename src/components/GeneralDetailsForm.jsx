
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from '../hooks/useLocalStorage';
import {
  User,
  Phone,
  Calendar,
  ArrowRight,
  Building2,
} from 'lucide-react';
import { EXAM_OPTIONS } from '../config/questionData';
import CLASS_OPTIONS  from '../config/class_option'

export default function GeneralDetailsForm() {
  const navigate = useNavigate();
  

  const [details, setDetails] = useLocalStorage('generalDetails', {
    fullName: '',
    uniqueId: '',
    mobile: '',
    exam: '',
    photo: '',
    prepStartDate: '',
    attendingClass: '', // NEW FIELD
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'mobile' && value !== '' && !/^\d+$/.test(value)) {
      return;
    }

    setDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (event) => {
      img.src = event.target.result;
    };

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 200;
      const scale = MAX_WIDTH / img.width;

      canvas.width = MAX_WIDTH;
      canvas.height = img.height * scale;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);

      setDetails((prev) => ({
        ...prev,
        photo: compressedBase64,
      }));
    };

    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    if (window.confirm('Are you sure you want to clear your general details?')) {
      setDetails({
        fullName: '',
        uniqueId: '',
        mobile: '',
        exam: '',
        photo: '',
        prepStartDate: '',
        attendingClass: '',
      });
    }
  };

  return (
    <div className="glass-card mb-6 p-5 rounded-2xl shadow-md">
      <div
        className="flex justify-between items-center mb-5 pb-3 border-b"
        style={{ borderBottom: '1px solid var(--card-border)' }}
      >
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <User size={22} color="var(--accent-primary)" />
          General Details
        </h2>

        <button
          type="button"
          className="btn btn-outline"
          style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}
          onClick={resetForm}
        >
          Reset Form
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1rem',
        }}
      >
        {/* Full Name */}
        <div className="form-group">
          <label className="form-label flex items-center gap-1 mb-2">
            <User size={14} />
            Full Name *
          </label>

          <input
            type="text"
            name="fullName"
            value={details.fullName}
            onChange={handleChange}
            className="form-input w-full"
            placeholder="e.g. Sneh"
            required
          />
        </div>

        {/* Mobile */}
        <div className="form-group">
          <label className="form-label flex items-center gap-1 mb-2">
            <Phone size={14} />
            Mobile Number *
          </label>

          <input
            type="tel"
            name="mobile"
            value={details.mobile}
            onChange={handleChange}
            className="form-input w-full"
            placeholder="e.g. 93213860123"
            required
          />
        </div>

        {/* Exam */}
        <div className="form-group">
          <label className="form-label flex items-center gap-1 mb-2">
            <Calendar size={14} />
            Which exam are you appearing for? *
          </label>

          <select
            name="exam"
            value={details.exam}
            onChange={handleChange}
            className="form-select w-full"
            required
          >
            <option value="" disabled>
              -- Select Exam --
            </option>

            {EXAM_OPTIONS.map((exam) => (
              <option key={exam} value={exam}>
                {exam}
              </option>
            ))}
          </select>
        </div>

        {/* NEW FIELD */}
        <div className="form-group">
          <label className="form-label flex items-center gap-1 mb-2">
            <Building2 size={14} />
            Attending classes at? *
          </label>

          <select
            name="attendingClass"
            value={details.attendingClass}
            onChange={handleChange}
            className="form-select w-full"
            required
          >
            <option value="" disabled>
              -- Select Option --
            </option>

            {CLASS_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        {/* Prep Start Date */}
        <div className="form-group">
          <label className="form-label flex items-center gap-1 mb-2">
            <Calendar size={14} />
            Prep Start Date *
          </label>

          <input
            type="date"
            name="prepStartDate"
            value={details.prepStartDate}
            onChange={handleChange}
            className="form-input w-full"
            required
          />
        </div>

        {/* Photo Upload */}
        <div className="form-group">
          <label className="form-label mb-2">Upload Photo</label>

          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="form-input w-full"
          />

          {details.photo && (
            <img
              src={details.photo}
              alt="Preview"
              style={{
                marginTop: '10px',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                objectFit: 'cover',
              }}
            />
          )}
        </div>
      </div>

      <div className="mt-5">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="btn btn-outline flex items-center gap-2"
        >
          <ArrowRight size={18} />
          Next
        </button>
      </div>
    </div>
  );
}


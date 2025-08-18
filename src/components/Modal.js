import React, { useState, useEffect } from 'react';
import { useNotify } from '../context/NotificationContext';
import InfoModal from './InfoModal';
import UserProfile from './UserProfile';
import Analytics from './Analytics';
import BackupRestoreModal from './BackupRestoreModal';

const Modal = ({
  type,
  data,
  onClose,
  onSave,
  onLogout,
  L,
  loading = false,
}) => {
  const { notify } = useNotify();
  // State declarations at the top level to avoid conditional calls
  const [formData, setFormData] = useState({});
  // Notify prefs state must not be conditional
  const [localPrefs, setLocalPrefs] = useState(
    () => (type === 'notify_prefs' && data && data.prefs) || {},
  );
  // Contact Admin form state (keep un-conditional)
  const [contactForm, setContactForm] = useState({
    category: 'Jamaat',
    name: '',
    mobile: '',
    message: '',
  });

  // Timetable local state
  const [times, setTimes] = useState({
    Fajr: data?.times?.Fajr || '05:15',
    Dhuhr: data?.times?.Dhuhr || '14:15',
    Asr: data?.times?.Asr || '17:30',
    Maghrib: data?.times?.Maghrib || '19:10',
    Isha: data?.times?.Isha || '20:45',
  });

  // Update times when data prop changes
  useEffect(() => {
    if (type === 'timetable' && data?.times) {
      setTimes(data.times);
    }
  }, [data, type]);

  // Sync notify prefs when modal opens for notify_prefs
  useEffect(() => {
    if (type === 'notify_prefs') {
      setLocalPrefs((data && data.prefs) || {});
    }
  }, [type, data]);

  // Reset contact form when opening contact modal
  useEffect(() => {
    if (type === 'contact_admin') {
      setContactForm({ category: 'Jamaat', name: '', mobile: '', message: '' });
    }
  }, [type]);

  useEffect(() => {
    if (type === 'house') {
      const isEdit = data?.mode === 'edit';
      setFormData(
        isEdit ? { ...(data?.house || {}) } : { number: '', street: '' },
      );
    } else if (type === 'member') {
      const isEdit = data?.mode === 'edit';
      setFormData(
        isEdit
          ? {
              ...(data?.member || {}),
              houseId: data?.houseId,
              id: data?.member?.id,
              maktab: data?.member?.maktab ?? 'no',
              dawatCounts: data?.member?.dawatCounts || {
                '3-day': 0,
                '10-day': 0,
                '40-day': 0,
                '4-month': 0,
              },
            }
          : {
              name: '',
              fatherName: '',
              age: '',
              gender: 'Male',
              role: 'Member',
              occupation: '',
              education: 'Below 8th',
              quran: 'no',
              dawat: 'Nil',
              mobile: '',
              maktab: 'no',
              fatherNameDefault: data?.headName || '',
              dawatCounts: {
                '3-day': 0,
                '10-day': 0,
                '40-day': 0,
                '4-month': 0,
              },
            },
      );
    } else if (type === 'info') {
      // Info modal doesn't need form data
    }
  }, [type, data]);

  // Initialize/editable timetable values when this modal is opened
  useEffect(() => {
    if (type === 'timetable') {
      setTimes({
        Fajr: data?.times?.Fajr || '05:15',
        Dhuhr: data?.times?.Dhuhr || '14:15',
        Asr: data?.times?.Asr || '17:30',
        Maghrib: data?.times?.Maghrib || '19:10',
        Isha: data?.times?.Isha || '20:45',
      });
    }
  }, [type, data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'dawat') {
      // When Dawat Status changes, update dawatCounts accordingly
      let newCounts = { '3-day': 0, '10-day': 0, '40-day': 0, '4-month': 0 };
      if (value === '3-day') newCounts['3-day'] = 1;
      else if (value === '10-day') newCounts['10-day'] = 1;
      else if (value === '40-day') newCounts['40-day'] = 1;
      else if (value === '4-month') newCounts['4-month'] = 1;
      setFormData((prev) => ({
        ...prev,
        dawat: value,
        dawatCounts: newCounts,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = () => {
    let payload = { ...formData };
    if (type === 'member') {
      // Basic validation
      if (!payload.name || payload.name.trim().length === 0) {
        notify('Member name is required', { type: 'error' });
        return;
      }
      const ageNum = Number(payload.age);
      if (Number.isNaN(ageNum) || ageNum < 0 || ageNum > 120) {
        notify('Please enter a valid age (0-120)', { type: 'error' });
        return;
      }
      if (!payload.gender) {
        notify('Please select gender', { type: 'error' });
        return;
      }
      if (!payload.role) {
        notify('Please select role', { type: 'error' });
        return;
      }
      if (payload.mobile && !/^\+?\d{7,15}$/.test(String(payload.mobile))) {
        notify('Please enter a valid mobile number', { type: 'error' });
        return;
      }
      payload.mode = data?.mode;
      payload.houseId = data?.houseId;
      if (data?.mode === 'edit') payload.id = data?.member?.id;
    } else if (type === 'house') {
      if (!payload.number && payload.number !== 0) {
        notify('House number is required', { type: 'error' });
        return;
      }
      if (!payload.street || payload.street.trim().length === 0) {
        notify('Street is required', { type: 'error' });
        return;
      }
      payload.mode = data?.mode;
      if (data?.mode === 'edit') payload.id = data?.house?.id;
    }
    onSave(payload, type);
  };

  if (type === 'house') {
    return (
      <div className="modal-backdrop">
        <div className="modal">
          <h3>
            {data?.mode === 'add'
              ? 'Add New House'
              : `Edit House — ${data?.house?.number ?? ''}`}
          </h3>
          <div className="form-row">
            <div>
              <label>House Number</label>
              <input
                name="number"
                type="number"
                value={formData.number || ''}
                onChange={handleChange}
              />
            </div>
            <div>
              <label>Street</label>
              <input
                name="street"
                value={formData.street || ''}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="actions">
            <button className="ghost" onClick={onClose}>
              Cancel
            </button>
            <button onClick={handleSubmit}>
              {data?.mode === 'add' ? 'Create' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'member') {
    return (
      <div className="modal-backdrop">
        <div className="modal">
          <h3>
            {data?.mode === 'add' ? 'Add Member' : 'Edit Member'} — House{' '}
            {data?.houseId ?? ''}
          </h3>
          <div className="form-row">
            <div>
              <label>Name</label>
              <input
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
              />
            </div>
            <div>
              <label>Father's Name</label>
              <input
                name="fatherName"
                placeholder={formData.fatherNameDefault || ''}
                value={formData.fatherName || ''}
                onChange={handleChange}
              />
            </div>
            <div>
              <label>Age</label>
              <input
                name="age"
                type="number"
                min="0"
                value={formData.age || ''}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="form-row">
            <div>
              <label>Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>
            <div>
              <label>Role</label>
              <select name="role" value={formData.role} onChange={handleChange}>
                <option>Member</option>
                <option>Head</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div>
              <label>Occupation</label>
              <input
                name="occupation"
                value={formData.occupation || ''}
                onChange={handleChange}
              />
            </div>
            <div>
              <label>Education</label>
              <select
                name="education"
                value={formData.education}
                onChange={handleChange}
              >
                <option>Below 8th</option>
                <option>10th</option>
                <option>12th</option>
                <option>Graduate</option>
                <option>Above Graduate</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div>
              <label>Quran Read</label>
              <select
                name="quran"
                value={formData.quran}
                onChange={handleChange}
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
            {Number(formData.age) < 14 && (
              <div>
                <label>Maktab</label>
                <select
                  name="maktab"
                  value={formData.maktab || 'no'}
                  onChange={handleChange}
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
            )}
            <div>
              <label>Dawat Status</label>
              <select
                name="dawat"
                value={formData.dawat || ''}
                onChange={handleChange}
              >
                <option value="Nil">Nil</option>
                <option value="3-day">3 days</option>
                <option value="10-day">10 days</option>
                <option value="40-day">40 days</option>
                <option value="4-month">4 months</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div>
              <label>3 days count</label>
              <input
                type="number"
                min="0"
                name="dc_3"
                value={formData.dawatCounts?.['3-day'] ?? 0}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    dawatCounts: {
                      ...(prev.dawatCounts || {}),
                      '3-day': Math.max(0, parseInt(e.target.value || '0')),
                    },
                  }))
                }
              />
            </div>
            <div>
              <label>10 days count</label>
              <input
                type="number"
                min="0"
                name="dc_10"
                value={formData.dawatCounts?.['10-day'] ?? 0}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    dawatCounts: {
                      ...(prev.dawatCounts || {}),
                      '10-day': Math.max(0, parseInt(e.target.value || '0')),
                    },
                  }))
                }
              />
            </div>
          </div>
          <div className="form-row">
            <div>
              <label>40 days count</label>
              <input
                type="number"
                min="0"
                name="dc_40"
                value={formData.dawatCounts?.['40-day'] ?? 0}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    dawatCounts: {
                      ...(prev.dawatCounts || {}),
                      '40-day': Math.max(0, parseInt(e.target.value || '0')),
                    },
                  }))
                }
              />
            </div>
            <div>
              <label>4 months count</label>
              <input
                type="number"
                min="0"
                name="dc_4m"
                value={formData.dawatCounts?.['4-month'] ?? 0}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    dawatCounts: {
                      ...(prev.dawatCounts || {}),
                      '4-month': Math.max(0, parseInt(e.target.value || '0')),
                    },
                  }))
                }
              />
            </div>
          </div>
          <div className="form-row">
            <div>
              <label>Mobile</label>
              <input
                name="mobile"
                value={formData.mobile || ''}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="actions">
            <button className="ghost" onClick={onClose}>
              Cancel
            </button>
            <button onClick={handleSubmit}>
              {data?.mode === 'add' ? 'Add' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Timetable modal (editable prayer times)
  if (type === 'timetable') {
    const onChange = (e) => {
      const { name, value } = e.target;
      setTimes((t) => ({ ...t, [name]: value }));
    };

    const handleSaveClick = () => {
      onSave({ times }, type);
    };

    const handleResetClick = () => {
      const ok = window.confirm(
        'Reset prayer times? This will revert Fajr, Dhuhr, Asr and Isha to their original values. Maghrib remains Auto from sunset.',
      );
      if (!ok) return;
      const fallback = {
        Fajr: '05:15',
        Dhuhr: '14:15',
        Asr: '17:30',
        Maghrib: times.Maghrib,
        Isha: '20:45',
      };
      const base = data && data.times ? data.times : fallback; // original values or sensible defaults
      setTimes(base);
    };

    return (
      <div className="modal-backdrop">
        <div className="modal">
          <div className="timetable-ayah">
            <div className="ayah-text">
              Beshak Namaz apne muqarrar waqto mein momino par farz hai
            </div>
            <div className="ayah-ref">(Surah An Nisa — Ayat 103)</div>
          </div>

          <div
            style={{
              background: '#fff3cd',
              padding: '8px 12px',
              borderRadius: 6,
              marginBottom: 10,
              fontSize: '0.9rem',
              lineHeight: 1.3,
              color: '#856404',
              textAlign: 'center',
              border: '1px solid #ffeeba',
            }}
          >
            <strong>Note:</strong> Maghrib automatically calculated from sunset
            for your location (28°58'24"N 77°41'22"E); other times editable. On
            Fridays, Dhuhr switches to Juma at 1:10 PM.
          </div>

          <div className="timetable-grid">
            <div className="time-field">
              <label>Fajr</label>
              <input
                type="time"
                step="60"
                name="Fajr"
                value={times.Fajr}
                onChange={onChange}
              />
            </div>
            <div className="time-field">
              <label>Dhuhr</label>
              <input
                type="time"
                step="60"
                name="Dhuhr"
                value={times.Dhuhr}
                onChange={onChange}
              />
            </div>
            <div className="time-field">
              <label>Asr</label>
              <input
                type="time"
                step="60"
                name="Asr"
                value={times.Asr}
                onChange={onChange}
              />
            </div>
            <div className="time-field">
              <label>
                Maghrib <span className="badge-auto">Auto</span>
              </label>
              <input
                type="time"
                step="60"
                name="Maghrib"
                value={times.Maghrib}
                onChange={onChange}
                disabled
              />
            </div>
            <div className="time-field">
              <label>Isha</label>
              <input
                type="time"
                step="60"
                name="Isha"
                value={times.Isha}
                onChange={onChange}
              />
            </div>
          </div>

          <div className="prayer-summary">
            <div className="summary-heading">
              <span className="heading-title">Prayer Timetable</span>
              <span className="heading-sub">Fazilatien</span>
            </div>
            <ul className="prayer-list">
              <li className="prayer-item">
                <div className="prayer-name">Fajr</div>
                <div className="prayer-time">{times.Fajr}</div>
                <div className="prayer-quote">
                  Fajr chehre ka noor hai — ise kabhi na chhodo.
                </div>
              </li>
              <li className="prayer-item">
                <div className="prayer-name">Dhuhr</div>
                <div className="prayer-time">{times.Dhuhr}</div>
                <div className="prayer-quote">
                  Dhuhr rooh ko sukoon deta hai, din ki thakan ko mitaata hai.
                </div>
              </li>
              <li className="prayer-item">
                <div className="prayer-name">Asr</div>
                <div className="prayer-time">{times.Asr}</div>
                <div className="prayer-quote">
                  Asr ka waqt ghanimat hai, guzar jaane se pehle apne Rabb ko
                  yaad karo.
                </div>
              </li>
              <li className="prayer-item">
                <div className="prayer-name">Maghrib</div>
                <div className="prayer-time">{times.Maghrib}</div>
                <div className="prayer-quote highlight">
                  Maghrib duaon ki qabooliyat ka waqt hai.
                </div>
              </li>
              <li className="prayer-item">
                <div className="prayer-name">Isha</div>
                <div className="prayer-time">{times.Isha}</div>
                <div className="prayer-quote">
                  Isha imaan ko mazboot karta hai, aur neend ko barkat deta hai.
                </div>
              </li>
            </ul>
          </div>

          <div className="actions">
            <button type="button" className="ghost" onClick={onClose}>
              Close
            </button>
            <button type="button" className="ghost" onClick={handleResetClick}>
              Reset
            </button>
            <button type="button" onClick={handleSaveClick}>
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'export' || type === 'export_pdf') {
    const allCols = (data && data.allColumns) || [];
    const initial = new Set((data && data.columns) || allCols);
    const idFor = (col) =>
      `col_${col.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`;
    const handleExport = () => {
      // Read current checkbox states directly to avoid async state issues
      const cols = allCols.filter((col) => {
        const el = document.getElementById(idFor(col));
        return el ? !!el.checked : initial.has(col);
      });
      onSave({ columns: cols.length ? cols : allCols, __target: type });
    };
    return (
      <div className="modal-backdrop">
        <div className="modal" style={{ maxWidth: 720 }}>
          <h3 style={{ marginBottom: 6 }}>
            {type === 'export_pdf' ? 'Export PDF Columns' : 'Export Columns'}
          </h3>
          <div
            className="form-row"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 8,
            }}
          >
            {allCols.map((col) => (
              <label
                key={col}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  padding: '6px 8px',
                  background: '#f8fafc',
                }}
              >
                <input
                  id={idFor(col)}
                  type="checkbox"
                  defaultChecked={initial.has(col)}
                />
                <span>{col}</span>
              </label>
            ))}
          </div>
          <div className="actions">
            <button type="button" className="ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="button" onClick={handleExport}>
              Export
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Info modals (imam, running, aumoor, etc.)
  // Info modals (imam, running, aumoor, etc.)
  if (type === 'info') {
    // For 'contact' info, show read-only list; others editable
    const readOnly = data === 'contact';
    return (
      <InfoModal
        data={data}
        onClose={onClose}
        onSave={onSave}
        readOnly={readOnly}
      />
    );
  }

  if (type === 'about') {
    const VisionMission = require('./VisionMission.jsx').default;
    return (
      <div className="modal-backdrop">
        <div className="modal" style={{ maxWidth: 900 }}>
          <h3 style={{ marginBottom: 8 }}>About Us</h3>
          <VisionMission />
          <div className="actions">
            <button type="button" className="ghost" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'contact_admin') {
    const onChange = (e) =>
      setContactForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    const handleSend = () => {
      if (!contactForm.name.trim()) {
        notify('Please enter your name', { type: 'error' });
        return;
      }
      if (
        contactForm.mobile &&
        !/^\+?\d{7,15}$/.test(String(contactForm.mobile))
      ) {
        notify('Enter a valid mobile', { type: 'error' });
        return;
      }
      if (!contactForm.message.trim()) {
        notify('Please enter your message', { type: 'error' });
        return;
      }
      onSave({ type: 'contact_admin', payload: contactForm });
    };

    const getCategoryIcon = (category) => {
      switch (category) {
        case 'Jamaat':
          return '🕌';
        case 'Taqaza':
          return '📢';
        case 'Suggestions':
          return '💡';
        case 'Facing Issues':
          return '⚠️';
        case 'General':
          return '📝';
        default:
          return '📧';
      }
    };

    return (
      <div className="modal-backdrop">
        <div className="modal contact-admin-modal" style={{ maxWidth: 600 }}>
          <div className="modal-header">
            <div className="header-content">
              <h3>📞 Contact Admin</h3>
              <p className="modal-subtitle">Get in touch with the admin team</p>
            </div>
            <button
              className="modal-close-btn"
              onClick={onClose}
              aria-label="Close contact form"
            >
              ✕
            </button>
          </div>

          <div className="contact-form">
            <div className="form-section">
              <label className="form-label">
                <span className="label-icon">🎯</span>
                Purpose
              </label>
              <select
                name="category"
                value={contactForm.category}
                onChange={onChange}
                className="contact-select"
              >
                <option value="Jamaat">🕌 Jamaat</option>
                <option value="Taqaza">📢 Taqaza</option>
                <option value="Suggestions">💡 Suggestions</option>
                <option value="Facing Issues">⚠️ Facing Issues</option>
                <option value="General">📝 General</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-section">
                <label className="form-label">
                  <span className="label-icon">👤</span>
                  Your Name *
                </label>
                <input
                  name="name"
                  value={contactForm.name}
                  onChange={onChange}
                  placeholder="Enter your full name"
                  className="contact-input"
                />
              </div>
              <div className="form-section">
                <label className="form-label">
                  <span className="label-icon">📱</span>
                  Mobile (optional)
                </label>
                <input
                  name="mobile"
                  value={contactForm.mobile}
                  onChange={onChange}
                  placeholder="+91 98765 43210"
                  className="contact-input"
                />
              </div>
            </div>

            <div className="form-section">
              <label className="form-label">
                <span className="label-icon">💬</span>
                Message *
              </label>
              <textarea
                name="message"
                rows={5}
                value={contactForm.message}
                onChange={onChange}
                placeholder={`Please describe your ${contactForm.category.toLowerCase()} in detail...`}
                className="contact-textarea"
              />
              <div className="message-counter">
                {contactForm.message.length}/500 characters
              </div>
            </div>

            <div className="contact-summary">
              <div className="summary-header">
                <span className="summary-icon">
                  {getCategoryIcon(contactForm.category)}
                </span>
                <span className="summary-title">{contactForm.category}</span>
              </div>
              <p className="summary-text">
                {contactForm.category === 'Suggestions' &&
                  'Share your ideas to improve our services'}
                {contactForm.category === 'Facing Issues' &&
                  "Report any problems you're experiencing"}
                {contactForm.category === 'Jamaat' &&
                  'Contact regarding jamaat activities and events'}
                {contactForm.category === 'Taqaza' &&
                  'Submit taqaza or special requests'}
                {contactForm.category === 'General' &&
                  'General inquiries and information'}
              </p>
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              <span>❌</span> Cancel
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleSend}
              disabled={loading}
            >
              <span>📤</span> {loading ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'notify_prefs') {
    const onToggle = (k) => setLocalPrefs((p) => ({ ...p, [k]: !p[k] }));
    const onToggleAll = () =>
      setLocalPrefs((p) => {
        const next = !p.all;
        return {
          ...p,
          all: next,
          prayer: next,
          jamaat: next,
          info: next,
          clear: next,
          prayerFajr: next,
          prayerDhuhr: next,
          prayerAsr: next,
          prayerMaghrib: next,
          prayerIsha: next,
        };
      });
    const handleSavePrefs = () => {
      onSave({ type: 'notify_prefs', prefs: localPrefs });
    };

    // Check if current user is guest
    const isGuest = data?.user?.isGuest || data?.user?.role === 'guest';
    return (
      <div className="modal-backdrop">
        <div className="modal" style={{ maxWidth: 520 }}>
          <h3 style={{ marginBottom: 6 }}>
            Notification Preferences
            {isGuest && (
              <span
                style={{
                  fontSize: '14px',
                  color: '#666',
                  fontWeight: 'normal',
                }}
              >
                {' '}
                (Guest Mode)
              </span>
            )}
          </h3>
          {isGuest && (
            <div
              style={{
                background: '#fff3cd',
                border: '1px solid #ffeaa7',
                borderRadius: '6px',
                padding: '8px 12px',
                marginBottom: '12px',
                fontSize: '13px',
                color: '#856404',
              }}
            >
              <strong>ℹ️ Guest User:</strong> You can customize basic
              notifications. Some admin features are limited.
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                checked={!!localPrefs.all}
                onChange={onToggleAll}
              />
              <strong>Select All</strong>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                checked={!!localPrefs.prayer}
                onChange={() => onToggle('prayer')}
              />
              Prayer time alerts
            </label>
            {localPrefs.prayer && (
              <div
                style={{
                  paddingLeft: 22,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(120px,1fr))',
                  gap: 8,
                }}
              >
                <label>
                  <input
                    type="checkbox"
                    checked={!!localPrefs.prayerFajr}
                    onChange={() => onToggle('prayerFajr')}
                  />{' '}
                  Fajr
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={!!localPrefs.prayerDhuhr}
                    onChange={() => onToggle('prayerDhuhr')}
                  />{' '}
                  Dhuhr/Juma
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={!!localPrefs.prayerAsr}
                    onChange={() => onToggle('prayerAsr')}
                  />{' '}
                  Asr
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={!!localPrefs.prayerMaghrib}
                    onChange={() => onToggle('prayerMaghrib')}
                  />{' '}
                  Maghrib
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={!!localPrefs.prayerIsha}
                    onChange={() => onToggle('prayerIsha')}
                  />{' '}
                  Isha
                </label>
              </div>
            )}
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                checked={!!localPrefs.jamaat}
                onChange={() => onToggle('jamaat')}
              />
              Jamaat updates
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                checked={!!localPrefs.info}
                onChange={() => onToggle('info')}
              />
              Info changes (Aumoor/Resources)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                checked={!!localPrefs.clear}
                onChange={() => onToggle('clear')}
              />
              Admin “Clear All” notice
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                checked={!!localPrefs.admin}
                onChange={() => onToggle('admin')}
              />
              Admin mode reminders
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginTop: 6,
              }}
            >
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  checked={!!localPrefs.quietEnabled}
                  onChange={() => onToggle('quietEnabled')}
                />
                Quiet hours
              </label>
              <input
                type="time"
                value={localPrefs.quietStart || '22:00'}
                onChange={(e) =>
                  setLocalPrefs((p) => ({ ...p, quietStart: e.target.value }))
                }
              />
              <span>to</span>
              <input
                type="time"
                value={localPrefs.quietEnd || '06:00'}
                onChange={(e) =>
                  setLocalPrefs((p) => ({ ...p, quietEnd: e.target.value }))
                }
              />
            </div>
          </div>
          <div
            className="actions"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                className="ghost"
                onClick={() => {
                  // simple test for info notification respecting quiet hours
                  if (
                    navigator.serviceWorker &&
                    navigator.serviceWorker.controller
                  ) {
                    navigator.serviceWorker.controller.postMessage({
                      type: 'showNow',
                      title: 'Test Notification',
                      body: 'This is a preview.',
                      prefs: localPrefs,
                    });
                  }
                }}
              >
                Test
              </button>
              <button
                type="button"
                className="ghost"
                onClick={() => {
                  // test scheduling in ~10s for current prayer (for quick check)
                  if (
                    navigator.serviceWorker &&
                    navigator.serviceWorker.controller
                  ) {
                    const now = new Date();
                    now.setSeconds(now.getSeconds() + 10);
                    const hm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                    navigator.serviceWorker.controller.postMessage({
                      type: 'schedule',
                      times: [{ name: 'Test', time: hm }],
                      prefs: localPrefs,
                    });
                  }
                }}
              >
                Test schedule 10s
              </button>
            </div>
            <button type="button" className="ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="button" onClick={handleSavePrefs}>
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'analytics') {
    return (
      <div className="modal-backdrop">
        <div className="modal" style={{ maxWidth: 900 }}>
          <div className="modal-header">
            <h3>📊 Analytics Dashboard</h3>
            <button
              className="modal-close-btn"
              onClick={onClose}
              onKeyDown={(e) => e.key === 'Escape' && onClose()}
              aria-label="Close analytics"
            >
              ✕
            </button>
          </div>
          <Analytics
            houses={data?.houses || []}
            members={data?.members || []}
            isAdmin={data?.isAdmin || false}
          />
        </div>
      </div>
    );
  }

  if (type === 'backup_restore') {
    return (
      <div className="modal-backdrop">
        <div className="modal" style={{ maxWidth: 600 }}>
          <div className="modal-header">
            <h3>💾 Data Backup & Restore</h3>
            <button
              className="modal-close-btn"
              onClick={onClose}
              aria-label="Close backup"
            >
              ✕
            </button>
          </div>
          <BackupRestoreModal
            currentData={data?.currentData}
            onBackup={data?.onBackup}
            onRestore={data?.onRestore}
            onClose={onClose}
          />
        </div>
      </div>
    );
  }

  if (type === 'user_profile') {
    return (
      <div className="modal-backdrop">
        <div className="modal" style={{ maxWidth: 600 }}>
          <div className="modal-header">
            <h3>User Profile</h3>
            <button
              className="modal-close-btn"
              onClick={onClose}
              aria-label="Close profile"
            >
              ✕
            </button>
          </div>
          <UserProfile
            user={data?.user}
            onUpdatePreferences={onSave}
            onLogout={onLogout || onClose}
          />
        </div>
      </div>
    );
  }

  if (type === 'demo') {
    return (
      <div className="modal-backdrop">
        <div className="modal" style={{ maxWidth: 500 }}>
          <div className="modal-header">
            <h3>📊 Load Demo Data</h3>
            <button
              className="modal-close-btn"
              onClick={onClose}
              aria-label="Close demo"
            >
              ✕
            </button>
          </div>
          <div className="modal-body">
            <p>This will load sample data including:</p>
            <ul>
              <li>🏠 5 sample houses</li>
              <li>👥 13 sample members</li>
              <li>📚 5 sample resources</li>
            </ul>
            <p>
              <strong>Note:</strong> This will replace any existing data.
            </p>
          </div>
          <div className="modal-footer">
            <button type="button" className="ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onSave('demo');
                onClose();
              }}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Load Demo Data'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Modal;

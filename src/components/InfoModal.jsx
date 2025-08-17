import React, { useState, useEffect, useMemo } from 'react';
import { FaPhoneAlt, FaWalking, FaBookOpen, FaUsers, FaMoon, FaPray, FaCalendarAlt, FaBell, FaImages, FaEllipsisH, FaBullhorn } from 'react-icons/fa';

// Sample data for the info modal
const getInfoData = (dataType) => {
  // Load persisted edits if available
  let persisted = {};
  try {
    persisted = JSON.parse(localStorage.getItem('infoData_v1') || '{}');
  } catch (e) {}

  // Base dataset
  const base = {
    timetable: {
      title: "Prayer Timetable",
      items: [
        { name: "Fajr", time: "05:00 AM" },
        { name: "Dhuhr", time: "12:30 PM" },
        { name: "Asr", time: "03:45 PM" },
        { name: "Maghrib", time: "06:15 PM" },
        { name: "Isha", time: "07:30 PM" }
      ]
    },
    imam: {
      title: "Imam Contact",
      items: [
        { name: "Imam Sahab", mobile: "+91-9876500000" }
      ]
    },
    aumoor: {
      title: "Aumoor",
      items: [
        { name: "Aumoomi Ghast", note: "Every week — Monday after Maghrib" },
        { name: "Taleem & Mashwara", note: "Everyday after Isha" },
        { name: "Haftwari Mashwara", note: "Every Jumu'ah after Jumu'ah at Jama Masjid Badarkha" },
        { name: "Shab-guzari", note: "Every Saturday — Garh Tehsil Masjid after Asr" }
      ]
    },
    running: {
      title: "Jama'at Activities",
      sections: [
        {
          title: "Upcoming Jama'at",
          items: [
            { name: "3 Days Jama'at", note: "Starting 20th August 2025" },
            { name: "10 Days Jama'at", note: "Starting 1st September 2025" }
          ]
        },
        {
          title: "Running Jama'at",
          items: [
            { name: "3 Days Jama'at", note: "Ongoing - 15 members" },
            { name: "40 Days Jama'at", note: "Day 25/40 - 5 members" }
          ]
        },
        {
          title: "Current Tashkeel",
          items: [
            { name: "Ameer", note: "Maulana Yusuf Sahab" },
            { name: "Naib Ameer", note: "Maulana Ibrahim Sahab" },
            { name: "Nazim-e-Tarbiyat", note: "Maulana Hamza Sahab" }
          ]
        },
        {
          title: "Taqaze",
          items: [
            { name: "3 Days", note: "Minimum once a year" },
            { name: "10 Days", note: "Once in 2 years" },
            { name: "40 Days", note: "Once in 4 years" },
            { name: "4 Months", note: "As per capacity" }
          ]
        }
      ]
    },
    outgoing: {
      title: "Outgoing Jamaat",
      items: [
        { name: "3 days", note: "14th'August'2025 -7 AM" }
      ]
    },
    contact: {
      title: "Contact Us",
      items: [
        { name: "M/s Ji Mursaleen Sahab", mobile: "+91-9639874789" },
        { name: "Haroon Bhai", mobile: "+91-9568094910" },
        { name: "Imaam Sahab", mobile: "+91-9760253216" },
      ]
    },
    resources_imp: {
      title: "Important Islamic Resources",
      items: [
        { name: "Quran", note: "Tilawat, Tafseer links" },
        { name: "Hadith", note: "Sahih collections references" }
      ]
    },
    resources_dawah: {
      title: "Dawah Guidelines",
      items: [
        { name: "Methodology", note: "Hikmat & husn-e-akhlaq" },
        { name: "Do's & Don'ts", note: "Adab, ikhlas" }
      ]
    },
    resources_gallery: {
      title: "Gallery",
      items: [
        { name: "Event Photos", note: "Local activities" }
      ]
    },
    resources_misc: {
      title: "Miscellaneous",
      items: [
        { name: "FAQs", note: "Common questions" }
      ]
    }
  };

  // Apply persisted overrides
  if (dataType && persisted[dataType]) {
    const p = persisted[dataType];
    if (p.items) return { title: base[dataType]?.title || 'Information', items: p.items };
    if (p.sections) return { title: base[dataType]?.title || 'Information', sections: p.sections };
  }

  return base[dataType];
};

const InfoModal = ({ data, onClose, onSave, readOnly = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableItems, setEditableItems] = useState([]);
  const infoData = useMemo(() => getInfoData(data) || { title: 'Information' }, [data]);
  const isEditable = ['aumoor', 'running', 'outgoing', 'contact', 'resources_imp', 'resources_dawah', 'resources_gallery', 'resources_misc'].includes(data);
  const canEdit = isEditable && !readOnly;

  // Initialize editable items when data changes
  useEffect(() => {
    if (Array.isArray(infoData?.sections)) {
      const sanitized = infoData.sections.map(sec => ({
        title: (sec && typeof sec.title === 'string') ? sec.title : '',
        items: Array.isArray(sec?.items) ? [...sec.items] : []
      }));
      setEditableItems(sanitized);
    } else if (Array.isArray(infoData?.items)) {
      setEditableItems([...infoData.items]);
    } else {
      setEditableItems([]);
    }
  }, [infoData]);

  const handleEdit = () => {
    if (!canEdit) return;
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    if (onSave) {
      // Build payload strictly matching type shape
      const payload = { type: data };
      if (Array.isArray(infoData?.sections)) {
        payload.sections = editableItems.map(sec => ({
          title: sec.title || '',
          items: Array.isArray(sec.items) ? sec.items.map(it => ({ name: it.name || '', note: it.note || '' })) : []
        }));
      } else {
        payload.items = (Array.isArray(editableItems) ? editableItems : []).map(it => (
          data === 'contact'
            ? { name: it.name || '', mobile: it.mobile || '' }
            : { name: it.name || '', note: it.note || '' }
        ));
      }
      onSave(payload, data);
      try {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          const tag = data === 'running' ? 'jamaat-changed' : 'info-updated';
          navigator.serviceWorker.controller.postMessage({ type: 'showNow', title: 'Info Updated', body: `${infoData?.title || 'Information'} updated`, tag });
        }
      } catch {}
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original data (both items and sections)
    if (infoData?.sections) {
      setEditableItems([...infoData.sections]);
    } else if (infoData?.items) {
      setEditableItems([...infoData.items]);
    } else {
      setEditableItems([]);
    }
  };

  const handleItemChange = (index, field, value, sectionIndex = null) => {
    const updated = [...editableItems];
    if (sectionIndex !== null) {
      // Update item inside a specific section
      const section = { ...updated[sectionIndex] };
      const items = [...section.items];
      items[index] = { ...items[index], [field]: value };
      section.items = items;
      updated[sectionIndex] = section;
    } else {
      // Update root-level item
      updated[index] = { ...updated[index], [field]: value };
    }
    setEditableItems(updated);
  };

  const handleAddItem = (sectionIndex = null) => {
    if (sectionIndex !== null) {
      // Add to a specific section
      const newSections = [...editableItems];
      if (!newSections[sectionIndex]) return;
      const section = { ...newSections[sectionIndex] };
      const items = Array.isArray(section.items) ? [...section.items] : [];
      items.push({ name: '', note: '' });
      section.items = items;
      newSections[sectionIndex] = section;
      setEditableItems(newSections);
    } else {
      // Add to root items - use appropriate default structure based on data type
      if (data === 'contact') {
        setEditableItems([...editableItems, { name: '', mobile: '' }]);
      } else {
        setEditableItems([...editableItems, { name: '', note: '' }]);
      }
    }
  };

  const handleRemoveItem = (index, sectionIndex = null) => {
    const updatedItems = [...editableItems];
    if (sectionIndex !== null) {
      if (!updatedItems[sectionIndex]) return;
      const section = { ...updatedItems[sectionIndex] };
      const items = Array.isArray(section.items) ? [...section.items] : [];
      items.splice(index, 1);
      section.items = items;
      updatedItems[sectionIndex] = section;
    } else {
      updatedItems.splice(index, 1);
    }
    setEditableItems(updatedItems);
  };

  const handleRemoveSection = (sectionIndex) => {
    const updated = [...editableItems];
    if (sectionIndex < 0 || sectionIndex >= updated.length) return;
    updated.splice(sectionIndex, 1);
    setEditableItems(updated);
  };

  const renderItems = (items, sectionIndex = null) => {
    const safeItems = Array.isArray(items) ? items : [];
    return safeItems.map((item, index) => (
      <div key={index} className="info-item">
        {isEditing ? (
          <div className="editable-item">
            <input
              type="text"
              value={item.name}
              onChange={(e) => handleItemChange(index, 'name', e.target.value, sectionIndex)}
              placeholder="Name"
              className="edit-input"
            />
            <input
              type={data === 'contact' ? 'tel' : 'text'}
              value={item.mobile ?? item.note ?? ''}
              onChange={(e) => {
                const field = data === 'contact' ? 'mobile' : 'note';
                handleItemChange(index, field, e.target.value, sectionIndex);
              }}
              placeholder={data === 'contact' ? 'Mobile Number' : 'Description'}
              className="edit-input"
            />
            <button 
              onClick={() => handleRemoveItem(index, sectionIndex)}
              className="remove-btn"
              title="Remove item"
              aria-label="Remove item"
            >
              ×
            </button>
          </div>
        ) : (
          <div className="info-row">
            <span className="item-name">{item.name}</span>
            <span className="item-note">
              {item.mobile ?? item.note ?? '-'}
              {item.mobile && (
                <a href={`tel:${item.mobile}`} className="phone-link" title="Call">
                  <FaPhoneAlt size={12} style={{ marginLeft: '8px' }} />
                </a>
              )}
            </span>
          </div>
        )}
      </div>
    ));
  };

  // Icon chooser for Aumoor items
  const getAumoorIcon = (title = '') => {
    const t = title.toLowerCase();
    if (t.includes('ghast') || t.includes('gasht') || t.includes('walk')) return <FaWalking />;
    if (t.includes('taleem')) return <FaBookOpen />;
    if (t.includes('mashwara')) return <FaUsers />;
    if (t.includes('shab') || t.includes('night')) return <FaMoon />;
    if (t.includes('namaz') || t.includes('salah') || t.includes('pray')) return <FaPray />;
    if (t.includes('hafta') || t.includes('week') || t.includes('jumu')) return <FaCalendarAlt />;
    return <FaBookOpen />;
  };

  const getJamaatIcon = (sectionTitle = '', itemName = '') => {
    const s = (sectionTitle || '').toLowerCase();
    const t = (itemName || '').toLowerCase();
    if (s.includes('upcoming') || t.includes('upcoming')) return <FaCalendarAlt />;
    if (s.includes('running') || t.includes('running')) return <FaWalking />;
    if (s.includes('tashkeel') || t.includes('ameer') || t.includes('nazim')) return <FaBullhorn />;
    if (s.includes('taqaze') || t.includes('taqaze')) return <FaBell />;
    return <FaUsers />;
  };

  const getResourceIcon = (type) => {
    if (type === 'resources_gallery') return <FaImages />;
    if (type === 'resources_misc') return <FaEllipsisH />;
    return <FaBookOpen />; // imp, dawah
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ margin: 0 }}>{infoData?.title || 'Information'}</h3>
          {canEdit && !isEditing && (
            <button onClick={handleEdit} style={{ padding: '5px 10px', fontSize: '0.8em' }}>Edit</button>
          )}
        </div>
        
        <div className="form-row" style={{ marginBottom: 6, gap: '16px' }}>
          {Array.isArray(infoData?.sections) ? (
            // Render sections for Jama'at Activities
            <div style={{ width: '100%' }}>
              {(Array.isArray(editableItems) ? editableItems : []).map((section, sectionIndex) => (
                <div key={sectionIndex} className={isEditing ? '' : 'jamaat-section'} style={isEditing ? { marginBottom: '20px', border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' } : {}}>
                  <div className={isEditing ? '' : 'section-title-line'} style={isEditing ? { background: '#eef8f0', padding: '8px 12px', color: '#083d24', fontWeight: 'bold' } : {}}>
                    {isEditing ? (
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => {
                          const updatedSections = [...editableItems];
                          updatedSections[sectionIndex] = { ...updatedSections[sectionIndex], title: e.target.value };
                          setEditableItems(updatedSections);
                        }}
                        style={{ width: '100%', padding: '4px 8px' }}
                      />
                    ) : (
                      <span>{section.title}</span>
                    )}
                  </div>
                  <div style={{ padding: '8px' }}>
                    {isEditing ? (
                      renderItems(section.items, sectionIndex)
                    ) : (
                      <div className="section-grid">
                        {(Array.isArray(section.items) ? section.items : []).map((it, idx) => (
                          <div key={idx} className="section-item">
                            <div className="section-icon">{getJamaatIcon(section.title, it?.name)}</div>
                            <div className="section-body">
                              <div className="section-item-title">{it?.name || '-'}</div>
                              <div className="section-item-note">{it?.note || '-'}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {isEditing && (
                    <div style={{ padding: '8px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between' }}>
                      <button
                        onClick={() => handleAddItem(sectionIndex)}
                        style={{
                          background: '#4CAF50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '4px 8px',
                          cursor: 'pointer'
                        }}
                      >
                        + Add Item
                      </button>
                      <button
                        onClick={() => handleRemoveSection(sectionIndex)}
                        style={{
                          background: '#ff4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '4px 8px',
                          cursor: 'pointer'
                        }}
                      >
                        Remove Section
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {isEditing && (
                <div style={{ textAlign: 'center', marginTop: '10px' }}>
                  <button 
                    onClick={() => {
                      setEditableItems([...editableItems, { title: 'New Section', items: [] }]);
                    }}
                    style={{ 
                      background: '#2196F3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '6px 12px',
                      cursor: 'pointer',
                      fontSize: '0.9em'
                    }}
                  >
                    + Add New Section
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Render simple items list (for Aumoor, Outgoing, Contact, etc.)
            <div style={{ width: '100%' }}>
              {!isEditing && data === 'aumoor' ? (
                <div className="aumoor-grid">
                  {(Array.isArray(editableItems) ? editableItems : []).map((item, index) => (
                    <div key={index} className="aumoor-card">
                      <div className="aumoor-icon">{getAumoorIcon(item?.name)}</div>
                      <div className="aumoor-body">
                        <div className="aumoor-title">{item?.name || '-'}</div>
                        <div className="aumoor-note">{item?.note || '-'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : !isEditing && data === 'contact' ? (
                <div className="contact-grid">
                  {(Array.isArray(editableItems) ? editableItems : []).map((item, index) => (
                    <div key={index} className="contact-card">
                      <div className="contact-avatar"><FaPhoneAlt size={14} /></div>
                      <div className="contact-body">
                        <div className="contact-name">{item?.name || '-'}</div>
                        <div className="contact-mobile">{item?.mobile ? (
                          <a href={`tel:${item.mobile}`} title="Call">{item.mobile}</a>
                        ) : '-'}</div>
                      </div>
                      {item?.mobile && (
                        <a className="contact-call" href={`tel:${item.mobile}`} title="Call">Call</a>
                      )}
                    </div>
                  ))}
                </div>
              ) : !isEditing && String(data || '').startsWith('resources_') ? (
                <div className="resource-grid">
                  {(Array.isArray(editableItems) ? editableItems : []).map((item, index) => (
                    <div key={index} className="resource-card">
                      <div className="resource-icon">{getResourceIcon(data)}</div>
                      <div className="resource-body">
                        <div className="resource-title">{item?.name || '-'}</div>
                        <div className="resource-note">{item?.note || '-'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }} role="table">
                  <tbody>
                    {(Array.isArray(editableItems) ? editableItems : []).map((item, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #f0f0f0' }} role="row">
                        <td style={{ padding: '8px', width: '30%' }}>
                          {isEditing ? (
                            <input
                              type="text"
                              value={item.name || ''}
                              onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                              placeholder="Name"
                              style={{ width: '100%', padding: '4px 8px' }}
                            />
                          ) : (
                            <strong>{item.name}</strong>
                          )}
                        </td>
                        <td style={{ padding: '8px' }}>
                          {isEditing ? (
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <input
                                type={data === 'contact' ? 'tel' : 'text'}
                                value={item.mobile ?? item.note ?? ''}
                                onChange={(e) => {
                                  const field = data === 'contact' ? 'mobile' : 'note';
                                  handleItemChange(index, field, e.target.value);
                                }}
                                placeholder={data === 'contact' ? 'Mobile Number' : 'Description'}
                                style={{ flex: 1, padding: '4px 8px' }}
                              />
                              <button 
                                type="button"
                                onClick={() => handleRemoveItem(index)}
                                style={{
                                  background: '#ff4444',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  padding: '4px 8px',
                                  cursor: 'pointer'
                                }}
                              >
                                Remove
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <span>{item.mobile ?? item.note ?? '-'}</span>
                              {item.mobile && (
                                <a 
                                  href={`tel:${item.mobile}`} 
                                  style={{ marginLeft: '8px', color: '#4CAF50' }}
                                  title="Call"
                                >
                                  <FaPhoneAlt size={14} />
                                </a>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {isEditing && (
                      <tr>
                        <td colSpan="2" style={{ textAlign: 'center', padding: '8px' }}>
                          <button 
                            type="button"
                            onClick={() => handleAddItem()}
                            style={{ 
                              background: '#4CAF50', 
                              color: 'white', 
                              border: 'none', 
                              padding: '6px 12px', 
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.9em'
                            }}
                          >
                            + Add New {data === 'contact' ? 'Contact' : 'Item'}
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
        
        <div className="muted-note">
          Confidential — use only when necessary.
        </div>
        
        <div className="actions">
          {isEditing ? (
            <>
              <button type="button" className="ghost" onClick={handleCancel} style={{ marginRight: '10px' }}>Cancel</button>
              <button type="button" onClick={handleSave} style={{ background: '#4caf50', color: 'white' }}>Save Changes</button>
            </>
          ) : (
            <button type="button" className="ghost" onClick={onClose}>Close</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InfoModal;

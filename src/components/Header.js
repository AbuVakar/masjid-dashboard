import React, { useState, useEffect, useRef } from 'react';
import {
  FaMosque,
  FaUserAlt,
  FaBullhorn,
  FaPhoneAlt,
  FaChevronDown,
  FaBook,
  FaBookOpen,
  FaImages,
  FaEllipsisH,
  FaUsers,
  FaWalking,
  FaCalendarAlt,
  FaBell,
  FaChartBar,
} from 'react-icons/fa';
import Clock from './Clock';
import logo from '../assets/logo.png';

const Header = ({
  onNavClick,
  L,
  children,
  time,
  nextPrayer,
  prayerTimes,
  isAdmin,
  onEnableNotifications,
  currentUser,
  onShowProfile,
  onNotificationTestToggle,
}) => {
  const translateRef = useRef(null);
  // Load Google Translate widget dynamically (EN, HI, UR), isolate to a stable container
  useEffect(() => {
    const initFunctionName = 'googleTranslateElementInit';
    const existingScript = document.getElementById('google-translate-script');

    if (!window._gtInitialized && !window[initFunctionName]) {
      window[initFunctionName] = function () {
        try {
          const g = window.google;
          const TranslateElement = g?.translate?.TranslateElement;
          if (!TranslateElement || !translateRef.current) return;
          const opts = {
            pageLanguage: 'en',
            includedLanguages: 'en,hi,ur',
            autoDisplay: false,
          };
          new TranslateElement(opts, translateRef.current);
          window._gtInitialized = true;

          setTimeout(() => {
            const style = document.createElement('style');
            style.textContent = `
              .goog-te-gadget { font-family: Arial, sans-serif !important; color: transparent !important; }
              .goog-te-gadget-simple { background-color: rgba(255, 255, 255, 0.1) !important; border: 1px solid rgba(255, 255, 255, 0.2) !important; border-radius: 6px !important; padding: 4px 8px !important; cursor: pointer !important; transition: all 0.2s ease !important; }
              .goog-te-gadget-simple:hover { background-color: rgba(255, 255, 255, 0.2) !important; }
              .goog-te-gadget-simple span { color: white !important; font-size: 14px !important; }
              .goog-te-menu-value span { display: none !important; }
              .goog-te-menu-value:before { content: 'G'; color: white; }
            `;
            document.head.appendChild(style);
          }, 100);
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('Google Translate initialization error:', e);
        }
      };
    }

    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = `https://translate.google.com/translate_a/element.js?cb=${initFunctionName}`;
      script.async = true;
      document.body.appendChild(script);
    } else if (
      window.google &&
      window.google.translate &&
      window.google.translate.TranslateElement &&
      !window._gtInitialized
    ) {
      window[initFunctionName]();
    }
  }, []);

  // State for dropdown menus & mobile menu
  const [showJamaatDropdown, setShowJamaatDropdown] = useState(false);
  const [showResourcesDropdown, setShowResourcesDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="header-container">
      <div className="header-top">
        <div className="brand">
          <img src={logo} alt="Logo" className="logo-img" />
          <div className="brand-text">
            <h1 id="ui_title">{L.title}</h1>
            <div className="subtitle">{L.subtitle}</div>
          </div>
        </div>
        <div className="mobile-controls">
          <button
            className="mobile-menu-btn navlink"
            aria-label="Toggle menu"
            onClick={() => setIsMobileMenuOpen((o) => !o)}
          >
            ☰ <span>Menu</span>
          </button>
          <button
            className="navlink notify-mobile"
            onClick={onEnableNotifications}
            title="Enable Notifications"
            aria-label="Enable Notifications"
          >
            🔔
          </button>
        </div>
        <nav className={`nav-links ${isMobileMenuOpen ? 'open' : ''}`}>
          <button
            className="navlink"
            onClick={() => onNavClick('dashboard', {})}
          >
            <FaChartBar /> <span>Dashboard</span>
          </button>
          <button
            className="navlink"
            onClick={() => onNavClick('timetable', { times: prayerTimes })}
          >
            <FaMosque /> <span>Timetable</span>
          </button>
          <button
            className="navlink"
            onClick={() => onNavClick('info', 'aumoor')}
          >
            <FaUserAlt /> <span>Aumoor</span>
          </button>
          <button
            className="navlink"
            onClick={() => onNavClick('analytics', {})}
          >
            <FaBook /> <span>Analytics</span>
          </button>
          {/* Jama'at Activities Dropdown */}
          <div
            className="nav-dropdown"
            onMouseEnter={() => setShowJamaatDropdown(true)}
            onMouseLeave={() => setShowJamaatDropdown(false)}
          >
            <button
              className="navlink"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowJamaatDropdown((v) => !v);
              }}
            >
              <FaUsers /> <span>Jama'at Activities</span>{' '}
              <FaChevronDown size={12} style={{ marginLeft: '4px' }} />
            </button>
            {showJamaatDropdown && (
              <div
                className="dropdown-menu"
                onMouseEnter={() => setShowJamaatDropdown(true)}
                onMouseLeave={() => setShowJamaatDropdown(false)}
              >
                <button
                  className="dropdown-item"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onNavClick('info', 'running');
                    setShowJamaatDropdown(false);
                  }}
                >
                  <FaCalendarAlt size={14} /> <span>Upcoming Jamaat</span>
                </button>
                <button
                  className="dropdown-item"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onNavClick('info', 'running');
                    setShowJamaatDropdown(false);
                  }}
                >
                  <FaWalking size={14} /> <span>Running Jamaat</span>
                </button>
                <button
                  className="dropdown-item"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onNavClick('info', 'running');
                    setShowJamaatDropdown(false);
                  }}
                >
                  <FaBullhorn size={14} /> <span>Current Tashkeel</span>
                </button>
                <button
                  className="dropdown-item"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onNavClick('info', 'running');
                    setShowJamaatDropdown(false);
                  }}
                >
                  <FaBell size={14} /> <span>Taqaze</span>
                </button>
              </div>
            )}
          </div>

          {/* Resources Dropdown */}
          <div
            className="nav-dropdown"
            onMouseEnter={() => setShowResourcesDropdown(true)}
            onMouseLeave={() => setShowResourcesDropdown(false)}
          >
            <button
              className="navlink"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowResourcesDropdown((v) => !v);
              }}
            >
              <FaBook /> <span>Resources</span>{' '}
              <FaChevronDown size={12} style={{ marginLeft: '4px' }} />
            </button>
            {showResourcesDropdown && (
              <div
                className="dropdown-menu"
                onMouseEnter={() => setShowResourcesDropdown(true)}
                onMouseLeave={() => setShowResourcesDropdown(false)}
              >
                <button
                  className="dropdown-item"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onNavClick('resources', {});
                    setShowResourcesDropdown(false);
                  }}
                >
                  <FaImages size={14} /> <span>Learning Resources</span>
                </button>
                <button
                  className="dropdown-item"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onNavClick('info', 'resources_imp');
                    setShowResourcesDropdown(false);
                  }}
                >
                  <FaBookOpen size={14} />{' '}
                  <span>Important Islamic Resources</span>
                </button>
                <button
                  className="dropdown-item"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onNavClick('info', 'resources_dawah');
                    setShowResourcesDropdown(false);
                  }}
                >
                  <FaBookOpen size={14} /> <span>Dawah Guidelines</span>
                </button>
                <button
                  className="dropdown-item"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onNavClick('info', 'resources_gallery');
                    setShowResourcesDropdown(false);
                  }}
                >
                  <FaImages size={14} /> <span>Gallery</span>
                </button>
                <button
                  className="dropdown-item"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onNavClick('info', 'resources_misc');
                    setShowResourcesDropdown(false);
                  }}
                >
                  <FaEllipsisH size={14} /> <span>Miscellaneous</span>
                </button>
                <div style={{ borderTop: '1px solid #eee', margin: '6px 0' }} />
                <button
                  className="dropdown-item"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onNavClick('info', 'contact'); // read-only contacts list
                    setShowResourcesDropdown(false);
                  }}
                >
                  <FaPhoneAlt size={14} /> <span>Contacts List</span>
                </button>
              </div>
            )}
          </div>

          <button
            className="navlink"
            onClick={() => onNavClick('contact_admin', {})}
          >
            <FaPhoneAlt /> <span>Contact Us</span>
          </button>
          <button className="navlink" onClick={() => onNavClick('about', {})}>
            <FaBookOpen /> <span>About Us</span>
          </button>
        </nav>
        <div className="header-actions">
          <div className="clock-display">
            <Clock prayerTimes={prayerTimes} />
          </div>
          {/* Google Translate widget renders here; dropdown removed */}
          {/* Quiet hours indicator (if active) will be toggled from app-level in future; placeholder here */}
          {/* <span className="quiet-chip">Quiet hours</span> */}
          {/* Offline indicator (App can render via children if desired) */}

          <button
            className="navlink notify-desktop"
            onClick={onEnableNotifications}
            title="Enable Notifications"
          >
            🔔
          </button>

          <button
            className="navlink user-profile-btn"
            onClick={onShowProfile}
            title={`Profile: ${currentUser?.name || 'User'}`}
          >
            👤 <span>{currentUser?.name || 'User'}</span>
          </button>
          <div className="translate-wrap" title="Select Language">
            <div id="google_translate_element" ref={translateRef}></div>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
};

export default React.memo(Header);

import React from 'react';
import '../App.css';

function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        &copy; {new Date().getFullYear()} All Rights Reserved - Madina Masjid
        Badrakha
      </div>
    </footer>
  );
}

export default Footer;

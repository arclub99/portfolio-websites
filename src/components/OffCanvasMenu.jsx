import React, { useState } from "react";
import "../styles/OffCanvasMenu.css";
import profilePicture from '../assets/profile_picture.png';

const OffCanvasMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const currentYear = new Date().getFullYear();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Hamburger Icon */}
      <button
        className={`hamburger-icon ${isOpen ? "active" : ""}`}
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Overlay Backdrop */}
      {isOpen && (
        <div className="offcanvas-backdrop" onClick={closeMenu}></div>
      )}

      {/* Off-Canvas Slider */}
      <div className={`offcanvas-menu ${isOpen ? "open" : ""}`}>
        <button className="close-btn" onClick={closeMenu}>
          ×
        </button>

        {/* Main Container - Left Content + Right Image */}
        <div className="offcanvas-container">
          {/* Left Content */}
          <div className="menu-content">
            <h2 className="name-title">Abdul Rashid</h2>
            <p className="subtitle">WordPress Designer & Developer</p>

            {/* Social & Links Section */}
            <div className="menu-sections">
              <div className="menu-group">
                <h3>Connect</h3>
                <a
                  href="https://www.upwork.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="menu-link upwork-btn"
                  onClick={closeMenu}
                >
                  <span className="icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M10 18c-.478 0-.833-.38-.833-.833v-6.334c0-.452.356-.833.833-.833.477 0 .833.381.833.833v6.334c0 .453-.356.833-.833.833zM6.5 17.667c0 .92-.749 1.667-1.667 1.667-.918 0-1.667-.747-1.667-1.667 0-.92.749-1.667 1.667-1.667.918 0 1.667.747 1.667 1.667zm10.834-1.333c-1.587 0-2.5-1.198-2.5-2.5V13c0-1.302.913-2.5 2.5-2.5 1.588 0 2.5 1.198 2.5 2.5v1.334h-2.5v1.667c0 .747.554 1.333 1.25 1.333.696 0 1.25-.586 1.25-1.333V14zm3.333-9.667L14.167 2h-9.167c-1.378 0-2.5 1.122-2.5 2.5v15c0 1.378 1.122 2.5 2.5 2.5h10c1.378 0 2.5-1.122 2.5-2.5v-13.333z"/>
                    </svg>
                  </span>
                  Upwork Profile
                </a>
                <a
                  href="https://www.linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="menu-link linkedin-btn"
                  onClick={closeMenu}
                >
                  <span className="icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/>
                    </svg>
                  </span>
                  LinkedIn Profile
                </a>
              </div>

              <div className="menu-group">
                <h3>Download</h3>
                <a
                  href="../assets/Abdul_Rashid_WordPress.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="menu-link resume-btn"
                  onClick={closeMenu}
                >
                  <span className="icon">📄</span>
                  Download Resume
                </a>
              </div>

              <div className="menu-group">
                <h3>Contact</h3>
                <a
                  href={`mailto:rashedverse@gmail.com`}
                  className="menu-link email-btn"
                  onClick={closeMenu}
                >
                  <span className="icon">✉</span>
                  rashedverse@gmail.com
                </a>
                <a
                  href={`https://wa.me/8801720498825`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="menu-link whatsapp-btn"
                  onClick={closeMenu}
                >
                  <span className="icon">💬</span>
                  +880 1720 498825
                </a>
              </div>

              <div className="menu-group">
                <h3>More</h3>
                <div className="additional-links">
                  <button className="menu-link future-btn" onClick={closeMenu}>
                  <span className="icon">🔗</span>
                  Additional Links
                  </button>
                  <button className="menu-link future-btn" onClick={closeMenu}>
                    <span className="icon">📧</span>
                    Contact Me
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="menu-footer">
              <p>&copy; {currentYear} Your Portfolio. All rights reserved.</p>
            </div>
          </div>

          {/* Right Profile Image */}
          <div className="profile-section-right">
            <img
              src={profilePicture}
              alt="Abdul Rashid"
              className="profile-image-right"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default OffCanvasMenu;

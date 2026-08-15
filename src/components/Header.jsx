import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Newspaper, 
  Award, 
  MapPin, 
  Users, 
  Calendar, 
  ShieldCheck, 
  Sparkles,
  Menu,
  X
} from 'lucide-react';

export default function Header({ activeTab, onTabChange, onOpenAdminModal, isAdminLoggedIn }) {
  const [now, setNow] = useState(new Date());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const dateStr = now.toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handleNavClick = (tab) => {
    onTabChange(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="header">
      {/* Brand logo & location left */}
      <div className="header-left-group">
        <div className="header-logo" style={{ cursor: 'pointer' }} onClick={() => handleNavClick('home')}>
          <img src="/xtslogo.png" alt="Đoàn Thanh Niên Xã Xuân Thới Sơn" />
          <div className="header-brand">
            <span className="header-brand-name">ĐOÀN TNCS HỒ CHÍ MINH</span>
            <span className="header-brand-sub">XÃ XUÂN THỚI SƠN - TP.HCM</span>
          </div>
        </div>

        {/* Mobile Hamburger Menu Toggle Button */}
        <button 
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Navigation center - 5 tabs with Lucide Icons */}
      <nav className={`header-nav ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <button 
          className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => handleNavClick('home')}
        >
          <Home className="nav-icon" size={16} />
          <span>Trang Chủ</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'news' ? 'active' : ''}`}
          onClick={() => handleNavClick('news')}
        >
          <Newspaper className="nav-icon" size={16} />
          <span>Tin tức - Sự kiện</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'awards' ? 'active' : ''}`}
          onClick={() => handleNavClick('awards')}
        >
          <Award className="nav-icon" size={16} />
          <span>Khen thưởng</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'map' ? 'active' : ''}`}
          onClick={() => handleNavClick('map')}
        >
          <MapPin className="nav-icon" size={16} />
          <span>Bản Đồ hành chính</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'bch' ? 'active' : ''}`}
          onClick={() => handleNavClick('bch')}
        >
          <Users className="nav-icon" size={16} />
          <span>BCH Đoàn xã</span>
        </button>
      </nav>

      {/* Actions right */}
      <div className="header-right-group">
        <div className="header-date">
          <Calendar size={14} />
          <span>{dateStr}</span>
        </div>

        <button 
          className={`header-admin-btn ${isAdminLoggedIn ? 'logged-in' : ''}`}
          onClick={onOpenAdminModal}
          title={isAdminLoggedIn ? "Đã đăng nhập Admin Đoàn xã" : "Đăng nhập Admin bài viết"}
        >
          {isAdminLoggedIn ? <ShieldCheck size={15} /> : <Sparkles size={15} />}
          <span>{isAdminLoggedIn ? 'Cán Bộ Đoàn Xã' : 'Admin'}</span>
        </button>
      </div>
    </header>
  );
}

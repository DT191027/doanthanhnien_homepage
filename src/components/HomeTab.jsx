import React from 'react';
import { INTRO_DATA } from '../data/introData';
import { 
  Map, 
  Newspaper, 
  ShieldCheck, 
  Users, 
  Cpu, 
  Award, 
  CheckCircle2, 
  Sparkles, 
  ExternalLink,
  ChevronRight,
  Landmark
} from 'lucide-react';

export default function HomeTab({ onNavigateToMap, onNavigateToNews }) {
  const getFunctionIcon = (id) => {
    switch (id) {
      case 'f1': return <ShieldCheck size={22} />;
      case 'f2': return <Users size={22} />;
      case 'f3': return <Cpu size={22} />;
      case 'f4': return <Award size={22} />;
      default: return <Sparkles size={22} />;
    }
  };

  return (
    <div className="tab-page-container home-page">
      {/* Banner / Hero Section */}
      <section className="home-hero-banner">
        <div className="home-hero-overlay"></div>
        <div className="home-hero-content">
          <div className="hero-badge flex-badge">
            <Landmark size={14} />
            <span>{INTRO_DATA.overview.badge}</span>
          </div>
          <h1 className="hero-title">{INTRO_DATA.title}</h1>
          <p className="hero-subtitle">{INTRO_DATA.subTitle}</p>
          <div className="hero-slogan-box">
            <span>"{INTRO_DATA.slogan}"</span>
          </div>
          <div className="hero-cta-buttons">
            <button className="btn-hero-primary" onClick={onNavigateToMap}>
              <Map size={18} />
              Khám Phá Bản Đồ 30 Ấp
            </button>
            <button className="btn-hero-secondary" onClick={onNavigateToNews}>
              <Newspaper size={18} />
              Xem Tin Tức Mới Nhất
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="home-main-layout">
        <div className="home-left-col">
          {/* Overview Block */}
          <section className="intro-card-section">
            <h2 className="section-title-decorated">
              <span className="accent-bar"></span>
              {INTRO_DATA.overview.heading}
            </h2>
            <div className="intro-text-body">
              {INTRO_DATA.overview.content.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>
          </section>

          {/* Functions & Duties Block */}
          <section className="intro-card-section">
            <h2 className="section-title-decorated">
              <span className="accent-bar"></span>
              Chức Năng & Nhiệm Vụ Trọng Tâm
            </h2>
            <div className="functions-grid">
              {INTRO_DATA.functions.map((fn) => (
                <div key={fn.id} className="function-box">
                  <div className="fn-icon-wrapper">
                    {getFunctionIcon(fn.id)}
                  </div>
                  <div className="fn-text">
                    <h3>{fn.title}</h3>
                    <p>{fn.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Action Targets */}
          <section className="intro-card-section">
            <h2 className="section-title-decorated">
              <span className="accent-bar"></span>
              Chỉ Tiêu & Phương Hướng Hành Động
            </h2>
            <ul className="target-list">
              {INTRO_DATA.targets.map((tgt, idx) => (
                <li key={idx}>
                  <span className="target-num">0{idx + 1}</span>
                  <span className="target-text">{tgt}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Featured Youth Projects */}
          <section className="intro-card-section">
            <h2 className="section-title-decorated">
              <span className="accent-bar"></span>
              Công Trình Thanh Niên Tiêu Biểu
            </h2>
            <div className="projects-grid">
              {INTRO_DATA.featuredProjects.map((pj) => (
                <div key={pj.id} className="project-card">
                  <div className="project-header">
                    <span className="project-year">{pj.year}</span>
                    <span className="project-status flex-center-gap">
                      <CheckCircle2 size={13} />
                      {pj.status}
                    </span>
                  </div>
                  <h3 className="project-title">{pj.title}</h3>
                  <p className="project-desc">{pj.description}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Sidebar Column */}
        <div className="home-right-col">
          {/* Quick Stats Widget */}
          <div className="widget-card stats-widget">
            <h3 className="widget-title">Con Số Nổi Bật</h3>
            <div className="widget-stats-grid">
              <div className="stat-item">
                <span className="stat-value">30</span>
                <span className="stat-label">Ấp Địa giới Hành chính</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">37+</span>
                <span className="stat-label">Chi đoàn Trực thuộc</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">2.000+</span>
                <span className="stat-label">Đoàn viên Thanh niên</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">100%</span>
                <span className="stat-label">Số hóa Quản lý</span>
              </div>
            </div>
          </div>

          {/* Subordinate Units Widget */}
          <div className="widget-card units-widget">
            <h3 className="widget-title">{INTRO_DATA.units.heading}</h3>
            <p className="widget-subtext">{INTRO_DATA.units.summary}</p>
            <div className="unit-category-list">
              {INTRO_DATA.units.categories.map((cat, idx) => (
                <div key={idx} className="unit-cat-item">
                  <div className="cat-top">
                    <span className="cat-name">{cat.name}</span>
                    <span className="cat-badge">{cat.count}</span>
                  </div>
                  <p className="cat-detail">{cat.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Facebook Fanpage Quick Connect Widget */}
          <div className="widget-card fb-connect-widget">
            <div className="fb-widget-header">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              <div>
                <h4>Tuổi Trẻ Xã Xuân Thới Sơn</h4>
                <p>@DTNxaTTN • Trang FB Chính Thức</p>
              </div>
            </div>
            <p className="fb-widget-desc">
              Theo dõi fanpage để cập nhật liên tục các tin tức, hoạt động tình nguyện và thông báo mới nhất từ Đoàn xã.
            </p>
            <a 
              href="https://www.facebook.com/DTNxaTTN?locale=vi_VN" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn-fb-follow flex-center-gap"
            >
              Truy Cập Trang Facebook
              <ExternalLink size={15} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

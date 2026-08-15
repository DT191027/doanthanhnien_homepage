import React, { useState } from 'react';
import { EXECUTIVE_BOARD_DATA } from '../data/executiveBoardData';
import { 
  Users, 
  Phone, 
  Mail, 
  MapPin, 
  ExternalLink, 
  ShieldCheck, 
  Building2, 
  UserCheck,
  Maximize2,
  X,
  Award,
  Star,
  CheckCircle2
} from 'lucide-react';

export default function ExecutiveBoardTab() {
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <div className="tab-page-container executive-page">
      {/* Header Banner */}
      <div className="page-top-banner">
        <div className="banner-title-area">
          <div className="breadcrumb-nav">Trang Chủ / Cơ Cấu Tổ Chức</div>
          <h1 className="page-main-title">{EXECUTIVE_BOARD_DATA.organizationName}</h1>
          <p className="page-sub-title">
            <Award size={16} className="inline-icon" /> {EXECUTIVE_BOARD_DATA.term} • Xã Xuân Thới Sơn, Thành phố Hồ Chí Minh
          </p>
        </div>
      </div>

      {/* Main Layout */}
      <div className="executive-layout">

        {/* Official Banner Showcase Section */}
        <section className="executive-section official-banner-section">
          <div className="section-header-flex">
            <h2 className="section-title-decorated">
              <span className="accent-bar"></span>
              Sơ Đồ Ban Thường Vụ Đoàn Xã (Khoá I, Nhiệm Kỳ 2025 - 2030)
            </h2>
            <span className="official-badge flex-center-gap">
              <Star size={14} /> Chính thức
            </span>
          </div>

          <div 
            className="banner-image-wrapper"
            onClick={() => setSelectedImage({
              src: EXECUTIVE_BOARD_DATA.bannerUrl,
              title: "Sơ Đồ Ban Thường Vụ Đoàn Xã Xuân Thới Sơn Khoá I, Nhiệm kỳ 2025 - 2030"
            })}
          >
            <img 
              src={EXECUTIVE_BOARD_DATA.bannerUrl} 
              alt="Sơ đồ Ban Thường Vụ Đoàn Xã Xuân Thới Sơn Khoá I" 
              className="official-banner-img"
            />
            <div className="banner-hover-overlay flex-center-gap">
              <Maximize2 size={20} />
              <span>Xem sơ đồ phóng to</span>
            </div>
          </div>
        </section>

        {/* Ban Thường vụ Section */}
        <section className="executive-section">
          <h2 className="section-title-decorated">
            <span className="accent-bar"></span>
            Ban Thường Vụ Đoàn Xã (7 Đồng Chí)
          </h2>
          
          <div className="leadership-cards-grid">
            {EXECUTIVE_BOARD_DATA.leadership.map((leader, idx) => (
              <div 
                key={leader.id} 
                className={`leader-card ${idx < 3 ? 'top-leadership' : ''}`}
              >
                <div className="leader-avatar-wrapper">
                  <img 
                    src={leader.avatarUrl} 
                    alt={leader.name} 
                    onClick={() => setSelectedImage({ src: leader.avatarUrl, title: `${leader.name} - ${leader.fullTitle}` })}
                  />
                  <span className={`leader-position-tag ${idx < 1 ? 'tag-primary' : idx < 3 ? 'tag-subprimary' : 'tag-normal'}`}>
                    {leader.fullTitle || leader.position}
                  </span>
                </div>
                <div className="leader-info">
                  <h3 className="leader-name">{leader.name}</h3>
                  <div className="leader-role-group">{leader.position}</div>
                  
                  <div className="leader-assigned">
                    <strong>Nhiệm vụ phụ trách:</strong> {leader.assignedArea}
                  </div>
                  
                  <div className="leader-contact-list">
                    <div className="contact-line">
                      <Phone size={14} />
                      <span>{leader.phone}</span>
                    </div>
                    <div className="contact-line">
                      <Mail size={14} />
                      <span>{leader.email}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Ban Chấp hành Members Section */}
        <section className="executive-section">
          <div className="section-header-flex">
            <h2 className="section-title-decorated">
              <span className="accent-bar"></span>
              Ủy Viên Ban Chấp Hành Đoàn Xã ({EXECUTIVE_BOARD_DATA.executiveMembers.length} Đồng Chí)
            </h2>
            <span className="official-badge flex-center-gap">
              <CheckCircle2 size={14} /> Nhiệm kỳ 2025 - 2030
            </span>
          </div>

          <div className="leadership-cards-grid bch-cards-grid">
            {EXECUTIVE_BOARD_DATA.executiveMembers.map(mem => (
              <div key={mem.id} className="leader-card bch-card">
                <div className="leader-avatar-wrapper">
                  <img 
                    src={mem.avatarUrl} 
                    alt={mem.name} 
                    onClick={() => setSelectedImage({ src: mem.avatarUrl, title: `${mem.name} - ${mem.position}` })}
                  />
                  <span className="leader-position-tag tag-normal">
                    {mem.position}
                  </span>
                </div>
                <div className="leader-info">
                  <h3 className="leader-name">{mem.name}</h3>
                  <div className="leader-role-group">{mem.position} Đoàn Xã</div>
                  <div className="leader-assigned">
                    <strong>Nhiệm vụ phụ trách:</strong> {mem.assignedArea}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Inspection Committee & Office Info Section */}
        <div className="executive-dual-cols">
          <div className="dual-card ubkt-card">
            <h3 className="dual-card-title flex-center-gap">
              <ShieldCheck size={18} />
              Ủy Ban Kiểm Tra Đoàn Xã
            </h3>
            <ul className="ubkt-list">
              {EXECUTIVE_BOARD_DATA.inspectionCommittee.map((ub, idx) => (
                <li key={idx}>
                  <span className="ub-name">{ub.name}</span>
                  <span className="ub-title">{ub.title}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="dual-card office-card">
            <h3 className="dual-card-title flex-center-gap">
              <Building2 size={18} />
              Văn Phòng Đoàn Xã Xuân Thới Sơn
            </h3>
            <div className="office-info-list">
              <p><strong>Địa chỉ:</strong> {EXECUTIVE_BOARD_DATA.address}</p>
              <p><strong>Email liên hệ:</strong> {EXECUTIVE_BOARD_DATA.email}</p>
              <p><strong>Fanpage chính thức:</strong> Tuổi Trẻ Xã Xuân Thới Sơn (@DTNxaTTN)</p>
              <a 
                href={EXECUTIVE_BOARD_DATA.fanpage} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-contact-office flex-center-gap"
              >
                Gửi Tin Nhắn Cho Đoàn Xã
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Image Lightbox Modal */}
      {selectedImage && (
        <div className="lightbox-modal-backdrop" onClick={() => setSelectedImage(null)}>
          <div className="lightbox-modal-content" onClick={e => e.stopPropagation()}>
            <button className="btn-close-lightbox" onClick={() => setSelectedImage(null)}>
              <X size={24} />
            </button>
            <img src={selectedImage.src} alt={selectedImage.title} className="lightbox-img" />
            <div className="lightbox-caption">{selectedImage.title}</div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { hamlets, tongQuan } from '../data/hamlets';

// ─── Direction map ────────────────────────────────────────────
const dirMap = { dong: 'Đông', tay: 'Tây', nam: 'Nam', bac: 'Bắc' };

// ─── Chevron Toggle Icons for mobile view ───
const ChevronUpIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15" />
  </svg>
);
const ChevronDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const getStatusClass = (status) => {
  if (!status) return 'status-on-dinh';
  if (status.includes('mạnh')) return 'status-phat-trien-manh';
  if (status.includes('Phát triển')) return 'status-phat-trien';
  if (status.includes('Đang')) return 'status-dang-phat-trien';
  return 'status-on-dinh';
};

// ─── Inline SVG Icons ─────────────────────────────────────────
const ArrowRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const ListIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);
const BackIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const RulerIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.3 15l-5.8-5.8M3 21l1.5-1.5 1.5 1.5 1.5-1.5 1.5 1.5 1.5-1.5 1.5 1.5 1.5-1.5 1.5 1.5 1.5-1.5" />
    <path d="M3 21L21.3 8.7l-1.5-1.5-1.5 1.5-1.5-1.5-1.5 1.5-1.5-1.5-1.5 1.5" />
  </svg>
);
const UsersIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const HomeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const StarIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const InfoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
const CompassIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </svg>
);
const FlagIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" y1="22" x2="4" y2="15" />
  </svg>
);
const RoadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 17l3-10h12l3 10" />
    <line x1="9" y1="17" x2="9" y2="7" />
    <line x1="15" y1="17" x2="15" y2="7" />
  </svg>
);
const ClipboardIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
  </svg>
);
const MapPinIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);
const PersonIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const CheckIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const PlusIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const MinusIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

// ─── Stats Bar ────────────────────────────────────────────────
function StatsBarInline() {
  return (
    <div className="stats-bar-container">
      <div className="stats-bar-header">
        <div className="stats-title-group">
          <span className="stats-logo-dot" />
          <h3>SỐ LIỆU TỔNG QUAN XÃ</h3>
        </div>
        <span className="stats-year-tag">CẬP NHẬT 2026</span>
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-num text-union">{tongQuan.tongAp}</span>
          <span className="stat-lbl">Tổng ấp</span>
        </div>
        <div className="stat-card">
          <span className="stat-num text-cyan">
            {tongQuan.tongHoDan ? tongQuan.tongHoDan.toLocaleString('vi-VN') : '—'}
          </span>
          <span className="stat-lbl">Hộ dân</span>
        </div>
        <div className="stat-card">
          <span className="stat-num text-success">
            {tongQuan.tongDienTich ? `${(tongQuan.tongDienTich / 100).toFixed(2)} km²` : '—'}
          </span>
          <span className="stat-lbl">Diện tích</span>
        </div>
        <div className="stat-card">
          <span className="stat-num text-warning">
            {tongQuan.tongDanSo ? `${(tongQuan.tongDanSo / 1000).toFixed(1)}k` : '—'}
          </span>
          <span className="stat-lbl">Dân số</span>
        </div>
      </div>
    </div>
  );
}

// ─── Hamlet List Item ─────────────────────────────────────────
function HamletListItem({ hamlet, isActive, onClick }) {
  return (
    <div
      className={`hamlet-item ${isActive ? 'active' : ''}`}
      onClick={() => onClick(hamlet)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick(hamlet)}
      aria-label={`Xem chi tiết ${hamlet.ten}`}
    >
      <div className="hamlet-badge">{hamlet.id}</div>

      <div className="hamlet-info">
        <div className="hamlet-name">{hamlet.ten}</div>
        <div className="hamlet-meta">
          <span className="hamlet-meta-tag">
            <HomeIcon />
            {hamlet.soHoDan ? `${hamlet.soHoDan.toLocaleString('vi-VN')} hộ` : '—'}
          </span>
          <span className="hamlet-meta-tag">
            <MapPinIcon />
            {hamlet.dienTich ? `${hamlet.dienTich} ha` : 'Chưa cập nhật'}
          </span>
        </div>
      </div>

      {hamlet.diaChiDo && hamlet.diaChiDo.length > 0 ? (
        <span className="hamlet-status status-diachido" title={`${hamlet.diaChiDo.length} địa chỉ đỏ`}>
          🚩 {hamlet.diaChiDo.length} Địa chỉ đỏ
        </span>
      ) : hamlet.tinhTrang ? (
        <span className={`hamlet-status ${getStatusClass(hamlet.tinhTrang)}`}>
          {hamlet.tinhTrang}
        </span>
      ) : null}

      <span className="hamlet-arrow">
        <ArrowRightIcon />
      </span>
    </div>
  );
}

// ─── Hamlet Detail Panel (Collapsible Cards styled like the image) ───
function HamletDetail({ hamlet, onBack }) {
  const getInitials = (fullName) => {
    if (!fullName) return '??';
    const parts = fullName.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return parts.slice(-2).map((n) => n[0]).join('').toUpperCase();
  };

  const truongInitials = getInitials(hamlet.truongAp);
  const biInitials = getInitials(hamlet.biBiThu);

  // Accordion toggle states
  const [collapsed, setCollapsed] = useState({
    sapNhap: false,
    ranhGioi: false,
    lanhDao: false,
    duong: false,
    moTa: false
  });

  const toggleSection = (section) => {
    setCollapsed(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Check if sections have data
  const hasDiaChiDo = hamlet.diaChiDo && hamlet.diaChiDo.length > 0;
  const hasRanhGioi = hamlet.ranhGioi && Object.values(hamlet.ranhGioi).some(v => v !== "");
  const hasLanhDao = hamlet.truongAp !== "" || hamlet.biBiThu !== "";
  const hasDuong = hamlet.duongChinh && hamlet.duongChinh.length > 0;
  const hasMoTa = hamlet.moTa && hamlet.moTa !== "";

  return (
    <div className="detail-overlay">
      {/* ── Header ── */}
      <div className="detail-header">
        <button className="detail-back-btn" onClick={onBack} aria-label="Quay lại">
          <BackIcon />
        </button>
        <div className="detail-header-info">
          <div className="detail-hamlet-number">ẤP {hamlet.ten.toUpperCase()} · XÃ XUÂN THỚI SƠN</div>
          <div className="detail-hamlet-name">{hamlet.ten}</div>
        </div>
        {hamlet.tinhTrang ? (
          <div className="detail-status-badge">{hamlet.tinhTrang}</div>
        ) : null}
      </div>

      {/* ── Scrollable body ── */}
      <div className="detail-body">

        {/* 5 metrics */}
        <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))' }}>
          <div className="metric-card">
            <div className="metric-icon orange"><HomeIcon /></div>
            <div className="metric-data">
              <div className="metric-value">
                {hamlet.soHoDan ? hamlet.soHoDan.toLocaleString('vi-VN') : '—'}
                <span className="metric-unit"> hộ</span>
              </div>
              <div className="metric-label">Số hộ dân</div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon blue"><RulerIcon /></div>
            <div className="metric-data">
              <div className="metric-value">
                {hamlet.dienTich ? hamlet.dienTich : '—'}
                <span className="metric-unit"> ha</span>
              </div>
              <div className="metric-label">Diện tích</div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon teal">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              </svg>
            </div>
            <div className="metric-data">
              <div className="metric-value">
                {hamlet.chuVi !== undefined && hamlet.chuVi !== null ? hamlet.chuVi : '—'}
                <span className="metric-unit"> km</span>
              </div>
              <div className="metric-label">Chu vi</div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon green"><UsersIcon /></div>
            <div className="metric-data">
              <div className="metric-value">
                {hamlet.danSo ? hamlet.danSo.toLocaleString('vi-VN') : '—'}
                <span className="metric-unit"> người</span>
              </div>
              <div className="metric-label">Dân số</div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon red"><StarIcon /></div>
            <div className="metric-data">
              <div className="metric-value">
                {hamlet.soChiDoanVien !== null ? hamlet.soChiDoanVien : '—'}
                <span className="metric-unit"> đoàn viên</span>
              </div>
              <div className="metric-label">Đoàn viên</div>
            </div>
          </div>
        </div>

        {/* Địa chỉ đỏ / Di tích lịch sử */}
        {hasDiaChiDo && (
          <div className={`section-card diachido-section-card ${collapsed.diaChiDo ? 'collapsed' : ''}`}>
            <div className="section-card-header" onClick={() => toggleSection('diaChiDo')} role="button" tabIndex={0}>
              <div className="section-card-title text-red-600">
                <span className="red-flag-anim">🚩</span>
                Địa chỉ đỏ / Di tích lịch sử ({hamlet.diaChiDo.length})
              </div>
              <button className="section-collapse-btn" aria-label="Toggle section">
                {collapsed.diaChiDo ? <PlusIcon /> : <MinusIcon />}
              </button>
            </div>
            {!collapsed.diaChiDo && (
              <div className="section-card-body">
                <div className="diachido-list">
                  {hamlet.diaChiDo.map((item) => (
                    <div className="diachido-item-card" key={item.id}>
                      <h4 className="diachido-item-title">{item.ten}</h4>
                      {item.moTa && <p className="diachido-item-desc">{item.moTa}</p>}

                      <div className="diachido-actions-row">
                        <button
                          className="diachido-focus-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.dispatchEvent(new CustomEvent('xts_focus_diachido', {
                              detail: { toado: item.toado, id: item.id }
                            }));
                          }}
                          title="Định vị trên bản đồ"
                        >
                          <MapPinIcon />
                          <span>Định vị bản đồ</span>
                        </button>
                        {item.linkMap && (
                          <a
                            href={item.linkMap}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="diachido-nav-btn"
                            title="Chỉ đường trên Google Maps"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polygon points="3 11 22 2 13 21 11 13 3 11" />
                            </svg>
                            <span>Chỉ đường đi đến</span>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sáp nhập từ */}
        {hamlet.sapNhapTu && hamlet.sapNhapTu.length > 0 && (
          <div className={`section-card ${collapsed.sapNhap ? 'collapsed' : ''}`}>
            <div className="section-card-header" onClick={() => toggleSection('sapNhap')} role="button" tabIndex={0}>
              <div className="section-card-title">
                <ClipboardIcon />
                Sáp nhập từ các ấp cũ
              </div>
              <button className="section-collapse-btn" aria-label="Toggle section">
                {collapsed.sapNhap ? <PlusIcon /> : <MinusIcon />}
              </button>
            </div>
            {!collapsed.sapNhap && (
              <div className="section-card-body">
                <div className="origin-tags">
                  {hamlet.sapNhapTu.map((ten, i) => (
                    <span className="origin-tag" key={i}>
                      <CheckIcon />
                      {ten}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Địa giới */}
        {hasRanhGioi && (
          <div className={`section-card ${collapsed.ranhGioi ? 'collapsed' : ''}`}>
            <div className="section-card-header" onClick={() => toggleSection('ranhGioi')} role="button" tabIndex={0}>
              <div className="section-card-title">
                <CompassIcon />
                Địa giới tiếp giáp
              </div>
              <button className="section-collapse-btn" aria-label="Toggle section">
                {collapsed.ranhGioi ? <PlusIcon /> : <MinusIcon />}
              </button>
            </div>
            {!collapsed.ranhGioi && (
              <div className="section-card-body">
                <div className="boundary-table">
                  {Object.entries(hamlet.ranhGioi).map(([dir, val]) => {
                    if (!val) return null;
                    return (
                      <div className="boundary-row" key={dir}>
                        <span className="boundary-direction">{dirMap[dir]}</span>
                        <span className="boundary-value">{val}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Ban lãnh đạo */}
        {hasLanhDao && (
          <div className={`section-card ${collapsed.lanhDao ? 'collapsed' : ''}`}>
            <div className="section-card-header" onClick={() => toggleSection('lanhDao')} role="button" tabIndex={0}>
              <div className="section-card-title">
                <FlagIcon />
                Ban lãnh đạo ấp
              </div>
              <button className="section-collapse-btn" aria-label="Toggle section">
                {collapsed.lanhDao ? <PlusIcon /> : <MinusIcon />}
              </button>
            </div>
            {!collapsed.lanhDao && (
              <div className="section-card-body">
                <div className="people-list">
                  {hamlet.truongAp && (
                    <div className="person-row">
                      <div className="person-avatar">{truongInitials}</div>
                      <div className="person-info">
                        <div className="person-name">{hamlet.truongAp}</div>
                        <div className="person-role">Trưởng ấp</div>
                      </div>
                      <div className="person-tag">Trưởng ấp</div>
                    </div>
                  )}
                  {hamlet.biBiThu && (
                    <div className="person-row">
                      <div
                        className="person-avatar"
                        style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' }}
                      >
                        {biInitials}
                      </div>
                      <div className="person-info">
                        <div className="person-name">{hamlet.biBiThu}</div>
                        <div className="person-role">{hamlet.chiDoan || 'Chi đoàn'} · Bí thư Chi đoàn</div>
                      </div>
                      <div className="person-tag" style={{ background: '#FEF3C7', color: '#92400E' }}>
                        Bí thư
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Đường giao thông */}
        {hasDuong && (
          <div className={`section-card ${collapsed.duong ? 'collapsed' : ''}`}>
            <div className="section-card-header" onClick={() => toggleSection('duong')} role="button" tabIndex={0}>
              <div className="section-card-title">
                <RoadIcon />
                Đường giao thông chính
              </div>
              <button className="section-collapse-btn" aria-label="Toggle section">
                {collapsed.duong ? <PlusIcon /> : <MinusIcon />}
              </button>
            </div>
            {!collapsed.duong && (
              <div className="section-card-body">
                <div className="roads-list">
                  {hamlet.duongChinh.map((duong, i) => (
                    <div className="road-item" key={i}>
                      <div className="road-dot" />
                      <span className="road-name">{duong}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mô tả */}
        {hasMoTa && (
          <div className={`section-card ${collapsed.moTa ? 'collapsed' : ''}`}>
            <div className="section-card-header" onClick={() => toggleSection('moTa')} role="button" tabIndex={0}>
              <div className="section-card-title">
                <InfoIcon />
                Mô tả địa bàn
              </div>
              <button className="section-collapse-btn" aria-label="Toggle section">
                {collapsed.moTa ? <PlusIcon /> : <MinusIcon />}
              </button>
            </div>
            {!collapsed.moTa && (
              <div className="section-card-body">
                <p className="description-text">{hamlet.moTa}</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default function Sidebar({ selectedHamletId, onHamletSelect }) {
  const [isMobileExpanded, setIsMobileExpanded] = useState(true);

  // Derive the hamlet object from the shared id
  const selectedHamlet = selectedHamletId
    ? hamlets.find((h) => h.id === selectedHamletId) || null
    : null;

  const [search, setSearch] = useState('');

  // Expand bottom sheet on mobile when a hamlet is selected from map
  useEffect(() => {
    if (selectedHamletId) {
      setIsMobileExpanded(true);
    }
  }, [selectedHamletId]);

  const filtered = hamlets.filter(
    (h) =>
      h.ten.toLowerCase().includes(search.toLowerCase()) ||
      h.tenCu.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className={`sidebar ${isMobileExpanded ? 'mobile-expanded' : ''}`} style={{ position: 'relative' }}>
      {/* Mobile handle pull tab for bottom sheet */}
      <div
        className="sidebar-mobile-handle"
        onClick={() => setIsMobileExpanded(!isMobileExpanded)}
      >
        <div className="handle-bar"></div>
        <span className="handle-text">
          {isMobileExpanded ? 'Thu gọn danh sách' : 'Hiện danh sách 30 ấp'}
        </span>
        <span className="handle-icon">
          {isMobileExpanded ? <ChevronDownIcon /> : <ChevronUpIcon />}
        </span>
      </div>

      {/* ── Stats Bar ── */}
      <StatsBarInline />

      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-header-row">
          <div className="sidebar-title">
            <span className="sidebar-title-icon">
              <ListIcon />
            </span>
            Danh sách ấp Xuân Thới Sơn
          </div>
          <span className="sidebar-count">{hamlets.length} ấp</span>
        </div>

        {/* Search */}
        <div className="sidebar-search">
          <span style={{ color: 'var(--subtext)', flexShrink: 0 }}>
            <SearchIcon />
          </span>
          <input
            type="text"
            id="hamlet-search"
            placeholder="Tìm theo tên ấp mới, tên ấp cũ sáp nhập..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Tìm kiếm ấp"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--subtext)',
                lineHeight: 1,
                padding: 0,
                flexShrink: 0,
              }}
              aria-label="Xóa tìm kiếm"
            >
              <XIcon />
            </button>
          )}
        </div>
      </div>

      {/* ── List / Detail container ── */}
      <div className="hamlet-list-container">
        {/* Hamlet list */}
        <div className="hamlet-list-grid">
          {filtered.length > 0 ? (
            filtered.map((hamlet) => (
              <HamletListItem
                key={hamlet.id}
                hamlet={hamlet}
                isActive={selectedHamlet?.id === hamlet.id}
                onClick={(h) => onHamletSelect(h.id)}
              />
            ))
          ) : (
            <div className="no-result">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#9CA3AF"
                strokeWidth="1.5"
                style={{ marginBottom: 8 }}
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <div>
                Không tìm thấy kết quả cho "<strong>{search}</strong>"
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedHamlet && (
        <HamletDetail
          hamlet={selectedHamlet}
          onBack={() => onHamletSelect(null)}
        />
      )}

      {/* Footer */}
      <div className="footer-bar">
        <div className="footer-left">
          <span className="footer-dot" />
          Dữ liệu cập nhật năm 2026
        </div>
        <div className="footer-right">
          Đoàn TNCS HCM <span>Xã Xuân Thới Sơn</span>
        </div>
      </div>
    </aside>
  );
}

import { useState } from 'react';
import { hamlets } from '../data/hamlets';

// ─── Inline SVG Icons ─────────────────────────────────────────
const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const HomeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const MapIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
    <line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/>
  </svg>
);
const ArrowUpDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="11 5 15 9 19 5"/><line x1="15" y1="9" x2="15" y2="20"/>
    <polyline points="13 19 9 15 5 19"/><line x1="9" y1="15" x2="9" y2="4"/>
  </svg>
);
const FilterIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

export default function HamletsInfo({ onViewOnMap }) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name-asc'); // name-asc, households-desc, households-asc

  // Filter and sort logic
  const filtered = hamlets.filter((h) => {
    // Search
    return (
      h.ten.toLowerCase().includes(search.toLowerCase()) ||
      h.tenCu.toLowerCase().includes(search.toLowerCase())
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'name-asc') {
      return a.ten.localeCompare(b.ten, 'vi');
    }
    if (sortBy === 'households-desc') {
      return b.soHoDan - a.soHoDan;
    }
    if (sortBy === 'households-asc') {
      return a.soHoDan - b.soHoDan;
    }
    return 0;
  });

  return (
    <div className="info-tab-container">
      {/* ── Page Header ── */}
      <div className="tab-title-row">
        <div>
          <h1 className="tab-main-title">Danh Bạ Địa Giới Hành Chính 30 Ấp</h1>
          <p className="tab-sub-title">Cơ sở dữ liệu hành chính Xã Xuân Thới Sơn sau sáp nhập (Năm 2026)</p>
        </div>
        <div className="tab-meta-pill">
          Tổng số ấp: <strong>{hamlets.length}</strong>
        </div>
      </div>

      {/* ── Filters Bar ── */}
      <div className="filters-bar">
        {/* Search */}
        <div className="filter-search-box">
          <SearchIcon />
          <input
            type="text"
            placeholder="Tìm theo tên ấp mới, tên ấp cũ sáp nhập..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Sort */}
        <div className="filter-group" style={{ marginLeft: 'auto' }}>
          <span className="filter-label">
            <ArrowUpDownIcon />
            Sắp xếp:
          </span>
          <select 
            className="filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name-asc">Tên ấp (A - Z)</option>
            <option value="households-desc">Hộ dân (Giảm dần)</option>
            <option value="households-asc">Hộ dân (Tăng dần)</option>
          </select>
        </div>
      </div>

      {/* ── Grid of Hamlets ── */}
      {sorted.length > 0 ? (
        <div className="info-grid">
          {sorted.map((h) => (
            <div className="info-hamlet-card" key={h.id}>
              {/* Top Row */}
              <div className="card-top-row">
                <span className="card-id-badge">#{h.id}</span>
                <span className="card-status-dot" style={{ backgroundColor: h.color }} />
              </div>

              {/* Title */}
              <h2 className="card-hamlet-name">Ấp {h.ten}</h2>
              <div className="card-locality">Xã Xuân Thới Sơn - TP.HCM</div>

              {/* Households Metric */}
              <div className="card-metric">
                <div className="metric-icon-small"><HomeIcon /></div>
                <div className="metric-text-group">
                  <span className="metric-title">Số hộ gia đình:</span>
                  <strong className="metric-val">{h.soHoDan.toLocaleString('vi-VN')} hộ</strong>
                </div>
              </div>

              {/* Origins */}
              <div className="card-origins-container">
                <div className="origins-header">Sắp xếp sáp nhập từ:</div>
                <div className="origins-tags-grid">
                  {h.sapNhapTu.map((c, i) => (
                    <span className="origin-badge" key={i}>
                      <CheckIcon />
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action */}
              <button 
                className="card-action-btn"
                onClick={() => onViewOnMap(h.id)}
              >
                <MapIcon />
                <span>Định vị trên bản đồ</span>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-result-card">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--subtext)" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <h3>Không tìm thấy dữ liệu</h3>
          <p>Hãy thử tìm kiếm với từ khóa khác hoặc điều chỉnh lại các bộ lọc</p>
        </div>
      )}
    </div>
  );
}

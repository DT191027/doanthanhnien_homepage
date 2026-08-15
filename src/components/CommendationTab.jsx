import React, { useState, useEffect } from 'react';
import { COMMENDATION_CATEGORIES } from '../data/commendationsData';
import { commendationService } from '../lib/commendationService';
import { Award, Medal, Star, Trophy, PlusCircle, Trash2, X, ShieldCheck } from 'lucide-react';

export default function CommendationTab({ isAdminLoggedIn, onOpenAdminModal }) {
  const [activeCategory, setActiveCategory] = useState("danh-hieu");
  const [data, setData] = useState({
    "danh-hieu": [],
    "cap-tren": [],
    "thanh-nien-tieu-bieu": []
  });
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states for creating a new commendation
  const [title, setTitle] = useState('');
  const [issuingBody, setIssuingBody] = useState('');
  const [year, setYear] = useState('2026');
  const [certificateNo, setCertificateNo] = useState('');
  const [summary, setSummary] = useState('');
  const [category, setCategory] = useState('danh-hieu');
  const [badgeColor, setBadgeColor] = useState('#0056B3');

  useEffect(() => {
    async function loadCommendations() {
      setLoading(true);
      const res = await commendationService.getCommendations();
      setData(res);
      setLoading(false);
    }
    loadCommendations();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim()) {
      alert('Vui lòng nhập đầy đủ Tên danh hiệu/khen thưởng và Mô tả!');
      return;
    }

    const newItem = {
      id: 'cmd-' + Date.now(),
      title: title.trim(),
      issuingBody: issuingBody.trim() || 'Ủy ban Nhân dân / Đoàn Xã Xuân Thới Sơn',
      year: year || '2026',
      certificateNo: certificateNo.trim() || 'Quyết định khen thưởng',
      summary: summary.trim(),
      category: category,
      badgeColor: badgeColor
    };

    const updatedData = await commendationService.createCommendation(newItem);
    setData(updatedData);

    // Reset form
    setTitle('');
    setIssuingBody('');
    setCertificateNo('');
    setSummary('');
    setIsAddModalOpen(false);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Bạn có chắc chắn muốn xóa mục khen thưởng này?')) {
      const updatedData = await commendationService.deleteCommendation(id);
      setData(updatedData);
    }
  };

  const currentItems = data[activeCategory] || [];

  return (
    <div className="tab-page-container commendation-page">
      {/* Header Banner */}
      <div className="page-top-banner flex-between">
        <div className="banner-title-area">
          <div className="breadcrumb-nav">Trang Chủ / Khen Thưởng</div>
          <h1 className="page-main-title">Khen Thưởng & Danh Hiệu Thi Đua</h1>
          <p className="page-sub-title">Tuyên dương các danh hiệu thi đua xuất sắc, bằng khen cấp trên và gương thanh niên tiêu biểu xã Xuân Thới Sơn</p>
        </div>

        <div className="banner-admin-action">
          <button 
            className="btn-admin-post" 
            onClick={() => {
              if (!isAdminLoggedIn) {
                onOpenAdminModal();
              } else {
                setIsAddModalOpen(true);
              }
            }}
          >
            <PlusCircle size={18} />
            {isAdminLoggedIn ? 'Thêm Khen Thưởng Mới' : 'Đăng Nhập Quản Trị để Thêm'}
          </button>
        </div>
      </div>

      {/* Category Navigation Bar */}
      <div className="commendation-nav-bar">
        {COMMENDATION_CATEGORIES.map(cat => (
          <button 
            key={cat.id} 
            className={`commendation-nav-item ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="commendation-content-area">
        {currentItems.length === 0 && !loading ? (
          <div className="empty-news-card">
            <div className="empty-icon-wrapper">
              <Award size={44} />
            </div>
            <h3>Chưa có nội dung khen thưởng nào trong danh mục này</h3>
            <p>
              Cán bộ Đoàn xã vui lòng bấm nút bên dưới để đăng nhập và tự nhập thông tin khen thưởng, bằng khen, hoặc gương tuyên dương.
            </p>
            <button 
              className="btn-admin-post"
              onClick={() => {
                if (!isAdminLoggedIn) {
                  onOpenAdminModal();
                } else {
                  setIsAddModalOpen(true);
                }
              }}
            >
              <PlusCircle size={18} />
              {isAdminLoggedIn ? 'Thêm Nội Dung Khen Thưởng Mới' : 'Đăng Nhập Quản Trị để Thêm'}
            </button>
          </div>
        ) : (
          <div className="commendation-grid">
            {currentItems.map(item => (
              <div key={item.id} className="award-card">
                <div className="award-card-header" style={{ backgroundColor: item.badgeColor || '#0056B3' }}>
                  <span className="award-year-tag flex-center-gap">
                    <Trophy size={14} />
                    {item.year}
                  </span>
                  <span className="award-cert-no">{item.certificateNo}</span>
                  {isAdminLoggedIn && (
                    <button 
                      className="btn-delete-award" 
                      onClick={(e) => handleDelete(item.id, e)}
                      title="Xóa mục khen thưởng này"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <div className="award-card-body">
                  <h3 className="award-title">{item.title}</h3>
                  <div className="award-issuing">
                    <strong>Cơ quan ban hành:</strong> {item.issuingBody}
                  </div>
                  <p className="award-summary">{item.summary}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Admin Add Commendation Modal */}
      {isAddModalOpen && (
        <div className="admin-modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="flex-center-gap">
                <ShieldCheck size={20} />
                Thêm Nội Dung Khen Thưởng Mới
              </h3>
              <button className="btn-close-modal" onClick={() => setIsAddModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-body">
              <form onSubmit={handleAddSubmit} className="admin-post-form">
                <div className="form-group">
                  <label>Danh mục khen thưởng:</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="danh-hieu">Danh Hiệu Thi Đua</option>
                    <option value="cap-tren">Khen Thưởng Cấp Trên</option>
                    <option value="thanh-nien-tieu-bieu">Tuyên Dương & Phong Trào</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Tên danh hiệu / Khen thưởng (*):</label>
                  <input 
                    type="text" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    placeholder="Ví dụ: Bằng khen của UBND Thành phố Hồ Chí Minh..." 
                    required 
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label>Cơ quan ban hành (*):</label>
                    <input 
                      type="text" 
                      value={issuingBody} 
                      onChange={(e) => setIssuingBody(e.target.value)} 
                      placeholder="Ví dụ: Thành Đoàn TP.HCM / UBND Xã Xuân Thới Sơn" 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Năm khen thưởng (*):</label>
                    <input 
                      type="text" 
                      value={year} 
                      onChange={(e) => setYear(e.target.value)} 
                      placeholder="2026" 
                      required 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Số Quyết định / Số Bằng khen (Tùy chọn):</label>
                  <input 
                    type="text" 
                    value={certificateNo} 
                    onChange={(e) => setCertificateNo(e.target.value)} 
                    placeholder="Ví dụ: QĐ số 123/QĐ-UBND..." 
                  />
                </div>

                <div className="form-group">
                  <label>Tóm tắt thành tích (*):</label>
                  <textarea 
                    rows="4" 
                    value={summary} 
                    onChange={(e) => setSummary(e.target.value)} 
                    placeholder="Tóm tắt thành tích xuất sắc đạt được..." 
                    required 
                  />
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-cancel" onClick={() => setIsAddModalOpen(false)}>Hủy Bỏ</button>
                  <button type="submit" className="btn-submit-primary">Thêm Khen Thưởng Lên Website</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

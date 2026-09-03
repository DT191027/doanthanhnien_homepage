import React, { useState, useRef } from 'react';
import { 
  ShieldCheck, 
  X, 
  Link2, 
  Image as ImageIcon, 
  Calendar, 
  Tag, 
  FileText, 
  LogOut, 
  LogIn,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Upload,
  RefreshCw,
  Sparkles,
  Eye,
  Edit3,
  ExternalLink,
  ArrowRight,
  Send
} from 'lucide-react';
import { fetchUrlMetaData } from '../lib/metaFetcher';
import { authService } from '../lib/authService';

const PRESET_IMAGES = [
  {
    name: 'Hoạt động Tình nguyện',
    url: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Công trình Thanh niên',
    url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Chuyển đổi số',
    url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Giáo dục Truyền thống',
    url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
  },
];

export default function AdminNewsModal({ isOpen, onClose, onSavePost, isAdminLoggedIn, onLogin, onLogout }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Form states for creating a new post
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [fbLink, setFbLink] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('Hoạt động Tình nguyện');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [content, setContent] = useState('');
  const [formError, setFormError] = useState('');

  // Active view inside modal: 'edit' | 'preview'
  const [modalTab, setModalTab] = useState('edit');

  // Metadata fetching states
  const [isFetchingMeta, setIsFetchingMeta] = useState(false);
  const [metaStatus, setMetaStatus] = useState(null); // { type: 'success'|'warning'|'error', text: '' }

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    const res = await authService.login(username, password);
    setIsLoggingIn(false);

    if (res.success) {
      onLogin();
    } else {
      setLoginError(res.error || 'Tài khoản hoặc mật khẩu không chính xác!');
    }
  };

  // Extract metadata from Facebook link
  const runMetaExtract = async (urlToFetch) => {
    if (!urlToFetch || !urlToFetch.trim().startsWith('http')) return;

    setIsFetchingMeta(true);
    setMetaStatus(null);

    const meta = await fetchUrlMetaData(urlToFetch);
    setIsFetchingMeta(false);

    if (meta.success) {
      if (meta.title) setTitle(meta.title);
      if (meta.abstract) setAbstract(meta.abstract);
      if (meta.date) setDate(meta.date);

      if (meta.imageUrl) {
        setImageUrl(meta.imageUrl);
        setMetaStatus({
          type: 'success',
          text: 'Đã tự động lấy đúng Tiêu đề, Nội dung có Icon Emojis & Ảnh gốc từ bài viết Facebook!'
        });
      } else {
        if (!imageUrl) setImageUrl(PRESET_IMAGES[0].url);
        setMetaStatus({
          type: 'warning',
          text: 'Đã bóc tách Tiêu đề & Nội dung có Emojis. Ảnh bài viết được tự chọn mẫu (bạn có thể đổi link ảnh hoặc tải từ máy).'
        });
      }
    } else {
      setMetaStatus({
        type: 'error',
        text: meta.error || 'Không thể tự động bóc tách từ link này. Bạn có thể tự điền nội dung.'
      });
    }
  };

  const handleFbLinkChange = (e) => {
    const val = e.target.value;
    setFbLink(val);
    if (val.trim().startsWith('http')) {
      runMetaExtract(val);
    } else {
      setMetaStatus(null);
    }
  };

  // Local image upload handling
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Dung lượng ảnh tối đa 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setImageUrl(evt.target.result);
          setMetaStatus({
            type: 'success',
            text: 'Đã tải ảnh thành công từ máy tính của bạn!'
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePost = (e) => {
    if (e) e.preventDefault();
    if (!title.trim() || !abstract.trim()) {
      setFormError('Vui lòng nhập đầy đủ Tiêu đề và Tóm tắt bài viết!');
      setModalTab('edit');
      return;
    }

    const defaultCover = PRESET_IMAGES[0].url;

    const newPost = {
      id: 'news-' + Date.now(),
      title: title.trim(),
      abstract: abstract.trim(),
      date: date || new Date().toISOString().split('T')[0],
      category: category,
      author: 'Đoàn Xã Xuân Thới Sơn',
      fbLink: fbLink.trim() || 'https://www.facebook.com/DTNxaTTN?locale=vi_VN',
      imageUrl: imageUrl.trim() || defaultCover,
      views: 1,
      isFeatured: false,
      content: content.trim() || abstract.trim()
    };

    onSavePost(newPost);
    // Reset form
    setTitle('');
    setAbstract('');
    setFbLink('');
    setImageUrl('');
    setContent('');
    setFormError('');
    setMetaStatus(null);
    setModalTab('edit');
    onClose();
  };

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div className="admin-modal-box" style={{ maxWidth: modalTab === 'preview' ? '820px' : '720px', transition: 'max-width 0.25s ease' }} onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3 className="flex-center-gap">
            <ShieldCheck size={20} />
            Quản Trị Bài Viết - Đoàn Xã Xuân Thới Sơn
          </h3>
          <button className="btn-close-modal" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="admin-modal-body">
          {!isAdminLoggedIn ? (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="admin-login-form">
              {loginError && <div className="error-alert">{loginError}</div>}
              
              <div className="form-group">
                <label>Tên đăng nhập (Username / Email):</label>
                <input 
                  type="text" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  placeholder="Nhập tên đăng nhập hoặc email cán bộ..."
                  required 
                />
              </div>

              <div className="form-group">
                <label>Mật khẩu (Password):</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="Nhập mật khẩu..."
                  required 
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-submit-primary flex-center-gap" disabled={isLoggingIn}>
                  {isLoggingIn ? <Loader2 size={16} className="spin-icon" /> : <LogIn size={16} />}
                  {isLoggingIn ? 'Đang xác thực...' : 'Đăng Nhập Quản Trị'}
                </button>
              </div>
            </form>
          ) : (
            /* Create Post Container */
            <div className="admin-post-container">
              <div className="admin-user-bar">
                <span>Đã đăng nhập: <strong>Đoàn TNCS Hồ Chí Minh Xã Xuân Thới Sơn</strong></span>
                <button type="button" className="btn-logout flex-center-gap" onClick={onLogout}>
                  <LogOut size={14} />
                  Thoát Quản Trị
                </button>
              </div>

              {/* Tab Navigation: Edit vs Live Preview */}
              <div className="admin-modal-tabs" style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '2px solid #E5E7EB', paddingBottom: '8px' }}>
                <button
                  type="button"
                  onClick={() => setModalTab('edit')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '14px',
                    cursor: 'pointer',
                    backgroundColor: modalTab === 'edit' ? '#008DD5' : '#F3F4F6',
                    color: modalTab === 'edit' ? '#FFFFFF' : '#4B5563',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Edit3 size={16} />
                  Soạn Thảo Bài Viết
                </button>
                <button
                  type="button"
                  onClick={() => setModalTab('preview')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '14px',
                    cursor: 'pointer',
                    backgroundColor: modalTab === 'preview' ? '#008DD5' : '#F3F4F6',
                    color: modalTab === 'preview' ? '#FFFFFF' : '#4B5563',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Eye size={16} />
                  Xem Trước Bài Đăng Live
                </button>
              </div>

              {formError && <div className="error-alert">{formError}</div>}

              {/* TAB 1: EDIT FORM */}
              {modalTab === 'edit' && (
                <form onSubmit={handleCreatePost} className="admin-post-form">
                  {/* Facebook Link & Auto Metadata */}
                  <div className="form-group">
                    <label className="flex-center-gap" style={{ justifyContent: 'space-between' }}>
                      <span className="flex-center-gap">
                        <Link2 size={15} />
                        Đường dẫn bài viết Facebook (Paste Link Facebook vào đây):
                      </span>
                      {fbLink.trim() && !isFetchingMeta && (
                        <button 
                          type="button" 
                          className="btn-retry-meta flex-center-gap"
                          onClick={() => runMetaExtract(fbLink)}
                          title="Bóc tách lại thông tin"
                          style={{ background: 'none', border: 'none', color: '#008DD5', fontSize: '12px', cursor: 'pointer' }}
                        >
                          <RefreshCw size={13} />
                          Bóc tách lại
                        </button>
                      )}
                    </label>
                    <div className="input-with-loader">
                      <input 
                        type="url" 
                        value={fbLink} 
                        onChange={handleFbLinkChange} 
                        placeholder="Dán link bài viết Facebook: https://www.facebook.com/share/p/..." 
                      />
                      {isFetchingMeta && (
                        <span className="loader-badge flex-center-gap">
                          <Loader2 size={14} className="spin-icon" />
                          Đang lấy MetaData...
                        </span>
                      )}
                    </div>
                    <small className="form-help">Hệ thống sẽ tự động đọc OpenGraph trích xuất Ảnh bài viết gốc, Icon Emojis và Tiêu đề từ Facebook!</small>
                    
                    {metaStatus?.type === 'success' && (
                      <div className="meta-success-alert flex-center-gap" style={{ marginTop: '8px', padding: '8px 12px', backgroundColor: '#DCFCE7', border: '1px solid #22C55E', borderRadius: '6px', fontSize: '13px', color: '#15803D' }}>
                        <CheckCircle2 size={15} color="#16A34A" style={{ flexShrink: 0 }} />
                        <span>{metaStatus.text}</span>
                      </div>
                    )}
                    {metaStatus?.type === 'warning' && (
                      <div className="meta-warning-alert flex-center-gap" style={{ marginTop: '8px', padding: '8px 12px', backgroundColor: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: '6px', fontSize: '13px', color: '#92400E' }}>
                        <AlertCircle size={15} color="#D97706" style={{ flexShrink: 0 }} />
                        <span>{metaStatus.text}</span>
                      </div>
                    )}
                    {metaStatus?.type === 'error' && (
                      <div className="meta-error-alert flex-center-gap" style={{ marginTop: '8px', padding: '8px 12px', backgroundColor: '#FEE2E2', border: '1px solid #EF4444', borderRadius: '6px', fontSize: '13px', color: '#991B1B' }}>
                        <AlertCircle size={15} color="#DC2626" style={{ flexShrink: 0 }} />
                        <span>{metaStatus.text}</span>
                      </div>
                    )}
                  </div>

                  {/* Image URL & Upload / Selection Options */}
                  <div className="form-group">
                    <label className="flex-center-gap">
                      <ImageIcon size={15} />
                      Hình Ảnh Hiển Thị (Auto-Thumbnail / Dán URL / Tải ảnh / Chọn mẫu):
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        type="text" 
                        value={imageUrl} 
                        onChange={(e) => setImageUrl(e.target.value)} 
                        placeholder="https://... (URL hình ảnh bài viết)" 
                        style={{ flex: 1 }}
                      />
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        accept="image/*" 
                        onChange={handleFileUpload} 
                        style={{ display: 'none' }} 
                      />
                      <button 
                        type="button" 
                        className="btn-upload-file flex-center-gap"
                        onClick={() => fileInputRef.current?.click()}
                        style={{ padding: '0 12px', backgroundColor: '#F3F4F6', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                      >
                        <Upload size={14} />
                        Tải từ máy
                      </button>
                    </div>

                    {/* Preset image suggestions */}
                    <div style={{ marginTop: '8px' }}>
                      <span style={{ fontSize: '12px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                        <Sparkles size={13} color="#008DD5" />
                        Hoặc chọn ảnh mẫu nhanh:
                      </span>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {PRESET_IMAGES.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setImageUrl(preset.url)}
                            style={{
                              fontSize: '11px',
                              padding: '4px 8px',
                              borderRadius: '12px',
                              border: imageUrl === preset.url ? '1px solid #008DD5' : '1px solid #E5E7EB',
                              backgroundColor: imageUrl === preset.url ? '#EFF6FF' : '#F9FAFB',
                              color: imageUrl === preset.url ? '#008DD5' : '#4B5563',
                              cursor: 'pointer'
                            }}
                          >
                            {preset.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Prominent Live Thumbnail Preview Box */}
                    {imageUrl && (
                      <div className="image-preview-thumbnail" style={{ marginTop: '12px', backgroundColor: '#F9FAFB', padding: '12px', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <ImageIcon size={14} color="#008DD5" />
                            Xem trước Thumbnail ảnh
                          </span>
                          <button 
                            type="button" 
                            onClick={() => setImageUrl('')}
                            style={{ fontSize: '11px', color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer' }}
                          >
                            Xóa ảnh này
                          </button>
                        </div>
                        <img 
                          src={imageUrl} 
                          alt="Thumbnail Xem trước" 
                          referrerPolicy="no-referrer"
                          onError={() => {
                            setImageUrl(PRESET_IMAGES[0].url);
                            setMetaStatus({
                              type: 'warning',
                              text: 'Link ảnh dán không tải được (lỗi CORS/Hotlink). Hệ thống đã tự động chuyển sang ảnh mẫu tiêu chuẩn.'
                            });
                          }}
                          style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #D1D5DB' }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label className="flex-center-gap">
                        <Calendar size={15} />
                        Ngày đăng bài:
                      </label>
                      <input 
                        type="date" 
                        value={date} 
                        onChange={(e) => setDate(e.target.value)} 
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label className="flex-center-gap">
                        <Tag size={15} />
                        Danh mục tin tức:
                      </label>
                      <select value={category} onChange={(e) => setCategory(e.target.value)}>
                        <option value="Hoạt động Tình nguyện">Hoạt động Tình nguyện</option>
                        <option value="Giáo dục Truyền thống">Giáo dục Truyền thống</option>
                        <option value="Chuyển đổi số">Chuyển đổi số</option>
                        <option value="Tuyên dương Khen thưởng">Tuyên dương Khen thưởng</option>
                        <option value="Công trình Thanh niên">Công trình Thanh niên</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Tiêu đề bài viết (*):</label>
                    <input 
                      type="text" 
                      value={title} 
                      onChange={(e) => setTitle(e.target.value)} 
                      placeholder="Tiêu đề bài viết (Ví dụ: 🇻🇳 CHÚC MỪNG...)" 
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label>Tóm tắt ngắn (Abstract) (*):</label>
                    <textarea 
                      rows="3" 
                      value={abstract} 
                      onChange={(e) => setAbstract(e.target.value)} 
                      placeholder="Tóm tắt ngắn gọn hiển thị trên thẻ bài viết..." 
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label>Nội dung chi tiết (Tùy chọn):</label>
                    <textarea 
                      rows="4" 
                      value={content} 
                      onChange={(e) => setContent(e.target.value)} 
                      placeholder="Nội dung bài viết đầy đủ..." 
                    />
                  </div>

                  <div className="form-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button type="button" className="btn-cancel" onClick={onClose}>Hủy Bỏ</button>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        type="button" 
                        className="btn-hero-secondary flex-center-gap"
                        onClick={() => setModalTab('preview')}
                        style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #008DD5', backgroundColor: '#EFF6FF', color: '#008DD5', fontWeight: 600, cursor: 'pointer' }}
                      >
                        <Eye size={16} />
                        Xem Trước Bài Đăng
                      </button>
                      <button type="submit" className="btn-submit-primary flex-center-gap">
                        <Send size={16} />
                        Đăng Bài Viết Lên Website
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* TAB 2: LIVE PREVIEW MODE */}
              {modalTab === 'preview' && (
                <div className="admin-live-preview-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #86EFAC', padding: '12px 16px', borderRadius: '8px', color: '#166534', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Eye size={18} color="#16A34A" />
                    <span><strong>Chế độ Xem Trước Live:</strong> Dưới đây là hình ảnh thực tế bài đăng sẽ xuất hiện trên Website của Đoàn Xã. Hãy nhìn lại tổng thể trước khi phát hành!</span>
                  </div>

                  {/* Preview Section 1: Post Card View */}
                  <div style={{ border: '1px solid #E5E7EB', borderRadius: '12px', padding: '16px', backgroundColor: '#FFFFFF' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Sparkles size={14} color="#008DD5" />
                      1. Hiển thị dạng Thẻ Bài Viết (News Card):
                    </h4>

                    <article className="news-card-item" style={{ maxWidth: '480px', margin: '0 auto', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                      <div className="card-img-wrapper">
                        <img 
                          src={imageUrl || PRESET_IMAGES[0].url} 
                          alt={title || 'Tiêu đề bài viết'} 
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = PRESET_IMAGES[0].url;
                          }}
                        />
                        <span className="card-cat-tag">{category}</span>
                      </div>
                      <div className="card-body">
                        <div className="post-meta">
                          <span className="post-date">{date}</span>
                          <span className="post-author">Đoàn Xã Xuân Thới Sơn</span>
                        </div>
                        <h3 className="card-title" style={{ fontSize: '16px', lineHeight: '1.4' }}>
                          {title || 'Chưa nhập tiêu đề bài viết...'}
                        </h3>
                        <p className="card-abstract" style={{ whiteSpace: 'pre-line', wordBreak: 'break-word' }}>
                          {abstract || 'Chưa nhập nội dung tóm tắt...'}
                        </p>
                        
                        <div className="card-footer-bar">
                          <span className="btn-link-text flex-center-gap">
                            Xem tiếp <ArrowRight size={14} />
                          </span>
                          {fbLink && (
                            <span className="btn-fb-direct flex-center-gap" style={{ fontSize: '11px', color: '#1877F2' }}>
                              Xem trên Facebook <ExternalLink size={11} />
                            </span>
                          )}
                        </div>
                      </div>
                    </article>
                  </div>

                  {/* Preview Section 2: Detail Article Popup View */}
                  <div style={{ border: '1px solid #E5E7EB', borderRadius: '12px', padding: '16px', backgroundColor: '#FFFFFF' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FileText size={14} color="#008DD5" />
                      2. Hiển thị khi người đọc bấm vào xem chi tiết:
                    </h4>

                    <div className="article-modal-card" style={{ maxWidth: '100%', margin: '0 auto', boxShadow: 'none', border: '1px solid #E5E7EB' }}>
                      <div className="article-modal-hero" style={{ height: '220px' }}>
                        <img 
                          src={imageUrl || PRESET_IMAGES[0].url} 
                          alt={title} 
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = PRESET_IMAGES[0].url;
                          }}
                        />
                        <span className="modal-cat-tag">{category}</span>
                      </div>
                      <div className="article-modal-body">
                        <div className="post-meta">
                          <span>{date}</span>
                          <span>• Đoàn Xã Xuân Thới Sơn</span>
                        </div>
                        <h2 style={{ fontSize: '20px', lineHeight: '1.4', margin: '8px 0 12px' }}>
                          {title || 'Tiêu đề bài viết xem trước'}
                        </h2>
                        <div className="article-full-text" style={{ fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-line', wordBreak: 'break-word' }}>
                          {(content || abstract || 'Nội dung chi tiết bài viết...').split(/\n\s*\n/).map((paragraph, idx) => (
                            <p key={idx} style={{ whiteSpace: 'pre-line', marginBottom: '12px' }}>{paragraph}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Preview Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                    <button 
                      type="button" 
                      className="btn-cancel flex-center-gap"
                      onClick={() => setModalTab('edit')}
                      style={{ padding: '10px 18px', fontWeight: 600 }}
                    >
                      <Edit3 size={16} />
                      Chỉnh Sửa Bài Viết
                    </button>
                    <button 
                      type="button" 
                      className="btn-submit-primary flex-center-gap"
                      onClick={() => handleCreatePost()}
                      style={{ padding: '10px 24px', fontSize: '15px' }}
                    >
                      <Send size={16} />
                      Xác Nhận & Đăng Bài Lên Website
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

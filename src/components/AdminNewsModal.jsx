import React, { useState, useRef, useEffect } from 'react';
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
  Send,
  Trash2,
  Check
} from 'lucide-react';
import { fetchUrlMetaData } from '../lib/metaFetcher';
import { authService } from '../lib/authService';

const PRESET_IMAGES = [
  {
    name: 'Hoạt động Tình nguyện',
    category: 'Hoạt động Tình nguyện',
    url: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Công trình Thanh niên',
    category: 'Công trình Thanh niên',
    url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Chuyển đổi số',
    category: 'Chuyển đổi số',
    url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Giáo dục Truyền thống',
    category: 'Giáo dục Truyền thống',
    url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Tuyên dương Khen thưởng',
    category: 'Tuyên dương Khen thưởng',
    url: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?auto=format&fit=crop&w=1200&q=80',
  },
];

// Nén ảnh tải từ máy tính bằng Canvas để tối ưu dung lượng (1200px, ~150KB)
function compressImageFile(file, maxWidth = 1200, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(event.target.result);
    };
    reader.onerror = (err) => reject(err);
  });
}

export default function AdminNewsModal({ 
  isOpen, 
  onClose, 
  onSavePost, 
  isAdminLoggedIn, 
  onLogin, 
  onLogout,
  editingPost = null 
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Form states for creating / editing a post
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [fbLink, setFbLink] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('Hoạt động Tình nguyện');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [content, setContent] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Active view inside modal: 'edit' | 'preview'
  const [modalTab, setModalTab] = useState('edit');

  // Metadata fetching states
  const [isFetchingMeta, setIsFetchingMeta] = useState(false);
  const [metaStatus, setMetaStatus] = useState(null); // { type: 'success'|'warning'|'error', text: '' }

  // Image load error indicator (does NOT destroy imageUrl)
  const [imgLoadError, setImgLoadError] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef(null);

  // Pre-fill form when editing an existing post or resetting
  useEffect(() => {
    if (editingPost) {
      setTitle(editingPost.title || '');
      setAbstract(editingPost.abstract || '');
      setFbLink(editingPost.fbLink || '');
      setImageUrl(editingPost.imageUrl || '');
      setCategory(editingPost.category || 'Hoạt động Tình nguyện');
      setDate(editingPost.date || new Date().toISOString().split('T')[0]);
      setContent(editingPost.content || editingPost.abstract || '');
      setImgLoadError(false);
      setFormError('');
      setSaveSuccessMsg('');
    } else {
      // Default new form
      setTitle('');
      setAbstract('');
      setFbLink('');
      setImageUrl('');
      setCategory('Hoạt động Tình nguyện');
      setDate(new Date().toISOString().split('T')[0]);
      setContent('');
      setImgLoadError(false);
      setFormError('');
      setSaveSuccessMsg('');
    }
  }, [editingPost, isOpen]);

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
        setImgLoadError(false);
        setMetaStatus({
          type: 'success',
          text: '✓ Đã tự động bóc tách Tiêu đề, Tóm tắt & Ảnh bài viết từ Facebook!'
        });
      } else {
        // Nếu Facebook không trả ảnh do bảo mật, tự động gán ảnh mẫu tương ứng
        const matchedPreset = PRESET_IMAGES.find(p => p.category === category) || PRESET_IMAGES[0];
        if (!imageUrl) setImageUrl(matchedPreset.url);
        setImgLoadError(false);
        setMetaStatus({
          type: 'warning',
          text: '✓ Đã bóc tách Tiêu đề & Nội dung Facebook. Do Facebook chặn hotlink trực tiếp, bạn có thể tải ảnh từ máy tính hoặc dùng ảnh mẫu chuẩn.'
        });
      }
    } else {
      setMetaStatus({
        type: 'error',
        text: meta.error || 'Không thể tự động bóc tách từ link này. Bạn có thể tự điền nội dung bên dưới.'
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

  // Local image upload handling with smart canvas compression
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file hình ảnh (JPG, PNG, WebP)');
      return;
    }

    setIsUploading(true);
    try {
      const compressedDataUrl = await compressImageFile(file, 1200, 0.85);
      setImageUrl(compressedDataUrl);
      setImgLoadError(false);
      setMetaStatus({
        type: 'success',
        text: '✓ Đã tải ảnh từ máy tính thành công! Thumbnail sắc nét và hiển thị chuẩn 16:9.'
      });
    } catch (err) {
      console.error('Lỗi nén ảnh:', err);
      alert('Không thể đọc file ảnh này. Vui lòng thử lại với ảnh khác.');
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  // Tự động gợi ý ảnh khi đổi danh mục nếu chưa có ảnh
  const handleCategoryChange = (newCat) => {
    setCategory(newCat);
    const matchedPreset = PRESET_IMAGES.find(p => p.category === newCat);
    if (matchedPreset && (!imageUrl || PRESET_IMAGES.some(p => p.url === imageUrl))) {
      setImageUrl(matchedPreset.url);
      setImgLoadError(false);
    }
  };

  // Lưu bài viết
  const handleCreateOrUpdatePost = async (e) => {
    if (e) e.preventDefault();
    if (!title.trim() || !abstract.trim()) {
      setFormError('Vui lòng nhập đầy đủ Tiêu đề và Tóm tắt bài viết!');
      setModalTab('edit');
      return;
    }

    const defaultCover = PRESET_IMAGES.find(p => p.category === category)?.url || PRESET_IMAGES[0].url;

    const postPayload = {
      id: editingPost ? editingPost.id : ('news-' + Date.now()),
      title: title.trim(),
      abstract: abstract.trim(),
      date: date || new Date().toISOString().split('T')[0],
      category: category,
      author: 'Đoàn Xã Xuân Thới Sơn',
      fbLink: fbLink.trim() || 'https://www.facebook.com/DTNxaTTN?locale=vi_VN',
      imageUrl: imageUrl.trim() || defaultCover,
      views: editingPost?.views || 1,
      isFeatured: editingPost?.isFeatured || false,
      content: content.trim() || abstract.trim(),
      isEditing: Boolean(editingPost)
    };

    setIsSubmitting(true);
    setFormError('');

    try {
      await onSavePost(postPayload);
      setSaveSuccessMsg(editingPost ? '✓ Đã cập nhật bài viết thành công!' : '✓ Đã đăng bài viết mới thành công!');

      setTimeout(() => {
        setIsSubmitting(false);
        setSaveSuccessMsg('');
        onClose();
      }, 700);
    } catch (err) {
      setIsSubmitting(false);
      setFormError('Có lỗi khi lưu bài viết: ' + (err.message || 'Vui lòng thử lại'));
    }
  };

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div 
        className="admin-modal-box" 
        style={{ maxWidth: modalTab === 'preview' ? '860px' : '740px', transition: 'max-width 0.25s ease' }} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-modal-header">
          <h3 className="flex-center-gap">
            <ShieldCheck size={20} />
            {editingPost ? 'Chỉnh Sửa Bài Viết' : 'Quản Trị Bài Viết'} - Đoàn Xã Xuân Thới Sơn
          </h3>
          <button className="btn-close-modal" onClick={onClose} title="Đóng cửa sổ">
            <X size={20} />
          </button>
        </div>

        <div className="admin-modal-body">
          {!isAdminLoggedIn ? (
            /* Form Đăng nhập Admin */
            <form onSubmit={handleLoginSubmit} className="admin-login-form">
              {loginError && <div className="error-alert">{loginError}</div>}
              
              <div className="admin-account-info-box">
                <h4>
                  <ShieldCheck size={16} />
                  Tài khoản Cán bộ Đoàn Xã:
                </h4>
                <p>Tên đăng nhập: <code>doanxaxuanthoison</code></p>
                <p>Mật khẩu: <code>doanxaxuanthoison2026</code> hoặc <code>admin123</code></p>
              </div>

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
            /* Container Tạo / Chỉnh sửa bài viết */
            <div className="admin-post-container">
              <div className="admin-user-bar">
                <span>Cán bộ đang đăng nhập: <strong>Đoàn TNCS Hồ Chí Minh Xã Xuân Thới Sơn</strong></span>
                <button type="button" className="btn-logout flex-center-gap" onClick={onLogout}>
                  <LogOut size={14} />
                  Thoát Quản Trị
                </button>
              </div>

              {/* Thanh Tab điều hướng: Soạn thảo vs Xem trước Live */}
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
                  {editingPost ? 'Chỉnh Sửa Nội Dung' : 'Soạn Thảo Bài Viết'}
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
              {saveSuccessMsg && (
                <div className="meta-success-alert flex-center-gap" style={{ marginBottom: '16px', padding: '10px 14px', fontSize: '14px' }}>
                  <CheckCircle2 size={18} color="#16A34A" />
                  <strong>{saveSuccessMsg}</strong>
                </div>
              )}

              {/* TAB 1: FORM SOẠN THẢO */}
              {modalTab === 'edit' && (
                <form onSubmit={handleCreateOrUpdatePost} className="admin-post-form">
                  {/* Link Facebook & Tự động bóc tách dữ liệu */}
                  <div className="form-group">
                    <label className="flex-center-gap" style={{ justifyContent: 'space-between' }}>
                      <span className="flex-center-gap">
                        <Link2 size={15} />
                        Đường dẫn bài viết Facebook (Tùy chọn - Dán Link bài viết vào đây):
                      </span>
                      {fbLink.trim() && !isFetchingMeta && (
                        <button 
                          type="button" 
                          className="btn-retry-meta flex-center-gap"
                          onClick={() => runMetaExtract(fbLink)}
                          title="Bóc tách lại thông tin"
                          style={{ background: 'none', border: 'none', color: '#008DD5', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}
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
                        placeholder="Dán link bài Facebook: https://www.facebook.com/share/p/..." 
                      />
                      {isFetchingMeta && (
                        <span className="loader-badge flex-center-gap">
                          <Loader2 size={14} className="spin-icon" />
                          Đang đọc thông tin...
                        </span>
                      )}
                    </div>
                    <small className="form-help">Hệ thống sẽ tự động lấy Tiêu đề, Tóm tắt và Ảnh đại diện từ Facebook để cán bộ không phải gõ lại!</small>
                    
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

                  {/* THUMBNAIL / HÌNH ẢNH BÌA BÀI VIẾT (ĐÃ FIX LỖI XEM TRƯỚC VÀ CHUẨN HÓA 16:9) */}
                  <div className="form-group">
                    <label className="flex-center-gap">
                      <ImageIcon size={15} />
                      Hình Ảnh Bìa Bài Viết (Thumbnail):
                    </label>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        type="text" 
                        value={imageUrl} 
                        onChange={(e) => {
                          setImageUrl(e.target.value);
                          setImgLoadError(false);
                        }} 
                        placeholder="Dán link ảnh https://... hoặc bấm nút Tải từ máy bên cạnh" 
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
                        disabled={isUploading}
                        style={{ 
                          padding: '0 14px', 
                          backgroundColor: '#008DD5', 
                          color: '#FFFFFF', 
                          border: 'none', 
                          borderRadius: '6px', 
                          fontSize: '13px', 
                          fontWeight: 600,
                          cursor: 'pointer', 
                          whiteSpace: 'nowrap' 
                        }}
                      >
                        {isUploading ? <Loader2 size={14} className="spin-icon" /> : <Upload size={14} />}
                        {isUploading ? 'Đang nén ảnh...' : 'Tải từ máy'}
                      </button>
                    </div>

                    {/* Gợi ý chọn ảnh mẫu nhanh theo danh mục */}
                    <div style={{ marginTop: '10px' }}>
                      <span style={{ fontSize: '12px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                        <Sparkles size={13} color="#008DD5" />
                        Hoặc chọn nhanh ảnh mẫu tiêu chuẩn của Đoàn Xã:
                      </span>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {PRESET_IMAGES.map((preset, idx) => {
                          const isSelected = imageUrl === preset.url;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setImageUrl(preset.url);
                                setImgLoadError(false);
                              }}
                              style={{
                                fontSize: '12px',
                                padding: '5px 10px',
                                borderRadius: '16px',
                                border: isSelected ? '1px solid #008DD5' : '1px solid #D1D5DB',
                                backgroundColor: isSelected ? '#EFF6FF' : '#F9FAFB',
                                color: isSelected ? '#008DD5' : '#374151',
                                fontWeight: isSelected ? 700 : 500,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              {isSelected && <Check size={12} color="#008DD5" />}
                              {preset.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* KHUNG XEM TRƯỚC THUMBNAIL CHUYÊN NGHIỆP TỶ LỆ 16:9 */}
                    <div className="admin-thumbnail-preview-card" style={{ marginTop: '14px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <ImageIcon size={16} color="#008DD5" />
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B' }}>
                            Xem trước Thumbnail Ảnh Bìa (Tỷ lệ 16:9 chuẩn Thẻ Tin Tức)
                          </span>
                        </div>
                        {imageUrl && (
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {imageUrl.startsWith('http') && (
                              <a 
                                href={imageUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{ fontSize: '11px', color: '#008DD5', display: 'flex', alignItems: 'center', gap: '3px', textDecoration: 'none' }}
                              >
                                Mở ảnh gốc <ExternalLink size={11} />
                              </a>
                            )}
                            <button 
                              type="button" 
                              onClick={() => { setImageUrl(''); setImgLoadError(false); }}
                              style={{ fontSize: '11px', color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                            >
                              <Trash2 size={12} /> Xóa ảnh
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Khung chứa ảnh 16:9 sắc nét, responsive */}
                      <div 
                        style={{ 
                          width: '100%', 
                          aspectRatio: '16 / 9', 
                          maxHeight: '260px', 
                          borderRadius: '8px', 
                          overflow: 'hidden', 
                          position: 'relative', 
                          backgroundColor: '#0F172A', 
                          border: '1px solid #CBD5E1',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {imageUrl ? (
                          <>
                            <img 
                              src={imageUrl} 
                              alt="Thumbnail Xem trước" 
                              referrerPolicy="no-referrer"
                              onLoad={() => setImgLoadError(false)}
                              onError={() => setImgLoadError(true)}
                              style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'cover', 
                                display: 'block' 
                              }}
                            />
                            {/* Huy hiệu Danh mục ghim góc ảnh */}
                            <span 
                              style={{ 
                                position: 'absolute', 
                                top: '10px', 
                                left: '10px', 
                                backgroundColor: 'rgba(0, 86, 179, 0.92)', 
                                color: '#FFFFFF', 
                                padding: '4px 10px', 
                                borderRadius: '14px', 
                                fontSize: '11px', 
                                fontWeight: 700,
                                backdropFilter: 'blur(4px)',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                              }}
                            >
                              {category}
                            </span>
                            {/* Ngày đăng ghim góc ảnh */}
                            <span 
                              style={{ 
                                position: 'absolute', 
                                bottom: '10px', 
                                left: '10px', 
                                backgroundColor: 'rgba(15, 23, 42, 0.78)', 
                                color: '#F1F5F9', 
                                padding: '3px 8px', 
                                borderRadius: '6px', 
                                fontSize: '11px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <Calendar size={11} /> {date}
                            </span>
                          </>
                        ) : (
                          <div 
                            onClick={() => fileInputRef.current?.click()}
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              display: 'flex', 
                              flexDirection: 'column', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              color: '#94A3B8', 
                              cursor: 'pointer',
                              backgroundColor: '#F8FAFC'
                            }}
                          >
                            <ImageIcon size={40} color="#94A3B8" />
                            <p style={{ marginTop: '8px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                              Chưa có ảnh bìa bài viết
                            </p>
                            <p style={{ fontSize: '11px', color: '#94A3B8' }}>
                              Bấm "Tải từ máy", dán link ảnh hoặc chọn ảnh mẫu phía trên
                            </p>
                          </div>
                        )}

                        {/* Cảnh báo an toàn nếu link ảnh bị lỗi CORS / Hotlink */}
                        {imgLoadError && imageUrl && (
                          <div 
                            style={{ 
                              position: 'absolute', 
                              bottom: 0, 
                              left: 0, 
                              right: 0, 
                              backgroundColor: 'rgba(254, 242, 242, 0.95)', 
                              borderTop: '1px solid #F87171', 
                              padding: '8px 12px', 
                              color: '#991B1B', 
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between'
                            }}
                          >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <AlertCircle size={14} color="#DC2626" />
                              Link ảnh dán không tải được trực tiếp (Do Facebook bảo mật chặn hotlink).
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setImageUrl(PRESET_IMAGES[0].url);
                                setImgLoadError(false);
                              }}
                              style={{
                                backgroundColor: '#DC2626',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '3px 8px',
                                fontSize: '11px',
                                cursor: 'pointer'
                              }}
                            >
                              Dùng ảnh mẫu
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Hàng: Ngày đăng bài & Danh mục tin tức */}
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
                      <select 
                        value={category} 
                        onChange={(e) => handleCategoryChange(e.target.value)}
                      >
                        <option value="Hoạt động Tình nguyện">Hoạt động Tình nguyện</option>
                        <option value="Công trình Thanh niên">Công trình Thanh niên</option>
                        <option value="Chuyển đổi số">Chuyển đổi số</option>
                        <option value="Giáo dục Truyền thống">Giáo dục Truyền thống</option>
                        <option value="Tuyên dương Khen thưởng">Tuyên dương Khen thưởng</option>
                      </select>
                    </div>
                  </div>

                  {/* Tiêu đề bài viết */}
                  <div className="form-group">
                    <label>Tiêu đề bài viết (*):</label>
                    <input 
                      type="text" 
                      value={title} 
                      onChange={(e) => setTitle(e.target.value)} 
                      placeholder="Nhập tiêu đề (Ví dụ: 🌟 SẴN SÀNG CHO HÀNH TRÌNH “THEO BƯỚC CHÂN NHỮNG NGƯỜI ANH HÙNG”...)" 
                      required 
                    />
                  </div>

                  {/* Tóm tắt ngắn */}
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

                  {/* Nội dung chi tiết */}
                  <div className="form-group">
                    <label>Nội dung chi tiết bài viết (Tùy chọn):</label>
                    <textarea 
                      rows="4" 
                      value={content} 
                      onChange={(e) => setContent(e.target.value)} 
                      placeholder="Nhập nội dung bài viết đầy đủ (các đoạn văn sẽ tự động ngắt dòng đẹp mắt)..." 
                    />
                  </div>

                  {/* Nút hành động */}
                  <div className="form-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button type="button" className="btn-cancel" onClick={onClose} disabled={isSubmitting}>
                      Hủy Bỏ
                    </button>
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
                      <button 
                        type="submit" 
                        className="btn-submit-primary flex-center-gap" 
                        disabled={isSubmitting}
                        style={{ minWidth: '180px', justifyContent: 'center' }}
                      >
                        {isSubmitting ? <Loader2 size={16} className="spin-icon" /> : <Send size={16} />}
                        {isSubmitting 
                          ? 'Đang lưu bài viết...' 
                          : (editingPost ? 'Cập Nhật Bài Viết' : 'Đăng Bài Viết Lên Website')
                        }
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* TAB 2: CHẾ ĐỘ XEM TRƯỚC LIVE */}
              {modalTab === 'preview' && (
                <div className="admin-live-preview-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #86EFAC', padding: '12px 16px', borderRadius: '8px', color: '#166534', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Eye size={18} color="#16A34A" />
                    <span><strong>Chế độ Xem Trước Live:</strong> Dưới đây là hình ảnh thực tế bài đăng sẽ xuất hiện trên Website của Đoàn Xã. Hãy nhìn lại tổng thể trước khi phát hành!</span>
                  </div>

                  {/* Preview Section 1: Thẻ Tin tức (News Card) */}
                  <div style={{ border: '1px solid #E5E7EB', borderRadius: '12px', padding: '16px', backgroundColor: '#FFFFFF' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Sparkles size={14} color="#008DD5" />
                      1. Hiển thị dạng Thẻ Bài Viết (News Card):
                    </h4>

                    <article className="news-card-item" style={{ maxWidth: '480px', margin: '0 auto', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                      <div className="card-img-wrapper" style={{ aspectRatio: '16 / 9', height: 'auto', overflow: 'hidden' }}>
                        <img 
                          src={imageUrl || PRESET_IMAGES[0].url} 
                          alt={title || 'Tiêu đề bài viết'} 
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = PRESET_IMAGES[0].url;
                          }}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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

                  {/* Preview Section 2: Giao diện xem chi tiết bài viết (Popup View) */}
                  <div style={{ border: '1px solid #E5E7EB', borderRadius: '12px', padding: '16px', backgroundColor: '#FFFFFF' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FileText size={14} color="#008DD5" />
                      2. Hiển thị khi người dân và đoàn viên bấm vào đọc chi tiết:
                    </h4>

                    <div className="article-modal-card" style={{ maxWidth: '100%', margin: '0 auto', boxShadow: 'none', border: '1px solid #E5E7EB' }}>
                      <div className="article-modal-hero" style={{ height: '240px' }}>
                        <img 
                          src={imageUrl || PRESET_IMAGES[0].url} 
                          alt={title} 
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = PRESET_IMAGES[0].url;
                          }}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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

                  {/* Nút hành động trong Preview */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                    <button 
                      type="button" 
                      className="btn-cancel flex-center-gap"
                      onClick={() => setModalTab('edit')}
                      style={{ padding: '10px 18px', fontWeight: 600 }}
                      disabled={isSubmitting}
                    >
                      <Edit3 size={16} />
                      Chỉnh Sửa Thêm
                    </button>
                    <button 
                      type="button" 
                      className="btn-submit-primary flex-center-gap"
                      onClick={() => handleCreateOrUpdatePost()}
                      disabled={isSubmitting}
                      style={{ padding: '10px 24px', fontSize: '15px' }}
                    >
                      {isSubmitting ? <Loader2 size={16} className="spin-icon" /> : <Send size={16} />}
                      {isSubmitting 
                        ? 'Đang lưu bài viết...' 
                        : (editingPost ? 'Xác Nhận & Cập Nhật Bài Viết' : 'Xác Nhận & Đăng Bài Lên Website')
                      }
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

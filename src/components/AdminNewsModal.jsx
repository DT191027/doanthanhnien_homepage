import React, { useState } from 'react';
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
  CheckCircle2
} from 'lucide-react';
import { fetchUrlMetaData } from '../lib/metaFetcher';
import { authService } from '../lib/authService';

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

  // Metadata fetching states
  const [isFetchingMeta, setIsFetchingMeta] = useState(false);
  const [metaSuccessMsg, setMetaSuccessMsg] = useState('');

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

  // Auto extract metadata from Facebook link
  const handleFbLinkChange = async (e) => {
    const val = e.target.value;
    setFbLink(val);
    setMetaSuccessMsg('');

    if (val && val.trim().startsWith('http')) {
      setIsFetchingMeta(true);
      const meta = await fetchUrlMetaData(val);
      setIsFetchingMeta(false);

      if (meta.success) {
        if (meta.imageUrl && !imageUrl) setImageUrl(meta.imageUrl);
        if (meta.title && !title) setTitle(meta.title);
        if (meta.abstract && !abstract) setAbstract(meta.abstract);
        if (meta.date && date === new Date().toISOString().split('T')[0]) setDate(meta.date);
        setMetaSuccessMsg('Đã tự động bóc tách Thumbnail & MetaData bài đăng từ Facebook!');
      }
    }
  };

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!title.trim() || !abstract.trim()) {
      setFormError('Vui lòng nhập đầy đủ Tiêu đề và Tóm tắt bài viết!');
      return;
    }

    const newPost = {
      id: 'news-' + Date.now(),
      title: title.trim(),
      abstract: abstract.trim(),
      date: date || new Date().toISOString().split('T')[0],
      category: category,
      author: 'Đoàn Xã Xuân Thới Sơn',
      fbLink: fbLink.trim() || 'https://www.facebook.com/DTNxaTTN?locale=vi_VN',
      imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
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
    setMetaSuccessMsg('');
    onClose();
  };

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
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
            /* Create Post Form */
            <form onSubmit={handleCreatePost} className="admin-post-form">
              <div className="admin-user-bar">
                <span>Đã đăng nhập: <strong>Đoàn TNCS Hồ Chí Minh Xã Xuân Thới Sơn</strong></span>
                <button type="button" className="btn-logout flex-center-gap" onClick={onLogout}>
                  <LogOut size={14} />
                  Thoát Quản Trị
                </button>
              </div>

              {formError && <div className="error-alert">{formError}</div>}

              <div className="form-group">
                <label className="flex-center-gap">
                  <Link2 size={15} />
                  Đường dẫn bài viết Facebook (Paste Link Facebook vào đây):
                </label>
                <div className="input-with-loader">
                  <input 
                    type="url" 
                    value={fbLink} 
                    onChange={handleFbLinkChange} 
                    placeholder="Dán link bài viết Facebook: https://www.facebook.com/DTNxaTTN/posts/..." 
                  />
                  {isFetchingMeta && (
                    <span className="loader-badge flex-center-gap">
                      <Loader2 size={14} className="spin-icon" />
                      Đang lấy MetaData...
                    </span>
                  )}
                </div>
                <small className="form-help">Hệ thống sẽ tự động đọc OpenGraph trích xuất Thumbnail ảnh, Ngày đăng và Tiêu đề từ Facebook!</small>
                {metaSuccessMsg && (
                  <div className="meta-success-alert flex-center-gap">
                    <CheckCircle2 size={15} />
                    {metaSuccessMsg}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="flex-center-gap">
                  <ImageIcon size={15} />
                  URL Ảnh Hiển Thị (Auto-Thumbnail từ Facebook):
                </label>
                <input 
                  type="url" 
                  value={imageUrl} 
                  onChange={(e) => setImageUrl(e.target.value)} 
                  placeholder="https://scontent... (Tự động lấy từ Facebook bài viết)" 
                />
                {imageUrl && (
                  <div className="image-preview-thumbnail">
                    <img src={imageUrl} alt="Thumbnail Xem trước" />
                    <span>Xem trước Thumbnail ảnh Facebook</span>
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
                  placeholder="Tiêu đề bài viết..." 
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

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={onClose}>Hủy Bỏ</button>
                <button type="submit" className="btn-submit-primary">Đăng Bài Viết Lên Website</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

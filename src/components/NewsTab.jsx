import React, { useState, useEffect } from 'react';
import { ARCHIVED_NEWS_BOXES } from '../data/newsData';
import { newsService } from '../lib/newsService';
import { 
  Search, 
  Calendar, 
  FileText, 
  ArrowRight, 
  ExternalLink, 
  PlusCircle, 
  Trash2, 
  FolderArchive,
  X,
  Newspaper
} from 'lucide-react';

const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80';
const handleImgError = (e) => {
  e.target.onerror = null;
  e.target.src = DEFAULT_FALLBACK_IMAGE;
};

export default function NewsTab({ onOpenAdminModal, isAdminLoggedIn }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeArticleModal, setActiveArticleModal] = useState(null);

  // Sync news posts with Supabase and local cache
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await newsService.getPosts();
      setPosts(data);
      setLoading(false);
    }
    loadData();

    // Listen for custom post update events
    const handleNewsUpdate = async () => {
      const data = await newsService.getPosts();
      setPosts(data);
    };
    window.addEventListener('xts_news_updated', handleNewsUpdate);
    return () => window.removeEventListener('xts_news_updated', handleNewsUpdate);
  }, []);

  const handleDeletePost = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
      const updated = await newsService.deletePost(id);
      setPosts(updated);
    }
  };

  const categories = ['Tất cả', 'Hoạt động Tình nguyện', 'Giáo dục Truyền thống', 'Chuyển đổi số', 'Tuyên dương Khen thưởng', 'Công trình Thanh niên'];

  const filteredPosts = posts.filter(post => {
    const matchCat = selectedCategory === 'Tất cả' || post.category === selectedCategory;
    const matchSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        post.abstract.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  const featuredPost = filteredPosts.find(p => p.isFeatured) || filteredPosts[0];
  const regularPosts = filteredPosts.filter(p => p !== featuredPost);

  return (
    <div className="tab-page-container news-page">
      {/* Header Bar of News Section */}
      <div className="news-header-bar">
        <div className="news-title-group">
          <h1 className="page-main-title">Tin Tức & Sự Kiện Tuổi Trẻ Xuân Thới Sơn</h1>
          <p className="page-sub-title">Cập nhật chính xác các hoạt động, phong trào thi đua và thông tin chỉ đạo mới nhất từ Facebook Đoàn Xã</p>
        </div>

        <div className="news-admin-action">
          <button className="btn-admin-post" onClick={onOpenAdminModal}>
            <PlusCircle size={18} />
            {isAdminLoggedIn ? 'Đăng Bài Viết Mới (Admin)' : 'Đăng Nhập Quản Trị Bài Viết'}
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="news-filter-toolbar">
        <div className="category-pills">
          {categories.map(cat => (
            <button 
              key={cat} 
              className={`pill-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="news-search-box">
          <Search size={16} />
          <input 
            type="text" 
            placeholder="Tìm kiếm tin tức, sự kiện..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="btn-clear-search" onClick={() => setSearchTerm('')}>
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Empty State when no posts exist */}
      {filteredPosts.length === 0 && !loading && (
        <div className="empty-news-card">
          <div className="empty-icon-wrapper">
            <Newspaper size={44} />
          </div>
          <h3>Chưa có bài viết tin tức nào</h3>
          <p>
            Cán bộ Đoàn xã vui lòng bấm nút bên dưới để đăng nhập tài khoản Admin và tải bài viết trực tiếp từ Facebook!
          </p>
          <button className="btn-admin-post" onClick={onOpenAdminModal}>
            <PlusCircle size={18} />
            {isAdminLoggedIn ? 'Đăng Bài Viết Mới (Admin)' : 'Đăng Nhập Quản Trị Bài Viết'}
          </button>
        </div>
      )}

      {/* Featured Big News Banner */}
      {featuredPost && (
        <section className="featured-news-card" onClick={() => setActiveArticleModal(featuredPost)}>
          <div className="featured-img-container">
            <img src={featuredPost.imageUrl || DEFAULT_FALLBACK_IMAGE} alt={featuredPost.title} referrerPolicy="no-referrer" onError={handleImgError} />
            <span className="featured-badge">{featuredPost.category}</span>
          </div>
          <div className="featured-content">
            <div className="post-meta">
              <span className="post-date">
                <Calendar size={14} />
                {featuredPost.date}
              </span>
              <span className="post-author">• {featuredPost.author}</span>
            </div>
            <h2 className="featured-title">{featuredPost.title}</h2>
            <p className="featured-abstract">{featuredPost.abstract}</p>
            
            <div className="featured-actions">
              <span className="btn-read-more">
                Đọc Chi Tiết 
                <ArrowRight size={16} />
              </span>
              {featuredPost.fbLink && (
                <a 
                  href={featuredPost.fbLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn-fb-direct flex-center-gap"
                  onClick={(e) => e.stopPropagation()}
                >
                  Xem trên Facebook
                  <ExternalLink size={13} />
                </a>
              )}
              {isAdminLoggedIn && (
                <button 
                  className="btn-delete-post flex-center-gap"
                  onClick={(e) => handleDeletePost(featuredPost.id, e)}
                >
                  <Trash2 size={13} />
                  Xóa Bài
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Grid of Regular Posts */}
      {regularPosts.length > 0 && (
        <section className="regular-news-grid">
          {regularPosts.map(post => (
            <article key={post.id} className="news-card-item" onClick={() => setActiveArticleModal(post)}>
              <div className="card-img-wrapper">
                <img src={post.imageUrl || DEFAULT_FALLBACK_IMAGE} alt={post.title} referrerPolicy="no-referrer" onError={handleImgError} />
                <span className="card-cat-tag">{post.category}</span>
              </div>
              <div className="card-body">
                <div className="post-meta">
                  <span className="post-date">{post.date}</span>
                  <span className="post-author">{post.author}</span>
                </div>
                <h3 className="card-title">{post.title}</h3>
                <p className="card-abstract">{post.abstract}</p>
                
                <div className="card-footer-bar">
                  <span className="btn-link-text flex-center-gap">
                    Xem tiếp <ArrowRight size={14} />
                  </span>
                  {isAdminLoggedIn && (
                    <button 
                      className="btn-delete-post-sm"
                      onClick={(e) => handleDeletePost(post.id, e)}
                    >
                      Xóa
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      {/* ARCHIVED BOXES LAYOUT (Chỉ hiển thị khi có dữ liệu chính thức) */}
      <section className="archived-boxes-section">
        <h2 className="archive-section-heading">
          <FolderArchive size={24} />
          Lưu Trữ & Chuỗi Hoạt Động Trước Đó
        </h2>
        <p className="archive-section-sub">Tổng hợp các hoạt động ngoại khóa, sự kiện nổi bật và công trình thanh niên theo mốc thời gian</p>

        {ARCHIVED_NEWS_BOXES.length === 0 ? (
          <div className="empty-archive-box">
            <p>Danh mục lưu trữ hoạt động sẽ hiển thị khi Đoàn xã thêm các mốc chuỗi sự kiện và công trình thanh niên chính thức.</p>
          </div>
        ) : (
          <div className="archived-boxes-grid">
            {ARCHIVED_NEWS_BOXES.map(box => (
              <div key={box.id} className="archive-box-card">
                <div className="box-card-header" style={{ borderColor: box.color }}>
                  <h3 className="box-card-title" style={{ color: box.color }}>{box.title}</h3>
                </div>

                <div className="box-timeline-list">
                  {box.items.map(item => (
                    <a 
                      key={item.id} 
                      href={item.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="timeline-item-row"
                    >
                      <div className="timeline-left">
                        <div className="doc-icon-badge" style={{ backgroundColor: `${box.color}15`, color: box.color }}>
                          <FileText size={18} />
                        </div>
                        <div className="vertical-timeline-line"></div>
                      </div>

                      <div className="timeline-center">
                        <h4 className="timeline-item-period">{item.period}</h4>
                        <p className="timeline-item-abstract">{item.abstract}</p>
                      </div>

                      <div className="timeline-right">
                        <div className="arrow-btn-circle">
                          <ArrowRight size={16} />
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Article Detail View Modal */}
      {activeArticleModal && (
        <div className="article-modal-backdrop" onClick={() => setActiveArticleModal(null)}>
          <div className="article-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="btn-close-modal" onClick={() => setActiveArticleModal(null)}>&times;</button>
            <div className="article-modal-hero">
              <img src={activeArticleModal.imageUrl || DEFAULT_FALLBACK_IMAGE} alt={activeArticleModal.title} referrerPolicy="no-referrer" onError={handleImgError} />
              <span className="modal-cat-tag">{activeArticleModal.category}</span>
            </div>
            <div className="article-modal-body">
              <div className="post-meta">
                <span>{activeArticleModal.date}</span>
                <span>• {activeArticleModal.author}</span>
              </div>
              <h2>{activeArticleModal.title}</h2>
              <div className="article-full-text" style={{ whiteSpace: 'pre-line', wordBreak: 'break-word' }}>
                {(activeArticleModal.content || activeArticleModal.abstract).split(/\n\s*\n/).map((paragraph, idx) => (
                  <p key={idx} style={{ whiteSpace: 'pre-line', marginBottom: '12px' }}>{paragraph}</p>
                ))}
              </div>

              <div className="modal-footer-actions">
                <a 
                  href={activeArticleModal.fbLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn-fb-direct-large flex-center-gap"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  Xem Bài Viết Gốc Trên Facebook
                  <ExternalLink size={16} />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

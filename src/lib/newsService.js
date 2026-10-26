import { supabase } from './supabaseClient';
import { INITIAL_NEWS } from '../data/newsData';

const STORAGE_KEY = 'xts_news_posts_v2';

// Helper: Lấy bài viết từ localStorage
function getLocalPosts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_NEWS));
      return [...INITIAL_NEWS];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_NEWS));
    return [...INITIAL_NEWS];
  } catch (e) {
    console.warn('Lỗi đọc localStorage bài viết:', e);
    return [...INITIAL_NEWS];
  }
}

// Helper: Lưu bài viết vào localStorage
function saveLocalPosts(posts) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  } catch (e) {
    console.error('Lỗi lưu localStorage bài viết:', e);
  }
}

export const newsService = {
  // Lấy danh sách bài viết (ưu tiên LocalStorage tức thì, đồng bộ Supabase nếu kết nối được)
  async getPosts() {
    const localPosts = getLocalPosts();

    // Thử đồng bộ ngầm với Supabase nếu có kết nối
    try {
      const { data, error } = await Promise.race([
        supabase
          .from('news_posts')
          .select('*')
          .order('date', { ascending: false }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2500))
      ]);

      if (!error && Array.isArray(data) && data.length > 0) {
        const remotePosts = data.map(item => ({
          id: item.id,
          title: item.title,
          abstract: item.abstract,
          date: item.date,
          category: item.category,
          author: item.author || 'Đoàn Xã Xuân Thới Sơn',
          fbLink: item.fb_link || item.fbLink || '',
          imageUrl: item.image_url || item.imageUrl || '',
          views: item.views || 1,
          isFeatured: Boolean(item.is_featured),
          content: item.content || item.abstract
        }));

        // Hợp nhất (Merge) không trùng lặp
        const localIdMap = new Set(remotePosts.map(p => p.id));
        const merged = [
          ...remotePosts,
          ...localPosts.filter(p => !localIdMap.has(p.id))
        ];

        saveLocalPosts(merged);
        return merged;
      }
    } catch (e) {
      // Supabase offline hoặc timeout -> dùng hoàn toàn localPosts an toàn 100%
      console.info('Supabase không phản hồi, tải bài viết từ bộ nhớ cục bộ an toàn.');
    }

    return localPosts;
  },

  // Tạo bài viết mới
  async createPost(post) {
    const localPosts = getLocalPosts();
    const newPost = {
      id: post.id || ('news-' + Date.now()),
      title: post.title.trim(),
      abstract: post.abstract.trim(),
      date: post.date || new Date().toISOString().split('T')[0],
      category: post.category || 'Hoạt động Tình nguyện',
      author: post.author || 'Đoàn Xã Xuân Thới Sơn',
      fbLink: post.fbLink?.trim() || 'https://www.facebook.com/DTNxaTTN?locale=vi_VN',
      imageUrl: post.imageUrl?.trim() || 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1200&q=80',
      views: post.views || 1,
      isFeatured: Boolean(post.isFeatured),
      content: post.content?.trim() || post.abstract.trim()
    };

    // 1. Lưu ngay lập tức vào LocalStorage để đảm bảo hiển thị tức thì 0ms
    const updated = [newPost, ...localPosts.filter(p => p.id !== newPost.id)];
    saveLocalPosts(updated);

    // 2. Thử đẩy lên Supabase ngầm (nếu cấu hình)
    try {
      supabase.from('news_posts').insert([
        {
          id: newPost.id,
          title: newPost.title,
          abstract: newPost.abstract,
          date: newPost.date,
          category: newPost.category,
          author: newPost.author,
          fb_link: newPost.fbLink,
          image_url: newPost.imageUrl,
          views: newPost.views,
          is_featured: newPost.isFeatured,
          content: newPost.content
        }
      ]).then(() => {});
    } catch (err) {
      console.warn('Supabase cloud sync notice (create):', err);
    }

    // 3. Phát sự kiện cập nhật
    window.dispatchEvent(new CustomEvent('xts_news_updated', { detail: { action: 'create', post: newPost } }));

    return { success: true, post: newPost, posts: updated };
  },

  // Cập nhật / Chỉnh sửa bài viết
  async updatePost(updatedPost) {
    const localPosts = getLocalPosts();
    const postIndex = localPosts.findIndex(p => p.id === updatedPost.id);

    const mergedPost = {
      ...(postIndex !== -1 ? localPosts[postIndex] : {}),
      ...updatedPost
    };

    let updatedList;
    if (postIndex !== -1) {
      updatedList = [...localPosts];
      updatedList[postIndex] = mergedPost;
    } else {
      updatedList = [mergedPost, ...localPosts];
    }

    saveLocalPosts(updatedList);

    // Thử cập nhật lên Supabase
    try {
      supabase.from('news_posts').update({
        title: mergedPost.title,
        abstract: mergedPost.abstract,
        date: mergedPost.date,
        category: mergedPost.category,
        author: mergedPost.author,
        fb_link: mergedPost.fbLink,
        image_url: mergedPost.imageUrl,
        views: mergedPost.views,
        is_featured: mergedPost.isFeatured,
        content: mergedPost.content
      }).eq('id', mergedPost.id).then(() => {});
    } catch (err) {
      console.warn('Supabase cloud sync notice (update):', err);
    }

    window.dispatchEvent(new CustomEvent('xts_news_updated', { detail: { action: 'update', post: mergedPost } }));

    return { success: true, post: mergedPost, posts: updatedList };
  },

  // Xóa bài viết
  async deletePost(id) {
    const localPosts = getLocalPosts();
    const updated = localPosts.filter(p => p.id !== id);
    saveLocalPosts(updated);

    try {
      supabase.from('news_posts').delete().eq('id', id).then(() => {});
    } catch (err) {
      console.warn('Supabase cloud sync notice (delete):', err);
    }

    window.dispatchEvent(new CustomEvent('xts_news_updated', { detail: { action: 'delete', id } }));

    return updated;
  },

  // Khôi phục bài viết mẫu
  resetToDefaults() {
    saveLocalPosts(INITIAL_NEWS);
    window.dispatchEvent(new CustomEvent('xts_news_updated', { detail: { action: 'reset' } }));
    return [...INITIAL_NEWS];
  }
};

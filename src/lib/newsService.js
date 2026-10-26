import { supabase } from './supabaseClient';

const STORAGE_KEY = 'xts_news_posts_v3';
const MOCK_IDS = new Set([
  'news-hanh-trinh-anh-hung',
  'news-chu-nhat-xanh-155',
  'news-chuyen-doi-so-30-ap',
  'news-tuyen-duong-thanh-nien-2026',
  'news-ve-nguon-nga-ba-giong'
]);

// Helper: Lấy bài viết từ localStorage (loại bỏ hoàn toàn các id bài viết mẫu)
function getLocalPosts() {
  try {
    // Dọn dẹp cache cũ nếu có bài ảo
    localStorage.removeItem('xts_news_posts_v2');
    localStorage.removeItem('xts_news_posts_storage');

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Lọc bỏ sạch mọi bài mẫu ảo
      const cleanPosts = parsed.filter(p => !MOCK_IDS.has(p.id));
      if (cleanPosts.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanPosts));
      }
      return cleanPosts;
    }
    return [];
  } catch (e) {
    console.warn('Lỗi đọc localStorage bài viết:', e);
    return [];
  }
}

// Helper: Lưu bài viết vào localStorage
function saveLocalPosts(posts) {
  try {
    const cleanPosts = posts.filter(p => !MOCK_IDS.has(p.id));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanPosts));
  } catch (e) {
    console.error('Lỗi lưu localStorage bài viết:', e);
  }
}

export const newsService = {
  // Lấy danh sách bài viết thực tế
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
        const remotePosts = data
          .filter(item => !MOCK_IDS.has(item.id))
          .map(item => ({
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

        const localIdMap = new Set(remotePosts.map(p => p.id));
        const merged = [
          ...remotePosts,
          ...localPosts.filter(p => !localIdMap.has(p.id))
        ];

        saveLocalPosts(merged);
        return merged;
      }
    } catch (e) {
      // Supabase offline -> dùng localPosts an toàn
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
      imageUrl: post.imageUrl?.trim() || '',
      views: post.views || 1,
      isFeatured: Boolean(post.isFeatured),
      content: post.content?.trim() || post.abstract.trim()
    };

    const updated = [newPost, ...localPosts.filter(p => p.id !== newPost.id)];
    saveLocalPosts(updated);

    // Đồng bộ Supabase nếu có thể
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

    window.dispatchEvent(new CustomEvent('xts_news_updated', { detail: { action: 'create', post: newPost } }));

    return { success: true, post: newPost, posts: updated };
  },

  // Cập nhật bài viết
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

  // Xóa toàn bộ bài viết
  clearAllPosts() {
    saveLocalPosts([]);
    window.dispatchEvent(new CustomEvent('xts_news_updated', { detail: { action: 'clear' } }));
    return [];
  }
};

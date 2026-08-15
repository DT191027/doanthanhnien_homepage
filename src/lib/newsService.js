import { supabase } from './supabaseClient';

export const newsService = {
  // Live fetch directly from Supabase
  async getPosts() {
    try {
      const { data, error } = await supabase
        .from('news_posts')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Lỗi lấy bài viết từ Supabase:', error);
        return [];
      }

      if (data && data.length > 0) {
        return data.map(item => ({
          id: item.id,
          title: item.title,
          abstract: item.abstract,
          date: item.date,
          category: item.category,
          author: item.author || 'Đoàn Xã Xuân Thới Sơn',
          fbLink: item.fb_link || item.fbLink,
          imageUrl: item.image_url || item.imageUrl,
          views: item.views || 1,
          isFeatured: item.is_featured || false,
          content: item.content || item.abstract
        }));
      }

      return [];
    } catch (e) {
      console.error('Lỗi kết nối Supabase:', e);
      return [];
    }
  },

  // Create post directly in Supabase
  async createPost(post) {
    try {
      const { data, error } = await supabase.from('news_posts').insert([
        {
          id: post.id,
          title: post.title,
          abstract: post.abstract,
          date: post.date,
          category: post.category,
          author: post.author,
          fb_link: post.fbLink,
          image_url: post.imageUrl,
          views: post.views || 1,
          is_featured: post.isFeatured || false,
          content: post.content
        }
      ]);

      if (error) {
        console.error('Lỗi lưu bài viết lên Supabase:', error);
      }
    } catch (err) {
      console.error('Lỗi kết nối khi tạo bài viết:', err);
    }

    return await this.getPosts();
  },

  // Delete post directly from Supabase
  async deletePost(id) {
    try {
      const { error } = await supabase.from('news_posts').delete().eq('id', id);
      if (error) {
        console.error('Lỗi xóa bài viết trên Supabase:', error);
      }
    } catch (err) {
      console.error('Lỗi kết nối khi xóa bài viết:', err);
    }

    return await this.getPosts();
  }
};

import { supabase } from './supabaseClient';
import { COMMENDATIONS_DATA } from '../data/commendationsData';

export const commendationService = {
  // Live fetch commendations from Supabase
  async getCommendations() {
    try {
      const { data, error } = await supabase
        .from('commendations')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        // Group by category
        const grouped = {
          "danh-hieu": [],
          "cap-tren": [],
          "thanh-nien-tieu-bieu": []
        };

        data.forEach(item => {
          const cat = item.category || 'danh-hieu';
          if (!grouped[cat]) grouped[cat] = [];
          grouped[cat].push({
            id: item.id,
            title: item.title,
            issuingBody: item.issuing_body || item.issuingBody,
            year: item.year,
            certificateNo: item.certificate_no || item.certificateNo,
            summary: item.summary,
            badgeColor: item.badge_color || item.badgeColor || '#0056B3',
            name: item.title,
            role: item.issuing_body,
            achievement: item.summary
          });
        });

        return grouped;
      }
    } catch (e) {
      console.warn('Supabase fetch commendations notice:', e);
    }

    return COMMENDATIONS_DATA;
  },

  // Insert a new commendation
  async createCommendation(item) {
    try {
      await supabase.from('commendations').insert([
        {
          id: item.id || 'cmd-' + Date.now(),
          title: item.title,
          issuing_body: item.issuingBody || item.role || 'Ủy ban Nhân dân / Đoàn Xã',
          year: item.year || '2026',
          certificate_no: item.certificateNo || 'Quyết định khen thưởng',
          summary: item.summary || item.achievement || '',
          category: item.category || 'danh-hieu',
          badge_color: item.badgeColor || '#0056B3'
        }
      ]);
    } catch (err) {
      console.error('Lỗi tạo khen thưởng:', err);
    }

    return await this.getCommendations();
  },

  // Delete a commendation by ID
  async deleteCommendation(id) {
    try {
      await supabase.from('commendations').delete().eq('id', id);
    } catch (err) {
      console.error('Lỗi xóa khen thưởng:', err);
    }

    return await this.getCommendations();
  }
};

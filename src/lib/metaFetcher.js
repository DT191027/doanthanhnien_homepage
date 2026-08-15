/**
 * Utility to fetch OpenGraph metadata (Thumbnail, Title, Description) from Facebook links
 * Uses Microlink API to extract og:image, og:title, og:description without requiring server proxy
 */

export async function fetchUrlMetaData(url) {
  if (!url || !url.trim().startsWith('http')) {
    return { success: false, error: 'Đường dẫn không hợp lệ' };
  }

  try {
    const response = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url.trim())}`);
    const result = await response.json();

    if (result.status === 'success' && result.data) {
      const data = result.data;
      const imageUrl = data.image?.url || data.logo?.url || '';
      const title = data.title || '';
      const abstract = data.description || '';
      const date = data.date ? new Date(data.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

      return {
        success: true,
        title: title,
        abstract: abstract,
        imageUrl: imageUrl,
        date: date,
        author: data.publisher || 'Đoàn Xã Xuân Thới Sơn'
      };
    } else {
      return { success: false, error: 'Không tìm thấy dữ liệu xem trước metadata' };
    }
  } catch (err) {
    console.warn('Lỗi trích xuất Facebook metadata:', err);
    return { success: false, error: err.message };
  }
}

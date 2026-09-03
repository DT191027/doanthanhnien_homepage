/**
 * Utility to fetch OpenGraph metadata (Thumbnail, Title, Description) from Facebook & Web links
 * Uses Microlink API with JS Prerender & CORS Fallback to extract actual high-res photos and full Emojis (🇻🇳, 🌟, 💐, 🔥, etc.)
 */

// Helper to check if an image URL is a genuine photo (and NOT a favicon/logo placeholder)
function isValidPhotoUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const cleanUrl = url.toLowerCase().trim();

  // Exclude favicons, .ico files, Facebook resource icons, and generic logos
  if (
    cleanUrl.endsWith('.ico') ||
    cleanUrl.includes('.ico?') ||
    cleanUrl.includes('rsrc.php') ||
    cleanUrl.includes('favicon') ||
    cleanUrl.includes('ay1hv6olegs') ||
    cleanUrl.includes('static.xx.fbcdn.net') ||
    cleanUrl.includes('facebook.com/images/') ||
    cleanUrl.includes('fbcdn.net/rsrc')
  ) {
    return false;
  }

  return cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://');
}

// Decode HTML Entities to preserve full Emojis & Special Characters (🇻🇳 🌟 💐 🔥)
function decodeHtmlEntities(text) {
  if (!text) return '';
  try {
    const cleanHtml = text.replace(/<br\s*[\/]?>/gi, '\n');
    const doc = new DOMParser().parseFromString(cleanHtml, 'text/html');
    return doc.body.textContent || text;
  } catch {
    return text;
  }
}

// Normalize Facebook URLs to standard format
function normalizeFacebookUrl(url) {
  try {
    let clean = url.trim();
    clean = clean.replace(/\/\/(m|mbasic)\.facebook\.com/, '//www.facebook.com');

    const parsed = new URL(clean);
    const trackingParams = ['mibextid', 'rdid', 'share_url', 'ref', 'source', 'sfnsn'];
    trackingParams.forEach((param) => parsed.searchParams.delete(param));

    return parsed.toString();
  } catch {
    return url.trim();
  }
}

export async function fetchUrlMetaData(url) {
  if (!url || !url.trim().startsWith('http')) {
    return { success: false, error: 'Đường dẫn không hợp lệ' };
  }

  const cleanUrl = normalizeFacebookUrl(url);

  // Strategy 1: Microlink API with JS prerender=true (Extracts actual high-res FB photos & full emojis)
  try {
    const res = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(cleanUrl)}&prerender=true`);
    if (res.ok) {
      const json = await res.json();
      if (json.status === 'success' && json.data) {
        const data = json.data;
        const candidateImage = data.image?.url || '';
        const validImage = isValidPhotoUrl(candidateImage) ? candidateImage : '';
        
        let title = decodeHtmlEntities(data.title || '');
        let abstract = decodeHtmlEntities(data.description || '');

        // If title is generic "Facebook" or page name, try using description text
        if ((!title || title === 'Facebook' || title.includes('Tuổi Trẻ Xã')) && abstract) {
          const lines = abstract.split('\n').map(l => l.trim()).filter(Boolean);
          if (lines.length > 0) {
            title = lines[0]; // First line with emojis as title
            if (lines.length > 1) {
              abstract = lines.slice(1).join('\n\n');
            }
          }
        }

        const date = data.date
          ? new Date(data.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0];

        if (title || validImage || abstract) {
          return {
            success: true,
            title: title,
            abstract: abstract,
            imageUrl: validImage,
            date: date,
            author: data.publisher || 'Đoàn Xã Xuân Thới Sơn',
            hasPhoto: Boolean(validImage),
          };
        }
      }
    }
  } catch (e) {
    console.warn('Microlink prerender error, attempting fallback...', e);
  }

  // Strategy 2: Microlink standard API
  try {
    const res = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(cleanUrl)}`);
    if (res.ok) {
      const json = await res.json();
      if (json.status === 'success' && json.data) {
        const data = json.data;
        const candidateImage = data.image?.url || '';
        const validImage = isValidPhotoUrl(candidateImage) ? candidateImage : '';
        const title = decodeHtmlEntities(data.title || '');
        const abstract = decodeHtmlEntities(data.description || '');

        if (title || validImage) {
          return {
            success: true,
            title: title,
            abstract: abstract,
            imageUrl: validImage,
            date: new Date().toISOString().split('T')[0],
            author: 'Đoàn Xã Xuân Thới Sơn',
            hasPhoto: Boolean(validImage),
          };
        }
      }
    }
  } catch (e) {
    console.warn('Microlink standard error...', e);
  }

  // Strategy 3: Dub.co Metatags API
  try {
    const res = await fetch(`https://api.dub.co/metatags?url=${encodeURIComponent(cleanUrl)}`);
    if (res.ok) {
      const data = await res.json();
      const candidateImage = data.image || '';
      const validImage = isValidPhotoUrl(candidateImage) ? candidateImage : '';
      const title = decodeHtmlEntities(data.title || '');
      const abstract = decodeHtmlEntities(data.description || '');

      if (title || validImage) {
        return {
          success: true,
          title: title,
          abstract: abstract,
          imageUrl: validImage,
          date: new Date().toISOString().split('T')[0],
          author: 'Đoàn Xã Xuân Thới Sơn',
          hasPhoto: Boolean(validImage),
        };
      }
    }
  } catch (e) {
    console.warn('Dub.co Metatags API error...', e);
  }

  return {
    success: true,
    title: '',
    abstract: '',
    imageUrl: '',
    date: new Date().toISOString().split('T')[0],
    author: 'Đoàn Xã Xuân Thới Sơn',
    hasPhoto: false,
  };
}

/**
 * Utility to fetch OpenGraph metadata (Thumbnail, Title, Description) from Facebook & Web links
 * Uses multi-tier extraction (Microlink API, CORS OpenGraph Scraper, oEmbed fallback)
 * Filters out invalid/placeholder icons like Facebook favicons (.ico, rsrc.php, logo icons)
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

// Normalize Facebook URLs to standard format
function normalizeFacebookUrl(url) {
  try {
    let clean = url.trim();
    // Convert m.facebook.com / mbasic.facebook.com to www.facebook.com
    clean = clean.replace(/\/\/(m|mbasic)\.facebook\.com/, '//www.facebook.com');

    const parsed = new URL(clean);
    // Keep essential path and query, strip tracking parameters like mibextid, rdid
    const trackingParams = ['mibextid', 'rdid', 'share_url', 'ref', 'source', 'sfnsn'];
    trackingParams.forEach((param) => parsed.searchParams.delete(param));

    return parsed.toString();
  } catch {
    return url.trim();
  }
}

// Extract OpenGraph tags directly from raw HTML string
function parseOgFromHtml(html) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const getMeta = (props) => {
      for (const prop of props) {
        const el =
          doc.querySelector(`meta[property="${prop}"]`) ||
          doc.querySelector(`meta[name="${prop}"]`);
        if (el && el.getAttribute('content')) {
          return el.getAttribute('content').trim();
        }
      }
      return '';
    };

    const title =
      getMeta(['og:title', 'twitter:title']) ||
      doc.querySelector('title')?.textContent?.trim() ||
      '';
    const description = getMeta([
      'og:description',
      'description',
      'twitter:description',
    ]);
    const image = getMeta([
      'og:image',
      'og:image:src',
      'twitter:image',
      'twitter:image:src',
    ]);

    return {
      title,
      description,
      imageUrl: isValidPhotoUrl(image) ? image : '',
    };
  } catch {
    return { title: '', description: '', imageUrl: '' };
  }
}

export async function fetchUrlMetaData(url) {
  if (!url || !url.trim().startsWith('http')) {
    return { success: false, error: 'Đường dẫn không hợp lệ' };
  }

  const cleanUrl = normalizeFacebookUrl(url);

  // Strategy 1: Microlink API
  try {
    const res = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(cleanUrl)}`);
    if (res.ok) {
      const json = await res.json();
      if (json.status === 'success' && json.data) {
        const data = json.data;
        const candidateImage = data.image?.url || '';
        const validImage = isValidPhotoUrl(candidateImage) ? candidateImage : '';
        const title = data.title || '';
        const abstract = data.description || '';
        const date = data.date
          ? new Date(data.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0];

        // If Microlink returned at least title or valid image
        if (title || validImage) {
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
    console.warn('Microlink API error, attempting fallback...', e);
  }

  // Strategy 2: Dub.co Metatags API
  try {
    const res = await fetch(`https://api.dub.co/metatags?url=${encodeURIComponent(cleanUrl)}`);
    if (res.ok) {
      const data = await res.json();
      const candidateImage = data.image || '';
      const validImage = isValidPhotoUrl(candidateImage) ? candidateImage : '';
      const title = data.title || '';
      const abstract = data.description || '';

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
    console.warn('Dub.co Metatags API error, attempting next fallback...', e);
  }

  // Strategy 3: CORS Proxy HTML Scraping
  const proxies = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(cleanUrl)}`,
    `https://corsproxy.io/?${encodeURIComponent(cleanUrl)}`,
  ];

  for (const proxyUrl of proxies) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(proxyUrl, { signal: controller.signal });
      clearTimeout(timeout);

      if (res.ok) {
        const htmlText = await res.text();
        const parsed = parseOgFromHtml(htmlText);

        if (parsed.title || parsed.imageUrl) {
          return {
            success: true,
            title: parsed.title,
            abstract: parsed.description,
            imageUrl: parsed.imageUrl,
            date: new Date().toISOString().split('T')[0],
            author: 'Đoàn Xã Xuân Thới Sơn',
            hasPhoto: Boolean(parsed.imageUrl),
          };
        }
      }
    } catch {
      /* continue to next proxy */
    }
  }

  // If title/metadata extraction failed completely or returned no photo
  return {
    success: true,
    title: '',
    abstract: '',
    imageUrl: '',
    date: new Date().toISOString().split('T')[0],
    author: 'Đoàn Xã Xuân Thới Sơn',
    hasPhoto: false,
    warning: 'Không thể tự động bóc tách thumbnail bài viết Facebook này. Vui lòng chọn hoặc dán URL ảnh.',
  };
}

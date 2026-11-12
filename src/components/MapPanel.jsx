import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { hamlets, allMapLocations, LOCATION_CATEGORIES } from '../data/hamlets';
import { buildGoogleMapsDirectionUrl } from '../data/mapLocationsData';
import { fallbackKMLText } from '../data/xuanThoiSonKMLData';

/* ─── Palette ──────────────────────────────────────────────── */
const PALETTE = ['#008DD5', '#00B4D8', '#22C55E', '#F59E0B', '#E53935'];
const getColor = (id) => PALETTE[(id - 1) % PALETTE.length];

/* ─── SVG Icons chuẩn định dạng Google My Maps của người dùng ─── */
function getMarkerSvgAndStyle(item) {
  // 1. Ban nhân dân ấp / liên ấp -> Biểu tượng Nhà thị chính (Town Hall) tô màu xanh lá (#0F9D58)
  if (item.category === 'bnd_ap') {
    return {
      color: '#0F9D58',
      gradient: 'linear-gradient(135deg, #10B981 0%, #0F9D58 100%)',
      pulseColor: 'rgba(15, 157, 88, 0.55)',
      badgeBg: '#ECFDF5',
      badgeColor: '#065F46',
      badgeBorder: '#A7F3D0',
      tagLabel: '🏛️ BAN NHÂN DÂN ẤP / LIÊN ẤP',
      svg: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L2 7v2h20V7L12 2zm-7 9v7H3v2h18v-2h-2v-7h-2v7h-4v-7h-2v7H9v-7H7v7H5v-7z"/>
      </svg>`,
    };
  }

  // 2. Trường Mầm non -> Biểu tượng Trường học (2 học sinh / ngôi trường) tô màu xanh dương (#0288D1)
  if (item.category === 'mam_non') {
    return {
      color: '#0288D1',
      gradient: 'linear-gradient(135deg, #0EA5E9 0%, #0288D1 100%)',
      pulseColor: 'rgba(2, 136, 209, 0.55)',
      badgeBg: '#E0F2FE',
      badgeColor: '#0369A1',
      badgeBorder: '#BAE6FD',
      tagLabel: '🧒 TRƯỜNG MẦM NON',
      svg: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16.5 12c1.38 0 2.5-1.12 2.5-2.5S17.88 7 16.5 7 14 8.12 14 9.5s1.12 2.5 2.5 2.5zM9 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm7.5 3c-1.83 0-5.5.92-5.5 2.75V19h11v-2.25c0-1.83-3.67-2.75-5.5-2.75zM9 13c-2.33 0-7 1.17-7 3.5V19h7v-2.25c0-.85.33-2.34 2.37-3.47C10.5 13.1 9.66 13 9 13z"/>
      </svg>`,
    };
  }

  // 3. Trường từ Tiểu học đến THPT -> Biểu tượng Trường đại học (Mũ cử nhân) tô màu xanh dương (#0288D1)
  if (item.category === 'truong_hoc') {
    return {
      color: '#0288D1',
      gradient: 'linear-gradient(135deg, #0288D1 0%, #0369A1 100%)',
      pulseColor: 'rgba(2, 136, 209, 0.55)',
      badgeBg: '#EFF6FF',
      badgeColor: '#1D4ED8',
      badgeBorder: '#BFDBFE',
      tagLabel: `🎓 ${item.loai ? item.loai.toUpperCase() : 'TRƯỜNG HỌC'}`,
      svg: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
      </svg>`,
    };
  }

  // 4. Trung tâm học tập cộng đồng & Các địa điểm hỗ trợ
  if (item.category === 'tthtcd') {
    const isMedical = item.ten.toLowerCase().includes('trạm y tế');
    const isLearning = item.ten.toLowerCase().includes('học tập cộng đồng') || item.ten.toLowerCase().includes('dịch vụ công');
    if (isMedical) {
      return {
        color: '#DB4436',
        gradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
        pulseColor: 'rgba(219, 68, 54, 0.5)',
        badgeBg: '#FEF2F2',
        badgeColor: '#B91C1C',
        badgeBorder: '#FECACA',
        tagLabel: '🏥 TRẠM Y TẾ XÃ',
        svg: `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z"/>
        </svg>`,
      };
    }
    if (isLearning) {
      return {
        color: '#7C3AED',
        gradient: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
        pulseColor: 'rgba(124, 58, 237, 0.5)',
        badgeBg: '#F5F3FF',
        badgeColor: '#5B21B6',
        badgeBorder: '#DDD6FE',
        tagLabel: '📚 TRUNG TÂM HỌC TẬP CỘNG ĐỒNG & DỊCH VỤ CÔNG',
        svg: `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
        </svg>`,
      };
    }
    return {
      color: '#E65100',
      gradient: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
      pulseColor: 'rgba(230, 81, 0, 0.5)',
      badgeBg: '#FFF7ED',
      badgeColor: '#9A3412',
      badgeBorder: '#FED7AA',
      tagLabel: `🏢 ${item.loai ? item.loai.toUpperCase() : 'ĐỊA ĐIỂM HỖ TRỢ HÀNH CHÍNH'}`,
      svg: `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>
      </svg>`,
    };
  }

  // 5. Nhà bia liệt sĩ & Địa chỉ đỏ / Di tích lịch sử
  return {
    color: '#DC2626',
    gradient: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)',
    pulseColor: 'rgba(220, 38, 38, 0.55)',
    badgeBg: '#FEF2F2',
    badgeColor: '#991B1B',
    badgeBorder: '#FECACA',
    tagLabel: `🚩 ${item.loai ? item.loai.toUpperCase() : 'DI TÍCH LỊCH SỬ & NHÀ BIA'}`,
    svg: `<span style="font-size: 14px; line-height: 1;">🚩</span>`,
  };
}

/* ─── Match KML feature name → hamlet ─────────────────────── */
function findHamlet(name = '') {
  const norm = (s) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

  const target = norm(name);
  return hamlets.find((h) => norm(h.ten) === target) || null;
}

function makeTooltip(hamlet) {
  const areaPart = hamlet.dienTich ? `${hamlet.dienTich} ha` : '—';
  const perimeterPart = hamlet.chuVi ? ` · ${hamlet.chuVi} km` : '';
  const popPart = hamlet.soHoDan ? ` · ${hamlet.soHoDan.toLocaleString('vi-VN')} hộ` : '';
  const locCount = hamlet.diaDiem ? hamlet.diaDiem.length : 0;
  const mergedFrom = hamlet.tenCu
    ? `<div class="map-tooltip-merged">🔄 Sáp nhập từ: <strong>${hamlet.tenCu}</strong></div>`
    : '';
  return `<div class="map-tooltip">
    <div class="map-tooltip-header">
      <div class="map-tooltip-name">${hamlet.ten}</div>
      <span class="map-tooltip-badge">${locCount} địa điểm</span>
    </div>
    ${mergedFrom}
    <div class="map-tooltip-meta">📐 ${areaPart}${perimeterPart}${popPart}</div>
    <div class="map-tooltip-hint">Nhấn để xem ranh giới & toàn bộ địa điểm thuộc ấp</div>
  </div>`;
}

/* ─── KML parser using browser DOMParser ───────────────────── */
function parseKMLtoGeoJSON(kmlText) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(kmlText, 'text/xml');

  const parseError = doc.querySelector('parsererror');
  if (parseError) throw new Error('XML parse error');

  const features = [];

  doc.querySelectorAll('Placemark').forEach((pm) => {
    const name = pm.querySelector('name')?.textContent?.trim() || '';

    pm.querySelectorAll('Polygon').forEach((poly) => {
      const outerCoords = poly
        .querySelector('outerBoundaryIs LinearRing coordinates')
        ?.textContent?.trim();
      if (!outerCoords) return;

      const ring = outerCoords
        .trim()
        .split(/\s+/)
        .map((c) => {
          const parts = c.split(',').map(Number);
          return [parts[0], parts[1]];
        })
        .filter((c) => !isNaN(c[0]) && !isNaN(c[1]));

      if (ring.length < 3) return;

      features.push({
        type: 'Feature',
        properties: { name },
        geometry: {
          type: 'Polygon',
          coordinates: [ring],
        },
      });
    });
  });

  return { type: 'FeatureCollection', features };
}

async function fetchKMLText() {
  if (fallbackKMLText) {
    return fallbackKMLText;
  }
  return null;
}

/* ──────────────────────────────────────────────────────────── */

export default function MapPanel({ activeTab, selectedHamletId, onHamletSelect, onMapLoaded }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const hamletLayersRef = useRef({});
  const allBoundsRef = useRef(null);
  const selectedIdRef = useRef(selectedHamletId);
  const locationMarkersRef = useRef({});
  const userLocationMarkerRef = useRef(null);

  const [kmlStatus, setKmlStatus] = useState('loading');
  const [mapMode, setMapMode] = useState('streets');
  const [showLegend, setShowLegend] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');

  const streetsLayerRef = useRef(null);
  const satelliteLayerRef = useRef(null);
  const topoLayerRef = useRef(null);

  useEffect(() => {
    selectedIdRef.current = selectedHamletId;
  }, [selectedHamletId]);

  // Handle container resizing / visibility switching
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (activeTab === 'map') {
      const delays = [30, 120, 300, 600];
      const timers = delays.map((delay) =>
        setTimeout(() => {
          if (mapRef.current) {
            mapRef.current.invalidateSize({ animate: false });
            if (selectedIdRef.current && hamletLayersRef.current[selectedIdRef.current]) {
              const activeLayer = hamletLayersRef.current[selectedIdRef.current];
              try {
                const bounds = activeLayer.getBounds?.();
                if (bounds?.isValid()) {
                  mapRef.current.fitBounds(bounds, {
                    padding: [50, 50],
                    maxZoom: 16,
                    animate: false,
                  });
                }
              } catch {
                // ignore
              }
            } else if (allBoundsRef.current) {
              mapRef.current.fitBounds(allBoundsRef.current, { padding: [25, 25], animate: false });
            }
          }
        }, delay)
      );

      return () => timers.forEach(clearTimeout);
    }
  }, [activeTab]);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize({ animate: false });
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Handle map mode switching
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    [streetsLayerRef.current, satelliteLayerRef.current, topoLayerRef.current].forEach((layer) => {
      if (layer && map.hasLayer(layer)) {
        map.removeLayer(layer);
      }
    });

    if (mapMode === 'satellite' && satelliteLayerRef.current) {
      satelliteLayerRef.current.addTo(map);
    } else if (mapMode === 'topo' && topoLayerRef.current) {
      topoLayerRef.current.addTo(map);
    } else if (streetsLayerRef.current) {
      streetsLayerRef.current.addTo(map);
    }
  }, [mapMode]);

  // Filter markers when activeCategory changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    allMapLocations.forEach((loc) => {
      const marker = locationMarkersRef.current[loc.id];
      if (!marker) return;

      const shouldShow = activeCategory === 'all' || loc.category === activeCategory;
      if (shouldShow) {
        if (!map.hasLayer(marker)) {
          marker.addTo(map);
        }
      } else {
        if (map.hasLayer(marker)) {
          map.removeLayer(marker);
        }
      }
    });
  }, [activeCategory]);

  /* ── Map initialisation ──────────────────────────────────── */
  useEffect(() => {
    const container = containerRef.current;
    if (!container || container._leaflet_id) return;

    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    const map = L.map(container, {
      center: [10.888141, 106.582284],
      zoom: 14.8,
      zoomControl: false,
    });

    const streetsLayer = L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      attribution: '&copy; Google Maps',
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      maxZoom: 20,
    });

    const satelliteLayer = L.tileLayer('https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
      attribution: '&copy; Google Maps',
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      maxZoom: 20,
    });

    const topoLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: '&copy; Esri &copy; OpenStreetMap contributors',
        maxZoom: 19,
      }
    );

    streetsLayer.addTo(map);

    streetsLayerRef.current = streetsLayer;
    satelliteLayerRef.current = satelliteLayer;
    topoLayerRef.current = topoLayer;

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapRef.current = map;

    initPolygons(map);
    initLocationMarkers(map);
  }, []); // eslint-disable-line

  // Listen for custom focus events from Sidebar detail panel
  useEffect(() => {
    const handleFocusLocation = (e) => {
      const { toado, id } = e.detail || {};
      if (!toado || !mapRef.current) return;

      // Ensure marker is visible if filtered out
      setActiveCategory('all');

      mapRef.current.flyTo(toado, 17, { duration: 1.1 });
      if (id && locationMarkersRef.current[id]) {
        setTimeout(() => {
          const marker = locationMarkersRef.current[id];
          if (marker && mapRef.current) {
            if (!mapRef.current.hasLayer(marker)) {
              marker.addTo(mapRef.current);
            }
            marker.openPopup();
          }
        }, 550);
      }
    };

    window.addEventListener('xts_focus_diachido', handleFocusLocation);
    window.addEventListener('xts_focus_location', handleFocusLocation);
    return () => {
      window.removeEventListener('xts_focus_diachido', handleFocusLocation);
      window.removeEventListener('xts_focus_location', handleFocusLocation);
    };
  }, []);

  function initLocationMarkers(map) {
    if (!map) return;

    allMapLocations.forEach((item) => {
      const styleCfg = getMarkerSvgAndStyle(item);
      const displayTitle = item.tenNgan || item.ten;

      const iconHtml = `
        <div class="xts-map-pin" style="--pin-bg: ${styleCfg.gradient}; --pin-pulse: ${styleCfg.pulseColor}; --pin-color: ${styleCfg.color};" title="${item.ten}">
          <div class="xts-pin-inner">${styleCfg.svg}</div>
          <div class="xts-pin-pulse"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-xts-location-divicon',
        html: iconHtml,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
        popupAnchor: [0, -34],
      });

      const marker = L.marker(item.toado, { icon: customIcon, zIndexOffset: 1000 }).addTo(map);
      locationMarkersRef.current[item.id] = marker;

      const directionUrl = buildGoogleMapsDirectionUrl(item.toado, item.linkMap);
      const addressHtml = item.diaChi
        ? `<div class="popup-detail-line"><strong>📍 Địa chỉ:</strong> ${item.diaChi}</div>`
        : '';
      const phoneHtml = item.dienThoai
        ? `<div class="popup-detail-line"><strong>📞 Điện thoại:</strong> <a href="tel:${item.dienThoai}">${item.dienThoai}</a></div>`
        : '';
      const webHtml = item.website
        ? `<div class="popup-detail-line"><strong>🌐 Trang thông tin:</strong> <a href="${item.website}" target="_blank" rel="noopener noreferrer">Xem liên kết</a></div>`
        : '';
      const coordHtml = `<div class="popup-coord-line">🎯 Tọa độ: ${item.toado[0].toFixed(5)}, ${item.toado[1].toFixed(5)}</div>`;

      const popupHtml = `
        <div class="red-address-popup-container xts-rich-popup">
          <div class="popup-tag" style="color: ${styleCfg.badgeColor}; background: ${styleCfg.badgeBg}; border-color: ${styleCfg.badgeBorder};">
            ${styleCfg.tagLabel}
          </div>
          <h4 class="popup-title">${item.ten}</h4>
          <div class="popup-badge-ap">
            Thuộc địa phận: <strong style="color: ${styleCfg.color};">Ấp ${item.apTen}</strong>
          </div>
          ${addressHtml}
          ${phoneHtml}
          ${webHtml}
          ${item.moTa ? `<p class="popup-desc">${item.moTa}</p>` : ''}
          ${coordHtml}
          <div class="popup-actions-row">
            <a href="${directionUrl}" target="_blank" rel="noopener noreferrer" class="popup-btn-direction" title="Mở Google Maps hướng dẫn đường đi đến địa điểm này">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
              <span>Chỉ đường đến đây</span>
            </a>
            <button class="popup-btn-select-ap" data-ap-id="${item.apId}" data-loc-id="${item.id}" title="Xem ranh giới Ấp ${item.apTen} và toàn bộ thông tin bên phải">
              <span>Xem ranh giới Ấp ${item.apTen}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        className: 'custom-leaflet-red-popup xts-custom-popup',
        maxWidth: 310,
      });

      marker.on('popupopen', (e) => {
        const popupEl = e.popup?.getElement?.();
        const btn =
          popupEl?.querySelector(`.popup-btn-select-ap[data-loc-id="${item.id}"]`) ||
          document.querySelector(`.popup-btn-select-ap[data-loc-id="${item.id}"]`);
        if (btn) {
          btn.onclick = () => {
            onHamletSelect(item.apId);
          };
        }
      });

      // Tooltip nhẹ khi di chuột qua điểm
      marker.bindTooltip(`<strong>${displayTitle}</strong> · Ấp ${item.apTen}`, {
        direction: 'top',
        offset: [0, -32],
        opacity: 0.95,
      });
    });
  }

  /* ── Sync polygon style & position with selected hamlet ─────────── */
  useEffect(() => {
    Object.entries(hamletLayersRef.current).forEach(([idStr, layer]) => {
      const id = parseInt(idStr, 10);
      const isActive = id === selectedHamletId;
      const color = getColor(id);

      layer.setStyle({
        fillColor: color,
        color: isActive ? '#0F172A' : color,
        fillOpacity: isActive ? 0.52 : 0.18,
        weight: isActive ? 4 : 1.5,
        dashArray: isActive ? null : '5 3',
        lineCap: 'round',
        lineJoin: 'round',
      });

      if (isActive) {
        try {
          layer.bringToFront();
        } catch {
          /* ignore */
        }
      }
    });

    if (mapRef.current) {
      if (selectedHamletId && hamletLayersRef.current[selectedHamletId]) {
        const activeLayer = hamletLayersRef.current[selectedHamletId];
        try {
          const bounds = activeLayer.getBounds?.();
          if (bounds?.isValid()) {
            mapRef.current.fitBounds(bounds, {
              padding: [50, 50],
              maxZoom: 16,
              animate: true,
            });
          }
        } catch (e) {
          console.warn('Could not zoom to hamlet:', e);
        }
      } else if (allBoundsRef.current) {
        mapRef.current.fitBounds(allBoundsRef.current, { padding: [25, 25], animate: true });
      }
    }
  }, [selectedHamletId]);

  /* ── Load & render polygons ──────────────────────────────── */
  async function initPolygons(map) {
    setKmlStatus('loading');

    const kmlText = await fetchKMLText();

    if (!kmlText) {
      setKmlStatus('error');
      return;
    }

    let geojson;
    try {
      geojson = parseKMLtoGeoJSON(kmlText);
    } catch (err) {
      console.error('MapPanel: KML parse error', err);
      setKmlStatus('error');
      return;
    }

    if (!geojson.features.length) {
      setKmlStatus('error');
      return;
    }

    const matchedLayers = [];

    L.geoJSON(geojson, {
      style: (feature) => {
        const hamlet = findHamlet(feature.properties?.name || '');
        const id = hamlet ? hamlet.id : null;
        const isActive = id && id === selectedIdRef.current;
        const color = id ? getColor(id) : '#64748B';
        return {
          fillColor: color,
          color: isActive ? '#0F172A' : color,
          fillOpacity: isActive ? 0.52 : 0.18,
          weight: isActive ? 4 : 1.5,
          dashArray: isActive ? null : '5 3',
          lineCap: 'round',
          lineJoin: 'round',
        };
      },
      onEachFeature: (feature, layer) => {
        const hamlet = findHamlet(feature.properties?.name || '');
        if (!hamlet) return;

        hamletLayersRef.current[hamlet.id] = layer;
        matchedLayers.push(layer);

        layer.on('click', () => onHamletSelect(hamlet.id));

        layer.on('mouseover', function () {
          if (hamlet.id !== selectedIdRef.current) {
            this.setStyle({ fillOpacity: 0.42, dashArray: null });
          }
          this.bindTooltip(makeTooltip(hamlet), {
            sticky: true,
            direction: 'top',
            className: 'hamlet-leaflet-tooltip',
          }).openTooltip();
        });
        layer.on('mouseout', function () {
          if (hamlet.id !== selectedIdRef.current) {
            this.setStyle({ fillOpacity: 0.18, dashArray: '5 3' });
          }
          this.closeTooltip();
        });

        try {
          const center = layer.getBounds().getCenter();
          if (center) {
            const labelIcon = L.divIcon({
              className: 'map-polygon-label-wrapper',
              html: `<div class="map-polygon-label" id="map-label-${hamlet.id}">${hamlet.ten}</div>`,
              iconSize: null,
            });
            const labelMarker = L.marker(center, { icon: labelIcon, zIndexOffset: 500 }).addTo(map);
            labelMarker.on('click', () => onHamletSelect(hamlet.id));
          }
        } catch (e) {
          console.warn('Could not add label for hamlet:', hamlet.ten, e);
        }
      },
    }).addTo(map);

    if (matchedLayers.length) {
      const group = L.featureGroup(matchedLayers);
      if (group.getBounds().isValid()) {
        allBoundsRef.current = group.getBounds();
      }
    }

    if (selectedIdRef.current && hamletLayersRef.current[selectedIdRef.current]) {
      const activeLayer = hamletLayersRef.current[selectedIdRef.current];
      try {
        const bounds = activeLayer.getBounds?.();
        if (bounds?.isValid()) {
          map.fitBounds(bounds, {
            padding: [50, 50],
            maxZoom: 16,
            animate: false,
          });
        }
      } catch (e) {
        console.warn('Could not zoom to selected hamlet:', e);
      }
    } else if (allBoundsRef.current) {
      map.fitBounds(allBoundsRef.current, { padding: [25, 25], animate: false });
    }

    setKmlStatus(matchedLayers.length > 0 ? 'loaded' : 'error');
    if (map && allBoundsRef.current && !selectedIdRef.current) {
      map.fitBounds(allBoundsRef.current, { padding: [25, 25], animate: false });
      map.invalidateSize({ animate: false });
    }
    if (onMapLoaded) onMapLoaded();
  }

  const handleResetView = () => {
    onHamletSelect(null);
    if (!mapRef.current) return;
    if (allBoundsRef.current) {
      mapRef.current.fitBounds(allBoundsRef.current, {
        padding: [25, 25],
        animate: true,
      });
    } else {
      mapRef.current.flyTo([10.888141, 106.582284], 14.5, {
        duration: 1.2,
        easeLinearity: 0.25,
      });
    }
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation || !mapRef.current) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        if (userLocationMarkerRef.current) {
          userLocationMarkerRef.current.setLatLng(coords);
        } else {
          const userIcon = L.divIcon({
            className: 'custom-xts-location-divicon',
            html: `<div class="xts-user-gps-dot"><div class="xts-user-gps-pulse"></div></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          });
          userLocationMarkerRef.current = L.marker(coords, {
            icon: userIcon,
            zIndexOffset: 2000,
          })
            .addTo(mapRef.current)
            .bindPopup('<strong>📍 Vị trí hiện tại của bạn</strong>');
        }
        mapRef.current.flyTo(coords, 16, { duration: 1.2 });
        userLocationMarkerRef.current.openPopup();
      },
      () => {
        alert('Vui lòng cấp quyền truy cập vị trí (GPS) trên trình duyệt để định vị.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleToggleFullscreen = () => {
    const el = containerRef.current?.parentElement;
    if (!el) return;
    if (!document.fullscreenElement) {
      if (el.requestFullscreen) {
        el.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  const categoryCounts = {
    all: allMapLocations.length,
    bnd_ap: allMapLocations.filter((l) => l.category === 'bnd_ap').length,
    truong_hoc: allMapLocations.filter((l) => l.category === 'truong_hoc').length,
    mam_non: allMapLocations.filter((l) => l.category === 'mam_non').length,
    tthtcd: allMapLocations.filter((l) => l.category === 'tthtcd').length,
    di_tich: allMapLocations.filter((l) => l.category === 'di_tich').length,
  };

  /* ── Render ──────────────────────────────────────────────── */
  return (
    <div className={`map-panel ${isFullscreen ? 'map-panel-fullscreen' : ''}`}>
      {/* Leaflet mount point */}
      <div ref={containerRef} className="leaflet-map-container" />

      {/* Loading overlay */}
      {kmlStatus === 'loading' && (
        <div className="map-status-overlay">
          <div className="map-spinner" />
          <span>Đang tải ranh giới 30 ấp và 55 địa điểm xã Xuân Thới Sơn...</span>
        </div>
      )}

      {/* Error banner */}
      {kmlStatus === 'error' && (
        <div className="map-error-banner">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          Không tải được ranh giới ấp. Chọn ấp từ danh sách bên phải.
        </div>
      )}

      {/* Top Overlay Toolbar */}
      <div className="map-overlay-top">
        <div className="map-stat-pill">
          <span className="dot" />
          Xã Xuân Thới Sơn · 30 ấp · {allMapLocations.length} địa điểm
        </div>

        <div className="map-mode-toggle">
          <button
            className={`toggle-btn ${mapMode === 'streets' ? 'active' : ''}`}
            onClick={() => setMapMode('streets')}
            title="Bản đồ Google Maps chuẩn (Đường sá, ngõ hẻm, tiếng Việt chi tiết)"
          >
            🗺️ Bản đồ
          </button>
          <button
            className={`toggle-btn ${mapMode === 'satellite' ? 'active' : ''}`}
            onClick={() => setMapMode('satellite')}
            title="Ảnh vệ tinh Google Maps độ phân giải cao kết hợp tên đường"
          >
            🛰️ Vệ tinh
          </button>
          <button
            className={`toggle-btn ${mapMode === 'topo' ? 'active' : ''}`}
            onClick={() => setMapMode('topo')}
            title="Bản đồ địa hình & ranh giới hành chính Esri"
          >
            🏛️ Địa hình
          </button>
        </div>

        <div className="map-action-buttons">
          <button
            className="map-action-btn"
            onClick={handleLocateMe}
            title="Định vị vị trí GPS hiện tại của tôi"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <polygon points="3 11 22 2 13 21 11 13 3 11" />
            </svg>
            <span>Vị trí của tôi</span>
          </button>

          <button
            className="map-action-btn"
            onClick={handleResetView}
            title="Quay về toàn cảnh 30 ấp xã Xuân Thới Sơn"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="3" />
              <line x1="12" y1="2" x2="12" y2="5" />
              <line x1="12" y1="19" x2="12" y2="22" />
              <line x1="2" y1="12" x2="5" y2="12" />
              <line x1="19" y1="12" x2="22" y2="12" />
            </svg>
            <span>Toàn xã</span>
          </button>

          <a
            href="/xuan_thoi_son_mymap_full.kml"
            download="xuan_thoi_son_mymap_full.kml"
            className="map-action-btn"
            style={{ textDecoration: 'none' }}
            title="Tải file KML chuẩn biểu tượng để nhập (Import) vào Google My Maps"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>KML MyMaps</span>
          </a>

          <button
            className={`map-action-btn ${showLegend ? 'active' : ''}`}
            onClick={() => setShowLegend(!showLegend)}
            title="Bật/Tắt chú thích bản đồ"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
            <span>Chú thích</span>
          </button>

          <button
            className="map-action-btn"
            onClick={handleToggleFullscreen}
            title="Bật/Tắt phóng to toàn màn hình"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              {isFullscreen ? (
                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
              ) : (
                <path d="M15 3h6v6M9 21H3v-6M21 9v6M3 9v6M21 3l-7 7M3 21l7-7" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Category Filter Pills Row */}
      <div className="map-category-filter-bar">
        <button
          className={`map-cat-chip ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => setActiveCategory('all')}
        >
          <span>✨ Tất cả</span>
          <span className="cat-chip-count">{categoryCounts.all}</span>
        </button>
        <button
          className={`map-cat-chip cat-bnd ${activeCategory === 'bnd_ap' ? 'active' : ''}`}
          onClick={() => setActiveCategory('bnd_ap')}
          title="Biểu tượng Nhà thị chính màu xanh lá (#0F9D58)"
        >
          <span>🏛️ BND Ấp / Liên ấp</span>
          <span className="cat-chip-count">{categoryCounts.bnd_ap}</span>
        </button>
        <button
          className={`map-cat-chip cat-school ${activeCategory === 'truong_hoc' ? 'active' : ''}`}
          onClick={() => setActiveCategory('truong_hoc')}
          title="Biểu tượng Trường đại học màu xanh dương (#0288D1)"
        >
          <span>🎓 Trường học (TH-THPT)</span>
          <span className="cat-chip-count">{categoryCounts.truong_hoc}</span>
        </button>
        <button
          className={`map-cat-chip cat-kinder ${activeCategory === 'mam_non' ? 'active' : ''}`}
          onClick={() => setActiveCategory('mam_non')}
          title="Biểu tượng Trường học màu xanh dương (#0288D1)"
        >
          <span>🧒 Mầm non</span>
          <span className="cat-chip-count">{categoryCounts.mam_non}</span>
        </button>
        <button
          className={`map-cat-chip cat-support ${activeCategory === 'tthtcd' ? 'active' : ''}`}
          onClick={() => setActiveCategory('tthtcd')}
          title="Trung tâm học tập cộng đồng & Các địa điểm hỗ trợ"
        >
          <span>🏢 TTHTCĐ & Hỗ trợ</span>
          <span className="cat-chip-count">{categoryCounts.tthtcd}</span>
        </button>
        <button
          className={`map-cat-chip cat-relic ${activeCategory === 'di_tich' ? 'active' : ''}`}
          onClick={() => setActiveCategory('di_tich')}
          title="Nhà bia liệt sĩ & Địa chỉ đỏ lịch sử"
        >
          <span>🚩 Di tích & Nhà bia</span>
          <span className="cat-chip-count">{categoryCounts.di_tich}</span>
        </button>
      </div>

      {/* Legend Card Overlay */}
      {showLegend && (
        <div className="map-legend-card">
          <div className="legend-header">
            <span>Chú thích ký hiệu bản đồ</span>
            <button className="legend-close" onClick={() => setShowLegend(false)}>
              ✕
            </button>
          </div>
          <div className="legend-body">
            <div className="legend-item">
              <span className="legend-color-box" style={{ background: '#0F9D58', color: '#fff' }}>
                🏛️
              </span>
              <span>Ban nhân dân ấp (Nhà thị chính - Xanh lá)</span>
            </div>
            <div className="legend-item">
              <span className="legend-color-box" style={{ background: '#0288D1', color: '#fff' }}>
                🎓
              </span>
              <span>Tiểu học - THPT (Trường ĐH - Xanh dương)</span>
            </div>
            <div className="legend-item">
              <span className="legend-color-box" style={{ background: '#0288D1', color: '#fff' }}>
                🧒
              </span>
              <span>Trường Mầm non (Trường học - Xanh dương)</span>
            </div>
            <div className="legend-item">
              <span className="legend-color-box" style={{ background: '#7C3AED', color: '#fff' }}>
                📚
              </span>
              <span>Trung tâm học tập cộng đồng & Dịch vụ công</span>
            </div>
            <div className="legend-item">
              <span className="legend-color-box" style={{ background: '#E65100', color: '#fff' }}>
                🏢
              </span>
              <span>Đảng ủy, UBND, Công an, Quân sự, Trạm Y tế</span>
            </div>
            <div className="legend-item">
              <span className="legend-color-box red-flag">🚩</span>
              <span>Nhà bia liệt sĩ & Địa chỉ đỏ cách mạng</span>
            </div>
            <div className="legend-item">
              <span className="legend-color-box active-boundary"></span>
              <span>Ấp đang chọn (Ranh giới đậm)</span>
            </div>
          </div>
        </div>
      )}

      {/* Hint */}
      {kmlStatus === 'loaded' && (
        <div className="map-hint-pill">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          Nhấn vào biểu tượng hoặc vùng ranh giới ấp để xem chi tiết & chỉ đường
        </div>
      )}
    </div>
  );
}

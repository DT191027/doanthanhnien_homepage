import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { hamlets, allDiaChiDo } from '../data/hamlets';

/* ─── Palette ──────────────────────────────────────────────── */
const PALETTE = ['#008DD5', '#00B4D8', '#22C55E', '#F59E0B', '#E53935'];
const getColor = (id) => PALETTE[(id - 1) % PALETTE.length];

/* ─── Match KML feature name → hamlet ─────────────────────── */
function findHamlet(name = '') {
  const norm = (s) =>
    s.toLowerCase()
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
  const popPart = hamlet.danSo ? ` · ${hamlet.danSo.toLocaleString('vi-VN')} người` : ' · Chưa có số liệu dân số';
  return `<div class="map-tooltip">
    <div class="map-tooltip-name">${hamlet.ten}</div>
    <div class="map-tooltip-meta">${areaPart}${perimeterPart}${popPart}</div>
    <div class="map-tooltip-hint">Nhấn để xem chi tiết</div>
  </div>`;
}

/* ─── KML parser using browser DOMParser ───────────────────── */
function parseKMLtoGeoJSON(kmlText) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(kmlText, 'text/xml');

  // Check for XML parse error
  const parseError = doc.querySelector('parsererror');
  if (parseError) throw new Error('XML parse error');

  const features = [];

  doc.querySelectorAll('Placemark').forEach((pm) => {
    const name = pm.querySelector('name')?.textContent?.trim() || '';

    // Collect all Polygon elements (also inside MultiGeometry)
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
          return [parts[0], parts[1]]; // [lng, lat]
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

/* ─── Fetch KML via multiple CORS proxies ──────────────────── */
const KML_MID = '1btOE2NICgFYjEgOpKGMrvUePujt4ksM';
const KML_BASE = `https://www.google.com/maps/d/kml?mid=${KML_MID}&forcekml=1`;

async function fetchKMLText() {
  const proxies = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(KML_BASE)}`,
    `https://corsproxy.io/?${encodeURIComponent(KML_BASE)}`,
    `https://proxy.cors.sh/${KML_BASE}`,
  ];

  for (const url of proxies) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (!res.ok) continue;
      const text = await res.text();

      // Make sure it looks like KML/XML, not an HTML error page
      if (text.includes('<kml') || text.includes('<Placemark')) {
        return text;
      }
    } catch {
      /* try next */
    }
  }
  return null;
}

/* ──────────────────────────────────────────────────────────── */

export default function MapPanel({ activeTab, selectedHamletId, onHamletSelect, onMapLoaded }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const hamletLayersRef = useRef({}); // id → layer
  const selectedIdRef = useRef(selectedHamletId);
  const [kmlStatus, setKmlStatus] = useState('loading');
  const [mapMode, setMapMode] = useState('streets'); // 'streets' | 'satellite'
  const streetsLayerRef = useRef(null);
  const satelliteLayerRef = useRef(null);

  // Keep ref current for stale-closure safety in event handlers
  useEffect(() => {
    selectedIdRef.current = selectedHamletId;
  }, [selectedHamletId]);

  // Handle container resizing / visibility switching
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (activeTab === 'map') {
      // Force Leaflet to recalculate container size now that display is no longer 'none'
      const timer = setTimeout(() => {
        map.invalidateSize({ animate: false });
        
        // Focus/Zoom to selected hamlet if present
        if (selectedIdRef.current && hamletLayersRef.current[selectedIdRef.current]) {
          const activeLayer = hamletLayersRef.current[selectedIdRef.current];
          try {
            const bounds = activeLayer.getBounds?.();
            if (bounds?.isValid()) {
              map.fitBounds(bounds, {
                padding: [40, 40],
                maxZoom: 16,
                animate: true,
              });
            }
          } catch (e) {
            console.warn("Could not focus bounds on visibility change:", e);
          }
        }
      }, 50); // slight timeout to allow CSS layout to settle

      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  // Handle map mode switching (Streets vs Satellite)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (mapMode === 'satellite') {
      if (streetsLayerRef.current) {
        map.removeLayer(streetsLayerRef.current);
      }
      if (satelliteLayerRef.current) {
        satelliteLayerRef.current.addTo(map);
      }
    } else {
      if (satelliteLayerRef.current) {
        map.removeLayer(satelliteLayerRef.current);
      }
      if (streetsLayerRef.current) {
        streetsLayerRef.current.addTo(map);
      }
    }
  }, [mapMode]);

  /* ── Map initialisation ──────────────────────────────────── */
  useEffect(() => {
    // Guard against React 18 StrictMode double-invocation:
    // We use a DOM attribute to mark whether Leaflet has already been mounted
    // on this particular container element.
    const container = containerRef.current;
    if (!container) return;
    if (container._leaflet_id) {
      // Already initialised (StrictMode second run) — just grab the existing map
      return;
    }

    // Fix Leaflet icon paths in Vite
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    const map = L.map(container, {
      center: [10.888141, 106.582284],
      zoom: 15,
      zoomControl: false,
    });

    const streetsLayer = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        subdomains: 'abc',
        maxZoom: 19,
      }
    );

    const satelliteLayer = L.tileLayer(
      'https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
      {
        attribution: '&copy; Google Maps',
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        maxZoom: 20,
      }
    );

    streetsLayer.addTo(map);

    streetsLayerRef.current = streetsLayer;
    satelliteLayerRef.current = satelliteLayer;

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapRef.current = map;

    // Load KML polygons & Red Address markers (async, fire-and-forget)
    initPolygons(map);
    initRedAddressMarkers(map);

    // NOTE: No cleanup/remove — we intentionally keep the map alive
    // to avoid the StrictMode double-destroy problem with Leaflet.
  }, []); // eslint-disable-line

  const redAddressMarkersRef = useRef({});

  // Listen for custom focus events from Sidebar detail panel
  useEffect(() => {
    const handleFocusDiaChiDo = (e) => {
      const { toado, id } = e.detail || {};
      if (toado && mapRef.current) {
        mapRef.current.flyTo(toado, 17, { duration: 1.2 });
        if (id && redAddressMarkersRef.current[id]) {
          setTimeout(() => {
            redAddressMarkersRef.current[id].openPopup();
          }, 600);
        }
      }
    };
    window.addEventListener('xts_focus_diachido', handleFocusDiaChiDo);
    return () => window.removeEventListener('xts_focus_diachido', handleFocusDiaChiDo);
  }, []);

  function initRedAddressMarkers(map) {
    if (!map) return;

    allDiaChiDo.forEach((item) => {
      const iconHtml = `
        <div class="red-address-pin" title="${item.ten}">
          <div class="pin-icon">🚩</div>
          <div class="pin-pulse"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-red-address-divicon',
        html: iconHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      const marker = L.marker(item.toado, { icon: customIcon, zIndexOffset: 1000 }).addTo(map);
      redAddressMarkersRef.current[item.id] = marker;

      const mapLinkHtml = item.linkMap ? `
        <a href="${item.linkMap}" target="_blank" rel="noopener noreferrer" class="popup-btn-direction">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
          <span>Chỉ đường (Google Maps)</span>
        </a>
      ` : '';

      const popupHtml = `
        <div class="red-address-popup-container">
          <div class="popup-tag">🚩 ĐỊA CHỈ ĐỎ / DI TÍCH LỊCH SỬ</div>
          <h4 class="popup-title">${item.ten}</h4>
          <div class="popup-badge-ap">Thuộc <strong>Ấp ${item.apTen}</strong></div>
          <p class="popup-desc">${item.moTa || ''}</p>
          <div class="popup-actions-row">
            ${mapLinkHtml}
            <button class="popup-btn-select-ap" data-ap-id="${item.apId}">
              <span>Xem Ấp ${item.apTen}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        className: 'custom-leaflet-red-popup',
        maxWidth: 280,
      });

      marker.on('popupopen', () => {
        const btn = document.querySelector(`.popup-btn-select-ap[data-ap-id="${item.apId}"]`);
        if (btn) {
          btn.onclick = () => {
            onHamletSelect(item.apId);
          };
        }
      });
    });
  }


  /* ── Sync polygon style with selected hamlet ─────────────── */
  useEffect(() => {
    Object.entries(hamletLayersRef.current).forEach(([idStr, layer]) => {
      const id = parseInt(idStr, 10);
      const isActive = id === selectedHamletId;
      const color = getColor(id);

      layer.setStyle({
        fillColor: color,
        color: isActive ? '#1F2937' : color,
        fillOpacity: isActive ? 0.55 : 0.18,
        weight: isActive ? 3 : 1.5,
        dashArray: isActive ? null : '5 3',
      });

      if (isActive && mapRef.current) {
        try {
          const bounds = layer.getBounds?.();
          if (bounds?.isValid()) {
            mapRef.current.fitBounds(bounds, {
              padding: [40, 40],
              maxZoom: 16,
              animate: true,
            });
          }
        } catch { /* ignore */ }
      }
    });
  }, [selectedHamletId]);

  /* ── Load & render polygons ──────────────────────────────── */
  async function initPolygons(map) {
    setKmlStatus('loading');

    const kmlText = await fetchKMLText();

    if (!kmlText) {
      console.warn('MapPanel: all KML proxies failed');
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
      console.warn('MapPanel: KML had no Polygon features');
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
          color: isActive ? '#1F2937' : color,
          fillOpacity: isActive ? 0.55 : 0.18,
          weight: isActive ? 3 : 1.5,
          dashArray: isActive ? null : '5 3',
        };
      },
      onEachFeature: (feature, layer) => {
        const hamlet = findHamlet(feature.properties?.name || '');
        if (!hamlet) return;

        hamletLayersRef.current[hamlet.id] = layer;
        matchedLayers.push(layer);

        // Click → select hamlet
        layer.on('click', () => onHamletSelect(hamlet.id));

        // Hover
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

        // Add a permanent text label directly at the polygon centroid/center
        try {
          const center = layer.getBounds().getCenter();
          if (center) {
            const labelIcon = L.divIcon({
              className: 'map-polygon-label-wrapper',
              html: `<div class="map-polygon-label" id="map-label-${hamlet.id}">${hamlet.ten}</div>`,
              iconSize: null, // auto sizing via CSS
            });
            const labelMarker = L.marker(center, { icon: labelIcon, zIndexOffset: 500 }).addTo(map);
            
            // Clicking label also selects the hamlet
            labelMarker.on('click', () => onHamletSelect(hamlet.id));
          }
        } catch (e) {
          console.warn("Could not add label for hamlet:", hamlet.ten, e);
        }
      },
    }).addTo(map);

    if (selectedIdRef.current && hamletLayersRef.current[selectedIdRef.current]) {
      const activeLayer = hamletLayersRef.current[selectedIdRef.current];
      try {
        const bounds = activeLayer.getBounds?.();
        if (bounds?.isValid()) {
          map.fitBounds(bounds, {
            padding: [40, 40],
            maxZoom: 16,
            animate: false,
          });
        }
      } catch (e) {
        console.warn("Could not zoom to selected hamlet:", e);
      }
    } else if (matchedLayers.length) {
      const group = L.featureGroup(matchedLayers);
      if (group.getBounds().isValid()) {
        map.fitBounds(group.getBounds(), { padding: [30, 30] });
      }
    }

    setKmlStatus(matchedLayers.length > 0 ? 'loaded' : 'error');
    if (onMapLoaded) onMapLoaded();
  }

  /* ── Render ──────────────────────────────────────────────── */
  return (
    <div className="map-panel">
      {/* Leaflet mount point */}
      <div ref={containerRef} className="leaflet-map-container" />

      {/* Loading overlay */}
      {kmlStatus === 'loading' && (
        <div className="map-status-overlay">
          <div className="map-spinner" />
          <span>Đang tải ranh giới ấp...</span>
        </div>
      )}

      {/* Error banner (non-blocking) */}
      {kmlStatus === 'error' && (
        <div className="map-error-banner">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          Không tải được ranh giới ấp. Chọn ấp từ danh sách bên phải.
        </div>
      )}

      {/* Overlay pills */}
      <div className="map-overlay-top">
        <div className="map-stat-pill">
          <span className="dot" />
          Xã Xuân Thới Sơn · 30 ấp
        </div>

        <div className="map-mode-toggle">
          <button 
            className={`toggle-btn ${mapMode === 'streets' ? 'active' : ''}`}
            onClick={() => setMapMode('streets')}
          >
            Bản đồ
          </button>
          <button 
            className={`toggle-btn ${mapMode === 'satellite' ? 'active' : ''}`}
            onClick={() => setMapMode('satellite')}
          >
            Vệ tinh
          </button>
        </div>

        <div className="map-stat-pill" style={{ marginLeft: 'auto' }}>
          <svg
            width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="#008DD5" strokeWidth="2.5" strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          Xã Xuân Thới Sơn - TP.HCM
        </div>
      </div>

      {/* Hint (only after KML loads) */}
      {kmlStatus === 'loaded' && (
        <div className="map-hint-pill">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          Nhấn vào vùng tô màu để xem chi tiết ấp
        </div>
      )}
    </div>
  );
}

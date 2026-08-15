import { useState } from 'react';
import { hamlets } from '../data/hamlets';

// ─── Inline SVG Icons ─────────────────────────────────────────
const FileTextIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);
const TrendingUpIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  </svg>
);
const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);
const HomeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

export default function StatsReport() {
  const [hoveredBar, setHoveredBar] = useState(null);

  // Statistics calculation
  const totalHamlets = hamlets.length;
  const totalHouseholds = hamlets.reduce((sum, h) => sum + h.soHoDan, 0);
  const averageHouseholds = Math.round(totalHouseholds / totalHamlets);

  // Sort hamlets by households size descending for the bar chart
  const sortedHamlets = [...hamlets].sort((a, b) => b.soHoDan - a.soHoDan);

  const maxHouseholds = Math.max(...hamlets.map(h => h.soHoDan));
  const minHouseholds = Math.min(...hamlets.map(h => h.soHoDan));

  const maxHamletName = hamlets.find(h => h.soHoDan === maxHouseholds)?.ten || '';
  const minHamletName = hamlets.find(h => h.soHoDan === minHouseholds)?.ten || '';

  // Export to official PDF via browser native print
  const handleExportPdf = () => {
    window.print();
  };

  // Export to official Word document (.doc) complying with Decree 30/2020/ND-CP
  const handleExportWord = () => {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    const sorted = [...hamlets].sort((a, b) => a.id - b.id);
    
    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <title>Bao cao sap xep ap Xuan Thoi Son</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          @page {
            size: 21.0cm 29.7cm; /* A4 */
            margin: 2.0cm 1.5cm 2.0cm 3.0cm; /* top, right, bottom, left as per Decree 30 */
          }
          body {
            font-family: "Times New Roman", Times, serif;
            font-size: 13pt;
            line-height: 1.4;
            color: #000000;
          }
          p {
            margin: 0 0 8px 0;
            text-align: justify;
          }
          .text-indent {
            text-indent: 1.27cm;
          }
          .header-table {
            width: 100%;
            border: none;
            margin-bottom: 24px;
          }
          .header-table td {
            border: none;
            vertical-align: top;
            padding: 0;
          }
          .header-left {
            width: 40%;
            text-align: center;
          }
          .header-right {
            width: 60%;
            text-align: center;
          }
          .org-parent {
            font-size: 12pt;
            text-transform: uppercase;
            margin-bottom: 2px;
          }
          .org-sub {
            font-size: 12pt;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 4px;
          }
          .doc-no {
            font-size: 12pt;
          }
          .national-title {
            font-size: 12pt;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 2px;
          }
          .national-sub {
            font-size: 13pt;
            font-weight: bold;
            margin-bottom: 4px;
          }
          .doc-date {
            font-size: 13pt;
            font-style: italic;
            margin-top: 8px;
            text-align: right;
          }
          .line-left {
            width: 80px;
            height: 1px;
            border-top: 1.5px dashed black;
            margin: 6px auto 0 auto;
          }
          .line-right {
            width: 140px;
            height: 1px;
            border-top: 1.5px solid black;
            margin: 4px auto 0 auto;
          }
          .title-container {
            text-align: center;
            margin: 32px 0 24px 0;
          }
          .main-title {
            font-size: 15pt;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 8px;
          }
          .sub-title {
            font-size: 13.5pt;
            font-weight: bold;
            max-width: 85%;
            margin: 0 auto;
            line-height: 1.3;
          }
          .section-heading {
            font-size: 13pt;
            font-weight: bold;
            text-transform: uppercase;
            margin: 16px 0 8px 0;
          }
          .data-table {
            width: 100%;
            border-collapse: collapse;
            margin: 16px 0;
          }
          .data-table th, .data-table td {
            border: 1px solid black;
            padding: 6px 8px;
            font-size: 12pt;
          }
          .data-table th {
            font-weight: bold;
            text-align: center;
            background-color: #F2F2F2;
          }
          .table-total-row td {
            font-weight: bold;
            background-color: #F9F9F9;
          }
          .sig-table {
            width: 100%;
            border: none;
            margin-top: 36px;
          }
          .sig-table td {
            border: none;
            vertical-align: top;
            padding: 0;
          }
          .recipients {
            width: 50%;
            font-size: 11pt;
            line-height: 1.3;
          }
          .recipients-title {
            font-weight: bold;
            font-style: italic;
            margin-bottom: 4px;
          }
          .signer {
            width: 50%;
            text-align: center;
          }
          .signer-title {
            font-size: 13pt;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 2px;
          }
          .signer-role {
            font-size: 13pt;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 64px;
          }
          .signer-name {
            font-size: 13pt;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <table class="header-table">
          <tr>
            <td class="header-left">
              <div class="org-parent">ĐOÀN TNCS HỒ CHÍ MINH</div>
              <div class="org-sub">BCH XÃ XUÂN THỚI SƠN</div>
              <div class="doc-no">Số: &nbsp; &nbsp; &nbsp; &nbsp; -BC/ĐTN</div>
              <div class="line-left"></div>
            </td>
            <td class="header-right">
              <div class="national-title">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
              <div class="national-sub">Độc lập - Tự do - Hạnh phúc</div>
              <div class="line-right"></div>
              <div class="doc-date"><i>Xuân Thới Sơn, ngày ${day < 10 ? '0' + day : day} tháng ${month < 10 ? '0' + month : month} năm ${year}</i></div>
            </td>
          </tr>
        </table>

        <div class="title-container">
          <div class="main-title">BÁO CÁO</div>
          <div class="sub-title">Về kết quả thực hiện sắp xếp địa giới hành chính các ấp và quy mô hộ dân năm 2026 trên địa bàn xã Xuân Thới Sơn</div>
        </div>

        <p class="text-indent">Thực hiện Nghị quyết của Hội đồng nhân dân xã Xuân Thới Sơn về việc sắp xếp, thành lập các ấp mới phục vụ công tác tinh gọn bộ máy hành chính và nâng cao hiệu lực chỉ đạo hành chính cấp cơ sở; Ban Chấp hành Đoàn xã Xuân Thới Sơn trân trọng báo cáo số liệu địa giới hành chính sau sáp nhập cập nhật đến năm ${year} như sau:</p>

        <div class="section-heading">I. KHÁI QUÁT CHUNG QUY MÔ DÂN CƯ</div>
        <p class="text-indent">Sau khi hoàn thành đề án sắp xếp, sáp nhập đơn vị hành chính cấp ấp, toàn xã Xuân Thới Sơn hiện có tổng cộng <b>${totalHamlets} ấp mới</b> với tổng quy mô dân cư đạt <b>${totalHouseholds.toLocaleString('vi-VN')} hộ gia đình</b>. Quy mô số hộ trung bình trên mỗi đơn vị hành chính ấp đạt <b>${averageHouseholds} hộ/ấp</b>.</p>
        <p class="text-indent">Quy mô số hộ lớn nhất tại xã đạt <b>${maxHouseholds.toLocaleString('vi-VN')} hộ</b> (Ấp ${maxHamletName}), quy mô nhỏ nhất đạt <b>${minHouseholds.toLocaleString('vi-VN')} hộ</b> (Ấp ${minHamletName}).</p>

        <div class="section-heading">II. BẢNG THỐNG KÊ CHI TIẾT SỐ LIỆU SẮP XẾP ĐỊA GIỚI 30 ẤP</div>
        <p class="text-indent">Số liệu chi tiết về tên ấp mới, quy mô số hộ và nguồn gốc sáp nhập từ các ấp cũ như sau:</p>

        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 50px;">STT</th>
              <th>Tên ấp mới sáp nhập</th>
              <th style="width: 120px;">Số hộ gia đình</th>
              <th>Sáp nhập từ ấp cũ</th>
            </tr>
          </thead>
          <tbody>
            ${sorted.map((h, i) => {
              return `
                <tr>
                  <td style="text-align: center;">${i + 1}</td>
                  <td><b>Ấp ${h.ten}</b></td>
                  <td style="text-align: right;">${h.soHoDan.toLocaleString('vi-VN')}</td>
                  <td>${h.tenCu}</td>
                </tr>
              `;
            }).join('')}
            <tr class="table-total-row">
              <td style="text-align: center;">-</td>
              <td><b>TỔNG CỘNG</b></td>
              <td style="text-align: right;"><b>${totalHouseholds.toLocaleString('vi-VN')}</b></td>
              <td><b>30 ấp sáp nhập hoàn thành</b></td>
            </tr>
          </tbody>
        </table>

        <div class="section-heading">III. KIẾN NGHỊ VÀ PHƯƠNG HƯỚNG CÔNG TÁC ĐOÀN</div>
        <p class="text-indent">Căn cứ trên số liệu quy mô hộ dân của các ấp mới sáp nhập, Ban Chấp hành Đoàn xã Xuân Thới Sơn sẽ tập trung kiện toàn tổ chức Đoàn tại các Chi đoàn ấp mới nhằm đồng bộ hóa với cơ cấu tổ chức hành chính mới, hỗ trợ chính quyền địa phương hoàn thành tốt các chỉ tiêu chuyển đổi số và phục vụ nhân dân trên địa bàn.</p>

        <table class="sig-table">
          <tr>
            <td class="recipients">
              <div class="recipients-title">Nơi nhận:</div>
              <p>- ...;</p>
              <p>- ...;</p>
              <p>- Lưu: ...</p>
            </td>
            <td class="signer">
              <div class="signer-title">TM. BAN CHẤP HÀNH</div>
              <div class="signer-role">BÍ THƯ</div>
              <div class="signer-name" style="margin-top: 80px;">&nbsp;</div>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + html], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Bao-cao-sap-xep-ap-Xuan-Thoi-Son.doc';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="stats-tab-container">
      {/* ── Page Header ── */}
      <div className="tab-title-row">
        <div>
          <h1 className="tab-main-title">Báo Cáo Số Liệu Chuyển Đổi Số</h1>
          <p className="tab-sub-title">Báo cáo phân tích cơ cấu dân cư phục vụ công tác chỉ đạo hành chính và phát triển thanh niên</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="export-btn"
            style={{ background: 'var(--secondary)', borderColor: 'var(--secondary)' }}
            onClick={handleExportWord}
          >
            <FileTextIcon />
            <span>Xuất file Word</span>
          </button>
          <button 
            className="export-btn"
            onClick={handleExportPdf}
          >
            <DownloadIcon />
            <span>Xuất báo cáo PDF</span>
          </button>
        </div>
      </div>

      {/* ── KPIs Overview grid ── */}
      <div className="stats-kpi-grid">
        <div className="kpi-card">
          <span className="kpi-icon-wrapper blue"><HomeIcon /></span>
          <div className="kpi-info">
            <span className="kpi-value">{totalHouseholds.toLocaleString('vi-VN')}</span>
            <span className="kpi-label">Tổng số hộ gia đình</span>
          </div>
        </div>
        <div className="kpi-card">
          <span className="kpi-icon-wrapper green">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <line x1="9" y1="3" x2="9" y2="21"/>
            </svg>
          </span>
          <div className="kpi-info">
            <span className="kpi-value">{totalHamlets}</span>
            <span className="kpi-label">Tổng số ấp sáp nhập</span>
          </div>
        </div>
        <div className="kpi-card">
          <span className="kpi-icon-wrapper orange"><TrendingUpIcon /></span>
          <div className="kpi-info">
            <span className="kpi-value">{averageHouseholds}</span>
            <span className="kpi-label">Số hộ trung bình / ấp</span>
          </div>
        </div>
        <div className="kpi-card">
          <span className="kpi-icon-wrapper red">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </span>
          <div className="kpi-info">
            <span className="kpi-value">{maxHouseholds.toLocaleString('vi-VN')}</span>
            <span className="kpi-label">Quy mô lớn nhất (Ấp {maxHamletName})</span>
          </div>
        </div>
      </div>

      {/* ── Charts Grid (Full Width) ── */}
      <div className="charts-grid-container" style={{ gridTemplateColumns: '1fr' }}>
        
        {/* Bar Chart Panel */}
        <div className="chart-panel bar-chart-panel">
          <div className="chart-header">
            <div className="chart-title">
              <TrendingUpIcon />
              Biểu đồ cột phân bổ hộ gia đình của 30 ấp mới
            </div>
            <span className="chart-legend-tag">Đơn vị: Hộ dân</span>
          </div>

          <div className="bar-chart-scroll-wrapper">
            <div className="bar-chart-canvas">
              {/* Y-axis helper ticks */}
              <div className="chart-y-axis">
                <span>{maxHouseholds}</span>
                <span>{Math.round(maxHouseholds * 0.75)}</span>
                <span>{Math.round(maxHouseholds * 0.5)}</span>
                <span>{Math.round(maxHouseholds * 0.25)}</span>
                <span>0</span>
              </div>

              {/* Bars container */}
              <div className="chart-bars-container">
                {sortedHamlets.map((h) => {
                  const percentHeight = (h.soHoDan / maxHouseholds) * 100;
                  return (
                    <div 
                      key={h.id} 
                      className="chart-bar-wrapper"
                      onMouseEnter={() => setHoveredBar(h)}
                      onMouseLeave={() => setHoveredBar(null)}
                    >
                      <div 
                        className={`chart-bar-fill ${hoveredBar?.id === h.id ? 'active' : ''}`}
                        style={{ 
                          height: `${percentHeight}%`,
                          backgroundColor: h.color || 'var(--primary)'
                        }}
                      />
                      <span className="chart-bar-label">{h.ten}</span>
                    </div>
                  );
                })}

                {/* Tooltip display */}
                {hoveredBar && (
                  <div className="chart-tooltip">
                    <div className="tooltip-title">Ấp {hoveredBar.ten}</div>
                    <div className="tooltip-row">
                      <span>Số hộ:</span>
                      <strong>{hoveredBar.soHoDan.toLocaleString('vi-VN')} hộ</strong>
                    </div>
                    <div className="tooltip-row">
                      <span>Ấp cũ sáp nhập:</span>
                      <span>{hoveredBar.tenCu}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── Table Summary ── */}
      <div className="stats-table-panel">
        <div className="chart-header" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
          <div className="chart-title">
            <FileTextIcon />
            Bảng thống kê chi tiết quy mô 30 ấp mới
          </div>
        </div>
        <div className="table-responsive-wrapper">
          <table className="stats-data-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>STT</th>
                <th>Tên ấp mới sáp nhập</th>
                <th>Hộ gia đình</th>
                <th>Tỷ lệ quy mô (%)</th>
                <th>Sáp nhập từ ấp cũ</th>
              </tr>
            </thead>
            <tbody>
              {sortedHamlets.map((h, index) => {
                const ratio = ((h.soHoDan / totalHouseholds) * 100).toFixed(2);
                return (
                  <tr key={h.id}>
                    <td><strong>{index + 1}</strong></td>
                    <td><strong>Ấp {h.ten}</strong></td>
                    <td>{h.soHoDan.toLocaleString('vi-VN')} hộ</td>
                    <td>{ratio}%</td>
                    <td style={{ color: 'var(--subtext)', fontSize: '12px' }}>{h.tenCu}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

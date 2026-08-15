import { hamlets, tongQuan } from '../data/hamlets';

export default function OfficialDocumentPrint() {
  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();

  // Sort hamlets by STT to make sure it's sequentially ordered from 1 to 30
  const sortedHamlets = [...hamlets].sort((a, b) => a.id - b.id);

  return (
    <div className="official-document-print">
      {/* ─── Quốc hiệu & BCH Đoàn Xã ─── */}
      <table className="doc-header-table">
        <tbody>
          <tr>
            <td className="header-left">
              <div className="org-parent">ĐOÀN TNCS HỒ CHÍ MINH</div>
              <div className="org-sub">BCH XÃ XUÂN THỚI SƠN</div>
              <div className="doc-no">Số: &nbsp; &nbsp; &nbsp; /BC-ĐTN</div>
              <div className="header-line-left"></div>
            </td>
            <td className="header-right">
              <div className="national-title">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
              <div className="national-sub">Độc lập - Tự do - Hạnh phúc</div>
              <div className="header-line-right"></div>
              <div className="doc-date">
                <i>Xuân Thới Sơn, ngày {day < 10 ? `0${day}` : day} tháng {month < 10 ? `0${month}` : month} năm {year}</i>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ─── Tiêu đề báo cáo ─── */}
      <div className="doc-title-container">
        <h1 className="doc-main-title">BÁO CÁO</h1>
        <h2 className="doc-sub-title">Về kết quả thực hiện sắp xếp địa giới hành chính các ấp và quy mô hộ dân năm 2026 trên địa bàn xã Xuân Thới Sơn</h2>
      </div>

      {/* ─── Nội dung báo cáo ─── */}
      <div className="doc-body">
        <p className="doc-intro">
          Thực hiện Nghị quyết của Hội đồng nhân dân xã Xuân Thới Sơn về việc sắp xếp, thành lập các ấp mới phục vụ công tác tinh gọn bộ máy hành chính và nâng cao hiệu lực chỉ đạo hành chính cấp cơ sở; Ban Chấp hành Đoàn TNCS Hồ Chí Minh xã Xuân Thới Sơn trân trọng báo cáo số liệu địa giới hành chính sau sáp nhập cập nhật đến năm {year} như sau:
        </p>

        <h3 className="doc-section-heading">I. KHÁI QUÁT CHUNG QUY MÔ DÂN CƯ</h3>
        <p className="doc-text">
          Sau khi hoàn thành đề án sắp xếp, sáp nhập đơn vị hành chính cấp ấp, toàn xã Xuân Thới Sơn hiện có tổng cộng <b>{tongQuan.tongAp} ấp mới</b> với tổng quy mô dân cư đạt <b>{tongQuan.tongHoDan.toLocaleString('vi-VN')} hộ gia đình</b>. Quy mô số hộ trung bình trên mỗi đơn vị hành chính ấp đạt <b>{Math.round(tongQuan.tongHoDan / tongQuan.tongAp)} hộ/ấp</b>.
        </p>

        <h3 className="doc-section-heading">II. BẢNG THỐNG KÊ CHI TIẾT SỐ LIỆU SẮP XẾP ĐỊA GIỚI 30 ẤP</h3>
        <p className="doc-text">
          Số liệu chi tiết về tên ấp mới, quy mô số hộ và nguồn gốc sáp nhập từ các ấp cũ như sau:
        </p>

        {/* ─── Bảng thống kê hành chính hành chính ─── */}
        <table className="doc-data-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>STT</th>
              <th style={{ width: '200px' }}>Tên ấp mới sáp nhập</th>
              <th style={{ width: '130px' }}>Số hộ gia đình</th>
              <th>Sáp nhập từ ấp cũ</th>
            </tr>
          </thead>
          <tbody>
            {sortedHamlets.map((h, i) => {
              return (
                <tr key={h.id}>
                  <td style={{ textAlign: 'center' }}>{i + 1}</td>
                  <td><b>Ấp {h.ten}</b></td>
                  <td style={{ textAlign: 'right', paddingRight: '12px' }}>{h.soHoDan.toLocaleString('vi-VN')}</td>
                  <td>{h.tenCu}</td>
                </tr>
              );
            })}
            <tr className="table-total-row">
              <td style={{ textAlign: 'center' }}><b>-</b></td>
              <td><b>TỔNG CỘNG</b></td>
              <td style={{ textAlign: 'right', paddingRight: '12px' }}><b>{tongQuan.tongHoDan.toLocaleString('vi-VN')}</b></td>
              <td><b>30 ấp sáp nhập hoàn thành</b></td>
            </tr>
          </tbody>
        </table>

        <h3 className="doc-section-heading" style={{ marginTop: '20px' }}>III. KIẾN NGHỊ VÀ PHƯƠNG HƯỚNG CÔNG TÁC ĐOÀN</h3>
        <p className="doc-text">
          Căn cứ trên số liệu quy mô hộ dân của các ấp mới sáp nhập, Ban Chấp hành Đoàn xã Xuân Thới Sơn sẽ tập trung kiện toàn tổ chức Đoàn tại các Chi đoàn ấp mới nhằm đồng bộ hóa với cơ cấu tổ chức hành chính mới, hỗ trợ chính quyền địa phương hoàn thành tốt các chỉ tiêu chuyển đổi số và phục vụ nhân dân trên địa bàn.
        </p>
      </div>

      {/* ─── Ký tên & Nơi nhận ─── */}
      <table className="doc-signature-table">
        <tbody>
          <tr>
            <td className="doc-recipients">
              <div className="recipients-title">Nơi nhận:</div>
              <div className="recipient-item">- ...;</div>
              <div className="recipient-item">- ...;</div>
              <div className="recipient-item">- Lưu: ...</div>
            </td>
            <td className="doc-signer">
              <div className="signer-title">TM. BAN CHẤP HÀNH</div>
              <div className="signer-role">BÍ THƯ</div>
              <div className="signer-space"></div>
              <div className="signer-name">&nbsp;</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

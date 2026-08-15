import { tongQuan } from '../data/hamlets';

const StatItem = ({ value, unit, label, color }) => (
  <div className="stat-item">
    <div className="stat-value" style={color ? { color } : {}}>
      {value}
      {unit && <span style={{ fontSize: 11, fontWeight: 500, color: '#6B7280' }}>{unit}</span>}
    </div>
    <div className="stat-label">{label}</div>
  </div>
);

export default function StatsBar() {
  return (
    <div className="stats-bar">
      <StatItem
        value={tongQuan.tongAp}
        label="Tổng số ấp"
        color="#008DD5"
      />
      <StatItem
        value={tongQuan.tongDienTich ? (tongQuan.tongDienTich / 100).toFixed(2) : '—'}
        unit=" km²"
        label="Tổng diện tích"
        color="#00B4D8"
      />
      <StatItem
        value={(tongQuan.tongDanSo / 1000).toFixed(1) + 'k'}
        label="Dân số"
        color="#22C55E"
      />
      <StatItem
        value={tongQuan.tongChiDoanVien}
        label="Đoàn viên"
        color="#F59E0B"
      />
    </div>
  );
}

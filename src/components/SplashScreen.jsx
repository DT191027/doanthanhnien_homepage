import { useEffect, useState } from 'react';

export default function SplashScreen({ isMapReady, onFinished }) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Đang khởi tạo bản đồ...');
  const [fadeOut, setFadeOut] = useState(false);
  const [visible, setVisible] = useState(true);

  // Status text animation
  useEffect(() => {
    if (progress < 30) {
      setStatusText('Đang kết nối cơ sở dữ liệu địa giới...');
    } else if (progress < 60) {
      setStatusText('Đang tải cấu trúc 30 ấp mới 2026...');
    } else if (progress < 90) {
      setStatusText('Đang vẽ ranh giới hành chính lên bản đồ vệ tinh...');
    } else {
      setStatusText('Thiết lập hệ thống sẵn sàng!');
    }
  }, [progress]);

  // Progress simulation (takes at least 1.8 seconds for smooth feeling)
  useEffect(() => {
    let timer;
    const step = () => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 100;
        }
        // Increment progress faster at first, slower later
        const diff = Math.max(1, Math.floor((100 - prev) * 0.15));
        const next = prev + diff;
        
        // Schedule next update
        timer = setTimeout(step, 80 + Math.random() * 80);
        return next > 100 ? 100 : next;
      });
    };

    timer = setTimeout(step, 50);
    return () => clearTimeout(timer);
  }, []);

  // When both map is loaded and progress reaches 100%, trigger fade-out
  useEffect(() => {
    if (progress === 100 && isMapReady) {
      // Small delay to let user see 100% complete state
      const delayTimer = setTimeout(() => {
        setFadeOut(true);
        // Remove from DOM after fade-out transition completes (600ms)
        const finishTimer = setTimeout(() => {
          setVisible(false);
          if (onFinished) onFinished();
        }, 600);
        return () => clearTimeout(finishTimer);
      }, 300);

      return () => clearTimeout(delayTimer);
    }
  }, [progress, isMapReady, onFinished]);

  if (!visible) return null;

  return (
    <div className={`splash-screen ${fadeOut ? 'fade-out' : ''}`}>
      <div className="splash-content">
        {/* Glow circles backgrounds */}
        <div className="splash-glow glow-1" />
        <div className="splash-glow glow-2" />

        {/* Brand logo container */}
        <div className="splash-logo-container">
          <img src="/xtslogo.png" alt="Logo Đoàn TNCS" className="splash-logo" />
        </div>

        {/* Text descriptions */}
        <h1 className="splash-title">ĐOÀN TNCS HỒ CHÍ MINH</h1>
        <h2 className="splash-subtitle">XÃ XUÂN THỚI SƠN - TP. HỒ CHÍ MINH</h2>
        <div className="splash-divider" />
        <p className="splash-app-name">Hệ Thống Tra Cứu Địa Giới Hành Chính 30 Ấp</p>

        {/* Progress bar container */}
        <div className="splash-progress-container">
          <div className="splash-progress-track">
            <div className="splash-progress-bar" style={{ width: `${progress}%` }} />
          </div>
          <div className="splash-progress-info">
            <span className="splash-status">{statusText}</span>
            <span className="splash-percent">{progress}%</span>
          </div>
        </div>
      </div>
      
      <div className="splash-footer">
        Dữ liệu ranh giới hành chính cập nhật chính thức năm 2026
      </div>
    </div>
  );
}

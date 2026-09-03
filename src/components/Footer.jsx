import React from 'react';
import { MapPin, Mail, Globe, Landmark } from 'lucide-react';

export default function Footer({ onTabChange }) {
  return (
    <footer className="app-footer">
      <div className="footer-top-container">
        <div className="footer-col brand-col">
          <div className="footer-logo">
            <img src="/xtslogo.png" alt="Đoàn TNCS Hồ Chí Minh Xã Xuân Thới Sơn" referrerPolicy="no-referrer" />
            <div>
              <h3>ĐOÀN TNCS HỒ CHÍ MINH</h3>
              <p>XÃ XUÂN THỚI SƠN - TP. HỒ CHÍ MINH</p>
            </div>
          </div>
          <p className="footer-desc">
            Cổng thông tin điện tử chính thức của Tuổi trẻ Xã Xuân Thới Sơn. Cung cấp thông tin hoạt động, tin tức sự kiện, tuyên dương khen thưởng và hệ thống Bản đồ địa giới 30 ấp hành chính.
          </p>
        </div>

        <div className="footer-col links-col">
          <h4>Chuyên Mục Website</h4>
          <ul>
            <li><button onClick={() => onTabChange('home')}>Trang Chủ</button></li>
            <li><button onClick={() => onTabChange('news')}>Tin tức - Sự kiện</button></li>
            <li><button onClick={() => onTabChange('awards')}>Khen thưởng</button></li>
            <li><button onClick={() => onTabChange('map')}>Bản Đồ hành chính 30 Ấp</button></li>
            <li><button onClick={() => onTabChange('bch')}>BCH Đoàn xã</button></li>
          </ul>
        </div>

        <div className="footer-col contact-col">
          <h4>Thông Tin Liên Hệ</h4>
          <p className="flex-center-gap"><Landmark size={15} /> <strong>Cơ quan:</strong> Trụ sở Đảng ủy xã Xuân Thới Sơn</p>
          <p className="flex-center-gap"><MapPin size={15} /> <strong>Địa chỉ:</strong> 2/2 Nguyễn Thị Nuôi, Ấp 54, Xã Xuân Thới Sơn, TP. Hồ Chí Minh</p>
          <p className="flex-center-gap"><Mail size={15} /> <strong>Email:</strong> dtnxts2026@gmail.com</p>
          <p className="flex-center-gap"><Globe size={15} /> <strong>Fanpage:</strong> Tuổi Trẻ Xã Xuân Thới Sơn</p>
        </div>
      </div>

      <div className="footer-bottom-bar">
        <p>&copy; {new Date().getFullYear()} Bản quyền thuộc về Đoàn TNCS Hồ Chí Minh Xã Xuân Thới Sơn - TP. Hồ Chí Minh.</p>
        <p className="gov-note">Đơn vị hành chính 2 cấp - TP. Hồ Chí Minh</p>
      </div>
    </footer>
  );
}

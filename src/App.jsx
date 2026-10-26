import { useState } from 'react';
import './index.css';
import Header from './components/Header';
import HomeTab from './components/HomeTab';
import NewsTab from './components/NewsTab';
import CommendationTab from './components/CommendationTab';
import ExecutiveBoardTab from './components/ExecutiveBoardTab';
import MapPanel from './components/MapPanel';
import Sidebar from './components/Sidebar';
import OfficialDocumentPrint from './components/OfficialDocumentPrint';
import AdminNewsModal from './components/AdminNewsModal';
import Footer from './components/Footer';
import { newsService } from './lib/newsService';

export default function App() {
  // Navigation active tab: 'home', 'news', 'awards', 'map', 'bch'
  const [activeTab, setActiveTab] = useState('home');

  // Lifted state — shared between map and sidebar
  const [selectedHamletId, setSelectedHamletId] = useState(null);
  
  // Admin Login state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem('xts_admin_session') === 'true';
  });
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  const handleAdminLogin = () => {
    setIsAdminLoggedIn(true);
    localStorage.setItem('xts_admin_session', 'true');
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('xts_admin_session');
  };

  const handleOpenAdminModal = (post = null) => {
    setEditingPost(post);
    setIsAdminModalOpen(true);
  };

  const handleCloseAdminModal = () => {
    setIsAdminModalOpen(false);
    setEditingPost(null);
  };

  const handleSavePost = async (postPayload) => {
    if (postPayload.isEditing) {
      await newsService.updatePost(postPayload);
    } else {
      await newsService.createPost(postPayload);
    }
  };

  return (
    <div className="app-layout-wrapper">
      {/* Print template styled with administrative format */}
      <OfficialDocumentPrint />

      {/* Admin News Management Modal */}
      <AdminNewsModal
        isOpen={isAdminModalOpen}
        onClose={handleCloseAdminModal}
        isAdminLoggedIn={isAdminLoggedIn}
        onLogin={handleAdminLogin}
        onLogout={handleAdminLogout}
        onSavePost={handleSavePost}
        editingPost={editingPost}
      />

      <div className="app-layout">
        {/* Header with 5 requested tabs */}
        <Header 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          onOpenAdminModal={() => handleOpenAdminModal(null)}
          isAdminLoggedIn={isAdminLoggedIn}
        />
        
        <main className="main-viewport-content">
          {/* Home Tab */}
          {activeTab === 'home' && (
            <div className="scrollable-page-wrapper">
              <HomeTab 
                onNavigateToMap={() => setActiveTab('map')} 
                onNavigateToNews={() => setActiveTab('news')} 
              />
              <Footer onTabChange={setActiveTab} />
            </div>
          )}

          {/* News & Events Tab */}
          {activeTab === 'news' && (
            <div className="scrollable-page-wrapper">
              <NewsTab 
                onOpenAdminModal={handleOpenAdminModal} 
                isAdminLoggedIn={isAdminLoggedIn}
              />
              <Footer onTabChange={setActiveTab} />
            </div>
          )}

          {/* Commendation Tab */}
          {activeTab === 'awards' && (
            <div className="scrollable-page-wrapper">
              <CommendationTab 
                isAdminLoggedIn={isAdminLoggedIn}
                onOpenAdminModal={() => handleOpenAdminModal(null)}
              />
              <Footer onTabChange={setActiveTab} />
            </div>
          )}

          {/* Executive Board Tab */}
          {activeTab === 'bch' && (
            <div className="scrollable-page-wrapper">
              <ExecutiveBoardTab />
              <Footer onTabChange={setActiveTab} />
            </div>
          )}

          {/* Administrative Map Viewport */}
          <div 
            className="main-content" 
            style={{ display: activeTab === 'map' ? 'flex' : 'none' }}
          >
            <MapPanel
              activeTab={activeTab}
              selectedHamletId={selectedHamletId}
              onHamletSelect={setSelectedHamletId}
              onMapLoaded={() => {}}
            />
            <Sidebar
              selectedHamletId={selectedHamletId}
              onHamletSelect={setSelectedHamletId}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

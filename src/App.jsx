import { useState, useEffect, useCallback } from 'react';
import { collegeData } from './collegeData.js';
import { treeData } from './careerData.js';
import WelcomeScreen from './components/WelcomeScreen';
import Header from './components/Header';
import ProfilePanel from './components/ProfilePanel';
import TabNav from './components/TabNav';
import Quiz from './components/Quiz';
import NearbyColleges from './components/NearbyColleges';
import CareerPaths from './components/CareerPaths';
import Timeline from './components/Timeline';
import Resources from './components/Resources'; // The new component
import Modal from './components/Modal';
import './index.css';

// Helper function to get all users from our "temporary database"
const getAllUsers = () => {
  const users = localStorage.getItem('users');
  return users ? JSON.parse(users) : {};
};

// Helper function to find nodes in the career tree (RESTORED)
function findNodeByTitle(node, title) {
  if (node.t === title) return node;
  if (node.c) {
    for (const child of node.c) {
      const found = findNodeByTitle(child, title);
      if (found) return found;
    }
  }
  return null;
}

// Helper function to calculate distance
function getDistance(p1, p2) {
  const R = 6371;
  const dLat = (p2.lat - p1.lat) * Math.PI / 180;
  const dLon = (p2.lng - p1.lng) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function App() {
  // User & UI State
  const [currentUser, setCurrentUser] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [activeTab, setActiveTab] = useState('quiz');
  const [isProfilePanelOpen, setProfilePanelOpen] = useState(false);
  const [modalData, setModalData] = useState(null);

  // Career Path State
  const [selectedNode, setSelectedNode] = useState(null);

  // College Filtering State - LIFTED UP
  const [collegeState, setCollegeState] = useState({
    collegesWithDistance: [],
    userLocation: null,
    isCareerFilterActive: false,
    careerFilteredColleges: [],
    status: 'idle', // 'idle', 'searching', 'found', 'error'
  });

  // Load user session on initial render
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const allUsers = getAllUsers();
      if (allUsers[savedUser]) {
        setCurrentUser(allUsers[savedUser]);
      }
    }
    document.body.className = theme === 'dark' ? 'dark-mode' : '';
  }, [theme]);

  // NEW: Logic for finding colleges is now in App.jsx
  const handleFindNearby = useCallback(() => {
    setCollegeState(prev => ({ ...prev, status: 'searching' }));
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          const colleges = collegeData.map(c => ({ ...c, distance: getDistance(location, c) }))
            .sort((a, b) => a.distance - b.distance);
          setCollegeState(prev => ({ ...prev, userLocation: location, collegesWithDistance: colleges, status: 'found' }));
        },
        () => setCollegeState(prev => ({ ...prev, status: 'error' }))
      );
    } else {
      setCollegeState(prev => ({ ...prev, status: 'error' }));
    }
  }, []);

  // Handlers for login/logout/profile
  const handleLoginOrSignup = (username) => {
    const allUsers = getAllUsers();
    if (allUsers[username]) {
      localStorage.setItem('currentUser', username);
      setCurrentUser(allUsers[username]);
      return false;
    }
    return true;
  };

  const handleCompleteSignup = (username, details) => {
    const allUsers = getAllUsers();
    const newProfile = {
      name: username,
      ...details,
      profilePic: null,
    };
    allUsers[username] = newProfile;
    localStorage.setItem('users', JSON.stringify(allUsers));
    localStorage.setItem('currentUser', username);
    setCurrentUser(newProfile);
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    window.location.reload();
  };

  const handleUpdateProfile = (updatedProfile) => {
    const allUsers = getAllUsers();
    allUsers[updatedProfile.name] = updatedProfile;
    localStorage.setItem('users', JSON.stringify(allUsers));
    setCurrentUser(updatedProfile);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    setTheme(newTheme);
  };

  const handleQuizComplete = (careerNode) => {
    setSelectedNode(careerNode);
    setActiveTab('courses');
  };

  const handleExploreColleges = (relevantColleges) => {
    setCollegeState(prev => ({ ...prev, careerFilteredColleges: relevantColleges, isCareerFilterActive: true }));
    setActiveTab('colleges');
  };

  if (!currentUser) {
    return <WelcomeScreen onLoginOrSignup={handleLoginOrSignup} onCompleteSignup={handleCompleteSignup} />;
  }

  return (
    <>
      <div id="appBody">
        <Header
          userProfile={currentUser}
          onProfileClick={() => setProfilePanelOpen(true)}
          onThemeToggle={toggleTheme}
          theme={theme}
        />
        <main>
          <TabNav activeTab={activeTab} onTabClick={setActiveTab} />

          {activeTab === 'quiz' && <Quiz userProfile={currentUser} onQuizComplete={handleQuizComplete} />}
          {activeTab === 'courses' && <CareerPaths selectedNode={selectedNode} setSelectedNode={setSelectedNode} onExplore={handleExploreColleges} />}
          {activeTab === 'colleges' && (
            <NearbyColleges
              collegeState={collegeState}
              setCollegeState={setCollegeState}
              onTabSwitch={setActiveTab}
              onOpenModal={(title, content) => setModalData({ title, content })}
              onFindNearby={handleFindNearby} // Pass the handler down
            />
          )}
          {activeTab === 'timeline' && <Timeline />}
          {/* Add the new component to the render logic */}
          {activeTab === 'resources' && <Resources />}
        </main>
      </div>
      <ProfilePanel isOpen={isProfilePanelOpen} onClose={() => setProfilePanelOpen(false)} userProfile={currentUser} onUpdateProfile={handleUpdateProfile} onLogout={handleLogout} />
      <Modal isOpen={!!modalData} onClose={() => setModalData(null)} title={modalData?.title}>
        {modalData?.content}
      </Modal>
    </>
  );
}

export default App;


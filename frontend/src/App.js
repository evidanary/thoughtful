import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ContactProfile from "./components/ContactProfile";
import ContactList from "./components/ContactList";
import TitleBar from "./components/TitleBar";
import Milestones from "./components/Milestones";
import EmailTemplates from "./components/EmailTemplates";
import ActionItems from "./components/ActionItems";
import BulkEmailModal from "./components/BulkEmailModal";
import ShortcutsModal from "./components/ShortcutsModal";

function AppContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showBulkEmailModal, setShowBulkEmailModal] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (query) => {
    setSearchQuery(query);
    // TODO: Implement search functionality
    console.log("Searching for:", query);
  };

  const handleShowBulkEmail = () => {
    setShowBulkEmailModal(true);
  };

  // Keyboard shortcut listener for global shortcuts
  useEffect(() => {
    let gPressed = false;
    let gPressTimer = null;

    const handleKeyDown = (e) => {
      // Ignore if user is typing in an input/textarea
      const isTyping = ['INPUT', 'TEXTAREA'].includes(e.target.tagName);

      // Cmd+/ or Ctrl+/ - Show shortcuts modal
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        setShowShortcutsModal(prev => !prev);
        return;
      }

      // Escape - Close any open modal
      if (e.key === 'Escape') {
        if (showShortcutsModal) {
          setShowShortcutsModal(false);
        } else if (showBulkEmailModal) {
          setShowBulkEmailModal(false);
        }
        return;
      }

      // Don't process other shortcuts if typing
      if (isTyping) return;

      // Cmd+K or Ctrl+K - Focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search"]');
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
        return;
      }

      // G key navigation - press 'g' then another key
      if (e.key.toLowerCase() === 'g' && !gPressed) {
        gPressed = true;
        // Reset after 1 second if no second key is pressed
        gPressTimer = setTimeout(() => {
          gPressed = false;
        }, 1000);
        return;
      }

      // Second key after 'g'
      if (gPressed) {
        clearTimeout(gPressTimer);
        gPressed = false;

        switch (e.key.toLowerCase()) {
          case 'h':
            // Navigate to home/contacts
            navigate('/');
            break;
          case 'a':
            // Navigate to action items
            navigate('/action-items');
            break;
          case 'm':
            // Navigate to milestones
            navigate('/milestones');
            break;
          case 'e':
            // Navigate to email templates
            navigate('/email-templates');
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (gPressTimer) clearTimeout(gPressTimer);
    };
  }, [showShortcutsModal, showBulkEmailModal, navigate]);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
      <TitleBar
        onSearch={handleSearch}
        onShowBulkEmail={handleShowBulkEmail}
      />
      <Routes>
        <Route path="/" element={<ContactList />} />
        <Route path="/profile/:id" element={<ContactProfileWrapper />} />
        <Route path="/milestones" element={<Milestones />} />
        <Route path="/email-templates" element={<EmailTemplates />} />
        <Route path="/action-items" element={<ActionItems />} />
      </Routes>
      {showBulkEmailModal && (
        <BulkEmailModal onClose={() => setShowBulkEmailModal(false)} />
      )}
      {showShortcutsModal && (
        <ShortcutsModal onClose={() => setShowShortcutsModal(false)} />
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

// Wrapper to extract :id param and pass as contactId
function ContactProfileWrapper() {
  const { id } = useParams();
  return <ContactProfile contactId={id} />;
}

export default App;

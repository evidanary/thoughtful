import { useState } from "react";
import { useParams } from "react-router-dom";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ContactProfile from "./components/ContactProfile";
import ContactList from "./components/ContactList";
import TitleBar from "./components/TitleBar";
import Milestones from "./components/Milestones";
import EmailTemplates from "./components/EmailTemplates";
import ActionItems from "./components/ActionItems";
import BulkEmailModal from "./components/BulkEmailModal";

function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showBulkEmailModal, setShowBulkEmailModal] = useState(false);

  const handleSearch = (query) => {
    setSearchQuery(query);
    // TODO: Implement search functionality
    console.log("Searching for:", query);
  };

  const handleShowBulkEmail = () => {
    setShowBulkEmailModal(true);
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
      <Router>
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
      </Router>
    </div>
  );
}

// Wrapper to extract :id param and pass as contactId
function ContactProfileWrapper() {
  const { id } = useParams();
  return <ContactProfile contactId={id} />;
}

export default App;

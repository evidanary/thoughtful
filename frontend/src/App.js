import { useState } from "react";
import ContactProfile from "./components/ContactProfile";
import TitleBar from "./components/TitleBar";

function App() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query) => {
    setSearchQuery(query);
    // TODO: Implement search functionality
    console.log("Searching for:", query);
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
      <TitleBar onSearch={handleSearch} />
      <div style={{ padding: "20px" }}>
        <ContactProfile contactId="1" />
      </div>
    </div>
  );
}

export default App;

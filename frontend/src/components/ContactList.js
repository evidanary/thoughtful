import { useEffect, useState } from "react";
import { getAllContacts, getContact } from "../api/contacts";
import ContactProfilePreview from "./ContactProfilePreview";

const ContactList = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAllContacts()
      .then(async (data) => {
        // For each contact, fetch full info (notes/tags)
        const contactsWithDetails = await Promise.all(
          data.map(async (contact) => {
            // If notes/tags are not present, fetch them
            if (!contact.notes || !contact.tags) {
              const full = await getContact(contact.id);
              return { ...contact, ...full };
            }
            return contact;
          })
        );
        setContacts(contactsWithDetails);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load contacts");
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{ padding: 32 }}>Loading...</div>;
  if (error) return <div style={{ color: "red", padding: 32 }}>{error}</div>;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 0" }}>
      {contacts.length === 0 ? (
        <div>No contacts found.</div>
      ) : (
        contacts.map((contact) => (
          <ContactProfilePreview key={contact.id} contact={contact} />
        ))
      )}
    </div>
  );
};

export default ContactList;

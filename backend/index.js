const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");

const db = new Database("db.sqlite");
const app = express();
app.use(cors());
app.use(express.json());

app.get("/contacts/:id", (req, res) => {
  const contactId = parseInt(req.params.id);
  console.log("Looking for contact with ID:", contactId, "Type:", typeof contactId);
  
  const contact = db
    .prepare("SELECT * FROM contacts WHERE id = ?")
    .get(contactId);
  console.log("Contact found:", contact);
  
  const tags = db
    .prepare("SELECT name FROM tags WHERE contact_id = ?")
    .all(contactId);
  console.log("Tags found:", tags);
  
  const notes = db
    .prepare(
      "SELECT * FROM notes WHERE contact_id = ? ORDER BY created_at DESC"
    )
    .all(contactId);
  console.log("Notes found:", notes);
  
  const result = { ...contact, tags: tags.map((t) => t.name), notes };
  console.log("Final result:", result);
  
  res.json(result);
});

app.post("/contacts/:id/note", (req, res) => {
  const contactId = parseInt(req.params.id);
  const { content } = req.body;
  const result = db.prepare(
    "INSERT INTO notes (contact_id, content) VALUES (?, ?)"
  ).run(contactId, content);
  res.json({ success: true, id: result.lastInsertRowid });
});

app.post("/contacts/:id/tag", (req, res) => {
  const contactId = parseInt(req.params.id);
  const { name } = req.body;
  const result = db.prepare("INSERT INTO tags (contact_id, name) VALUES (?, ?)").run(
    contactId,
    name
  );
  res.json({ success: true, id: result.lastInsertRowid });
});

app.put("/contacts/:id", (req, res) => {
  try {
    const contactId = parseInt(req.params.id);
    const { name, email, linkedin, company } = req.body;

    console.log("Updating contact:", contactId, "with data:", {
      name,
      email,
      linkedin,
      company,
    });

    const result = db
      .prepare(
        `
      UPDATE contacts 
      SET name = ?, email = ?, linkedin = ?, company = ? 
      WHERE id = ?
    `
      )
      .run(name, email, linkedin, company, contactId);

    console.log("Update result:", result);

    if (result.changes > 0) {
      res.json({ success: true });
    } else {
      console.log("No contact found with ID:", contactId);
      res.status(404).json({ error: "Contact not found" });
    }
  } catch (error) {
    console.error("Error updating contact:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/contacts/:contactId/tags/:tagName", (req, res) => {
  try {
    const contactId = parseInt(req.params.contactId);
    const tagName = req.params.tagName;

    console.log("Deleting tag:", tagName, "from contact:", contactId);

    const result = db
      .prepare(
        `
      DELETE FROM tags 
      WHERE contact_id = ? AND name = ?
    `
      )
      .run(contactId, tagName);

    console.log("Delete result:", result);

    if (result.changes > 0) {
      res.json({ success: true });
    } else {
      console.log("No tag found:", tagName, "for contact:", contactId);
      res.status(404).json({ error: "Tag not found" });
    }
  } catch (error) {
    console.error("Error deleting tag:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/contacts/:contactId/notes/:noteId", (req, res) => {
  try {
    const contactId = parseInt(req.params.contactId);
    const noteId = parseInt(req.params.noteId);
    const { content } = req.body;

    console.log("Updating note:", noteId, "for contact:", contactId);

    const result = db
      .prepare(
        `
      UPDATE notes 
      SET content = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND contact_id = ?
    `
      )
      .run(content, noteId, contactId);

    console.log("Update result:", result);

    if (result.changes > 0) {
      res.json({ success: true });
    } else {
      console.log("No note found:", noteId, "for contact:", contactId);
      res.status(404).json({ error: "Note not found" });
    }
  } catch (error) {
    console.error("Error updating note:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/contacts/:contactId/notes/:noteId", (req, res) => {
  try {
    const contactId = parseInt(req.params.contactId);
    const noteId = parseInt(req.params.noteId);

    console.log("Deleting note:", noteId, "from contact:", contactId);

    const result = db
      .prepare(
        `
      DELETE FROM notes 
      WHERE id = ? AND contact_id = ?
    `
      )
      .run(noteId, contactId);

    console.log("Delete result:", result);

    if (result.changes > 0) {
      res.json({ success: true });
    } else {
      console.log("No note found:", noteId, "for contact:", contactId);
      res.status(404).json({ error: "Note not found" });
    }
  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(3001, () => console.log("Backend running on http://localhost:3001"));

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

app.listen(3001, () => console.log("Backend running on http://localhost:3001"));

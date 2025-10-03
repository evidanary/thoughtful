const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");

const db = new Database("db.sqlite");

// Initialize database schema
try {
  const schemaPath = path.join(__dirname, "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf8");
  db.exec(schema);
  console.log("Database schema initialized successfully");
} catch (error) {
  console.error("Error initializing database schema:", error);
}

const app = express();
app.use(cors());
app.use(express.json());

app.post("/contacts", (req, res) => {
  try {
    const { name, email, linkedin, company } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");
    const result = db
      .prepare(
        "INSERT INTO contacts (name, email, linkedin, company, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)"
      )
      .run(name, email, linkedin, company, now, now);
    const contact = db
      .prepare("SELECT * FROM contacts WHERE id = ?")
      .get(result.lastInsertRowid);
    res.status(201).json(contact);
  } catch (error) {
    console.error("Error creating contact:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/contacts", (req, res) => {
  try {
    // Parse filters from query parameters
    const {
      tags,
      created_after,
      created_before,
      last_activity_after,
      last_activity_before,
    } = req.query;

    // Build WHERE clauses and parameters
    let whereClauses = [];
    let params = {};

    // Tag filter (contacts must have at least one of the specified tags)
    if (tags) {
      const tagList = tags.split(",").map((t) => t.trim());
      whereClauses.push(`
        c.id IN (
          SELECT contact_id FROM tags WHERE name IN (${tagList
            .map((_, i) => `@tag${i}`)
            .join(",")})
        )
      `);
      tagList.forEach((tag, i) => (params[`tag${i}`] = tag));
    }

    // Created date range filter
    if (created_after) {
      whereClauses.push("c.created_at >= @created_after");
      params.created_after = created_after;
    }
    if (created_before) {
      whereClauses.push("c.created_at <= @created_before");
      params.created_before = created_before;
    }

    // Last activity date range filter (computed later)
    let havingClauses = [];
    if (last_activity_after) {
      havingClauses.push("last_activity_date >= @last_activity_after");
      params.last_activity_after = last_activity_after;
    }
    if (last_activity_before) {
      havingClauses.push("last_activity_date <= @last_activity_before");
      params.last_activity_before = last_activity_before;
    }

    // Main query: get contacts, most recent note, and last activity date
    const query = `
      SELECT
        c.*,
        rn.id AS note_id,
        rn.content AS note_content,
        rn.created_at AS note_created_at,
        rn.updated_at AS note_updated_at,
        -- Compute last activity date: max of contact.created_at, note.created_at, note.updated_at
        MAX(
          COALESCE(rn.created_at, c.created_at),
          COALESCE(rn.updated_at, c.created_at),
          c.created_at
        ) AS last_activity_date
      FROM contacts c
      LEFT JOIN (
        SELECT n1.*
        FROM notes n1
        INNER JOIN (
          SELECT contact_id, MAX(created_at) AS max_created
          FROM notes
          GROUP BY contact_id
        ) n2
        ON n1.contact_id = n2.contact_id AND n1.created_at = n2.max_created
      ) rn
      ON c.id = rn.contact_id
      ${whereClauses.length ? "WHERE " + whereClauses.join(" AND ") : ""}
      GROUP BY c.id
      ${havingClauses.length ? "HAVING " + havingClauses.join(" AND ") : ""}
      ORDER BY last_activity_date DESC
    `;

    // Get contacts with note and activity info
    const contacts = db.prepare(query).all(params);

    // For each contact, fetch tags and add as an array
    const contactsWithTags = contacts.map((contact) => {
      const tags = db
        .prepare("SELECT name FROM tags WHERE contact_id = ?")
        .all(contact.id)
        .map((t) => t.name);
      return { ...contact, tags };
    });

    res.json(contactsWithTags);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/contacts/:id", (req, res) => {
  const contactId = parseInt(req.params.id);
  console.log(
    "Looking for contact with ID:",
    contactId,
    "Type:",
    typeof contactId
  );

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
  const result = db
    .prepare("INSERT INTO notes (contact_id, content) VALUES (?, ?)")
    .run(contactId, content);
  res.json({ success: true, id: result.lastInsertRowid });
});

app.post("/contacts/:id/tag", (req, res) => {
  const contactId = parseInt(req.params.id);
  const { name } = req.body;
  const result = db
    .prepare("INSERT INTO tags (contact_id, name) VALUES (?, ?)")
    .run(contactId, name);
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

app.delete("/contacts/:id", (req, res) => {
  try {
    const contactId = parseInt(req.params.id);

    console.log("DELETE /contacts/:id - Received request");
    console.log("Raw ID param:", req.params.id);
    console.log("Parsed contact ID:", contactId);

    // First, let's check if the contact exists
    const existingContact = db
      .prepare("SELECT * FROM contacts WHERE id = ?")
      .get(contactId);

    console.log("Existing contact:", existingContact);

    if (!existingContact) {
      console.log("Contact not found in database");
      return res.status(404).json({ error: "Contact not found" });
    }

    const result = db
      .prepare("DELETE FROM contacts WHERE id = ?")
      .run(contactId);

    console.log("Delete result:", result);

    if (result.changes > 0) {
      console.log("Contact deleted successfully");
      res.json({ success: true });
    } else {
      console.log("No contact found with ID:", contactId);
      res.status(404).json({ error: "Contact not found" });
    }
  } catch (error) {
    console.error("Error deleting contact:", error);
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

// Get all action items from notes containing "@action"
app.get("/action-items", (req, res) => {
  try {
    const actionItems = db.prepare(`
      SELECT 
        n.id as note_id,
        n.content,
        n.created_at as note_created_at,
        n.updated_at as note_updated_at,
        c.id as contact_id,
        c.name as contact_name,
        c.email as contact_email,
        c.company as contact_company
      FROM notes n
      JOIN contacts c ON n.contact_id = c.id
      WHERE n.content LIKE '%@action%'
      ORDER BY n.updated_at DESC
    `).all();
    
    res.json(actionItems);
  } catch (error) {
    console.error("Error fetching action items:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all views
app.get("/views", (req, res) => {
  try {
    const views = db.prepare("SELECT * FROM views ORDER BY id ASC").all();
    // Parse filter_json for each view
    const parsedViews = views.map((view) => ({
      ...view,
      filter: JSON.parse(view.filter_json),
    }));
    res.json(parsedViews);
  } catch (error) {
    console.error("Error fetching views:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/views", (req, res) => {
  try {
    const { label, description, filter_json } = req.body;
    if (!label) return res.status(400).json({ error: "Name is required" });
    if (!filter_json)
      return res.status(400).json({ error: "Filter is required" });

    const now = new Date().toISOString().slice(0, 19).replace("T", " ");
    const result = db
      .prepare(
        "INSERT INTO views (label, description, filter_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?)"
      )
      .run(label, description, filter_json, now, now);

    const view = db
      .prepare("SELECT * FROM views WHERE id = ?")
      .get(result.lastInsertRowid);

    res.status(201).json({
      ...view,
      filter: JSON.parse(view.filter_json),
    });
  } catch (error) {
    console.error("Error creating view:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/tags", (req, res) => {
  try {
    const tags = db
      .prepare("SELECT DISTINCT name FROM tags ORDER BY name COLLATE NOCASE")
      .all();
    // Return as a flat array of tag names
    res.json(tags.map((t) => t.name));
  } catch (error) {
    console.error("Error fetching tags:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/activity", (req, res) => {
  try {
    // Parse filters from query parameters (same as /contacts)
    const {
      tags,
      created_after,
      created_before,
      last_activity_after,
      last_activity_before,
    } = req.query;

    // Build WHERE clauses for contacts that match the filters
    let contactWhereClauses = [];
    let params = {};

    if (tags) {
      const tagList = tags.split(",").map((t) => t.trim());
      contactWhereClauses.push(`
        c.id IN (
          SELECT contact_id FROM tags WHERE name IN (${tagList
            .map((_, i) => `@tag${i}`)
            .join(",")})
        )
      `);
      tagList.forEach((tag, i) => (params[`tag${i}`] = tag));
    }

    if (created_after) {
      contactWhereClauses.push("c.created_at >= @created_after");
      params.created_after = created_after;
    }
    if (created_before) {
      contactWhereClauses.push("c.created_at <= @created_before");
      params.created_before = created_before;
    }

    // Get activity for contacts that match the filters
    const query = `
      SELECT 
        a.*,
        c.name as contact_name,
        c.id as contact_id
      FROM activity a
      INNER JOIN contacts c ON a.contact_id = c.id
      ${
        contactWhereClauses.length
          ? "WHERE " + contactWhereClauses.join(" AND ")
          : ""
      }
      ORDER BY a.created_at DESC
    `;

    const activities = db.prepare(query).all(params);
    res.json(activities);
  } catch (error) {
    console.error("Error fetching activity:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Email Templates endpoints
app.get("/email-templates", (req, res) => {
  try {
    const templates = db
      .prepare("SELECT * FROM email_templates ORDER BY created_at DESC")
      .all();
    res.json(templates);
  } catch (error) {
    console.error("Error fetching email templates:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/email-templates", (req, res) => {
  try {
    const { name, subject, body } = req.body;
    if (!name)
      return res.status(400).json({ error: "Template name is required" });
    if (!subject)
      return res.status(400).json({ error: "Email subject is required" });
    if (!body) return res.status(400).json({ error: "Email body is required" });

    const now = new Date().toISOString().slice(0, 19).replace("T", " ");
    const result = db
      .prepare(
        "INSERT INTO email_templates (name, subject, body, created_at, updated_at) VALUES (?, ?, ?, ?, ?)"
      )
      .run(name, subject, body, now, now);

    const template = db
      .prepare("SELECT * FROM email_templates WHERE id = ?")
      .get(result.lastInsertRowid);

    res.status(201).json(template);
  } catch (error) {
    console.error("Error creating email template:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/email-templates/:id", (req, res) => {
  try {
    const templateId = parseInt(req.params.id);
    const { name, subject, body } = req.body;

    if (!name)
      return res.status(400).json({ error: "Template name is required" });
    if (!subject)
      return res.status(400).json({ error: "Email subject is required" });
    if (!body) return res.status(400).json({ error: "Email body is required" });

    const now = new Date().toISOString().slice(0, 19).replace("T", " ");
    const result = db
      .prepare(
        "UPDATE email_templates SET name = ?, subject = ?, body = ?, updated_at = ? WHERE id = ?"
      )
      .run(name, subject, body, now, templateId);

    if (result.changes > 0) {
      const template = db
        .prepare("SELECT * FROM email_templates WHERE id = ?")
        .get(templateId);
      res.json(template);
    } else {
      res.status(404).json({ error: "Template not found" });
    }
  } catch (error) {
    console.error("Error updating email template:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/email-templates/:id", (req, res) => {
  try {
    const templateId = parseInt(req.params.id);
    const result = db
      .prepare("DELETE FROM email_templates WHERE id = ?")
      .run(templateId);

    if (result.changes > 0) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Template not found" });
    }
  } catch (error) {
    console.error("Error deleting email template:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(3001, () => console.log("Backend running on http://localhost:3001"));

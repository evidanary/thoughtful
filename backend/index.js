const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");
const auth = require("./auth");
const { displayNameFor } = require("./allowed-users");

const PORT = Number(process.env.PORT || 3002);
const IS_PRODUCTION = process.env.NODE_ENV === "production";

// Locally the DB sits next to the code; on Fly it lives on the mounted volume.
const DB_PATH = process.env.DB_PATH || path.join(__dirname, "db.sqlite");

// First boot on a fresh volume: seed it from the copy committed to the repo so
// a deploy starts with the existing rolodex rather than an empty one.
if (DB_PATH !== path.join(__dirname, "db.sqlite") && !fs.existsSync(DB_PATH)) {
  const seed = path.join(__dirname, "db.sqlite");
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  if (fs.existsSync(seed)) {
    fs.copyFileSync(seed, DB_PATH);
    console.log(`Seeded ${DB_PATH} from the committed db.sqlite`);
  }
}

auth.assertConfigured();

const db = new Database(DB_PATH);

// Initialize database schema
try {
  const schemaPath = path.join(__dirname, "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf8");
  db.exec(schema);
  console.log("Database schema initialized successfully");
} catch (error) {
  console.error("Error initializing database schema:", error);
}

// `schema.sql` is CREATE TABLE IF NOT EXISTS, so it cannot add a column to a
// table that already exists. These run every boot and are no-ops once applied.
const addColumnIfMissing = (table, column, definition) => {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all();
  if (columns.some((c) => c.name === column)) return;
  db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  console.log(`Added ${table}.${column}`);
};

try {
  // Attribution: who created a record and who last touched it
  addColumnIfMissing("contacts", "created_by", "TEXT");
  addColumnIfMissing("contacts", "updated_by", "TEXT");
  addColumnIfMissing("notes", "created_by", "TEXT");
  addColumnIfMissing("notes", "updated_by", "TEXT");
  addColumnIfMissing("campaigns", "created_by", "TEXT");
} catch (error) {
  console.error("Error applying column migrations:", error);
}

const app = express();

// Cookies must survive the cross-origin hop from the CRA dev server on :3000.
// In production the API and the UI share an origin, so this list is dev-only.
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      ...(process.env.APP_ORIGIN ? [process.env.APP_ORIGIN] : []),
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(auth.attachUser);

// The email recorded against writes made by the current request
const actor = (req) => (req.user && req.user.email) || null;

// --- Auth endpoints (the only routes reachable without a session) ---

app.get("/auth/config", (req, res) => {
  res.json({
    authEnabled: auth.AUTH_ENABLED,
    googleClientId: auth.GOOGLE_CLIENT_ID,
    sessionTtlHours: auth.SESSION_TTL_HOURS,
  });
});

app.get("/auth/me", (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Not signed in" });
  res.json({
    email: req.user.email,
    name: req.user.name,
    // When this session goes stale and Google has to vouch again
    expiresAt: req.user.exp ? req.user.exp * 1000 : null,
  });
});

app.post("/auth/google", async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential && auth.AUTH_ENABLED)
      return res.status(400).json({ error: "Missing Google credential" });
    const user = await auth.verifyGoogleIdToken(credential);
    auth.issueSession(res, user);
    res.json({ email: user.email, name: user.name });
  } catch (error) {
    console.error("Google sign-in rejected:", error.message);
    const notAllowed = error.code === "NOT_ALLOWED";
    res.status(notAllowed ? 403 : 401).json({
      error: notAllowed
        ? "That Google account does not have access to Thoughtful."
        : "Could not verify that Google sign-in.",
    });
  }
});

app.post("/auth/logout", (req, res) => {
  auth.clearSession(res);
  res.json({ success: true });
});

// Top-level path segments that carry data. Everything here needs a session;
// anything else is the static shell (index.html, JS, CSS), which is public so
// that signed-out people can reach the sign-in screen.
const API_SEGMENTS = new Set([
  "contacts",
  "tags",
  "tag-definitions",
  "notes",
  "views",
  "activity",
  "action-items",
  "email-templates",
  "quick-notes",
  "milestone-notes",
  "search",
  "campaigns",
  "stage-templates",
]);

// The built React app, served from this same process in production. Registered
// before the API routes is safe — no static file shares a name with an endpoint.
const FRONTEND_BUILD = path.join(__dirname, "public");
const HAS_FRONTEND_BUILD = fs.existsSync(FRONTEND_BUILD);
if (HAS_FRONTEND_BUILD) {
  app.use(express.static(FRONTEND_BUILD));
}

app.use((req, res, next) => {
  const segment = req.path.split("/")[1];
  if (!API_SEGMENTS.has(segment)) return next();

  // Client-side routes collide with API paths (/campaigns/3 is both). A browser
  // navigating there wants the app shell; only a data request wants JSON — and
  // that is what actually needs the session.
  const wantsHtml =
    req.method === "GET" && req.accepts(["json", "html"]) === "html";
  if (wantsHtml && HAS_FRONTEND_BUILD) {
    return res.sendFile(path.join(FRONTEND_BUILD, "index.html"));
  }

  return auth.requireAuth(req, res, next);
});

app.post("/contacts", (req, res) => {
  try {
    const { name, email, linkedin, company } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");
    const result = db
      .prepare(
        "INSERT INTO contacts (name, email, linkedin, company, created_at, updated_at, created_by, updated_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
      )
      .run(name, email, linkedin, company, now, now, actor(req), actor(req));
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
    .prepare(
      "INSERT INTO notes (contact_id, content, created_by) VALUES (?, ?, ?)"
    )
    .run(contactId, content, actor(req));
  res.json({ success: true, id: result.lastInsertRowid });
});

app.post("/contacts/:id/tag", (req, res) => {
  const contactId = parseInt(req.params.id);
  const { name } = req.body;
  const result = db
    .prepare("INSERT INTO tags (contact_id, name) VALUES (?, ?)")
    .run(contactId, name);
  // Ensure a tag definition exists for this name
  db.prepare("INSERT OR IGNORE INTO tag_definitions (name) VALUES (?)").run(name);
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
      SET name = ?, email = ?, linkedin = ?, company = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `
      )
      .run(name, email, linkedin, company, actor(req), contactId);

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
      SET content = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ?
      WHERE id = ? AND contact_id = ?
    `
      )
      .run(content, actor(req), noteId, contactId);

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

// Get all action items from notes containing "@action" or "@ask"
app.get("/action-items", (req, res) => {
  try {
    const actionItems = db
      .prepare(
        `
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
      WHERE n.content LIKE '%@action%' OR n.content LIKE '%@ask%'
      ORDER BY n.updated_at DESC
    `
      )
      .all();
    
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

// Global Search endpoint
app.get("/search", (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return res.json({ contacts: [], notes: [] });

    const term = `%${q.toLowerCase()}%`;

    const contacts = db.prepare(`
      SELECT id, name, email, company, linkedin, created_at
      FROM contacts
      WHERE LOWER(name) LIKE ?
         OR LOWER(COALESCE(email, '')) LIKE ?
         OR LOWER(COALESCE(company, '')) LIKE ?
      ORDER BY name COLLATE NOCASE
    `).all(term, term, term);

    const notes = db.prepare(`
      SELECT n.id, n.content, n.created_at, n.contact_id,
             c.name as contact_name, c.company as contact_company
      FROM notes n
      JOIN contacts c ON c.id = n.contact_id
      WHERE LOWER(n.content) LIKE ?
      ORDER BY n.created_at DESC
    `).all(term);

    res.json({ contacts, notes });
  } catch (error) {
    console.error("Error performing search:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Tag Definitions endpoints
app.get("/tag-definitions", (req, res) => {
  try {
    const defs = db.prepare(`
      SELECT td.*, COUNT(t.id) as usage_count
      FROM tag_definitions td
      LEFT JOIN tags t ON t.name = td.name
      GROUP BY td.id
      ORDER BY td.name COLLATE NOCASE
    `).all();
    res.json(defs);
  } catch (error) {
    console.error("Error fetching tag definitions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/tag-definitions", (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");
    const result = db
      .prepare("INSERT INTO tag_definitions (name, description, created_at, updated_at) VALUES (?, ?, ?, ?)")
      .run(name.trim(), description || "", now, now);
    const def = db.prepare("SELECT * FROM tag_definitions WHERE id = ?").get(result.lastInsertRowid);
    res.status(201).json(def);
  } catch (error) {
    if (error.message.includes("UNIQUE")) {
      return res.status(409).json({ error: "Tag already exists" });
    }
    console.error("Error creating tag definition:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/tag-definitions/:id", (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");
    const result = db
      .prepare("UPDATE tag_definitions SET name = ?, description = ?, updated_at = ? WHERE id = ?")
      .run(name.trim(), description || "", now, id);
    if (result.changes === 0) return res.status(404).json({ error: "Tag not found" });
    res.json(db.prepare("SELECT * FROM tag_definitions WHERE id = ?").get(id));
  } catch (error) {
    if (error.message.includes("UNIQUE")) {
      return res.status(409).json({ error: "Tag name already exists" });
    }
    console.error("Error updating tag definition:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/tag-definitions/:id", (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = db.prepare("DELETE FROM tag_definitions WHERE id = ?").run(id);
    if (result.changes === 0) return res.status(404).json({ error: "Tag not found" });
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting tag definition:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Quick Notes endpoints
app.get("/quick-notes", (req, res) => {
  try {
    const notes = db
      .prepare(
        `SELECT qn.*, c.name as contact_name
         FROM quick_notes qn
         LEFT JOIN contacts c ON qn.contact_id = c.id
         ORDER BY qn.created_at DESC`
      )
      .all();
    res.json(notes);
  } catch (error) {
    console.error("Error fetching quick notes:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/quick-notes", (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: "Content is required" });
    const result = db
      .prepare("INSERT INTO quick_notes (content) VALUES (?)")
      .run(content);
    const note = db
      .prepare("SELECT * FROM quick_notes WHERE id = ?")
      .get(result.lastInsertRowid);
    res.status(201).json(note);
  } catch (error) {
    console.error("Error creating quick note:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/quick-notes/:id/associate", (req, res) => {
  try {
    const noteId = parseInt(req.params.id);
    const { contact_id } = req.body;
    if (!contact_id) return res.status(400).json({ error: "contact_id is required" });

    const quickNote = db.prepare("SELECT * FROM quick_notes WHERE id = ?").get(noteId);
    if (!quickNote) return res.status(404).json({ error: "Quick note not found" });

    const now = new Date().toISOString().slice(0, 19).replace("T", " ");

    // Insert as a regular note on the contact
    db.prepare("INSERT INTO notes (contact_id, content) VALUES (?, ?)").run(contact_id, quickNote.content);

    // Mark quick note as associated
    db.prepare("UPDATE quick_notes SET contact_id = ?, associated_at = ? WHERE id = ?").run(contact_id, now, noteId);

    res.json({ success: true });
  } catch (error) {
    console.error("Error associating quick note:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/quick-notes/:id", (req, res) => {
  try {
    const noteId = parseInt(req.params.id);
    const result = db.prepare("DELETE FROM quick_notes WHERE id = ?").run(noteId);
    if (result.changes > 0) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Quick note not found" });
    }
  } catch (error) {
    console.error("Error deleting quick note:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/milestone-notes", (req, res) => {
  try {
    const rows = db.prepare("SELECT tab, milestone_id, note FROM milestone_notes").all();
    const result = {};
    for (const row of rows) {
      result[`${row.tab}-${row.milestone_id}`] = row.note;
    }
    res.json(result);
  } catch (err) {
    console.error("Error fetching milestone notes:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/milestone-notes", (req, res) => {
  try {
    const { tab, milestone_id, note } = req.body;
    if (!tab || milestone_id == null) return res.status(400).json({ error: "tab and milestone_id are required" });
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");
    db.prepare(
      `INSERT INTO milestone_notes (tab, milestone_id, note, updated_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(tab, milestone_id) DO UPDATE SET note = excluded.note, updated_at = excluded.updated_at`
    ).run(tab, String(milestone_id), note || "", now);
    res.json({ success: true });
  } catch (err) {
    console.error("Error saving milestone note:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ============================================================
// Campaigns
// ============================================================

const DEFAULT_STAGES = [
  { name: "Reached out", color: "#00BFFF" },
  { name: "Follow-up", color: "#3FA9F5" },
  { name: "Last email", color: "#7B68EE" },
  { name: "Engaged", color: "#FFB6C1" },
  { name: "Actively engaged", color: "#FF69B4" },
  { name: "Closed", color: "#4B0082" },
];

// Seed the default stage template the first time the table is empty
try {
  const templateCount = db
    .prepare("SELECT COUNT(*) AS n FROM stage_templates")
    .get().n;
  if (templateCount === 0) {
    const insert = db.prepare(
      "INSERT INTO stage_templates (name, position, color) VALUES (?, ?, ?)"
    );
    DEFAULT_STAGES.forEach((stage, i) => insert.run(stage.name, i, stage.color));
    console.log("Seeded default campaign stage template");
  }
} catch (error) {
  console.error("Error seeding stage templates:", error);
}

const nowStamp = () => new Date().toISOString().slice(0, 19).replace("T", " ");

const getStages = (campaignId) =>
  db
    .prepare(
      "SELECT * FROM campaign_stages WHERE campaign_id = ? ORDER BY position ASC, id ASC"
    )
    .all(campaignId);

// Contacts in a campaign, with the contact record flattened in
const getCampaignContacts = (campaignId) =>
  db
    .prepare(
      `SELECT
         cc.id AS membership_id,
         cc.stage_id,
         cc.notes AS campaign_notes,
         cc.added_at,
         cc.stage_changed_at,
         c.id, c.name, c.email, c.linkedin, c.company
       FROM campaign_contacts cc
       JOIN contacts c ON c.id = cc.contact_id
       WHERE cc.campaign_id = ?
       ORDER BY c.name COLLATE NOCASE ASC`
    )
    .all(campaignId);

const getCampaignDetail = (campaignId) => {
  const campaign = db
    .prepare("SELECT * FROM campaigns WHERE id = ?")
    .get(campaignId);
  if (!campaign) return null;
  const stages = getStages(campaignId);
  const contacts = getCampaignContacts(campaignId);
  const counts = {};
  stages.forEach((s) => (counts[s.id] = 0));
  let unassigned = 0;
  contacts.forEach((c) => {
    if (c.stage_id && counts[c.stage_id] !== undefined) counts[c.stage_id] += 1;
    else unassigned += 1;
  });
  return {
    ...campaign,
    stages: stages.map((s) => ({ ...s, contact_count: counts[s.id] || 0 })),
    contacts,
    contact_count: contacts.length,
    unassigned_count: unassigned,
  };
};

// Copy the default template into a campaign
const applyDefaultStages = (campaignId) => {
  const templates = db
    .prepare("SELECT * FROM stage_templates ORDER BY position ASC, id ASC")
    .all();
  const source = templates.length
    ? templates
    : DEFAULT_STAGES.map((s, i) => ({ ...s, position: i }));
  const insert = db.prepare(
    "INSERT INTO campaign_stages (campaign_id, name, position, color) VALUES (?, ?, ?, ?)"
  );
  source.forEach((s, i) => insert.run(campaignId, s.name, i, s.color || "#4B0082"));
};

// --- Stage template (the default set for new campaigns) ---

app.get("/stage-templates", (req, res) => {
  try {
    res.json(
      db
        .prepare("SELECT * FROM stage_templates ORDER BY position ASC, id ASC")
        .all()
    );
  } catch (error) {
    console.error("Error fetching stage templates:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Replaces the whole template in one shot — the editor sends the full list
app.put("/stage-templates", (req, res) => {
  try {
    const { stages } = req.body;
    if (!Array.isArray(stages))
      return res.status(400).json({ error: "stages array is required" });
    const clean = stages
      .map((s) => ({ name: (s.name || "").trim(), color: s.color || "#4B0082" }))
      .filter((s) => s.name);
    if (!clean.length)
      return res.status(400).json({ error: "At least one stage is required" });

    const replace = db.transaction(() => {
      db.prepare("DELETE FROM stage_templates").run();
      const insert = db.prepare(
        "INSERT INTO stage_templates (name, position, color) VALUES (?, ?, ?)"
      );
      clean.forEach((s, i) => insert.run(s.name, i, s.color));
    });
    replace();

    res.json(
      db
        .prepare("SELECT * FROM stage_templates ORDER BY position ASC, id ASC")
        .all()
    );
  } catch (error) {
    console.error("Error saving stage templates:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// --- Campaigns ---

app.get("/campaigns", (req, res) => {
  try {
    const { status } = req.query;
    const campaigns = db
      .prepare(
        `SELECT * FROM campaigns
         ${status ? "WHERE status = @status" : ""}
         ORDER BY created_at DESC, id DESC`
      )
      .all(status ? { status } : {});

    // Stage breakdown per campaign so the list can show counts without N fetches
    const withStages = campaigns.map((campaign) => {
      const stages = db
        .prepare(
          `SELECT s.*, (
             SELECT COUNT(*) FROM campaign_contacts cc WHERE cc.stage_id = s.id
           ) AS contact_count
           FROM campaign_stages s
           WHERE s.campaign_id = ?
           ORDER BY s.position ASC, s.id ASC`
        )
        .all(campaign.id);
      const contactCount = db
        .prepare("SELECT COUNT(*) AS n FROM campaign_contacts WHERE campaign_id = ?")
        .get(campaign.id).n;
      return { ...campaign, stages, contact_count: contactCount };
    });

    res.json(withStages);
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Combined view across several campaigns — must be declared before /campaigns/:id
app.get("/campaigns/combined", (req, res) => {
  try {
    const ids = String(req.query.ids || "")
      .split(",")
      .map((id) => parseInt(id, 10))
      .filter((id) => !Number.isNaN(id));
    if (!ids.length) return res.json({ campaigns: [], rows: [] });

    const campaigns = ids
      .map((id) => getCampaignDetail(id))
      .filter(Boolean)
      .map(({ contacts, ...rest }) => ({ ...rest, contacts }));

    // Roll every membership up by contact so one row = one person
    const rowsByContact = new Map();
    campaigns.forEach((campaign) => {
      const stageById = {};
      campaign.stages.forEach((s) => (stageById[s.id] = s));
      campaign.contacts.forEach((c) => {
        if (!rowsByContact.has(c.id)) {
          rowsByContact.set(c.id, {
            contact: {
              id: c.id,
              name: c.name,
              email: c.email,
              company: c.company,
              linkedin: c.linkedin,
            },
            entries: {},
          });
        }
        const stage = c.stage_id ? stageById[c.stage_id] : null;
        rowsByContact.get(c.id).entries[campaign.id] = {
          campaign_id: campaign.id,
          campaign_name: campaign.name,
          stage_id: c.stage_id,
          stage_name: stage ? stage.name : null,
          stage_color: stage ? stage.color : null,
          stage_position: stage ? stage.position : null,
        };
      });
    });

    const rows = Array.from(rowsByContact.values()).sort((a, b) =>
      a.contact.name.localeCompare(b.contact.name)
    );

    res.json({
      campaigns: campaigns.map(({ contacts, ...rest }) => rest),
      rows,
    });
  } catch (error) {
    console.error("Error building combined campaign view:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/campaigns/:id", (req, res) => {
  try {
    const detail = getCampaignDetail(parseInt(req.params.id, 10));
    if (!detail) return res.status(404).json({ error: "Campaign not found" });
    res.json(detail);
  } catch (error) {
    console.error("Error fetching campaign:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/campaigns", (req, res) => {
  try {
    const { name, description, goal, status, start_date, end_date } = req.body;
    if (!name || !name.trim())
      return res.status(400).json({ error: "Name is required" });
    const now = nowStamp();
    const result = db
      .prepare(
        `INSERT INTO campaigns (name, description, goal, status, start_date, end_date, created_at, updated_at, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        name.trim(),
        description || "",
        goal || "",
        status || "active",
        start_date || null,
        end_date || null,
        now,
        now,
        actor(req)
      );
    // Every new campaign starts from the default stage template
    applyDefaultStages(result.lastInsertRowid);
    res.status(201).json(getCampaignDetail(result.lastInsertRowid));
  } catch (error) {
    console.error("Error creating campaign:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/campaigns/:id", (req, res) => {
  try {
    const campaignId = parseInt(req.params.id, 10);
    const existing = db
      .prepare("SELECT * FROM campaigns WHERE id = ?")
      .get(campaignId);
    if (!existing) return res.status(404).json({ error: "Campaign not found" });

    const { name, description, goal, status, start_date, end_date } = req.body;
    db.prepare(
      `UPDATE campaigns
       SET name = ?, description = ?, goal = ?, status = ?, start_date = ?, end_date = ?, updated_at = ?
       WHERE id = ?`
    ).run(
      name !== undefined ? name : existing.name,
      description !== undefined ? description : existing.description,
      goal !== undefined ? goal : existing.goal,
      status !== undefined ? status : existing.status,
      start_date !== undefined ? start_date || null : existing.start_date,
      end_date !== undefined ? end_date || null : existing.end_date,
      nowStamp(),
      campaignId
    );
    res.json(getCampaignDetail(campaignId));
  } catch (error) {
    console.error("Error updating campaign:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/campaigns/:id", (req, res) => {
  try {
    const campaignId = parseInt(req.params.id, 10);
    // No ON DELETE CASCADE enforcement without foreign_keys pragma — clean up by hand
    db.prepare("DELETE FROM campaign_contacts WHERE campaign_id = ?").run(campaignId);
    db.prepare("DELETE FROM campaign_stages WHERE campaign_id = ?").run(campaignId);
    const result = db.prepare("DELETE FROM campaigns WHERE id = ?").run(campaignId);
    if (!result.changes)
      return res.status(404).json({ error: "Campaign not found" });
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting campaign:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// --- Per-campaign stages ---

app.get("/campaigns/:id/stages", (req, res) => {
  try {
    res.json(getStages(parseInt(req.params.id, 10)));
  } catch (error) {
    console.error("Error fetching campaign stages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/campaigns/:id/stages", (req, res) => {
  try {
    const campaignId = parseInt(req.params.id, 10);
    const { name, color } = req.body;
    if (!name || !name.trim())
      return res.status(400).json({ error: "Stage name is required" });
    const maxPos = db
      .prepare(
        "SELECT COALESCE(MAX(position), -1) AS p FROM campaign_stages WHERE campaign_id = ?"
      )
      .get(campaignId).p;
    db.prepare(
      "INSERT INTO campaign_stages (campaign_id, name, position, color) VALUES (?, ?, ?, ?)"
    ).run(campaignId, name.trim(), maxPos + 1, color || "#4B0082");
    res.status(201).json(getStages(campaignId));
  } catch (error) {
    console.error("Error adding campaign stage:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Replaces a campaign's whole stage list — used by the stage editor.
// Stages sent with an id keep their id (and their contacts); the rest are new.
app.put("/campaigns/:id/stages", (req, res) => {
  try {
    const campaignId = parseInt(req.params.id, 10);
    const { stages } = req.body;
    if (!Array.isArray(stages))
      return res.status(400).json({ error: "stages array is required" });
    const clean = stages
      .map((s) => ({
        id: s.id ? parseInt(s.id, 10) : null,
        name: (s.name || "").trim(),
        color: s.color || "#4B0082",
      }))
      .filter((s) => s.name);
    if (!clean.length)
      return res.status(400).json({ error: "At least one stage is required" });

    const keptIds = clean.map((s) => s.id).filter(Boolean);
    const existing = getStages(campaignId);
    const removed = existing.filter((s) => !keptIds.includes(s.id));

    const save = db.transaction(() => {
      clean.forEach((stage, i) => {
        if (stage.id) {
          db.prepare(
            "UPDATE campaign_stages SET name = ?, position = ?, color = ?, updated_at = ? WHERE id = ? AND campaign_id = ?"
          ).run(stage.name, i, stage.color, nowStamp(), stage.id, campaignId);
        } else {
          const result = db
            .prepare(
              "INSERT INTO campaign_stages (campaign_id, name, position, color) VALUES (?, ?, ?, ?)"
            )
            .run(campaignId, stage.name, i, stage.color);
          stage.id = result.lastInsertRowid;
        }
      });
      // Contacts sitting in a deleted stage fall back to the first remaining one
      if (removed.length) {
        const fallback = clean[0].id;
        removed.forEach((stage) => {
          db.prepare(
            "UPDATE campaign_contacts SET stage_id = ?, stage_changed_at = ? WHERE campaign_id = ? AND stage_id = ?"
          ).run(fallback, nowStamp(), campaignId, stage.id);
          db.prepare("DELETE FROM campaign_stages WHERE id = ?").run(stage.id);
        });
      }
    });
    save();

    res.json(getCampaignDetail(campaignId));
  } catch (error) {
    console.error("Error saving campaign stages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/campaigns/:id/stages/:stageId", (req, res) => {
  try {
    const campaignId = parseInt(req.params.id, 10);
    const stageId = parseInt(req.params.stageId, 10);
    const stages = getStages(campaignId);
    if (stages.length <= 1)
      return res
        .status(400)
        .json({ error: "A campaign needs at least one stage" });
    const remaining = stages.filter((s) => s.id !== stageId);
    db.prepare(
      "UPDATE campaign_contacts SET stage_id = ?, stage_changed_at = ? WHERE campaign_id = ? AND stage_id = ?"
    ).run(remaining[0].id, nowStamp(), campaignId, stageId);
    db.prepare("DELETE FROM campaign_stages WHERE id = ? AND campaign_id = ?").run(
      stageId,
      campaignId
    );
    res.json(getCampaignDetail(campaignId));
  } catch (error) {
    console.error("Error deleting campaign stage:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// --- Campaign membership ---

app.post("/campaigns/:id/contacts", (req, res) => {
  try {
    const campaignId = parseInt(req.params.id, 10);
    const campaign = db
      .prepare("SELECT id FROM campaigns WHERE id = ?")
      .get(campaignId);
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });

    const { contact_ids, contact_id, stage_id } = req.body;
    const ids = (contact_ids || (contact_id ? [contact_id] : []))
      .map((id) => parseInt(id, 10))
      .filter((id) => !Number.isNaN(id));
    if (!ids.length)
      return res.status(400).json({ error: "contact_ids is required" });

    const stages = getStages(campaignId);
    const targetStage = stage_id || (stages.length ? stages[0].id : null);
    const now = nowStamp();

    const insert = db.prepare(
      `INSERT INTO campaign_contacts (campaign_id, contact_id, stage_id, added_at, stage_changed_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(campaign_id, contact_id) DO NOTHING`
    );
    const addAll = db.transaction(() => {
      ids.forEach((id) => insert.run(campaignId, id, targetStage, now, now));
    });
    addAll();

    res.status(201).json(getCampaignDetail(campaignId));
  } catch (error) {
    console.error("Error adding contacts to campaign:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/campaigns/:id/contacts/:contactId", (req, res) => {
  try {
    const campaignId = parseInt(req.params.id, 10);
    const contactId = parseInt(req.params.contactId, 10);
    const membership = db
      .prepare(
        "SELECT * FROM campaign_contacts WHERE campaign_id = ? AND contact_id = ?"
      )
      .get(campaignId, contactId);
    if (!membership)
      return res.status(404).json({ error: "Contact is not in this campaign" });

    const { stage_id, notes } = req.body;
    if (stage_id !== undefined) {
      db.prepare(
        "UPDATE campaign_contacts SET stage_id = ?, stage_changed_at = ? WHERE id = ?"
      ).run(stage_id === null ? null : parseInt(stage_id, 10), nowStamp(), membership.id);
    }
    if (notes !== undefined) {
      db.prepare("UPDATE campaign_contacts SET notes = ? WHERE id = ?").run(
        notes,
        membership.id
      );
    }
    res.json(getCampaignDetail(campaignId));
  } catch (error) {
    console.error("Error updating campaign membership:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/campaigns/:id/contacts/:contactId", (req, res) => {
  try {
    const campaignId = parseInt(req.params.id, 10);
    const contactId = parseInt(req.params.contactId, 10);
    const result = db
      .prepare(
        "DELETE FROM campaign_contacts WHERE campaign_id = ? AND contact_id = ?"
      )
      .run(campaignId, contactId);
    if (!result.changes)
      return res.status(404).json({ error: "Contact is not in this campaign" });
    res.json(getCampaignDetail(campaignId));
  } catch (error) {
    console.error("Error removing contact from campaign:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Campaigns a single contact belongs to, with their current stage in each
app.get("/contacts/:id/campaigns", (req, res) => {
  try {
    const contactId = parseInt(req.params.id, 10);
    res.json(
      db
        .prepare(
          `SELECT
             cc.campaign_id,
             cc.stage_id,
             cc.notes AS campaign_notes,
             cc.added_at,
             cc.stage_changed_at,
             ca.name AS campaign_name,
             ca.description,
             ca.status,
             ca.start_date,
             ca.end_date,
             s.name AS stage_name,
             s.color AS stage_color,
             s.position AS stage_position,
             (SELECT COUNT(*) FROM campaign_stages WHERE campaign_id = ca.id) AS stage_count
           FROM campaign_contacts cc
           JOIN campaigns ca ON ca.id = cc.campaign_id
           LEFT JOIN campaign_stages s ON s.id = cc.stage_id
           WHERE cc.contact_id = ?
           ORDER BY ca.created_at DESC`
        )
        .all(contactId)
    );
  } catch (error) {
    console.error("Error fetching contact campaigns:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// SPA fallback: any path the API did not claim renders index.html and lets
// React Router take over (so /campaigns/3 survives a page refresh).
if (HAS_FRONTEND_BUILD) {
  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(FRONTEND_BUILD, "index.html"));
  });
}

app.listen(PORT, () =>
  console.log(
    `Backend running on http://localhost:${PORT} ` +
      `(auth ${auth.AUTH_ENABLED ? "on" : "OFF — local dev"}, ` +
      `sessions last ${auth.SESSION_TTL_HOURS}h)`
  )
);

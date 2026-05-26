CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    linkedin TEXT,
    company TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contact_id INTEGER,
    name TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(contact_id) REFERENCES contacts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contact_id INTEGER,
    content TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(contact_id) REFERENCES contacts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS views (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    label TEXT NOT NULL,
    description TEXT,
    filter_json TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activity (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contact_id INTEGER,
    activity_type TEXT NOT NULL, -- 'contact_added', 'note_added', 'note_edited', 'tag_added', 'tag_removed'
    description TEXT,
    metadata TEXT, -- JSON string for additional data like note content, tag name, etc.
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(contact_id) REFERENCES contacts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS email_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tag_definitions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT DEFAULT '',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quick_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    contact_id INTEGER,
    associated_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(contact_id) REFERENCES contacts(id) ON DELETE SET NULL
);

-- Trigger for contact creation
CREATE TRIGGER IF NOT EXISTS track_contact_added
AFTER INSERT ON contacts
BEGIN
    INSERT INTO activity (contact_id, activity_type, description, metadata)
    VALUES (NEW.id, 'contact_added', 'Contact added', json_object('name', NEW.name));
END;

-- Trigger for note creation
CREATE TRIGGER IF NOT EXISTS track_note_added
AFTER INSERT ON notes
BEGIN
    INSERT INTO activity (contact_id, activity_type, description, metadata)
    VALUES (NEW.contact_id, 'note_added', 'Note added', json_object('content', substr(NEW.content, 1, 50)));
END;

-- Trigger for note updates
CREATE TRIGGER IF NOT EXISTS track_note_edited
AFTER UPDATE ON notes
BEGIN
    INSERT INTO activity (contact_id, activity_type, description, metadata)
    VALUES (NEW.contact_id, 'note_edited', 'Note edited', json_object('content', substr(NEW.content, 1, 50)));
END;

-- Trigger for tag addition
CREATE TRIGGER IF NOT EXISTS track_tag_added
AFTER INSERT ON tags
BEGIN
    INSERT INTO activity (contact_id, activity_type, description, metadata)
    VALUES (NEW.contact_id, 'tag_added', 'Tag added', json_object('tag', NEW.name));
END;

-- Trigger for tag removal
CREATE TRIGGER IF NOT EXISTS track_tag_removed
AFTER DELETE ON tags
BEGIN
    INSERT INTO activity (contact_id, activity_type, description, metadata)
    VALUES (OLD.contact_id, 'tag_removed', 'Tag removed', json_object('tag', OLD.name));
END;

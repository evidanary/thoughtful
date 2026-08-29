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

CREATE TABLE IF NOT EXISTS milestone_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tab TEXT NOT NULL,
    milestone_id TEXT NOT NULL,
    note TEXT NOT NULL DEFAULT '',
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tab, milestone_id)
);

-- ============================================================
-- Campaigns: time-bound outreach pushes with per-campaign stages
-- ============================================================

CREATE TABLE IF NOT EXISTS campaigns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    goal TEXT DEFAULT '',
    status TEXT DEFAULT 'active', -- 'active' | 'paused' | 'completed'
    start_date TEXT,
    end_date TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Every campaign owns its own ordered list of stages
CREATE TABLE IF NOT EXISTS campaign_stages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    color TEXT DEFAULT '#4B0082',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
);

-- A contact's membership in a campaign, and where they sit in its progression
CREATE TABLE IF NOT EXISTS campaign_contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_id INTEGER NOT NULL,
    contact_id INTEGER NOT NULL,
    stage_id INTEGER,
    notes TEXT DEFAULT '',
    added_at TEXT DEFAULT CURRENT_TIMESTAMP,
    stage_changed_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(campaign_id, contact_id),
    FOREIGN KEY(campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
    FOREIGN KEY(contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
    FOREIGN KEY(stage_id) REFERENCES campaign_stages(id) ON DELETE SET NULL
);

-- The default stage set copied into every new campaign (editable in the UI)
CREATE TABLE IF NOT EXISTS stage_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    color TEXT DEFAULT '#4B0082',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Trigger for adding a contact to a campaign
CREATE TRIGGER IF NOT EXISTS track_campaign_contact_added
AFTER INSERT ON campaign_contacts
BEGIN
    INSERT INTO activity (contact_id, activity_type, description, metadata)
    VALUES (
        NEW.contact_id,
        'campaign_added',
        'Added to campaign',
        json_object(
            'campaign', (SELECT name FROM campaigns WHERE id = NEW.campaign_id),
            'campaign_id', NEW.campaign_id,
            'stage', (SELECT name FROM campaign_stages WHERE id = NEW.stage_id)
        )
    );
END;

-- Trigger for moving a contact between stages
CREATE TRIGGER IF NOT EXISTS track_campaign_stage_changed
AFTER UPDATE OF stage_id ON campaign_contacts
WHEN OLD.stage_id IS NOT NEW.stage_id
BEGIN
    INSERT INTO activity (contact_id, activity_type, description, metadata)
    VALUES (
        NEW.contact_id,
        'campaign_stage_changed',
        'Moved campaign stage',
        json_object(
            'campaign', (SELECT name FROM campaigns WHERE id = NEW.campaign_id),
            'campaign_id', NEW.campaign_id,
            'from', (SELECT name FROM campaign_stages WHERE id = OLD.stage_id),
            'to', (SELECT name FROM campaign_stages WHERE id = NEW.stage_id)
        )
    );
END;

-- Trigger for removing a contact from a campaign
CREATE TRIGGER IF NOT EXISTS track_campaign_contact_removed
AFTER DELETE ON campaign_contacts
BEGIN
    INSERT INTO activity (contact_id, activity_type, description, metadata)
    VALUES (
        OLD.contact_id,
        'campaign_removed',
        'Removed from campaign',
        json_object('campaign_id', OLD.campaign_id)
    );
END;

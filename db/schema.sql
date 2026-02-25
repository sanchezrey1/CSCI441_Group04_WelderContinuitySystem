PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  user_id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('ADMIN_CWI','VIEWER')),
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS welders (
  welder_id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  department TEXT,
  employment_status TEXT NOT NULL DEFAULT 'Active',
  hire_date TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS processes (
  process_id INTEGER PRIMARY KEY AUTOINCREMENT,
  process_name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS codes (
  code_id INTEGER PRIMARY KEY AUTOINCREMENT,
  code_name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS qualifications (
  qualification_id INTEGER PRIMARY KEY AUTOINCREMENT,
  welder_id INTEGER NOT NULL,
  process_id INTEGER NOT NULL,
  code_id INTEGER NOT NULL,
  qualified_date TEXT NOT NULL,
  expiration_date TEXT,
  status TEXT NOT NULL DEFAULT 'IN_STATUS' CHECK (status IN ('IN_STATUS','AT_RISK','EXPIRED')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (welder_id, process_id, code_id),
  FOREIGN KEY (welder_id) REFERENCES welders(welder_id) ON DELETE CASCADE,
  FOREIGN KEY (process_id) REFERENCES processes(process_id),
  FOREIGN KEY (code_id) REFERENCES codes(code_id)
);

CREATE TABLE IF NOT EXISTS continuity_events (
  event_id INTEGER PRIMARY KEY AUTOINCREMENT,
  welder_id INTEGER NOT NULL,
  process_id INTEGER NOT NULL,
  event_date TEXT NOT NULL,
  recorded_by_user_id INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (welder_id) REFERENCES welders(welder_id) ON DELETE CASCADE,
  FOREIGN KEY (process_id) REFERENCES processes(process_id),
  FOREIGN KEY (recorded_by_user_id) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS documents (
  document_id INTEGER PRIMARY KEY AUTOINCREMENT,
  qualification_id INTEGER NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('WPS','WPQR','OTHER')),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  uploaded_by_user_id INTEGER NOT NULL,
  uploaded_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (qualification_id) REFERENCES qualifications(qualification_id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by_user_id) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS notifications (
  notification_id INTEGER PRIMARY KEY AUTOINCREMENT,
  welder_id INTEGER NOT NULL,
  qualification_id INTEGER,
  type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('INFO','WARNING','CRITICAL')),
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'CREATED' CHECK (status IN ('CREATED','SENT','DISMISSED')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (welder_id) REFERENCES welders(welder_id) ON DELETE CASCADE,
  FOREIGN KEY (qualification_id) REFERENCES qualifications(qualification_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS audit_log (
  audit_id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type TEXT NOT NULL,
  entity_id INTEGER NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('CREATE','UPDATE','DELETE')),
  changed_by_user_id INTEGER NOT NULL,
  changed_at TEXT NOT NULL DEFAULT (datetime('now')),
  change_summary TEXT,
  FOREIGN KEY (changed_by_user_id) REFERENCES users(user_id)
);

CREATE INDEX IF NOT EXISTS idx_qual_expiration ON qualifications(expiration_date);
CREATE INDEX IF NOT EXISTS idx_events_welder_process_date ON continuity_events(welder_id, process_id, event_date);
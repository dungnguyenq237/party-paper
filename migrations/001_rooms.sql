CREATE TABLE sessions (id TEXT PRIMARY KEY, expires_at INTEGER NOT NULL);
CREATE TABLE rooms (id TEXT PRIMARY KEY, code TEXT UNIQUE NOT NULL, state TEXT NOT NULL, creation_key TEXT UNIQUE NOT NULL, creation_digest TEXT NOT NULL, expires_at INTEGER NOT NULL);
CREATE TABLE tickets (id TEXT PRIMARY KEY, session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE, room_id TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE, expires_at INTEGER NOT NULL);
CREATE TABLE receipts (room_id TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE, match_id TEXT NOT NULL, seat_id TEXT NOT NULL, command_id TEXT NOT NULL, digest TEXT NOT NULL, accepted_rev INTEGER NOT NULL, PRIMARY KEY(room_id,match_id,seat_id,command_id));
CREATE INDEX rooms_expiry ON rooms(expires_at);
CREATE INDEX sessions_expiry ON sessions(expires_at);
CREATE INDEX tickets_expiry ON tickets(expires_at);
PRAGMA user_version=1;

import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'
import { join } from 'node:path'
import { mkdirSync } from 'node:fs'

let db: Database.Database | null = null

function getDbPath() {
  const root = process.cwd()
  const dir = join(root, '.data')
  mkdirSync(dir, { recursive: true })
  return join(dir, 'inesa-lms.db')
}

export function useDb() {
  if (!db) {
    db = new Database(getDbPath())
    db.pragma('journal_mode = WAL')
    initSchema(db)
    seedDefaults(db)
  }
  return db
}

function initSchema(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'student')),
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'draft',
      thumbnail_url TEXT,
      source_pdf_path TEXT,
      source_text TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS lessons (
      id TEXT PRIMARY KEY,
      course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      type TEXT NOT NULL CHECK(type IN ('video', 'audio', 'pdf', 'text')),
      content_url TEXT,
      content_text TEXT,
      duration_seconds INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS enrollments (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      enrolled_at TEXT NOT NULL,
      UNIQUE(user_id, course_id)
    );

    CREATE TABLE IF NOT EXISTS lesson_progress (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
      completed INTEGER NOT NULL DEFAULT 0,
      progress_percent INTEGER NOT NULL DEFAULT 0,
      last_position_seconds INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL,
      UNIQUE(user_id, lesson_id)
    );

    CREATE INDEX IF NOT EXISTS idx_lessons_course ON lessons(course_id, sort_order);
    CREATE INDEX IF NOT EXISTS idx_progress_user ON lesson_progress(user_id);
  `)
}

function seedDefaults(database: Database.Database) {
  const adminEmail = process.env.INESA_ADMIN_EMAIL || 'admin@inesa.com'
  const exists = database
    .prepare('SELECT id FROM users WHERE email = ?')
    .get(adminEmail)
  if (exists) return

  const password = process.env.INESA_ADMIN_PASSWORD || 'admin123'
  const now = new Date().toISOString()
  database
    .prepare(
      `INSERT INTO users (id, email, name, role, password_hash, created_at)
       VALUES (?, ?, ?, 'admin', ?, ?)`,
    )
    .run(
      nanoid(),
      adminEmail,
      'Instructor INESA',
      bcrypt.hashSync(password, 10),
      now,
    )
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80) || nanoid(8)
}
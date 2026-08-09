import type { User, Session } from '@supabase/supabase-js';

const SESSION_KEY = 'spydeystate_local_session';
const USERS_KEY = 'spydeystate_local_users';
const PROFILES_KEY = 'spydeystate_local_profiles';
const CHAT_KEY = 'spydeystate_local_chat';

interface StoredUser {
  id: string;
  email: string;
  full_name: string;
  password_hash: string;
  created_at: string;
}

interface LocalSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number;
  token_type: string;
  user: User;
}

interface ProfileRow {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  avatar_url: string | null;
  organization: string | null;
  created_at: string;
  updated_at: string;
}

interface ChatRow {
  id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password + 'spydeystate-salt-v1');
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function readStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function localGetSession(): (Session & { user: User }) | null {
  const session = readStorage<LocalSession | null>(SESSION_KEY, null);
  if (!session || Date.now() > session.expires_at) {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
  return session;
}

export function localClearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

function makeUser(id: string, email: string, fullName: string): User {
  const now = new Date().toISOString();
  return {
    id,
    email,
    user_metadata: { full_name: fullName },
    app_metadata: { provider: 'local', roles: ['authenticated'] },
    aud: 'authenticated',
    created_at: now,
    updated_at: now,
  } as User;
}

function makeSession(user: User): LocalSession {
  return {
    access_token: 'local_' + Math.random().toString(36).slice(2, 15) + Date.now(),
    refresh_token: 'local_' + Math.random().toString(36).slice(2, 15) + Date.now(),
    expires_in: 86400,
    expires_at: Date.now() + 24 * 60 * 60 * 1000,
    token_type: 'bearer',
    user,
  };
}

/* ── Auth state change listeners ────────────────────────── */

type AuthListener = (event: string, session: Session | null) => void;
const authListeners: Set<AuthListener> = new Set();

export function emitAuthChange(event: string, session: Session | null): void {
  authListeners.forEach(cb => cb(event, session));
}

/* ── Local auth functions ────────────────────────────────── */

export async function localSignIn(email: string, password: string): Promise<{ data: { user: User | null }; error: Error | null }> {
  const users = readStorage<StoredUser[]>(USERS_KEY, []);
  const user = users.find(u => u.email === email);
  if (!user) {
    return { data: { user: null }, error: new Error('Invalid login credentials') };
  }
  const passwordHash = await hashPassword(password);
  if (user.password_hash !== passwordHash) {
    return { data: { user: null }, error: new Error('Invalid login credentials') };
  }
  const supabaseUser = makeUser(user.id, user.email, user.full_name);
  const session = makeSession(supabaseUser);
  writeStorage(SESSION_KEY, session);
  emitAuthChange('SIGNED_IN', session);
  return { data: { user: supabaseUser }, error: null };
}

export async function localSignUp(email: string, password: string, fullName: string): Promise<{ data: { user: User | null }; error: Error | null }> {
  const users = readStorage<StoredUser[]>(USERS_KEY, []);
  if (users.find(u => u.email === email)) {
    return { data: { user: null }, error: new Error('A user with this email already exists') };
  }
  if (password.length < 6) {
    return { data: { user: null }, error: new Error('Password should be at least 6 characters') };
  }
  const id = crypto.randomUUID();
  const passwordHash = await hashPassword(password);
  const newUser: StoredUser = { id, email, full_name: fullName, password_hash: passwordHash, created_at: new Date().toISOString() };
  users.push(newUser);
  writeStorage(USERS_KEY, users);

  const profiles = readStorage<ProfileRow[]>(PROFILES_KEY, []);
  const now = new Date().toISOString();
  profiles.push({
    id, email, full_name: fullName, role: 'student', avatar_url: null, organization: null,
    created_at: now, updated_at: now,
  });
  writeStorage(PROFILES_KEY, profiles);

  const supabaseUser = makeUser(id, email, fullName);
  const session = makeSession(supabaseUser);
  writeStorage(SESSION_KEY, session);
  emitAuthChange('SIGNED_UP', session);
  return { data: { user: supabaseUser }, error: null };
}

export async function localSignOut(): Promise<{ error: Error | null }> {
  localClearSession();
  emitAuthChange('SIGNED_OUT', null);
  return { error: null };
}

/* ── Local profiles ──────────────────────────────────────── */

export async function localGetProfile(userId: string): Promise<{ data: ProfileRow | null; error: Error | null }> {
  const profiles = readStorage<ProfileRow[]>(PROFILES_KEY, []);
  const profile = profiles.find(p => p.id === userId);
  return { data: profile ?? null, error: null };
}

export async function localUpsertProfile(profile: Partial<ProfileRow> & { id: string }): Promise<{ data: ProfileRow | null; error: Error | null }> {
  const profiles = readStorage<ProfileRow[]>(PROFILES_KEY, []);
  const now = new Date().toISOString();
  const existing = profiles.findIndex(p => p.id === profile.id);
  if (existing >= 0) {
    profiles[existing] = { ...profiles[existing], ...profile, updated_at: now };
  } else {
    profiles.push({
      id: profile.id, email: profile.email ?? '', full_name: profile.full_name ?? null,
      role: profile.role ?? 'student', avatar_url: profile.avatar_url ?? null,
      organization: profile.organization ?? null, created_at: now, updated_at: now,
    });
  }
  writeStorage(PROFILES_KEY, profiles);
  return { data: profiles[existing >= 0 ? existing : profiles.length - 1], error: null };
}

export async function localUpdateProfile(userId: string, updates: Partial<ProfileRow>): Promise<{ error: Error | null }> {
  const profiles = readStorage<ProfileRow[]>(PROFILES_KEY, []);
  const idx = profiles.findIndex(p => p.id === userId);
  if (idx >= 0) {
    profiles[idx] = { ...profiles[idx], ...updates, updated_at: new Date().toISOString() };
    writeStorage(PROFILES_KEY, profiles);
  }
  return { error: null };
}

/* ── Local chat messages ────────────────────────────────── */

export async function localInsertChat(role: 'user' | 'assistant', content: string, userId: string): Promise<{ error: Error | null }> {
  const chats = readStorage<ChatRow[]>(CHAT_KEY, []);
  chats.push({ id: crypto.randomUUID(), user_id: userId, role, content, created_at: new Date().toISOString() });
  writeStorage(CHAT_KEY, chats);
  return { error: null };
}

export async function localLoadMessages(userId: string): Promise<{ data: ChatRow[]; error: Error | null }> {
  const chats = readStorage<ChatRow[]>(CHAT_KEY, []);
  const userChats = chats.filter(c => c.user_id === userId).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  return { data: userChats, error: null };
}

export async function localClearChat(userId: string): Promise<{ error: Error | null }> {
  const chats = readStorage<ChatRow[]>(CHAT_KEY, []);
  const filtered = chats.filter(c => c.user_id !== userId);
  writeStorage(CHAT_KEY, filtered);
  return { error: null };
}

/* ── Subscription simulation ─────────────────────────────── */

export function localOnAuthStateChange(callback: (event: string, session: Session | null) => void): { data: { subscription: { unsubscribe: () => void } } } {
  authListeners.add(callback);
  const initialSession = localGetSession();
  if (initialSession) {
    callback('SIGNED_IN', initialSession as Session);
  } else {
    callback('SIGNED_OUT', null);
  }
  return {
    data: {
      subscription: {
        unsubscribe: () => { authListeners.delete(callback); },
      },
    },
  };
}

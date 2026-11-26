import { Injectable, signal } from '@angular/core';

import { UserProfile } from '../shared/interfaces';

/**
 * Tab-scoped copy of the NON-secret sign-in state, so a reload does not sign the user out
 * (UAM-AUT-03). Auth itself lives in the backend cookie; the cookie is what the server trusts, so a
 * stale copy only means the first API call answers "session expired" (the existing dialog).
 * Never stored: the SSO session id, tokens, passwords. `sessionStorage` (not `localStorage`): it
 * dies with the tab, so nothing outlives the browsing session.
 */
export const SESSION_STORAGE_KEY = 'uam.session';

interface StoredSession {
  readonly profile: UserProfile;
  readonly consented: boolean;
}

function isProfile(v: unknown): v is UserProfile {
  const p = v as Record<string, unknown> | null;
  return (
    !!p &&
    typeof p['userName'] === 'string' &&
    p['userName'] !== '' &&
    typeof p['uamRole'] === 'string' &&
    typeof p['systemAdmin'] === 'boolean' &&
    typeof p['userType'] === 'string'
  );
}

function readStored(): StoredSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredSession> | null;
    if (!parsed || !isProfile(parsed.profile) || typeof parsed.consented !== 'boolean') return null;
    return { profile: parsed.profile, consented: parsed.consented };
  } catch {
    return null;
  }
}

function writeStored(value: StoredSession | null): void {
  try {
    if (value) sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(value));
    else sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // Storage can be blocked; the user then simply signs in again after a reload.
  }
}

/** Who is signed in as far as the HTTP layer and the route guards care, plus the "session expired" signal for the UI. */
@Injectable({ providedIn: 'root' })
export class Session {
  readonly #restored = readStored();
  readonly #userType = signal<string | null>(this.#restored?.profile.userType ?? null);
  readonly #ssoSession = signal<string | null>(null);
  readonly #expired = signal(false);
  readonly #profile = signal<UserProfile | null>(this.#restored?.profile ?? null);
  readonly #consented = signal(this.#restored?.consented ?? false);

  readonly userType = this.#userType.asReadonly();
  /** Profile returned by login; feeds the shell (`SHELL_PROFILE`) and the route guards. */
  readonly profile = this.#profile.asReadonly();
  /** `false` until the user has accepted the PDPA consent (`isConsent` of login). */
  readonly consented = this.#consented.asReadonly();
  readonly ssoSession = this.#ssoSession.asReadonly();
  /** `true` after the backend said the session is over; the HTTP layer then refuses requests until {@link signIn}. */
  readonly expired = this.#expired.asReadonly();

  signIn(
    userType: string,
    ssoSession: string,
    profile: UserProfile | null = null,
    consented = true,
  ): void {
    this.#userType.set(userType);
    this.#profile.set(profile);
    this.#ssoSession.set(ssoSession);
    this.#consented.set(consented);
    this.#expired.set(false);
    writeStored(profile ? { profile, consented } : null);
  }

  /** The user accepted the consent text. */
  markConsented(): void {
    this.#consented.set(true);
    const profile = this.#profile();
    if (profile) writeStored({ profile, consented: true });
  }

  markExpired(): void {
    this.#expired.set(true);
  }

  clear(): void {
    this.#userType.set(null);
    this.#profile.set(null);
    this.#ssoSession.set(null);
    this.#consented.set(false);
    this.#expired.set(false);
    writeStored(null);
  }
}

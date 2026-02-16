/**
 * User Factory
 *
 * Creates and cleans up $users entities for E2E tests.
 */

import { FactoryBase } from './factory-base';
import { adminTransact, tx, getAdminDb } from '../admin-db';

export interface CreateUserOptions {
  id?: string;
  name?: string;
  email?: string;
  handle?: string;
  visibility?: string;
  about?: string;
  avatar?: string;
  bio?: string;
}

export interface CreatedUser {
  id: string;
  email: string;
  name: string;
  handle: string;
}

export class UserFactory extends FactoryBase {
  private _counter = 0;

  /**
   * Create a $users entity with sensible defaults.
   */
  async createUser(overrides: CreateUserOptions = {}): Promise<CreatedUser> {
    this._counter++;
    const userId = overrides.id ?? this.generateId();
    const suffix = `${Date.now()}-${this._counter}`;
    const email = overrides.email ?? `e2e-${suffix}@test.polity.app`;
    const name = overrides.name ?? `E2E User ${this._counter}`;
    const handle = overrides.handle ?? `e2e-user-${suffix}`;

    const now = new Date();

    await adminTransact([
      tx.$users[userId].update({
        email,
        name,
        handle,
        visibility: overrides.visibility ?? 'public',
        about: overrides.about ?? '',
        avatar: overrides.avatar ?? '',
        bio: overrides.bio ?? '',
        createdAt: now,
        updatedAt: now,
        lastSeenAt: now,
      }),
    ]);

    this.trackEntity('$users', userId);

    return { id: userId, email, name, handle };
  }

  /**
   * Create a user and an auth token so the user can log in.
   * Returns the user data plus the email for use with `login(page, email)`.
   */
  async createUserWithAuth(overrides: CreateUserOptions = {}): Promise<CreatedUser & { token: string }> {
    const db = getAdminDb();
    const user = await this.createUser(overrides);

    // Ensure the user is known to InstantDB auth
    const token = await db.auth.createToken(user.email);
    await db.auth.verifyToken(token);

    return { ...user, token };
  }
}

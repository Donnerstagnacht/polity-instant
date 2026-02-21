/**
 * User Factory
 *
 * Creates and cleans up user entities for E2E tests.
 */

import { FactoryBase } from './factory-base';
import { getAdminDb, adminUpsert } from '../admin-db';

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
   * Create a user entity with sensible defaults.
   */
  async createUser(overrides: CreateUserOptions = {}): Promise<CreatedUser> {
    this._counter++;
    const userId = overrides.id ?? this.generateId();
    const suffix = `${Date.now()}-${this._counter}`;
    const email = overrides.email ?? `e2e-${suffix}@test.polity.app`;
    const name = overrides.name ?? `E2E User ${this._counter}`;
    const handle = overrides.handle ?? `e2e-user-${suffix}`;

    const now = new Date().toISOString();

    await adminUpsert('user', {
      id: userId,
      email,
      handle,
      first_name: name,
      visibility: overrides.visibility ?? 'public',
      about: overrides.about ?? '',
      avatar: overrides.avatar ?? '',
      bio: overrides.bio ?? '',
      is_public: true,
      created_at: now,
      updated_at: now,
    });

    this.trackEntity('user', userId);

    return { id: userId, email, name, handle };
  }

  /**
   * Create a user and a Supabase auth account so the user can log in.
   * Returns the user data plus the email for use with `login(page, email)`.
   */
  async createUserWithAuth(overrides: CreateUserOptions = {}): Promise<CreatedUser & { token: string }> {
    const db = getAdminDb();
    const user = await this.createUser(overrides);

    // Create Auth user in Supabase so the user can authenticate
    const { data, error } = await db.auth.admin.createUser({
      email: user.email,
      email_confirm: true,
      user_metadata: { name: user.name },
    });

    if (error && !error.message?.includes('already been registered')) {
      throw new Error(`Failed to create auth user: ${error.message}`);
    }

    // If the auth user was created with a different ID, update the profile row
    if (data?.user && data.user.id !== user.id) {
      await db.from('user').delete().eq('id', user.id);
      await adminUpsert('user', {
        id: data.user.id,
        email: user.email,
        handle: user.handle,
        first_name: user.name,
        visibility: overrides.visibility ?? 'public',
        about: overrides.about ?? '',
        avatar: overrides.avatar ?? '',
        bio: overrides.bio ?? '',
        is_public: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      this._entities.get('user')?.delete(user.id);
      this.trackEntity('user', data.user.id);
      user.id = data.user.id;
    }

    // Generate a session token for test login
    const { data: session } = await db.auth.admin.generateLink({
      type: 'magiclink',
      email: user.email,
    });

    return { ...user, token: session?.properties?.hashed_token ?? '' };
  }
}

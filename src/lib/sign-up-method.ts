import type admin from 'firebase-admin';
import type { UserProfile } from './types';

export type SignUpMethod = NonNullable<UserProfile['signUpMethod']>;

/**
 * Which sign-up method an account used, derived from the Firebase Auth provider
 * record rather than from anything the client tells us.
 *
 * Firebase does not record which provider came *first*, so for the (currently
 * impossible) case of an account with both providers linked we report 'google'.
 * With "One account per email address" enabled in the Firebase console — the
 * project's current setting — every account has exactly one provider anyway.
 */
export function resolveSignUpMethod(authUser: admin.auth.UserRecord): SignUpMethod {
    const providerIds = authUser.providerData.map(p => p.providerId);
    return providerIds.includes('google.com') ? 'google' : 'email';
}

/**
 * Google OAuth (frontend).
 *
 * Flow:
 * 1. User clicks the button → browser opens Google consent.
 * 2. Google redirects to backend `GET /api/auth/google?code=...&state=login|signup`.
 * 3. Backend exchanges the code, creates/finds the user, issues a session/JWT.
 * 4. Backend redirects to the app (e.g. `/landing?token=...`); store token like email login.
 *
 * Configure: `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, `NEXT_PUBLIC_API_BASE_URL`
 * (redirect URI = `{API_BASE_URL}/auth/google`, must match Google Cloud console).
 */

export type GoogleAuthIntent = "login" | "signup";

export function buildGoogleOAuthUrl(intent: GoogleAuthIntent): string {
  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

  return `${apiBase}/auth/google?state=${intent}`;
}
  
const AUTH_COOKIE_PREFIX = "CognitoIdentityServiceProvider.";

function parseCookies(header: string | null): Record<string, string> {
    const cookies: Record<string, string> = {};
    if (!header) return cookies;

    for (const part of header.split(";")) {
        const separator = part.indexOf("=");
        if (separator === -1) continue;

        const name = part.slice(0, separator).trim();
        const rawValue = part.slice(separator + 1).trim();
        if (!name) continue;

        try {
            cookies[name] = decodeURIComponent(rawValue);
        } catch {
            cookies[name] = rawValue;
        }
    }

    return cookies;
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
    try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
        const bytes = Uint8Array.from(atob(padded), (char) =>
            char.charCodeAt(0),
        );
        return JSON.parse(new TextDecoder().decode(bytes));
    } catch {
        return null;
    }
}

/**
 * Reads the Cognito access token that Amplify persists in cookies
 * (see the `cookieStorage` config in `src/lib/auth.ts`).
 */
function findCookie(
    cookies: Record<string, string>,
    suffix: string,
): string | null {
    for (const [name, value] of Object.entries(cookies)) {
        if (name.startsWith(AUTH_COOKIE_PREFIX) && name.endsWith(suffix)) {
            return value;
        }
    }
    return null;
}

export function getAccessToken(cookieHeader: string | null): string | null {
    return findCookie(parseCookies(cookieHeader), ".accessToken");
}

export interface SessionUser {
    username: string | null;
    email: string | null;
    name: string | null;
}

/**
 * Reads the user's identity from the Cognito ID token (also persisted in a
 * cookie by Amplify) so the UI can render name/email server-side without a
 * client-side round-trip.
 */
export function getSessionUser(cookieHeader: string | null): SessionUser {
    const idToken = findCookie(parseCookies(cookieHeader), ".idToken");
    if (!idToken) return { username: null, email: null, name: null };

    const payload = decodeJwtPayload(idToken);
    if (!payload) return { username: null, email: null, name: null };

    const readString = (key: string): string | null =>
        typeof payload[key] === "string" ? (payload[key] as string) : null;

    return {
        username: readString("cognito:username") ?? readString("username"),
        email: readString("email"),
        name: readString("name"),
    };
}

/**
 * Cheap but meaningful server-side session check: the access token must
 * exist, decode and still be within its expiration window. Signature
 * verification is enforced by the backend on every protected request.
 */
export function isSessionValid(accessToken: string | null): boolean {
    if (!accessToken) return false;

    const payload = decodeJwtPayload(accessToken);
    if (!payload) return false;
    if (payload.token_use !== "access") return false;

    const expiresAt = typeof payload.exp === "number" ? payload.exp : null;
    return expiresAt === null || expiresAt * 1000 > Date.now();
}

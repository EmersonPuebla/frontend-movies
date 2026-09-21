import { defineMiddleware } from "astro:middleware";
import { getAccessToken, isSessionValid } from "@/lib/session";

const PUBLIC_ROUTE = "/login";

export const onRequest = defineMiddleware(async (context, next) => {
    const { pathname } = context.url;

    // Static assets and framework internals are never gated by auth.
    if (
        pathname.startsWith("/_astro/") ||
        pathname.startsWith("/_image") ||
        /\.(ico|png|jpe?g|webp|svg|gif|avif|css|js|map|woff2?|txt|xml)$/i.test(
            pathname,
        )
    ) {
        return next();
    }

    const authenticated = isSessionValid(
        getAccessToken(context.request.headers.get("cookie")),
    );

    // /login only exists for signed-out users; signed-in users go to /movies.
    if (pathname === PUBLIC_ROUTE) {
        return authenticated ? context.redirect("/movies") : next();
    }

    // Every other app route (/, /movies, /movies/[slug]) requires auth.
    if (!authenticated) {
        return context.redirect(PUBLIC_ROUTE);
    }

    return next();
});

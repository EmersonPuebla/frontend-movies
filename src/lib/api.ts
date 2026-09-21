const API_URL = import.meta.env.PUBLIC_API_URL || "http://localhost:8000";

export interface Movie {
    id: number;
    title: string;
    duration: number;
    release_date: string;
    director: string;
    synopsis: string;
    image_src: string;
    slug: string;
}

interface MovieResponse {
    data: Movie[] | null;
}

/**
 * Resolves the relative path returned by the backend (e.g. `/static/x.jpg`)
 * into an absolute URL pointing at the backend's own static files.
 */
export function resolveImageUrl(src: string): string {
    if (/^https?:\/\//i.test(src)) return src;
    return `${API_URL}${src.startsWith("/") ? "" : "/"}${src}`;
}

export async function fetchMovies(accessToken: string): Promise<Movie[]> {
    const response = await fetch(`${API_URL}/movies`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
        throw new Error(`Error al cargar las películas (${response.status})`);
    }

    const body = (await response.json()) as MovieResponse;
    return body.data ?? [];
}

export async function fetchMovieBySlug(
    accessToken: string,
    slug: string,
): Promise<Movie | undefined> {
    const movies = await fetchMovies(accessToken);
    return movies.find((movie) => movie.slug === slug);
}

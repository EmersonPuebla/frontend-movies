const API_URL = import.meta.env.PUBLIC_API_URL || "http://localhost:8000";

export const MAX_IMAGE_SIZE_MB = 5;

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

// Datos que se envían al crear/editar una película (sin `id`).
export interface MovieInput {
    title: string;
    duration: number;
    release_date: string;
    director: string;
    synopsis: string;
    image_src: string;
    slug: string;
}

interface ApiResponse<T> {
    code: string;
    message: string;
    data: T | null;
}

/**
 * Resolves the relative path returned by the backend (e.g. `/static/x.jpg`)
 * into an absolute URL pointing at the backend's own static files.
 */
export function resolveImageUrl(src: string): string {
    if (/^https?:\/\//i.test(src)) return src;
    return `${API_URL}${src.startsWith("/") ? "" : "/"}${src}`;
}

async function readErrorDetail(response: Response): Promise<string | null> {
    try {
        const body = (await response.json()) as { detail?: string };
        return body.detail ?? null;
    } catch {
        return null;
    }
}

export async function fetchMovies(accessToken: string): Promise<Movie[]> {
    const response = await fetch(`${API_URL}/movies`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
        throw new Error(`Error al cargar las películas (${response.status})`);
    }

    const body = (await response.json()) as ApiResponse<Movie[]>;
    return body.data ?? [];
}

export async function fetchMovieBySlug(
    accessToken: string,
    slug: string,
): Promise<Movie | undefined> {
    const movies = await fetchMovies(accessToken);
    return movies.find((movie) => movie.slug === slug);
}

export async function createMovie(
    accessToken: string,
    input: MovieInput,
): Promise<Movie> {
    const response = await fetch(`${API_URL}/movies`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
    });

    if (response.status === 409) {
        throw new Error("El slug ya existe, debe ser distinto.");
    }
    if (!response.ok) {
        const detail = await readErrorDetail(response);
        throw new Error(
            detail ?? `Error al crear la película (${response.status})`,
        );
    }

    const body = (await response.json()) as ApiResponse<Movie>;
    if (!body.data) throw new Error("La API no devolvió la película creada");
    return body.data;
}

export async function updateMovie(
    accessToken: string,
    id: number,
    input: MovieInput,
): Promise<Movie> {
    const response = await fetch(`${API_URL}/movies/${id}`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
    });

    if (response.status === 409) {
        throw new Error("El slug ya existe, debe ser distinto.");
    }
    if (!response.ok) {
        const detail = await readErrorDetail(response);
        throw new Error(
            detail ?? `Error al actualizar la película (${response.status})`,
        );
    }

    const body = (await response.json()) as ApiResponse<Movie>;
    if (!body.data) throw new Error("La API no devolvió la película actualizada");
    return body.data;
}

export async function deleteMovie(
    accessToken: string,
    id: number,
): Promise<void> {
    const response = await fetch(`${API_URL}/movies/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
        throw new Error(`Error al eliminar la película (${response.status})`);
    }
}

export async function uploadImage(
    accessToken: string,
    file: File,
): Promise<string> {
    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
        throw new Error(
            `La imagen supera el límite de ${MAX_IMAGE_SIZE_MB} MB.`,
        );
    }

    const body = new FormData();
    body.append("file", file);

    const response = await fetch(`${API_URL}/movies/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body,
    });

    if (!response.ok) {
        const detail = await readErrorDetail(response);
        throw new Error(detail ?? `Error al subir la imagen (${response.status})`);
    }

    const result = (await response.json()) as ApiResponse<{ url: string }>;
    if (!result.data?.url) {
        throw new Error("La API no devolvió la URL de la imagen");
    }
    return result.data.url;
}

export function slugify(value: string): string {
    return value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export type MovieFormResult =
    | { ok: true; input: MovieInput }
    | { ok: false; error: string };

export function parseMovieForm(formData: FormData): MovieFormResult {
    const field = (name: string) => String(formData.get(name) ?? "").trim();

    const title = field("title");
    const director = field("director");
    const duration = Number(field("duration"));
    const release_date = field("release_date");
    const synopsis = field("synopsis");
    const image_src = field("image_src");
    const slugRaw = field("slug");
    const slug = slugify(slugRaw);

    if (!title || !director) {
        return { ok: false, error: "El título y el director son obligatorios." };
    }

    if (!slugRaw || !slug) {
        return { ok: false, error: "El slug es obligatorio." };
    }

    if (!Number.isInteger(duration) || duration <= 0) {
        return {
            ok: false,
            error: "La duración debe ser un número entero mayor que 0.",
        };
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(release_date)) {
        return { ok: false, error: "La fecha de estreno no es válida." };
    }

    return {
        ok: true,
        input: {
            title,
            director,
            duration,
            release_date,
            synopsis,
            image_src,
            slug,
        },
    };
}

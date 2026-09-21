const IMAGE_BASE = import.meta.env.PUBLIC_API_URL || "http://localhost:8000";

/**
 * Resuelve la ruta relativa que devuelve el backend (ej. `/static/x.jpg`)
 * en una URL absoluta a la que el navegador puede acceder.
 */
export function resolveImageUrl(src: string): string {
    if (/^https?:\/\//i.test(src)) return src;
    return `${IMAGE_BASE}${src.startsWith("/") ? "" : "/"}${src}`;
}

export function slugify(value: string): string {
    return value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

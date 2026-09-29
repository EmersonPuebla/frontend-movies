# frontend-movies

Cliente web para consumir la API de películas desarrollado con Astro.

## Requisitos

- Tener instalado [Node.js](https://nodejs.org/) (versión 18 o superior)

## Instalar pnpm

La forma más fácil es usar npm para instalar pnpm globalmente:

```bash
npm install -g pnpm
```

Si prefieres, también puedes usar Corepack que viene incluido con Node.js reciente:

```bash
corepack enable
corepack prepare pnpm --activate
```

## Instalar dependencias

Desde la raíz del proyecto, ejecuta:

```bash
pnpm install
```

## Ejecutar la app

Para levantar el proyecto en modo desarrollo:

```bash
pnpm run dev
```

Esto iniciará el servidor local de Astro. Normalmente estará disponible en:

```text
http://localhost:4321
```

## Comandos útiles

```bash
pnpm run build
pnpm run preview
```

- `pnpm run build`: genera la versión de producción
- `pnpm run preview`: sirve la build de producción localmente

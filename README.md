# Frontend Movies

Frontend Astro para el catálogo de películas y el flujo de autenticación con Amazon Cognito.

## Configuración de Cognito

La página `/login` usa Cognito User Pools para iniciar sesión, registrar usuarios y confirmar cuentas. Copia `.env.example` a `.env` y completa los valores públicos de tu User Pool:

```sh
cp .env.example .env
```

Configura también el dominio de la aplicación frontend en Cognito con la URL de callback correspondiente. El `ClientId` no es un secreto y se expone mediante variables `PUBLIC_`; nunca guardes el client secret en este frontend.

El backend FastAPI deberá validar el `access_token` o `id_token` enviado en `Authorization: Bearer <token>` usando las claves públicas JWKS del User Pool, verificando firma, issuer, audience y expiración.

```sh
npm create astro@latest -- --template minimal
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

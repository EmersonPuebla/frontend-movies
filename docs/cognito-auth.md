# Autenticación con Amazon Cognito (frontend)

`frontend-movies` es una aplicación construida con Astro en modo SSR. El login usa la librería
cliente de AWS Amplify (`aws-amplify`) apuntando a un **user pool** de Cognito ya existente
(no usa Amplify Gen2).

## Variables de entorno

Astro expone al cliente las variables con prefijo `PUBLIC_`. Copia `.env.example` a `.env`:

| Variable | Descripción |
| --- | --- |
| `PUBLIC_COGNITO_USER_POOL_ID` | ID del user pool (ej. `us-east-1_AbCdEfGhI`) |
| `PUBLIC_COGNITO_CLIENT_ID` | ID del app client público (SPA, sin secret) |
| `PUBLIC_API_URL` | URL del backend (ej. `http://localhost:8000`) |

## Configuración

La configuración vive en `src/lib/auth.ts`:

```ts
import { CookieStorage } from "aws-amplify/utils";
import { cognitoUserPoolsTokenProvider } from "aws-amplify/auth/cognito";

Amplify.configure({
  Auth: { Cognito: { userPoolId, userPoolClientId } },
});

// Guarda los tokens en cookies para que el middleware de Astro pueda leerlos en el servidor.
cognitoUserPoolsTokenProvider.setKeyValueStorage(
  new CookieStorage({ path: "/", expires: 365, sameSite: "lax", secure: import.meta.env.PROD }),
);
```

## Flujo de login

| Acción | API de Amplify |
| --- | --- |
| Registro | `signUp` (envía un código de verificación al email) |
| Confirmar cuenta | `confirmSignUp` (valida el código de 6 dígitos) |
| Login | `signIn` (flujo SRP con email + contraseña) |
| Sesión actual | `getCurrentUser` / `fetchAuthSession` |
| Logout | `signOut` |

Amplify guarda los tokens en **cookies** (no en `localStorage`) para que la protección de rutas
pueda leerse en el servidor, y los refresca automáticamente. Para llamar al backend envía el
access token en `Authorization: Bearer <access_token>`.

## Archivos clave

| Archivo | Responsabilidad |
| --- | --- |
| `src/lib/auth.ts` | Configura Amplify (tokens en cookies) y expone las funciones de auth |
| `src/lib/session.ts` | Lee y valida (presencia + expiración) el access token desde las cookies |
| `src/lib/api.ts` | Consulta el backend usando el access token |
| `src/middleware.ts` | Protege las rutas en el servidor: solo `/login` es pública |
| `src/layouts/Layout.astro` | Layout compartido (header + menú de usuario) |
| `src/components/UserMenu.astro` | Menú desplegable del usuario y logout |
| `src/pages/login.astro` | UI de login, registro y confirmación |
| `src/pages/movies/index.astro` | Lista de películas (SSR con `Card` y `Grid`) |
| `src/pages/movies/[slug].astro` | Detalle de una película |
| `.env.example` | Plantilla de variables de entorno |

> El app client público **no debe tener secret**; usa el flujo de código de autorización + PKCE
> (o SRP) y nunca el *implicit grant*.

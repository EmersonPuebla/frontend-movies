# Autenticación con Amazon Cognito (frontend)

`frontend-movies` es una SPA construida con Astro. El login usa la librería cliente de AWS Amplify
(`aws-amplify`) apuntando a un **user pool** de Cognito ya existente (no usa Amplify Gen2).

## Variables de entorno

Astro expone al cliente las variables con prefijo `PUBLIC_`. Copia `.env.example` a `.env`:

| Variable | Descripción |
| --- | --- |
| `PUBLIC_COGNITO_USER_POOL_ID` | ID del user pool (ej. `us-east-1_AbCdEfGhI`) |
| `PUBLIC_COGNITO_CLIENT_ID` | ID del app client público (SPA, sin secret) |

## Configuración

La configuración vive en `src/lib/auth.ts`:

```ts
Amplify.configure({
  Auth: { Cognito: { userPoolId, userPoolClientId } },
});
```

## Flujo de login

| Acción | API de Amplify |
| --- | --- |
| Registro | `signUp` (envía un código de verificación al email) |
| Confirmar cuenta | `confirmSignUp` (valida el código de 6 dígitos) |
| Login | `signIn` (flujo SRP con email + contraseña) |
| Sesión actual | `getCurrentUser` / `fetchAuthSession` |
| Logout | `signOut` |

Amplify guarda los tokens y los refresca automáticamente. Para llamar al backend envía el access
token en `Authorization: Bearer <access_token>`.

## Archivos clave

| Archivo | Responsabilidad |
| --- | --- |
| `src/lib/auth.ts` | Configura Amplify y expone las funciones de auth |
| `src/pages/login.astro` | UI de login, registro y confirmación |
| `src/pages/index.astro` | Muestra la sesión y el botón de logout |
| `.env.example` | Plantilla de variables de entorno |

> El app client público **no debe tener secret**; usa el flujo de código de autorización + PKCE
> (o SRP) y nunca el *implicit grant*.

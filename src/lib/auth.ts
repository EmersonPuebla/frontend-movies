import { Amplify } from "aws-amplify";
import {
  confirmSignUp as amplifyConfirmSignUp,
  getCurrentUser,
  signIn as amplifySignIn,
  signOut as amplifySignOut,
  signUp as amplifySignUp,
} from "aws-amplify/auth";

const userPoolId = import.meta.env.PUBLIC_COGNITO_USER_POOL_ID;
const userPoolClientId = import.meta.env.PUBLIC_COGNITO_CLIENT_ID;

if (!userPoolId || !userPoolClientId) {
  throw new Error(
    "Falta la configuración de Cognito. Copia .env.example a .env y define PUBLIC_COGNITO_USER_POOL_ID y PUBLIC_COGNITO_CLIENT_ID.",
  );
}

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId,
      userPoolClientId,
    },
  },
});

export function signInUser(email: string, password: string) {
  return amplifySignIn({ username: email, password });
}

export function signUpUser(name: string, email: string, password: string) {
  return amplifySignUp({
    username: email,
    password,
    options: {
      userAttributes: { email, name },
    },
  });
}

export function confirmSignUpUser(email: string, code: string) {
  return amplifyConfirmSignUp({ username: email, confirmationCode: code });
}

export function signOutUser() {
  return amplifySignOut();
}

export async function currentUserEmail(): Promise<string | null> {
  try {
    const { signInDetails, username } = await getCurrentUser();
    return signInDetails?.loginId ?? username;
  } catch {
    return null;
  }
}

const ERROR_MESSAGES: Record<string, string> = {
  UserNotConfirmedException:
    "Tu cuenta aún no está confirmada. Revisa tu email e introduce el código.",
  NotAuthorizedException: "Email o contraseña incorrectos.",
  UserNotFoundException: "No existe ninguna cuenta con ese email.",
  UsernameExistsException:
    "Ya existe una cuenta con ese email. Inicia sesión o confírmala.",
  CodeMismatchException: "El código de confirmación no es válido.",
  ExpiredCodeException: "El código ha expirado. Solicita uno nuevo.",
  InvalidPasswordException: "La contraseña no cumple los requisitos de seguridad.",
  LimitExceededException: "Demasiados intentos. Espera un momento y vuelve a intentarlo.",
  InvalidParameterException: "Los datos introducidos no son válidos.",
};

export function describeAuthError(error: unknown): {
  name: string;
  message: string;
} {
  const name =
    typeof error === "object" && error !== null && "name" in error
      ? String((error as { name: unknown }).name)
      : "UnknownError";

  return {
    name,
    message: ERROR_MESSAGES[name] ?? "Ha ocurrido un error. Inténtalo de nuevo.",
  };
}

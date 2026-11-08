export type LoginField = "email" | "password";
export type LoginErrors = Partial<Record<LoginField, string>>;

export interface LoginValues {
  email: string;
  password: string;
}

export type RegisterField =
  | "name"
  | "email"
  | "password"
  | "confirmPassword"
  | "acceptedTerms";

export type RegisterErrors = Partial<Record<RegisterField, string>>;

export interface RegisterValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value: string): string | null {
  const email = value.trim();
  if (!email) return "Ingresá tu email.";
  if (email.length > 255) return "El email no puede superar los 255 caracteres.";
  if (!EMAIL_PATTERN.test(email)) {
    return "Ingresá un email válido, por ejemplo nombre@dominio.com.";
  }
  return null;
}

export function validateLogin(values: LoginValues): LoginErrors {
  const errors: LoginErrors = {};

  const emailError = validateEmail(values.email);
  if (emailError) errors.email = emailError;

  if (!values.password) errors.password = "Ingresá tu contraseña.";

  return errors;
}

export function validateName(value: string): string | null {
  const name = value.trim();
  if (!name) return "Ingresá tu nombre.";
  if (name.length < 2) return "El nombre debe tener al menos 2 caracteres.";
  if (name.length > 60) return "El nombre no puede superar los 60 caracteres.";
  return null;
}

export function validateNewPassword(value: string): string | null {
  if (!value) return "Creá una contraseña.";
  if (value.length < 8) return "Usá al menos 8 caracteres.";
  if (value.length > 72) return "La contraseña no puede superar los 72 caracteres.";
  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) {
    return "Combiná al menos una letra y un número.";
  }
  return null;
}

export function validateRegister(values: RegisterValues): RegisterErrors {
  const errors: RegisterErrors = {};

  const nameError = validateName(values.name);
  if (nameError) errors.name = nameError;

  const emailError = validateEmail(values.email);
  if (emailError) errors.email = emailError;

  const passwordError = validateNewPassword(values.password);
  if (passwordError) errors.password = passwordError;

  if (!values.confirmPassword) {
    errors.confirmPassword = "Repetí tu contraseña.";
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "Las contraseñas no coinciden.";
  }

  if (!values.acceptedTerms) {
    errors.acceptedTerms = "Aceptá los términos para continuar.";
  }

  return errors;
}

export function validateEmailOnly(value: string): string | null {
  return validateEmail(value);
}

export function hasErrors(errors: Record<string, string | undefined>): boolean {
  return Object.values(errors).some(Boolean);
}

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
}

export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return { score: 0, label: "Sin contraseña" };

  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Za-z]/.test(password) && /\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  const labels = ["Muy débil", "Débil", "Aceptable", "Buena", "Fuerte"] as const;
  const bounded = Math.min(score, 4) as PasswordStrength["score"];

  return { score: bounded, label: labels[bounded] };
}

export type ApiErrorKind =
  | "http"
  | "network"
  | "timeout"
  | "invalid-response";

export interface ApiErrorOptions {
  kind?: ApiErrorKind;
  status?: number;
  fieldErrors?: Record<string, string>;
  details?: unknown;
  cause?: unknown;
}

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status: number;
  readonly fieldErrors: Record<string, string>;
  readonly details: unknown;

  constructor(message: string, options: ApiErrorOptions = {}) {
    super(message, { cause: options.cause });
    this.name = "ApiError";
    this.kind = options.kind ?? "http";
    this.status = options.status ?? 0;
    this.fieldErrors = options.fieldErrors ?? {};
    this.details = options.details;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

const NETWORK_MESSAGE =
  "No pudimos conectarnos con el servidor. Verificá que el mock API esté corriendo en el puerto 3000.";
const TIMEOUT_MESSAGE =
  "La operación tardó demasiado. Revisá tu conexión y probá de nuevo.";
const INVALID_RESPONSE_MESSAGE =
  "El servidor devolvió una respuesta con un formato inesperado.";

function statusFallback(status: number): string {
  switch (status) {
    case 400:
      return "Revisá los datos ingresados.";
    case 401:
      return "Tu sesión no es válida o expiró. Volvé a ingresar.";
    case 404:
      return "No encontramos la información que buscabas.";
    case 422:
      return "La operación fue rechazada.";
    default:
      return "El servicio no está disponible en este momento. Probá de nuevo.";
  }
}

/** Los mensajes del mock API vienen en inglés: los traducimos en el borde. */
function translateFieldMessage(field: string, message: string): string {
  if (message.includes("is required")) return "Completá este campo.";
  if (message.includes("valid email")) return "Ingresá un email válido.";
  if (field === "amount" && message.includes("at least")) {
    return "El monto debe ser mayor a cero.";
  }
  if (field === "currency") return "La moneda no es válida.";
  if (field === "category") return "La categoría no es válida.";
  if (message.includes("at most") && message.includes("500")) {
    return "El texto no puede superar los 500 caracteres.";
  }
  if (message.includes("at most")) return "El valor es demasiado largo.";
  if (message.includes("at least")) return "El valor es demasiado corto.";
  return message;
}

interface ErrorPayload {
  error?: unknown;
  errors?: unknown;
}

export function parseErrorPayload(payload: unknown, status: number): {
  message: string;
  fieldErrors: Record<string, string>;
} {
  if (!payload || typeof payload !== "object") {
    return { message: statusFallback(status), fieldErrors: {} };
  }

  const data = payload as ErrorPayload;
  const fieldErrors: Record<string, string> = {};

  if (Array.isArray(data.errors)) {
    for (const item of data.errors) {
      if (!item || typeof item !== "object") continue;
      const candidate = item as { field?: unknown; message?: unknown };
      if (typeof candidate.field !== "string" || typeof candidate.message !== "string") {
        continue;
      }
      if (!fieldErrors[candidate.field]) {
        fieldErrors[candidate.field] = translateFieldMessage(
          candidate.field,
          candidate.message,
        );
      }
    }
  }

  const fieldMessages = Object.values(fieldErrors);
  if (fieldMessages.length > 0) {
    return {
      message: fieldMessages.join(" "),
      fieldErrors,
    };
  }

  if (typeof data.error === "string" && data.error.trim()) {
    return {
      message: translateTopLevelMessage(status, data.error),
      fieldErrors,
    };
  }

  return { message: statusFallback(status), fieldErrors };
}

function translateTopLevelMessage(status: number, message: string): string {
  if (message === "Invalid email or password") {
    return "El email o la contraseña no son correctos.";
  }
  if (message === "Insufficient funds in source account") {
    return "El saldo de la cuenta de origen no alcanza para esta transferencia.";
  }
  if (message === "Cannot transfer to the same account") {
    return "La cuenta de origen y destino no pueden ser la misma.";
  }
  if (message === "Destination account not found") {
    return "No encontramos la cuenta de destino. Elegí otro contacto.";
  }
  if (message === "Source account not found") {
    return "No encontramos la cuenta de origen. Actualizá la página y probá de nuevo.";
  }
  if (message === "Account not found") {
    return "La cuenta no existe o no pertenece a tu usuario.";
  }
  if (message === "Transaction not found") {
    return "No encontramos el movimiento.";
  }
  if (message === "Transfer not found") {
    return "No encontramos la transferencia.";
  }
  if (message === "Transfers cannot be edited") {
    return "Las transferencias no se pueden editar.";
  }
  return message || statusFallback(status);
}

export function networkError(cause?: unknown): ApiError {
  return new ApiError(NETWORK_MESSAGE, { kind: "network", cause });
}

export function timeoutError(cause?: unknown): ApiError {
  return new ApiError(TIMEOUT_MESSAGE, { kind: "timeout", cause });
}

export function invalidResponseError(details?: unknown): ApiError {
  return new ApiError(INVALID_RESPONSE_MESSAGE, {
    kind: "invalid-response",
    details,
  });
}

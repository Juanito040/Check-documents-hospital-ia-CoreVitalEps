/**
 * Extrae un mensaje legible de cualquier error HTTP,
 * incluyendo los errores 422 de FastAPI cuyo `detail` es un array.
 */
export function parseHttpError(err: any, fallback = 'Ocurrió un error. Intente de nuevo.'): string {
  const detail = err?.error?.detail;

  if (!detail) {
    if (err?.status === 0) return 'No se pudo conectar con el servidor.';
    if (err?.status === 422) return 'Los datos enviados no son válidos.';
    return fallback;
  }

  // FastAPI 422: detail es un array de objetos { loc, msg, type }
  if (Array.isArray(detail)) {
    return detail
      .map((d: any) => {
        const field = d.loc?.slice(-1)[0] ?? '';
        const msg: string = d.msg ?? '';
        return field ? `${field}: ${msg}` : msg;
      })
      .join(' | ');
  }

  // detail es string directo
  return String(detail);
}

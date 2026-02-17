export const formatDateForApi = (date) =>
  date.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

export const formatDateTimeForApi = (date) =>
  date
    .toLocaleString("es-CO", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "America/Bogota",
    })
    .replace(", ", "T")
    .replace(/\./g, "");

export const getFriendlyErrorMessage = (error) => {
  const rawMessage = String(error?.message || error || "");

  if (
    rawMessage.includes("Network Error") ||
    rawMessage.includes("Failed to fetch")
  ) {
    return "No se pudo conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.";
  }

  return "Ocurrió un error al procesar la solicitud. Inténtalo nuevamente en unos minutos.";
};

export const toNumber = (value) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const hasDeliverableItems = (detalle = [], quantities = {}) =>
  detalle.some((item) => toNumber(quantities[item.id]) > 0);

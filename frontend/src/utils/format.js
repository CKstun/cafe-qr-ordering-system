export const API_BASE =
  "http://localhost/cafe-qr-ordering-system/backend/api";

export const peso = (value) =>
  `₱${Number(value || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const API_BASE = "http://localhost/cafe-qr-ordering-system/backend/api";
export const ADMIN_API = `${API_BASE}/admin`;
export const UPLOADS_BASE =
  "http://localhost/cafe-qr-ordering-system/backend/uploads";

export const peso = (value) =>
  `₱${Number(value || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const imageUrl = (filename) =>
  filename ? `${UPLOADS_BASE}/${filename}` : null;

export class AuthError extends Error {}

// The admin API's own auth.php GET (session check) legitimately returns
// 401 when logged out - that one should NOT trigger the global
// "kick back to login" event, since AdminApp is the one calling it to
// find that out in the first place.
async function handleResponse(response, path) {
  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error("The server returned an unexpected response.");
  }

  if (!result.success) {
    if (response.status === 401) {
      if (path !== "auth.php") {
        window.dispatchEvent(new Event("admin-session-expired"));
      }
      throw new AuthError(result.message || "Please log in again.");
    }
    throw new Error(result.message || "Something went wrong.");
  }

  return result.data ?? null;
}

// `credentials: "include"` is required on every call so the browser
// sends/receives the PHP session cookie used for admin login.
export async function apiGet(path) {
  const response = await fetch(`${ADMIN_API}/${path}`, {
    credentials: "include",
  });
  return handleResponse(response, path);
}

export async function apiSend(path, method, body) {
  const response = await fetch(`${ADMIN_API}/${path}`, {
    method,
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handleResponse(response, path);
}

export const apiPost = (path, body) => apiSend(path, "POST", body);
export const apiPut = (path, body) => apiSend(path, "PUT", body);

export async function apiDelete(path) {
  const response = await fetch(`${ADMIN_API}/${path}`, {
    method: "DELETE",
    credentials: "include",
  });
  return handleResponse(response, path);
}

/**
 * Uploads an image file (multipart/form-data) and returns the saved
 * filename, which should then be stored on the menu item's `image` field.
 */
export async function uploadImage(file) {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`${ADMIN_API}/upload_image.php`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const data = await handleResponse(response);
  return data.image;
}

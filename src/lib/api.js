// Single point through which all backend calls flow.
// Every method returns { data, error } and never throws.
// Adding auth later is a one-line change in getAuthHeader().

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Stub. Phase 4: read the JWT from storage and return
// { Authorization: `Bearer ${token}` }.
function getAuthHeader() {
  return {};
}

async function request(method, path, body) {
  const init = {
    method,
    headers: { ...getAuthHeader() },
  };
  if (body !== undefined) {
    init.headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(BASE_URL + path, init);
  } catch {
    return {
      data: null,
      error: {
        error: 'NetworkError',
        message: 'Could not reach the server.',
        status: 0,
      },
    };
  }

  // 204 No Content
  if (res.status === 204) {
    return { data: null, error: null };
  }

  // Parse JSON body if there is one.
  let parsed = null;
  const text = await res.text();
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = null;
    }
  }

  if (res.ok) {
    return { data: parsed, error: null };
  }

  // Non-2xx: normalize to the documented error shape
  // { error, message, status, field? }
  const error = parsed && typeof parsed === 'object'
    ? {
        error: parsed.error || 'Error',
        message: parsed.message || 'Request failed',
        status: parsed.status ?? res.status,
        ...(parsed.field ? { field: parsed.field } : {}),
      }
    : {
        error: 'Error',
        message: 'Request failed',
        status: res.status,
      };

  return { data: null, error };
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body = {}) => request('POST', path, body),
  put: (path, body = {}) => request('PUT', path, body),
  del: (path) => request('DELETE', path),

  // Special helper for PUT /api/sets/<id>. The backend returns a 400 with
  // message "no fields to update" when nothing mutable was sent. Treat that
  // as a silent no-op so the edit-set form can close without surfacing an
  // error.
  async updateSet(id, body) {
    const result = await request('PUT', `/api/sets/${id}`, body ?? {});
    if (
      result.error &&
      result.error.status === 400 &&
      result.error.message === 'no fields to update'
    ) {
      return { data: null, error: null, noop: true };
    }
    return result;
  },
};

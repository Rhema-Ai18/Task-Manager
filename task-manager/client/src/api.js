async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const api = {
  list: () => request("/api/tasks"),
  create: (title) => request("/api/tasks", { method: "POST", body: JSON.stringify({ title }) }),
  update: (id, changes) =>
    request(`/api/tasks/${id}`, { method: "PATCH", body: JSON.stringify(changes) }),
  remove: (id) => request(`/api/tasks/${id}`, { method: "DELETE" }),
};

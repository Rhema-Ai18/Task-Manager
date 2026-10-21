import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import { mkdtemp, rm } from "node:fs/promises";
import { createApp } from "../src/app.js";
import { createStore } from "../src/store.js";

let server, base, tmp;

before(async () => {
  tmp = await mkdtemp(path.join(os.tmpdir(), "tasks-"));
  const app = createApp(createStore(path.join(tmp, "tasks.json")));
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  base = `http://localhost:${server.address().port}`;
});

after(async () => {
  server.close();
  await rm(tmp, { recursive: true, force: true });
});

const json = (method, url, body) =>
  fetch(base + url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

test("starts with an empty list", async () => {
  const res = await json("GET", "/api/tasks");
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), []);
});

test("rejects an empty title", async () => {
  const res = await json("POST", "/api/tasks", { title: "   " });
  assert.equal(res.status, 400);
});

test("creates, updates and deletes a task", async () => {
  const created = await (await json("POST", "/api/tasks", { title: "Learn Docker" })).json();
  assert.equal(created.title, "Learn Docker");
  assert.equal(created.done, false);

  const updated = await (await json("PATCH", `/api/tasks/${created.id}`, { done: true })).json();
  assert.equal(updated.done, true);

  const del = await json("DELETE", `/api/tasks/${created.id}`);
  assert.equal(del.status, 204);

  const list = await (await json("GET", "/api/tasks")).json();
  assert.equal(list.length, 0);
});

test("returns 404 for an unknown task", async () => {
  const res = await json("PATCH", "/api/tasks/nope", { done: true });
  assert.equal(res.status, 404);
});

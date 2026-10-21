import express from "express";
import cors from "cors";
import path from "node:path";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp(store) {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

  app.get("/api/tasks", async (_req, res, next) => {
    try {
      res.json(await store.list());
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/tasks", async (req, res, next) => {
    try {
      const title = typeof req.body.title === "string" ? req.body.title.trim() : "";
      if (!title) return res.status(400).json({ error: "title is required" });
      if (title.length > 200) {
        return res.status(400).json({ error: "title must be 200 characters or fewer" });
      }
      res.status(201).json(await store.create(title));
    } catch (err) {
      next(err);
    }
  });

  app.patch("/api/tasks/:id", async (req, res, next) => {
    try {
      const changes = {};
      if (typeof req.body.done === "boolean") changes.done = req.body.done;
      if (typeof req.body.title === "string" && req.body.title.trim()) {
        changes.title = req.body.title.trim();
      }
      if (Object.keys(changes).length === 0) {
        return res.status(400).json({ error: "send a boolean done and/or a non-empty title" });
      }
      const task = await store.update(req.params.id, changes);
      if (!task) return res.status(404).json({ error: "task not found" });
      res.json(task);
    } catch (err) {
      next(err);
    }
  });

  app.delete("/api/tasks/:id", async (req, res, next) => {
    try {
      const removed = await store.remove(req.params.id);
      if (!removed) return res.status(404).json({ error: "task not found" });
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  });

  // In production (Docker) the built React app is served by this same server.
  const clientDist = path.resolve(__dirname, "../../client/dist");
  if (existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.get("*", (_req, res) => res.sendFile(path.join(clientDist, "index.html")));
  }

  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: "something went wrong" });
  });

  return app;
}

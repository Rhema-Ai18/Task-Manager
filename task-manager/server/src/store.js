import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

// Tiny JSON-file store so the project runs with zero database setup.
// To level up: swap this file for MongoDB or PostgreSQL and keep the routes unchanged.
export function createStore(filePath) {
  async function read() {
    try {
      return JSON.parse(await fs.readFile(filePath, "utf8"));
    } catch (err) {
      if (err.code === "ENOENT") return [];
      throw err;
    }
  }

  async function write(tasks) {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(tasks, null, 2));
  }

  return {
    list: read,

    async create(title) {
      const tasks = await read();
      const task = {
        id: randomUUID(),
        title,
        done: false,
        createdAt: new Date().toISOString(),
      };
      tasks.push(task);
      await write(tasks);
      return task;
    },

    async update(id, changes) {
      const tasks = await read();
      const task = tasks.find((t) => t.id === id);
      if (!task) return null;
      Object.assign(task, changes);
      await write(tasks);
      return task;
    },

    async remove(id) {
      const tasks = await read();
      const next = tasks.filter((t) => t.id !== id);
      if (next.length === tasks.length) return false;
      await write(next);
      return true;
    },
  };
}

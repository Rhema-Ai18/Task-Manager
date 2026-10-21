import path from "node:path";
import { fileURLToPath } from "node:url";
import { createApp } from "./app.js";
import { createStore } from "./store.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataFile = process.env.DATA_FILE || path.resolve(__dirname, "../data/tasks.json");
const port = process.env.PORT || 4000;

createApp(createStore(dataFile)).listen(port, () => {
  console.log(`Task Manager running on http://localhost:${port}`);
});

import { useEffect, useMemo, useState } from "react";
import { api } from "./api.js";

const FILTERS = ["All", "Open", "Done"];

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [filter, setFilter] = useState("All");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .list()
      .then(setTasks)
      .catch(() => setError("Could not load tasks. Is the server running?"))
      .finally(() => setLoading(false));
  }, []);

  const visible = useMemo(
    () =>
      tasks.filter((t) =>
        filter === "All" ? true : filter === "Done" ? t.done : !t.done
      ),
    [tasks, filter]
  );
  const openCount = tasks.filter((t) => !t.done).length;

  async function run(action) {
    setError("");
    try {
      await action();
    } catch (err) {
      setError(err.message);
    }
  }

  const addTask = (e) =>
    run(async () => {
      e.preventDefault();
      if (!title.trim()) return;
      const task = await api.create(title);
      setTasks((prev) => [...prev, task]);
      setTitle("");
    });

  const toggle = (task) =>
    run(async () => {
      const updated = await api.update(task.id, { done: !task.done });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    });

  const remove = (task) =>
    run(async () => {
      await api.remove(task.id);
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
    });

  return (
    <main className="page">
      <header className="head">
        <h1>Today</h1>
        <p className="count">
          {openCount === 0 ? "Nothing left open" : `${openCount} open`}
        </p>
      </header>

      <form className="add" onSubmit={addTask}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task"
          maxLength={200}
          aria-label="New task"
        />
        <button type="submit">Add task</button>
      </form>

      {error && <p role="alert" className="error">{error}</p>}

      <div className="filters" role="tablist" aria-label="Filter tasks">
        {FILTERS.map((f) => (
          <button
            key={f}
            role="tab"
            aria-selected={filter === f}
            className={filter === f ? "tab on" : "tab"}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="empty">Loading tasks…</p>
      ) : visible.length === 0 ? (
        <p className="empty">
          {tasks.length === 0 ? "No tasks yet. Add your first one above." : `No ${filter.toLowerCase()} tasks.`}
        </p>
      ) : (
        <ul className="list">
          {visible.map((task) => (
            <li key={task.id} className={task.done ? "item done" : "item"}>
              <label>
                <input type="checkbox" checked={task.done} onChange={() => toggle(task)} />
                <span>{task.title}</span>
              </label>
              <button className="del" onClick={() => remove(task)} aria-label={`Delete ${task.title}`}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Note = {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
};

const NOTES_KEY = "exercise4-notes";
const USER_KEY = "exercise4-user";

function subscribeToStorage(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("exercise4-storage", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("exercise4-storage", callback);
  };
}

function getStoredValue(key: string) {
  return window.localStorage.getItem(key) ?? "";
}

function subscribeToHydration() {
  return () => {};
}

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

function parseNotes(snapshot: string): { notes: Note[]; error: boolean } {
  if (!snapshot) return { notes: [], error: false };

  try {
    const value: unknown = JSON.parse(snapshot);
    if (
      Array.isArray(value) &&
      value.every(
        (note): note is Note =>
          typeof note === "object" &&
          note !== null &&
          "id" in note &&
          typeof note.id === "string" &&
          "title" in note &&
          typeof note.title === "string" &&
          "content" in note &&
          typeof note.content === "string" &&
          "updatedAt" in note &&
          typeof note.updatedAt === "string",
      )
    ) {
      return { notes: value, error: false };
    }
  } catch {
    return { notes: [], error: true };
  }

  return { notes: [], error: true };
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default function NotesPage() {
  const router = useRouter();
  const isReady = useSyncExternalStore(
    subscribeToHydration,
    getClientSnapshot,
    getServerSnapshot,
  );
  const email = useSyncExternalStore(
    subscribeToStorage,
    () => getStoredValue(USER_KEY),
    () => "",
  );
  const notesSnapshot = useSyncExternalStore(
    subscribeToStorage,
    () => getStoredValue(NOTES_KEY),
    () => "",
  );
  const { notes, error: notesLoadError } = useMemo(
    () => parseNotes(notesSnapshot),
    [notesSnapshot],
  );
  const [search, setSearch] = useState("");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (isReady && !email) {
      router.replace("/");
    }
  }, [email, isReady, router]);

  const filteredNotes = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return notes;
    return notes.filter((note) =>
      `${note.title} ${note.content}`.toLowerCase().includes(query),
    );
  }, [notes, search]);

  const closeEditor = useCallback(() => {
    setIsEditorOpen(false);
    setEditingId(null);
    setTitle("");
    setContent("");
    setFormError("");
  }, []);

  function openNewNote() {
    setEditingId(null);
    setTitle("");
    setContent("");
    setFormError("");
    setIsEditorOpen(true);
  }

  function openEditNote(note: Note) {
    setEditingId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setFormError("");
    setIsEditorOpen(true);
  }

  function handleSaveNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || !content.trim()) {
      setFormError("Add a title and some note text before saving.");
      return;
    }

    const updatedAt = new Date().toISOString();
    let nextNotes: Note[];
    if (editingId) {
      nextNotes = notes.map((note) =>
          note.id === editingId
            ? { ...note, title: title.trim(), content: content.trim(), updatedAt }
            : note,
        );
    } else {
      nextNotes = [
        { id: crypto.randomUUID(), title: title.trim(), content: content.trim(), updatedAt },
        ...notes,
      ];
    }
    window.localStorage.setItem(NOTES_KEY, JSON.stringify(nextNotes));
    window.dispatchEvent(new Event("exercise4-storage"));
    closeEditor();
  }

  function deleteNote(id: string) {
    const nextNotes = notes.filter((note) => note.id !== id);
    window.localStorage.setItem(NOTES_KEY, JSON.stringify(nextNotes));
    window.dispatchEvent(new Event("exercise4-storage"));
  }

  function handleLogout() {
    window.localStorage.removeItem(USER_KEY);
    window.dispatchEvent(new Event("exercise4-storage"));
    router.push("/");
  }

  if (!isReady) return <main className="notes-loading" aria-label="Loading notes" />;

  return (
    <main className="notes-page">
      <header className="app-header">
        <Link className="brand app-brand" href="/notes" aria-label="Noted home">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M7 3.75h8l4.25 4.5v11A1.75 1.75 0 0 1 17.5 21h-10A1.75 1.75 0 0 1 5.75 19.25v-13A2.5 2.5 0 0 1 8.25 3.75Z" />
              <path d="M14.75 4v4.5h4.1M9 12h7M9 15.5h7" />
            </svg>
          </span>
          <span>noted<span className="brand-period">.</span></span>
        </Link>
        <div className="account-area">
          <span className="account-email">{email}</span>
          <span className="avatar" aria-hidden="true">{email.charAt(0).toUpperCase()}</span>
          <button className="logout-button" type="button" onClick={handleLogout}>Log out</button>
        </div>
      </header>

      <section className="notes-content">
        <div className="notes-heading">
          <div>
            <p className="section-label">YOUR PERSONAL SPACE</p>
            <h1>Good thoughts, kept.</h1>
            <p className="notes-subtitle">
              A home for all the things you don’t want to forget.
            </p>
          </div>
          <button className="new-note-button" type="button" onClick={openNewNote}>
            <span aria-hidden="true">＋</span> New note
          </button>
        </div>

        <div className="notes-toolbar">
          <div>
            <h2>All notes <span className="note-count">{notes.length}</span></h2>
          </div>
          <label className="search-box">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="10.8" cy="10.8" r="6.8" />
              <path d="m16 16 4.25 4.25" />
            </svg>
            <input
              type="search"
              aria-label="Search notes"
              placeholder="Search your notes"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
        </div>

        {notesLoadError && (
          <p className="load-error" role="alert">
            Saved notes could not be read. New notes can still be created.
          </p>
        )}

        {filteredNotes.length > 0 ? (
          <div className="notes-grid">
            {filteredNotes.map((note, index) => (
              <article className={`note-card note-color-${index % 4}`} key={note.id}>
                <div className="note-card-top">
                  <span className="note-type">NOTE</span>
                  <div className="note-actions">
                    <button type="button" onClick={() => openEditNote(note)} aria-label={`Edit ${note.title}`}>
                      Edit
                    </button>
                    <button type="button" onClick={() => deleteNote(note.id)} aria-label={`Delete ${note.title}`}>
                      Delete
                    </button>
                  </div>
                </div>
                <h3>{note.title}</h3>
                <p className="note-card-content">{note.content}</p>
                <span className="note-date">Updated {formatDate(note.updatedAt)}</span>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-icon" aria-hidden="true">✳</span>
            <h3>{search ? "No notes found" : "Your page is a blank canvas."}</h3>
            <p>
              {search
                ? "Try another search term."
                : "Start with a thought, a reminder, or anything you want to keep."}
            </p>
            {!search && (
              <button className="new-note-button" type="button" onClick={openNewNote}>
                <span aria-hidden="true">＋</span> Write your first note
              </button>
            )}
          </div>
        )}
      </section>

      <footer className="app-footer">Made for the thoughts worth keeping.</footer>

      {isEditorOpen && (
        <div className="modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeEditor();
        }}>
          <section className="note-editor" role="dialog" aria-modal="true" aria-labelledby="editor-title">
            <div className="editor-heading">
              <div>
                <p className="section-label">{editingId ? "MAKE IT YOURS" : "A FRESH PAGE"}</p>
                <h2 id="editor-title">{editingId ? "Edit note" : "New note"}</h2>
              </div>
              <button className="close-editor" type="button" onClick={closeEditor} aria-label="Close editor">
                ×
              </button>
            </div>
            <form onSubmit={handleSaveNote}>
              <label className="editor-label" htmlFor="note-title">Title</label>
              <input
                id="note-title"
                className="editor-input"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Give this note a name"
                maxLength={80}
                autoFocus
              />
              <label className="editor-label" htmlFor="note-content">Your note</label>
              <textarea
                id="note-content"
                className="editor-input editor-textarea"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Let your thoughts land here..."
                rows={7}
              />
              {formError && <p className="editor-error" role="alert">{formError}</p>}
              <div className="editor-actions">
                <button className="cancel-button" type="button" onClick={closeEditor}>Cancel</button>
                <button className="new-note-button" type="submit">{editingId ? "Save changes" : "Save note"}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

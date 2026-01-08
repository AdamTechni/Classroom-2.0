"use client";

import { useState } from "react";
import styles from "./page.module.css";

type Course = {
  id: string;
  name: string;
  shortName: string;
  period: string;
  group: string;
  location: string;
  color: string;
};

type Post = {
  id: number;
  courseId: string;
  content: string;
  createdAt: Date;
};

const COURSES: Course[] = [
  {
    id: "prog-web",
    name: "Programowanie aplikacji webowych",
    shortName: "Prog web",
    period: "2023–2028",
    group: "Klasa 3A",
    location: "Lublin",
    color: "#22c55e",
  },
  {
    id: "geo",
    name: "Geografia",
    shortName: "Geo",
    period: "2023–2028",
    group: "Klasa 3A",
    location: "Lublin",
    color: "#a855f7",
  },
  {
    id: "web-adv",
    name: "Zaawansowane aplikacje webowe",
    shortName: "Web",
    period: "2023–2028",
    group: "3A, gr.2",
    location: "Lublin",
    color: "#0ea5e9",
  },
  {
    id: "prog-mob",
    name: "Programowanie aplikacji mobilnych",
    shortName: "Mob",
    period: "2023–2028",
    group: "3A",
    location: "Lublin",
    color: "#f97316",
  },
];

function formatDate(date: Date) {
  try {
    return date.toLocaleString("pl-PL", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return "";
  }
}

export default function Home() {
  const [selectedId, setSelectedId] = useState<string>(COURSES[0].id);
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);

  const selected = COURSES.find((c) => c.id === selectedId)!;
  const postsForCourse = posts.filter((p) => p.courseId === selected.id);
  const canPublish = newPostContent.trim().length > 0;

  const handlePublish = () => {
    if (!canPublish) return;

    const post: Post = {
      id: Date.now(),
      courseId: selected.id,
      content: newPostContent.trim(),
      createdAt: new Date(),
    };

    setPosts((prev) => [post, ...prev]);
    setNewPostContent("");
    setIsPublishOpen(false);
  };

  return (
    <div className={styles.shell}>
      {/* Górny pasek */}
      <header className={styles.topbar}>
        <div className={styles.logoArea}>
          <div className={styles.logoMark}>C</div>
          <div className={styles.logoText}>
            <span className={styles.logoTitle}>Classroom 2.0</span>
            <span className={styles.logoSub}>Panel ucznia</span>
          </div>
        </div>
        <div className={styles.topbarRight}>
          <button className={styles.iconButton} aria-label="Powiadomienia">
            🔔
          </button>
          <button className={styles.avatar}>A</button>
        </div>
      </header>

      <main className={styles.layout}>
        {/* Lewy sidebar: lista przedmiotów */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <span className={styles.sidebarTitle}>Moje zajęcia</span>
            <button className={styles.smallButton}>+ Dołącz</button>
          </div>

          <div className={styles.courseList}>
            {COURSES.map((course) => (
              <button
                key={course.id}
                className={`${styles.courseItem} ${
                  course.id === selectedId ? styles.courseItemActive : ""
                }`}
                onClick={() => setSelectedId(course.id)}
              >
                <div
                  className={styles.courseDot}
                  style={{ backgroundColor: course.color }}
                />
                <div className={styles.courseMeta}>
                  <span className={styles.courseName}>{course.name}</span>
                  <span className={styles.courseDetails}>
                    {course.period} · {course.group} · {course.location}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Prawy panel: wybrane zajęcia */}
        <section className={styles.content}>
          <div className={styles.courseHeader}>
            <div className={styles.courseHeaderText}>
              <span className={styles.courseLabel}>
                Przedmiot · {selected.shortName}
              </span>
              <h1 className={styles.courseTitle}>{selected.name}</h1>
              <p className={styles.courseSubtitle}>
                {selected.period}, {selected.group}, {selected.location}
              </p>
            </div>
            <div className={styles.courseHeaderActions}>
              <button
                className={styles.primaryButton}
                onClick={() => setIsPublishOpen(true)}
              >
                Nowe ogłoszenie
              </button>
              <button className={styles.secondaryButton}>Dodaj zadanie</button>
            </div>
          </div>

          {/* Zakładki (na razie tylko UI) */}
          <div className={styles.tabs}>
            <button className={`${styles.tab} ${styles.tabActive}`}>
              Strumień
            </button>
            <button className={styles.tab}>Zadania</button>
            <button className={styles.tab}>Osoby</button>
          </div>

          {/* Strumień: albo lista postów, albo info że pusty */}
          {postsForCourse.length === 0 ? (
            <div className={styles.emptyWrapper}>
              <div className={styles.emptyState}>
                <div className={styles.emptyBadge}>Strumień zajęć</div>
                <h2 className={styles.emptyTitle}>
                  Na razie nie ma żadnych postów
                </h2>
                <p className={styles.emptyText}>
                  Gdy nauczyciel doda ogłoszenie lub zadanie dla przedmiotu
                  „{selected.name}”, pojawi się ono w tym miejscu.
                </p>
              </div>
            </div>
          ) : (
            <div className={styles.postList}>
              {postsForCourse.map((post) => (
                <article key={post.id} className={styles.postCard}>
                  <header className={styles.postHeader}>
                    <div className={styles.postAvatar}>N</div>
                    <div>
                      <div className={styles.postAuthor}>Nauczyciel</div>
                      <div className={styles.postMeta}>
                        {formatDate(post.createdAt)} · Ogłoszenie
                      </div>
                    </div>
                  </header>
                  <p className={styles.postContent}>{post.content}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* MODAL "OPUBLIKUJ" */}
      {isPublishOpen && (
        <div
          className={styles.modalOverlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsPublishOpen(false);
          }}
        >
          <div className={styles.modal}>
            <header className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Opublikuj</h2>
            </header>

            <form
              className={styles.modalBody}
              onSubmit={(e) => {
                e.preventDefault();
                handlePublish();
              }}
            >
              <div className={styles.modalEditor}>
                <textarea
                  className={styles.modalTextarea}
                  placeholder="Ogłoś coś uczniom"
                  name="content"
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                />
              </div>

              {/* pasek formatowania – na razie tylko wizualnie */}
              <div className={styles.modalToolbar}>
                <button type="button" className={styles.toolbarButton}>
                  B
                </button>
                <button type="button" className={styles.toolbarButton}>
                  I
                </button>
                <button type="button" className={styles.toolbarButton}>
                  U
                </button>
                <button type="button" className={styles.toolbarButton}>
                  •
                </button>
                <button type="button" className={styles.toolbarButton}>
                  1.
                </button>
                <button type="button" className={styles.toolbarButton}>
                  ✕
                </button>
              </div>

              {/* ikony załączników – na razie „martwe” */}
              <div className={styles.modalAttachmentRow}>
                <button type="button" className={styles.circleIconButton}>
                  △
                </button>
                <button type="button" className={styles.circleIconButton}>
                  ▶
                </button>
                <button type="button" className={styles.circleIconButton}>
                  ⬆
                </button>
                <button type="button" className={styles.circleIconButton}>
                  ⛓
                </button>
              </div>

              <footer className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.modalCancel}
                  onClick={() => setIsPublishOpen(false)}
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className={`${styles.modalPublish} ${
                    !canPublish ? styles.modalPublishDisabled : ""
                  }`}
                  disabled={!canPublish}
                >
                  Opublikuj
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

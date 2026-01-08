"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from 'react-hot-toast';
import { isValidClassCodeFormat } from "@/lib/classCode";
import {
    Bell,
    Plus,
    MoreVertical,
    MessageSquare,
    Menu,
    X,
    Image as ImageIcon,
    Link as LinkIcon,
    Youtube,
    Upload,
    LogOut,
    Settings,
    BookOpen,
    Calendar,
    FileText,
    CheckCircle2
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { db } from "@/lib/firebase";
import {
    collection,
    addDoc,
    query,
    where,
    onSnapshot,
    orderBy,
    serverTimestamp,
    Timestamp,
    getDocs,
    doc,
    setDoc
} from "firebase/firestore";

// --- Types ---

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
    id: string;
    courseId: string;
    content: string;
    createdAt: Timestamp | null;
    author: string;
    authorPhotoURL?: string;
};

type Assignment = {
    id: string;
    courseId: string;
    title: string;
    description: string;
    topic: string;
    type: 'material' | 'assignment';
    createdAt: Timestamp | null;
    dueDate?: string;
    authorId: string;
};

// --- Constants ---

const COURSES: Course[] = [
    {
        id: "prog-web",
        name: "Programowanie aplikacji webowych",
        shortName: "Prog web",
        period: "2023–2028",
        group: "Klasa 3A",
        location: "Sala 204",
        color: "bg-emerald-500",
    },
    {
        id: "geo",
        name: "Geografia",
        shortName: "Geo",
        period: "2023–2028",
        group: "Klasa 3A",
        location: "Sala 15",
        color: "bg-purple-500",
    },
    {
        id: "web-adv",
        name: "Zaawansowane aplikacje webowe",
        shortName: "Web",
        period: "2023–2028",
        group: "3A, gr.2",
        location: "Lab 3",
        color: "bg-sky-500",
    },
    {
        id: "prog-mob",
        name: "Programowanie aplikacji mobilnych",
        shortName: "Mob",
        period: "2023–2028",
        group: "3A",
        location: "Lab 2",
        color: "bg-orange-500",
    },
];

const DEFAULT_TOPICS = ["Materiały podstawowe", "Projekt końcowy", "Zadania domowe", "Inne"];

// --- Helpers ---

function formatDate(timestamp: Timestamp | null) {
    if (!timestamp) return "Teraz";
    try {
        return timestamp.toDate().toLocaleString("pl-PL", {
            dateStyle: "short",
            timeStyle: "short",
        });
    } catch {
        return "";
    }
}

function useClickOutside(callback: () => void) {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                callback();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [callback]);
    return ref;
}

// --- Main Component ---

export default function Home() {
    const { user, loading, logout } = useAuth();
    const router = useRouter();

    // UI State
    const [selectedId, setSelectedId] = useState<string>(COURSES[0].id);
    const [activeTab, setActiveTab] = useState<'stream' | 'classwork' | 'people'>('stream');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Modals & Menu State
    const [isPublishOpen, setIsPublishOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isJoinClassOpen, setIsJoinClassOpen] = useState(false);
    const [isCourseMenuOpen, setIsCourseMenuOpen] = useState(false);
    const [isCreateAssignmentOpen, setIsCreateAssignmentOpen] = useState(false);
    const [viewingAssignment, setViewingAssignment] = useState<Assignment | null>(null);

    // Refs
    const profileRef = useClickOutside(() => setIsProfileOpen(false));
    const notifRef = useClickOutside(() => setIsNotificationsOpen(false));
    const courseMenuRef = useClickOutside(() => setIsCourseMenuOpen(false));

    // Data State
    const [newPostContent, setNewPostContent] = useState("");
    const [posts, setPosts] = useState<Post[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);

    // Create Assignment Form State
    const [newAssignment, setNewAssignment] = useState({
        title: "",
        description: "",
        topic: DEFAULT_TOPICS[0],
        type: 'material' as 'material' | 'assignment'
    });

    // Join Class State
    const [joinClassCode, setJoinClassCode] = useState("");

    const selected = COURSES.find((c) => c.id === selectedId)!;

    // Auth Redirect
    useEffect(() => {
        if (!loading && !user) {
            router.push("/");
        }
    }, [user, loading, router]);

    // Fetch Posts
    useEffect(() => {
        if (!db) return;
        const q = query(
            collection(db, "posts"),
            where("courseId", "==", selectedId),
            orderBy("createdAt", "desc")
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post)));
        });
        return () => unsubscribe();
    }, [selectedId]);

    // Fetch Assignments
    useEffect(() => {
        if (!db) return;
        const q = query(
            collection(db, "assignments"),
            where("courseId", "==", selectedId),
            orderBy("createdAt", "desc")
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setAssignments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Assignment)));
        });
        return () => unsubscribe();
    }, [selectedId]);

    // Handlers
    const handlePublish = async () => {
        if (newPostContent.trim().length === 0 || !user || !db) return;
        const loadingToast = toast.loading('Publikowanie...');
        try {
            await addDoc(collection(db, "posts"), {
                courseId: selected.id,
                content: newPostContent.trim(),
                createdAt: serverTimestamp(),
                author: user.displayName || "Użytkownik",
                authorPhotoURL: user.photoURL,
                userId: user.uid
            });
            setNewPostContent("");
            setIsPublishOpen(false);
            toast.success('Ogłoszenie opublikowane!', { id: loadingToast });
        } catch (error) {
            console.error("Error adding post: ", error);
            toast.error('Błąd podczas publikacji', { id: loadingToast });
        }
    };

    const handleCreateAssignment = async () => {
        if (newAssignment.title.trim().length === 0 || !user || !db) return;
        const loadingToast = toast.loading('Tworzenie zadania...');
        try {
            await addDoc(collection(db, "assignments"), {
                courseId: selected.id,
                title: newAssignment.title,
                description: newAssignment.description,
                topic: newAssignment.topic,
                type: newAssignment.type,
                createdAt: serverTimestamp(),
                authorId: user.uid
            });
            setNewAssignment({ title: "", description: "", topic: DEFAULT_TOPICS[0], type: 'material' });
            setIsCreateAssignmentOpen(false);
            toast.success('Zadanie utworzone pomyślnie!', { id: loadingToast });
        } catch (error) {
            console.error("Error creating assignment: ", error);
            toast.error('Błąd podczas tworzenia zadania', { id: loadingToast });
        }
    };

    const handleLogout = async () => {
        await logout();
        router.push("/");
    };

    const handleJoinClass = async () => {
        if (!user || !db) return;

        const cleanCode = joinClassCode.replace(/-/g, '').toUpperCase().trim();

        if (!isValidClassCodeFormat(cleanCode)) {
            toast.error('Nieprawidłowy format kodu. Użyj formatu XXX-XXX');
            return;
        }

        const loadingToast = toast.loading('Szukam zajęć...');

        try {
            // Search for course with this code
            const coursesRef = collection(db, "courses");
            const q = query(coursesRef, where("code", "==", cleanCode));
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                toast.error('Nie znaleziono zajęć o tym kodzie', { id: loadingToast });
                return;
            }

            const courseDoc = snapshot.docs[0];
            const courseId = courseDoc.id;

            // Add user to course participants
            const participantRef = doc(db, `courses/${courseId}/participants`, user.uid);
            await setDoc(participantRef, {
                role: 'student',
                joinedAt: serverTimestamp(),
                displayName: user.displayName,
                email: user.email,
                photoURL: user.photoURL
            });

            toast.success('Pomyślnie dołączono do zajęć!', { id: loadingToast });
            setJoinClassCode("");
            setIsJoinClassOpen(false);

            // Refresh the page to show new course
            router.refresh();
        } catch (error) {
            console.error("Error joining class:", error);
            toast.error('Błąd podczas dołączania do zajęć', { id: loadingToast });
        }
    };

    // Grouping logic
    const groupedAssignments = assignments.reduce((acc, curr) => {
        const topic = curr.topic || "Inne";
        if (!acc[topic]) acc[topic] = [];
        acc[topic].push(curr);
        return acc;
    }, {} as Record<string, Assignment[]>);

    const sortedTopics = Object.keys(groupedAssignments).sort((a, b) => {
        // Force specific order/logic if needed, or just alpha
        return a.localeCompare(b);
    });


    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;
    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
            {/* Header */}
            <header className="h-16 bg-white border-b border-gray-200 px-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 rounded-full lg:hidden">
                        <Menu size={24} className="text-gray-600" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md">C</div>
                        <span className="text-xl font-bold tracking-tight text-gray-800 hidden sm:block">Classroom 2.0</span>
                    </div>
                </div>
                <div className="flex actions gap-2 sm:gap-4 items-center">
                    <button onClick={() => setIsJoinClassOpen(true)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                        <Plus size={24} />
                    </button>
                    <div className="relative" ref={notifRef}>
                        <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className={`p-2 rounded-full relative ${isNotificationsOpen ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-100 text-gray-500'}`}>
                            <Bell size={22} />
                        </button>
                        {isNotificationsOpen && (
                            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                                <div className="px-4 py-2 border-b border-gray-50"><h3 className="font-semibold text-gray-700">Powiadomienia</h3></div>
                                <div className="p-8 text-center text-gray-500 text-sm">Brak nowych powiadomień</div>
                            </div>
                        )}
                    </div>
                    <div className="w-px h-8 bg-gray-200 hidden sm:block"></div>
                    <div className="relative" ref={profileRef}>
                        <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white shadow-sm overflow-hidden hover:ring-2 hover:ring-indigo-100 transition-all">
                            {user?.photoURL ? <img src={user.photoURL} alt="User" /> : <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-700 font-bold">{user?.displayName?.[0] || "U"}</div>}
                        </button>
                        {isProfileOpen && (
                            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                                <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold flex-shrink-0 overflow-hidden">
                                        {user?.photoURL ? <img src={user.photoURL} alt="User" className="w-full h-full object-cover" /> : user?.displayName?.[0] || "U"}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-gray-800 truncate">{user.displayName || "Użytkownik"}</p>
                                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                    </div>
                                </div>
                                <div className="py-2">
                                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                                        <LogOut size={16} /> Wyloguj się
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <aside className={`fixed inset-y-0 left-0 z-20 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out pt-16 lg:relative lg:translate-x-0 lg:pt-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="p-4 overflow-y-auto h-full">
                        <div className="mb-6">
                            <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Moje zajęcia</h3>
                            <div className="space-y-1">
                                {COURSES.map((course) => (
                                    <button
                                        key={course.id}
                                        onClick={() => {
                                            setSelectedId(course.id);
                                            setActiveTab('stream');
                                            if (window.innerWidth < 1024) setIsSidebarOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${course.id === selectedId ? 'bg-indigo-50 text-indigo-700 font-medium shadow-sm ring-1 ring-indigo-200' : 'text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        <div className={`w-2 h-8 rounded-full ${course.color} shadow-sm`}></div>
                                        <div className="flex-1 min-w-0">
                                            <div className="truncate">{course.name}</div>
                                            <div className="text-xs text-gray-400 truncate opacity-80">{course.group}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main */}
                <main className="flex-1 overflow-y-auto w-full">
                    <div className="max-w-5xl mx-auto p-4 lg:p-8">
                        {/* Course Banner */}
                        <div className={`rounded-3xl p-6 lg:p-10 text-white shadow-lg mb-8 relative overflow-hidden ${selected.color}`}>
                            <div className="absolute inset-0 bg-black/10"></div>
                            <div className="relative z-10">
                                <h1 className="text-2xl lg:text-4xl font-bold mb-2">{selected.name}</h1>
                                <p className="text-white/90 text-sm lg:text-lg flex items-center gap-2">{selected.group}<span className="w-1.5 h-1.5 rounded-full bg-white/60"></span>{selected.location}</p>
                            </div>
                            <div className="absolute bottom-4 right-4" ref={courseMenuRef}>
                                <button onClick={() => setIsCourseMenuOpen(!isCourseMenuOpen)} className="p-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm text-white">
                                    <MoreVertical size={20} />
                                </button>
                                {isCourseMenuOpen && (
                                    <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-20 text-gray-800 animate-in fade-in zoom-in-95 duration-100">
                                        <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"><Settings size={16} /> Ustawienia kursu</button>
                                        <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"><LogOut size={16} /> Wypisz się</button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex items-center gap-1 border-b border-gray-200 mb-6 overflow-x-auto">
                            {['stream', 'classwork', 'people'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab as any)}
                                    className={`px-6 py-3 font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === tab ? 'text-indigo-600 border-indigo-600' : 'text-gray-500 border-transparent hover:bg-gray-50 hover:text-gray-800'}`}
                                >
                                    {tab === 'stream' ? 'Strumień' : tab === 'classwork' ? 'Zadania' : 'Osoby'}
                                </button>
                            ))}
                        </div>

                        {/* STREAM View */}
                        {activeTab === 'stream' && (
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                                <div className="lg:col-span-1 hidden lg:block space-y-4">
                                    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                                        <div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-gray-800">Nadchodzące</h3></div>
                                        <div className="text-sm text-gray-500 mb-4 space-y-3"><p>Brak zadań na ten tydzień</p></div>
                                        <button onClick={() => setActiveTab('classwork')} className="text-sm text-indigo-600 font-medium hover:underline block ml-auto">Wyświetl wszystko</button>
                                    </div>
                                </div>
                                <div className="lg:col-span-3 space-y-6">
                                    <div onClick={() => setIsPublishOpen(true)} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow group flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold group-hover:scale-105 transition-transform overflow-hidden">
                                            {user?.photoURL ? <img src={user.photoURL} alt="User" className="w-full h-full object-cover" /> : "J"}
                                        </div>
                                        <div className="text-gray-500 text-sm group-hover:text-gray-700">Ogłoś coś klasie...</div>
                                    </div>

                                    {posts.length === 0 ? (
                                        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
                                            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-400"><MessageSquare size={32} /></div>
                                            <h3 className="text-xl font-bold text-gray-800 mb-2">Tu zaczyna się dyskusja</h3>
                                            <p className="text-gray-500 max-w-md mx-auto">Gdy opublikujesz ogłoszenie lub zadanie, pojawi się ono tutaj.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {posts.map((post) => (
                                                <article key={post.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                                                    <div className="flex items-start gap-3 mb-4">
                                                        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                                                            {post.authorPhotoURL ? <img src={post.authorPhotoURL} alt={post.author} className="w-full h-full object-cover" /> : post.author[0]}
                                                        </div>
                                                        <div><div className="font-semibold text-gray-900">{post.author}</div><div className="text-xs text-gray-500">{formatDate(post.createdAt)}</div></div>
                                                        <button className="ml-auto text-gray-400 hover:text-gray-600 p-1"><MoreVertical size={18} /></button>
                                                    </div>
                                                    <div className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</div>
                                                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-4">
                                                        <input type="text" placeholder="Dodaj komentarz..." className="flex-1 bg-gray-50 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" />
                                                        <button className="p-2 text-gray-400 hover:text-indigo-600"><Upload size={18} /></button>
                                                    </div>
                                                </article>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* CLASSWORK View */}
                        {activeTab === 'classwork' && (
                            <div className="space-y-8 animate-in fade-in duration-300">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-gray-800">Zadania</h2>
                                    <button
                                        onClick={() => setIsCreateAssignmentOpen(true)}
                                        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
                                    >
                                        <Plus size={20} />
                                        Utwórz
                                    </button>
                                </div>

                                {assignments.length === 0 ? (
                                    <div className="text-center py-20 text-gray-500">
                                        <BookOpen size={48} className="mx-auto mb-4 text-gray-300" />
                                        <p>Brak zadań. Kliknij "Utwórz", aby dodać materiały.</p>
                                    </div>
                                ) : (
                                    sortedTopics.map(topic => (
                                        <div key={topic}>
                                            <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-4">
                                                <h3 className="text-xl font-semibold text-indigo-600">{topic}</h3>
                                            </div>
                                            <div className="space-y-3">
                                                {groupedAssignments[topic].map((assignment) => (
                                                    <div
                                                        key={assignment.id}
                                                        onClick={() => setViewingAssignment(assignment)}
                                                        className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer"
                                                    >
                                                        <div className={`p-2 rounded-lg ${assignment.type === 'assignment' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'}`}>
                                                            {assignment.type === 'assignment' ? <Calendar size={24} /> : <BookOpen size={24} />}
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="font-medium text-gray-800">{assignment.title}</h4>
                                                            <p className="text-xs text-gray-400">
                                                                {formatDate(assignment.createdAt)} {assignment.dueDate ? `• Termin: ${assignment.dueDate}` : ''}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* PEOPLE View */}
                        {activeTab === 'people' && (
                            <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
                                <div>
                                    <h2 className="text-2xl font-bold text-indigo-600 border-b border-indigo-200 pb-3 mb-4 flex justify-between items-center">
                                        Nauczyciele <span className="text-sm font-normal text-gray-500">1 osoba</span>
                                    </h2>
                                    <div className="flex items-center gap-4 p-3 border-b border-gray-100">
                                        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">N</div>
                                        <span className="font-medium text-gray-800">Jan Nauczyciel</span>
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-indigo-600 border-b border-indigo-200 pb-3 mb-4 flex justify-between items-center">
                                        Uczniowie <span className="text-sm font-normal text-gray-500">25 osób</span>
                                    </h2>
                                    <div className="space-y-1">
                                        {[...Array(5)].map((_, i) => (
                                            <div key={i} className="flex items-center gap-4 p-3 border-b border-gray-100 hover:bg-gray-50 rounded-lg transition-colors">
                                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">{String.fromCharCode(65 + i)}</div>
                                                <span className="font-medium text-gray-800">Uczeń {i + 1}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Create Post Modal */}
            {isPublishOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-800">Nowe ogłoszenie</h2>
                            <button onClick={() => setIsPublishOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} className="text-gray-500" /></button>
                        </div>
                        <div className="flex gap-4 p-4 bg-gray-50 rounded-2xl mb-4">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold flex-shrink-0">{user?.displayName?.[0] || "U"}</div>
                            <textarea placeholder={`Ogłoś coś klasie ${selected.name}...`} className="w-full bg-transparent border-none p-0 text-gray-800 placeholder:text-gray-400 focus:ring-0 resize-none min-h-[120px]" value={newPostContent} onChange={(e) => setNewPostContent(e.target.value)} autoFocus />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setIsPublishOpen(false)} className="px-6 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-200">Anuluj</button>
                            <button onClick={handlePublish} className="px-6 py-2.5 rounded-xl font-medium text-white bg-indigo-600 hover:bg-indigo-700">Opublikuj</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Assignment Modal */}
            {isCreateAssignmentOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-800">Nowe zadanie / materiał</h2>
                            <button onClick={() => setIsCreateAssignmentOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} className="text-gray-500" /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tytuł</label>
                                <input
                                    type="text"
                                    value={newAssignment.title}
                                    onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="np. Dokumentacja projektu"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Opis</label>
                                <textarea
                                    value={newAssignment.description}
                                    onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px]"
                                    placeholder="Dodaj instrukcje..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Temat</label>
                                    <select
                                        value={newAssignment.topic}
                                        onChange={(e) => setNewAssignment({ ...newAssignment, topic: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                    >
                                        {DEFAULT_TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Typ</label>
                                    <select
                                        value={newAssignment.type}
                                        onChange={(e) => setNewAssignment({ ...newAssignment, type: e.target.value as any })}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                    >
                                        <option value="material">Materiał</option>
                                        <option value="assignment">Zadanie</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 flex justify-end gap-3">
                            <button onClick={() => setIsCreateAssignmentOpen(false)} className="px-6 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-200">Anuluj</button>
                            <button
                                onClick={handleCreateAssignment}
                                disabled={!newAssignment.title.trim()}
                                className={`px-6 py-2.5 rounded-xl font-medium text-white transition-all ${newAssignment.title.trim() ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-300 cursor-not-allowed'}`}
                            >
                                Utwórz
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Assignment Modal */}
            {viewingAssignment && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-gray-100 flex items-start justify-between">
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-2xl ${viewingAssignment.type === 'assignment' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'}`}>
                                    {viewingAssignment.type === 'assignment' ? <Calendar size={32} /> : <BookOpen size={32} />}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 leading-tight">{viewingAssignment.title}</h2>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                        <span>{viewingAssignment.authorId === user.uid ? "Ty" : "Nauczyciel"}</span>
                                        <span>•</span>
                                        <span>{formatDate(viewingAssignment.createdAt)}</span>
                                        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium border border-gray-200">{viewingAssignment.topic}</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setViewingAssignment(null)} className="p-2 hover:bg-gray-100 rounded-full"><X size={24} className="text-gray-500" /></button>
                        </div>
                        <div className="p-8 overflow-y-auto">
                            <div className="prose prose-indigo max-w-none text-gray-700 whitespace-pre-wrap">
                                {viewingAssignment.description || <span className="italic text-gray-400">Brak opisu.</span>}
                            </div>
                        </div>
                        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
                            <button onClick={() => setViewingAssignment(null)} className="px-6 py-2.5 bg-white border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-100">Zamknij</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Join Class Modal */}
            {isJoinClassOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-800">Dołącz do zajęć</h2>
                            <button onClick={() => { setIsJoinClassOpen(false); setJoinClassCode(""); }} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} className="text-gray-500" /></button>
                        </div>
                        <div className="space-y-4">
                            <p className="text-sm text-gray-500">Poproś nauczyciela o kod zajęć i wpisz go tutaj.</p>
                            <input
                                type="text"
                                placeholder="XXX-XXX"
                                value={joinClassCode}
                                onChange={(e) => setJoinClassCode(e.target.value.toUpperCase())}
                                onKeyPress={(e) => e.key === 'Enter' && handleJoinClass()}
                                maxLength={7}
                                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none text-center text-lg font-mono tracking-wider"
                            />
                        </div>
                        <div className="px-6 py-4 mt-4 -mx-6 -mb-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 rounded-b-3xl">
                            <button onClick={() => { setIsJoinClassOpen(false); setJoinClassCode(""); }} className="px-6 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-200">Anuluj</button>
                            <button
                                onClick={handleJoinClass}
                                disabled={!joinClassCode.trim()}
                                className={`px-6 py-2.5 rounded-xl font-medium text-white transition-all ${joinClassCode.trim() ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-300 cursor-not-allowed'}`}
                            >
                                Dołącz
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

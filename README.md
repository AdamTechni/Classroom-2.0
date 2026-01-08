# Classroom 2.0

Nowoczesna platforma edukacyjna zbudowana na Next.js i Firebase, oferująca seamless doświadczenie nauki online.

## 🚀 Funkcje

- ✅ **Autentykacja Google** - Bezpieczne logowanie przez Firebase Auth
- ✅ **System Ogłoszeń** - Real-time komunikacja w ramach zajęć
- ✅ **Zarządzanie Zadaniami** - Tworzenie i organizacja materiałów i zadań
- ✅ **Kody Dostępu** - Łatwe dołączanie do zajęć przez kody
- ✅ **Toast Notifications** - Profesjonalne powiadomienia dla użytkowników
- ✅ **Security Rules** - Kompletne reguły bezpieczeństwa dla Firestore i Storage

## 🛠️ Stack Technologiczny

- **Frontend**: Next.js 16 + React 19 + TypeScript
- **Styling**: Tailwind CSS 4
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Deployment**: Firebase Hosting

## 📋 Wymagania

- Node.js 18+ i npm
- Konto Firebase
- Git

## ⚙️ Setup Lokalny

### 1. Klonowanie repozytorium

\`\`\`bash
git clone https://github.com/your-username/Classroom-2.0.git
cd Classroom-2.0
\`\`\`

### 2. Instalacja zależności

\`\`\`bash
npm install
\`\`\`

### 3. Konfiguracja Firebase

1. Utwórz nowy projekt Firebase na [console.firebase.google.com](https://console.firebase.google.com)
2. Włącz Authentication → Google Sign-In
3. Utwórz Firestore Database (w trybie production)
4. Aktywuj Firebase Storage
5. Skopiuj Firebase config z Project Settings

### 4. Zmienne Środowiskowe

Utwórz plik \`.env.local\` w głównym katalogu:

\`\`\`env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
\`\`\`

### 5. Deploy Security Rules

**KRYTYCZNE - Bez tego krok aplikacja jest niezabezpieczona!**

\`\`\`bash
# Instalacja Firebase CLI (jeśli nie masz)
npm install -g firebase-tools

# Logowanie
firebase login

# Inicjalizacja projektu (wybierz istniejący projekt)
firebase init

# Deploy reguł
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
\`\`\`

### 6. Uruchomienie Development Server

\`\`\`bash
npm run dev
\`\`\`

Otwórz [http://localhost:3000](http://localhost:3000) w przeglądarce.

## 🚢 Deployment

### Firebase Hosting

\`\`\`bash
# Build produkcyjny
npm run build

# Deploy do Firebase
firebase deploy --only hosting
\`\`\`

### Alternatywnie: Vercel

\`\`\`bash
npm install -g vercel
vercel
\`\`\`

Pamiętaj o ustawieniu zmiennych środowiskowych w Vercel Dashboard!

## 📁 Struktura Projektu

\`\`\`
Classroom-2.0/
├── app/
│   ├── dashboard/
│   │   └── page.tsx          # Główny dashboard
│   ├── layout.tsx             # Root layout z AuthProvider
│   ├── page.tsx               # Landing page
│   └── globals.css            # Global styles
├── components/
│   ├── AuthProvider.tsx       # Context dla autentykacji
│   ├── ClassCard.tsx          # Karta kursu
│   ├── Hero.tsx               # Hero section
│   ├── Navbar.tsx             # Navbar component
│   └── ToastProvider.tsx      # Toast notifications provider
├── lib/
│   ├── firebase.ts            # Firebase config
│   └── classCode.ts           # Utility dla kodów zajęć
├── public/                    # Static assets
├── firestore.rules            # 🔒 Firestore security rules
├── storage.rules              # 🔒 Storage security rules
├── firebase.json              # Firebase configuration
└── package.json
\`\`\`

## 🔐 Bezpieczeństwo

Projekt zawiera kompletne Security Rules dla:
- **Firestore**: Walidacja autoryzacji, sprawdzanie właściciela, limity długości treści
- **Storage**: Walidacja typów plików, limity rozmiaru, kontrola dostępu

**WAŻNE**: Zawsze deploy security rules razem z kodem!

## 🧪 Testowanie

\`\`\`bash
# Uruchom testy (gdy będą skonfigurowane)
npm test

# Linting
npm run lint
\`\`\`

## 📖 Dokumentacja Firebase

### Tworzenie Kursu (dla nauczycieli)

Obecnie kursy są hardcoded w \`COURSES\` array. W przyszłości planowane jest:
1. Panel dla nauczycieli do tworzenia kursów
2. Automatyczne generowanie kodów dostępu
3. Zarządzanie uczestnikami

### Dołączanie do Zajęć (dla uczniów)

1. Kliknij przycisk "+" w headerze
2. Wpisz kod zajęć otrzymany od nauczyciela (format: XXX-XXX)
3. Kliknij "Dołącz"

## 🔄 Firestore Data Model

\`\`\`
courses/
  {courseId}/
    - code: string (6-char access code)
    - name: string
    - teacherId: string
    participants/
      {userId}/
        - role: 'teacher' | 'student'
        - joinedAt: timestamp

posts/
  {postId}/
    - courseId: string
    - content: string
    - userId: string
    - author: string
    - createdAt: timestamp

assignments/
  {assignmentId}/
    - courseId: string
    - title: string
    - description: string
    - topic: string
    - type: 'material' | 'assignment'
    - authorId: string
    - createdAt: timestamp
\`\`\`

## 🤝 Contributing

1. Fork the project
2. Create feature branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit changes (\`git commit -m 'Add AmazingFeature'\`)
4. Push to branch (\`git push origin feature/AmazingFeature\`)
5. Open Pull Request

## 📝 Roadmap

Planowane ulepszenia (patrz [implementation_plan.md](./docs/implementation_plan.md)):

- [ ] System komentarzy
- [ ] Przesyłanie plików (załączniki)
- [ ] Ocenianie zadań
- [ ] Dark mode
- [ ] Testing suite
- [ ] PWA features

## 📄 Licencja

MIT License - feel free to use this project for learning or commercial purposes.

## 💬 Wsparcie

W razie pytań lub problemów:
- Otwórz Issue na GitHub
- Email: support@classroom20.example

---

Stworzone z ❤️ dla edukacji
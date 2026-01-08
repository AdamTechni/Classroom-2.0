# Deployment Guide - Classroom 2.0

## 🔥 Deploy Security Rules (KRYTYCZNE!)

Security rules są **najważniejsze** dla bezpieczeństwa aplikacji. Bez nich każdy użytkownik ma pełny dostęp do całej bazy danych!

### Krok 1: Weryfikacja plików

Sprawdź czy masz:
- ✅ `firestore.rules`
- ✅ `storage.rules`
- ✅ `firebase.json` (z referencjami do rules)

### Krok 2: Deploy do Firebase

\`\`\`bash
# Zaloguj się do Firebase (jeśli jeszcze nie jesteś)
firebase login

# Deploy tylko Firestore rules
firebase deploy --only firestore:rules

# Deploy tylko Storage rules
firebase deploy --only storage:rules

# Lub deploy wszystkiego naraz
firebase deploy
\`\`\`

### Krok 3: Weryfikacja

1. Idź do [Firebase Console](https://console.firebase.google.com)
2. Wybierz swój projekt
3. Firestore Database → Rules - sprawdź czy widać nowe reguły
4. Storage → Rules - sprawdź czy widać nowe reguły

## 🌐 Deploy Aplikacji

### Opcja 1: Firebase Hosting

\`\`\`bash
# 1. Build aplikacji
npm run build

# 2. Deploy
firebase deploy --only hosting

# Aplikacja będzie dostępna na:
# https://twoj-projekt.web.app
\`\`\`

### Opcja 2: Vercel (Zalecane dla Next.js)

\`\`\`bash
# 1. Zainstaluj Vercel CLI
npm i -g vercel

# 2. Deploy
vercel

# Lub połącz z GitHub i włącz auto-deploy
\`\`\`

**WAŻNE**: W Vercel Dashboard dodaj wszystkie zmienne środowiskowe z `.env.local`:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- itd.

## 🔒 Checklist Bezpieczeństwa

Przed wdrożeniem na produkcję upewnij się:

- [x] Security rules są deployed
- [ ] Zmienne środowiskowe są ustawione w platformie deployment
- [ ] `.env.local` jest w `.gitignore` (już jest ✓)
- [ ] Firebase Auth ma prawidłowe Authorized domains
- [ ] CORS jest skonfigurowany dla Firebase Storage

## 📊 Environment Setup

### Development
\`\`\`bash
npm run dev
\`\`\`
działa na http://localhost:3000

### Production Build
\`\`\`bash
npm run build
npm start
\`\`\`

### Linting
\`\`\`bash
npm run lint
\`\`\`

## 🐛 Troubleshooting

### Problem: "Permission denied" w Firestore
**Rozwiązanie**: Deploy security rules: `firebase deploy --only firestore:rules`

### Problem: Nie mogę zalogować się przez Google
**Rozwiązanie**: 
1. Sprawdź czy domena jest w Firebase Console → Authentication → Settings → Authorized domains
2. Dodaj `localhost` dla development
3. Dodaj swoją production domain

### Problem: Firebase nie jest zdefiniowany
**Rozwiązanie**: Sprawdź czy wszystkie zmienne `NEXT_PUBLIC_FIREBASE_*` są ustawione

### Problem: Build fails
**Rozwiązanie**: 
\`\`\`bash
# Wyczyść cache i node_modules
rm -rf .next node_modules
npm install
npm run build
\`\`\`

## 📈 Monitoring

Po deployment zalecamy włączenie:
1. **Firebase Analytics** - user behavior tracking
2. **Firestore Usage Metrics** - monitoring kosztów
3. **Performance Monitoring** - page load times
4. **Error Reporting** - Sentry lub podobne

## 🔄 Continuous Deployment

### GitHub Actions Example

Utwórz `.github/workflows/deploy.yml`:

\`\`\`yaml
name: Deploy to Firebase

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          projectId: your-project-id
\`\`\`

---

**Powodzenia! 🚀**

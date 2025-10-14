# 🎯 KwikCut PWA - Complete Guide

A Progressive Web App connecting customers with local barbers for haircut service bookings.

## ✅ Phase 1: Setup & Authentication - COMPLETE

This phase includes:

- ✅ Complete authentication system (signup, login, logout, password reset)
- ✅ Firebase integration (Auth, Firestore, Storage)
- ✅ Protected routes for Customer and Barber
- ✅ Landing page with user type selection
- ✅ Basic PWA setup with service worker
- ✅ TypeScript types and interfaces
- ✅ TailwindCSS styling
- ✅ Responsive mobile-first design

---

## 🚀 Getting Started

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" → Name it "KwikCut"
3. Enable Google Analytics (optional)
4. Click the **Web icon (</>)** to register your app
5. Copy the Firebase configuration

**Enable these services in Firebase:**

- **Authentication** → Enable "Email/Password"
- **Firestore Database** → Create database in production mode
- **Storage** → Enable Firebase Storage

### Step 3: Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
REACT_APP_FIREBASE_API_KEY=your_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

### Step 4: Set Up Firebase Security Rules

**Firestore Rules** (Go to Firebase Console → Firestore Database → Rules):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    match /barbers/{barberId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null &&
        resource.data.userId == request.auth.uid;
    }

    match /services/{serviceId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    match /bookings/{bookingId} {
      allow read: if request.auth != null &&
        (resource.data.customerId == request.auth.uid ||
         resource.data.barberId == request.auth.uid);
      allow create: if request.auth != null;
      allow update: if request.auth != null &&
        (resource.data.customerId == request.auth.uid ||
         resource.data.barberId == request.auth.uid);
    }

    match /favorites/{favoriteId} {
      allow read, write: if request.auth != null &&
        request.resource.data.customerId == request.auth.uid;
    }
  }
}
```

**Storage Rules** (Go to Firebase Console → Storage → Rules):

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /barbers/{barberId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /services/{serviceId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### Step 5: Run the Application

```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

---

## 📱 Testing Phase 1 Features

### Test Customer Flow:

1. Click "I'm a Customer" on landing page
2. Fill in signup form with valid details
3. You'll be redirected to Customer Dashboard
4. Logout and login again to test authentication

### Test Barber Flow:

1. Click "I'm a Barber" on landing page
2. Fill in signup form with valid details
3. You'll be redirected to Barber Dashboard
4. Test logout and login

### Test Password Reset:

1. Click "Sign In" on landing page
2. Click "Forgot password?"
3. Enter email and check inbox

### Test PWA Features:

1. Open app in Chrome
2. Check DevTools → Application → Service Workers
3. Try offline mode (DevTools → Network → Offline)

---

## 🏗️ Project Structure

```
kwikcut-pwa/
├── public/
│   ├── icons/                  # PWA icons
│   ├── index.html             # Main HTML file
│   ├── manifest.json          # PWA manifest
│   ├── offline.html           # Offline fallback page
│   └── service-worker.js      # Service worker for offline support
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx          # Login component
│   │   │   ├── SignupForm.tsx         # Signup component
│   │   │   └── ProtectedRoute.tsx     # Route protection
│   │   └── shared/
│   │       ├── LoadingSpinner.tsx     # Loading indicator
│   │       ├── ErrorMessage.tsx       # Error display
│   │       ├── EmptyState.tsx         # Empty state component
│   │       └── Toast.tsx              # Toast notifications
│   ├── contexts/
│   │   └── AuthContext.tsx            # Authentication state
│   ├── pages/
│   │   ├── LandingPage.tsx            # Landing/home page
│   │   ├── CustomerDashboard.tsx      # Customer dashboard
│   │   └── BarberDashboard.tsx        # Barber dashboard
│   ├── services/
│   │   └── firebase.ts                # Firebase configuration
│   ├── types/
│   │   └── index.ts                   # TypeScript types
│   ├── styles/
│   │   └── globals.css                # Global styles
│   ├── App.tsx                        # Main app component
│   └── index.tsx                      # Entry point
├── .env.local                         # Environment variables (create this)
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

---

## 🎨 Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **TailwindCSS** - Utility-first CSS
- **Firebase** - Backend (Auth, Firestore, Storage)
- **React Router v6** - Routing
- **Lucide React** - Icons
- **PWA** - Progressive Web App features

---

## 🔧 Available Scripts

### `npm start`

Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### `npm run build`

Builds the app for production to the `build` folder

### `npm test`

Launches the test runner

---

## 📋 What's Next?

### Phase 2: Customer Features (Coming Soon)

- Browse nearby barbers with geolocation
- View barber profiles and services
- Book appointments with date/time selection
- Manage bookings
- Save favorite barbers

### Phase 3: Barber Features (Coming Soon)

- Complete shop profile setup
- Service management (CRUD operations)
- Booking management
- Upload shop images
- Analytics dashboard

### Phase 4: PWA Enhancement (Coming Soon)

- Enhanced offline support
- Push notifications
- Background sync
- Install prompts

---

## 🐛 Troubleshooting

### "Firebase: Error (auth/configuration-not-found)"

✅ Check your `.env.local` file has correct values

### Can't login or signup

✅ Ensure Firebase Authentication is enabled
✅ Check console for errors
✅ Verify `.env.local` values are correct

### Service Worker not registering

✅ Must use HTTPS (or localhost)
✅ Check browser DevTools → Console for errors
✅ Clear browser cache and reload

### TypeScript errors

✅ Run `npm install` again
✅ Delete `node_modules` and `package-lock.json`, then run `npm install`

---

## 🌐 Deployment

### Firebase Hosting (Recommended)

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

### Vercel

1. Push to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Add environment variables
4. Deploy

### Netlify

1. Push to GitHub
2. Connect on [netlify.com](https://netlify.com)
3. Add environment variables in Netlify dashboard
4. Deploy

---

## 📝 Notes

- This is **Phase 1** - Basic authentication and setup complete
- Customer and Barber dashboards are placeholders
- Full features will be added in Phase 2 & 3
- PWA is functional with basic offline support
- All components are mobile-responsive

---

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

---

## 🙏 Support

If you encounter any issues:

1. Check the Troubleshooting section above
2. Verify Firebase configuration
3. Check browser console for errors
4. Ensure all dependencies are installed

---

**Made with ❤️ for barbers and customers**

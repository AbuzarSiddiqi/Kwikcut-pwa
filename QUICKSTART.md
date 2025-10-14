# 🚀 Quick Start Guide - KwikCut PWA

## Phase 1 Setup Complete! ✅

All the code is ready. Follow these steps to run the app:

---

## Step 1: Install Dependencies ✅ (Already Done!)

The dependencies have been installed.

---

## Step 2: Create Firebase Project

### 🔥 Firebase Console Setup:

1. Go to https://console.firebase.google.com/
2. Click **"Add project"**
3. Name it **"KwikCut"**
4. Enable Google Analytics (optional)
5. Click the **Web icon (</>)** to register your app
6. Copy the configuration object

### Enable Firebase Services:

#### Authentication:

1. Go to **Authentication** → **Sign-in method**
2. Enable **"Email/Password"**

#### Firestore Database:

1. Go to **Firestore Database**
2. Click **"Create database"**
3. Select **"Production mode"**
4. Choose a location

#### Storage:

1. Go to **Storage**
2. Click **"Get started"**
3. Use default security rules for now

---

## Step 3: Configure Environment

Create a file named `.env.local` in the root directory:

```env
REACT_APP_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXX
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdefghijklmnop
```

Replace with your actual Firebase config values!

---

## Step 4: Set Firebase Security Rules

### Firestore Rules:

Go to **Firestore Database → Rules** and paste:

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

Click **"Publish"**

### Storage Rules:

Go to **Storage → Rules** and paste:

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

Click **"Publish"**

---

## Step 5: Run the App! 🎉

```bash
npm start
```

The app will open at http://localhost:3000

---

## 🧪 Testing Checklist

### Test Customer Flow:

- [ ] Click "I'm a Customer" on landing page
- [ ] Sign up with email, name, phone, password
- [ ] Verify redirect to Customer Dashboard
- [ ] Logout
- [ ] Login with same credentials
- [ ] Test password reset

### Test Barber Flow:

- [ ] Click "I'm a Barber" on landing page
- [ ] Sign up with different email
- [ ] Verify redirect to Barber Dashboard
- [ ] Logout and login again

### Test PWA:

- [ ] Open DevTools → Application → Service Workers
- [ ] Verify service worker is registered
- [ ] Test offline mode (Network → Offline)

---

## 🎯 What Works in Phase 1:

✅ Complete authentication (signup, login, logout, password reset)
✅ User type selection (Customer/Barber)
✅ Protected routes
✅ Beautiful landing page
✅ Responsive design
✅ PWA with service worker
✅ Firebase integration

---

## 📱 Coming in Phase 2:

🔜 Customer: Browse nearby barbers with geolocation
🔜 Customer: View barber profiles and services
🔜 Customer: Book appointments
🔜 Customer: Manage bookings
🔜 Customer: Save favorites

---

## 📱 Coming in Phase 3:

🔜 Barber: Shop profile setup
🔜 Barber: Service management (CRUD)
🔜 Barber: Booking management
🔜 Barber: Upload images
🔜 Barber: Analytics

---

## 🐛 Common Issues:

### Firebase Error?

✅ Check `.env.local` has correct values
✅ Restart dev server after adding env vars

### Can't Sign Up?

✅ Ensure Email/Password auth is enabled in Firebase
✅ Check browser console for errors

### Service Worker Not Working?

✅ Must be on localhost or HTTPS
✅ Clear cache and reload

---

## 📞 Need Help?

1. Check browser console for errors
2. Verify Firebase configuration
3. Ensure all services are enabled in Firebase
4. Check the main README.md for detailed info

---

**Ready to test? Run `npm start` and enjoy!** 🚀

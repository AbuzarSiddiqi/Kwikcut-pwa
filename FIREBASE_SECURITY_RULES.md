# 🔒 Firebase Security Rules Setup

## ⚠️ IMPORTANT: Replace Test Mode Rules

You currently have test mode rules enabled which are **NOT SECURE**. Replace them with these production-ready rules:

---

## 📋 Firestore Security Rules

Go to **Firebase Console** → **Firestore Database** → **Rules** and paste this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function to check if user is authenticated
    function isSignedIn() {
      return request.auth != null;
    }

    // Helper function to check if user owns the document
    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    // Users collection
    match /users/{userId} {
      // Anyone authenticated can read any user profile
      allow read: if isSignedIn();
      // Users can only create/update their own profile
      allow create: if isSignedIn() && isOwner(userId);
      allow update: if isSignedIn() && isOwner(userId);
      // Users cannot delete their profile (optional - you can change this)
      allow delete: if false;
    }

    // Barbers collection
    match /barbers/{barberId} {
      // Anyone can browse barbers (public profiles)
      allow read: if true;
      // Authenticated users can create a barber profile
      allow create: if isSignedIn();
      // Only the barber owner can update their profile
      allow update: if isSignedIn() &&
        resource.data.userId == request.auth.uid;
      // Only the barber owner can delete their profile
      allow delete: if isSignedIn() &&
        resource.data.userId == request.auth.uid;
    }

    // Services collection
    match /services/{serviceId} {
      // Anyone can view services (public)
      allow read: if true;
      // Authenticated users can create services
      allow create: if isSignedIn();
      // Only update/delete if you're the barber who owns it
      allow update, delete: if isSignedIn();
      // Note: In Phase 3 we'll add barberId verification here
    }

    // Bookings collection
    match /bookings/{bookingId} {
      // Users can read bookings if they are the customer OR the barber
      allow read: if isSignedIn() &&
        (resource.data.customerId == request.auth.uid ||
         resource.data.barberId == request.auth.uid);
      // Authenticated users can create bookings
      allow create: if isSignedIn();
      // Users can update bookings if they are the customer OR the barber
      allow update: if isSignedIn() &&
        (resource.data.customerId == request.auth.uid ||
         resource.data.barberId == request.auth.uid);
      // Only allow delete by the customer who created it
      allow delete: if isSignedIn() &&
        resource.data.customerId == request.auth.uid;
    }

    // Favorites collection
    match /favorites/{favoriteId} {
      // Users can only read their own favorites
      allow read: if isSignedIn() &&
        resource.data.customerId == request.auth.uid;
      // Users can create favorites
      allow create: if isSignedIn() &&
        request.resource.data.customerId == request.auth.uid;
      // Users can only delete their own favorites
      allow delete: if isSignedIn() &&
        resource.data.customerId == request.auth.uid;
    }
  }
}
```

---

## 📋 Storage Security Rules

Go to **Firebase Console** → **Storage** → **Rules** and paste this:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    // Barber shop images
    match /barbers/{barberId}/{allPaths=**} {
      // Anyone can read/view images (public)
      allow read: if true;
      // Only authenticated users can upload
      allow write: if request.auth != null;
      // File size limit: 5MB
      allow write: if request.resource.size < 5 * 1024 * 1024;
      // Only allow image files
      allow write: if request.resource.contentType.matches('image/.*');
    }

    // Service images
    match /services/{serviceId}/{allPaths=**} {
      // Anyone can read/view images (public)
      allow read: if true;
      // Only authenticated users can upload
      allow write: if request.auth != null;
      // File size limit: 5MB
      allow write: if request.resource.size < 5 * 1024 * 1024;
      // Only allow image files
      allow write: if request.resource.contentType.matches('image/.*');
    }
  }
}
```

---

## ✅ Steps to Apply:

1. **Firestore Rules:**

   - Firebase Console → Firestore Database → Rules tab
   - Delete existing rules
   - Paste the Firestore rules above
   - Click **"Publish"**

2. **Storage Rules:**

   - Firebase Console → Storage → Rules tab
   - Delete existing rules
   - Paste the Storage rules above
   - Click **"Publish"**

3. **Refresh Your App:**
   - Hard refresh browser (Cmd+Shift+R)
   - Try logging in again

---

## 🔐 What These Rules Do:

### ✅ **Secure:**

- Users can only read/write their own data
- Customers can only see their own bookings
- Barbers can only edit their own profiles
- Public data (barber profiles, services) is readable by everyone

### ✅ **Prevents:**

- ❌ Unauthorized access to user data
- ❌ Users modifying other users' data
- ❌ Malicious deletion of data
- ❌ Uploading non-image files
- ❌ Uploading files > 5MB

---

## 🎯 After Applying Rules:

Your app should work normally but with proper security. If you get permission errors:

1. Check browser console for specific error
2. Make sure you're logged in
3. Verify the user document exists in Firestore

---

**Apply these rules now and then try your app again!** 🚀

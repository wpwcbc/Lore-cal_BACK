# Lore-cal

## What is this app?

Lore-cal is a location-based social app for sharing short stories tied to real places. Every post (“Story”) must be pinned to a specific point on the map, so users explore what has happened around them: local history, hidden spots, personal memories, or everyday scenes. The app is designed to encourage people to discover the city by walking through it, not by endlessly scrolling a feed.

## Features

### Implemented

- Location-anchored stories
    - Users create stories that must be pinned to a map location.
    - Stories can be tagged as `Historic`, `Anecdotal`, `HiddenGem`, or `Memorable`.
    - Each story has a comment thread for discussion.

- Map-based feed
    - Shows story pins around the user’s current location.

- User profiles and “turf” map
    - Each user has a profile showing a map of locations where they have posted.
    - The system calculates the user’s main “turf” (areas where they post most frequently) and displays it on their profile.

### Planned

- Ephemeral stories
    - 24-hour stories for lightweight, in-the-moment posts.

- Following and filtered map
    - Users can follow other users and view a map filtered to stories from accounts they follow.

- Curated exploration feed
    - Instead of ranking stories by popularity, the app surfaces districts to explore each day to encourage offline exploration.

## Tech stack

- Mobile app
    - Expo (React Native, TypeScript)
    - @rnmapbox/maps for map rendering and user location
    - TanStack Query (React Query) for client-side caching and data fetching
    - expo-router for file-based routing

- Backend API
    - Node.js, Express
    - MongoDB with Mongoose ODM
    - JWT for authentication
    - Render for hosting

- Infrastructure and services
    - Cloudinary for image hosting
    - Mapbox for map tiles and styles
    - LocationIQ APIs for reverse geocoding

- Tooling
    - TypeScript, ESLint, Prettier
    - Git and GitHub for version control

## Running the app

The project consists of a backend API and a mobile app. Run the backend first, then start the mobile app and point it at the API URL.

### 1. Backend API

1. Clone the backend repository:

    ```bash
    git clone https://github.com/wpwcbc/Lore-cal_BACK.git
    cd Lore-cal_BACK
    ```

2. Install dependencies:

```
npm install
```

3. Configure environment variables:

Copy .env.example to .env
Set values for:

- PORT (e.g. 4000)
- MONGODB_URI
- CLOUDINARY\_\* keys
- JWT\_\* secrets
- Any other required variables

4. Start the API server:

```
npm run dev
```

The API will be available at http://localhost:4000 (or the PORT you configured).

### 2. Mobile app (Expo)

1. Clone the mobile app repository:

```
git clone https://github.com/wpwcbc/Lore-cal_FRONT.git
cd Lore-cal_FRONT
```

2. Install dependencies:

```
npm install
```

3. Configure environment variables:

Copy .env.example to .env, or create .env.
Set:

- EXPO_PUBLIC_API_BASE_URL (e.g. http://localhost:4000)
- EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN
- EXPO_PUBLIC_MAPBOX_STYLE
- Any other required variables

4. Run the app:

- Start the Expo dev server:

```
npx expo start
```

- Or run directly on an emulator / device:

```
npx expo run:android
# or
npx expo run:ios
```

Make sure the device/emulator can reach your backend URL (e.g. use your machine’s LAN IP instead of localhost when testing on a real device).

## Documentation

### C4 Model

#### 1. System Context

```mermaid
C4Context
    title Lore-cal – System Context

    Person(user, "User", "Reads and posts stories at different locations.")

    System(lorecal, "Lore-cal", "Location-based storytelling platform (mobile + backend).")


    System_Ext(locationiq, "LocationIQ", "Provides reverse geocoding API.")
    System_Ext(mapbox, "Mapbox", "Provides map tiles <br>and geocoding.")
    System_Ext(cloudinary, "Cloudinary", "Stores and serves story images.")

    Rel(user, lorecal, "Uses via mobile app")
    Rel(lorecal, mapbox, "Loads maps and gets coordinates")
    Rel(lorecal, locationiq, "Reverse geocodes coordinates to addresses")
    Rel(lorecal, cloudinary, "Uploads and fetches story images")

```

#### 2. Container View

```mermaid
C4Container
    title Lore-cal – Container Diagram

    Person(user, "User", "Reads and posts stories at different locations.")

    System_Boundary(lorecal, "Lore-cal") {
        Container(mobile, "Lore-cal Mobile App", "React Native / Expo", "Allows users to browse the map and create stories.")
        Container(api, "Lore-cal Backend API", "Node.js / Express", "Handles authentication, story logic, and serves data to the app.")
        ContainerDb(db, "Lore-cal Database", "MongoDB Atlas", "Stores users, stories, comments, and location data.")
    }

    System_Ext(mapbox, "Mapbox", "Provides map tiles and geocoding.")
    System_Ext(locationiq, "LocationIQ", "Provides reverse geocoding API.")
    System_Ext(cloudinary, "Cloudinary", "Stores and serves story images.")

    Rel(user, mobile, "Uses", "HTTPS")
    Rel(mobile, api, "Calls REST/JSON API", "HTTPS")
    Rel(api, db, "Reads from and writes to", "MongoDB protocol")
    Rel(api, mapbox, "Requests maps / geocoding", "HTTPS")
    Rel(api, locationiq, "Reverse geocodes coordinates", "HTTPS")
    Rel(api, cloudinary, "Uploads and fetches images", "HTTPS")

```

#### 3. Component View

```mermaid
C4Component
  title Lore-cal – Backend Component Diagram

  Person(user, "User", "Uses the Lore-cal mobile app.")
  Container(mobile, "Lore-cal Mobile App", "React Native / Expo", "Provides the UI for browsing and posting stories.")

  System_Boundary(lorecal, "Lore-cal Backend API") {
    Component(apiLayer, "API Layer", "Express controllers", "Handles HTTP requests and routes them to domain services.")
    Component(authService, "Auth Service", "Node.js module", "Handles login, signup, JWT, and current-user resolution.")
    Component(userService, "User/Profile Service", "Node.js module", "Manages user profiles and user-related data.")
    Component(storyService, "Story Service", "Node.js module", "Creates, reads, and lists stories.")
    Component(geoService, "Geo Service", "Node.js module", "Wraps Mapbox/LocationIQ for geocoding and reverse geocoding.")
    Component(mediaService, "Media Service", "Node.js module", "Wraps Cloudinary for image upload and retrieval.")
    Component(dbAccess, "Database Access", "Node.js module (Mongoose)", "Reads and writes users, stories, and comments in MongoDB.")
  }

  ContainerDb(db, "Lore-cal Database", "MongoDB Atlas", "Stores users, stories, comments, and locations.")

  System_Ext(mapbox, "Mapbox", "Map tiles and geocoding APIs.")
  System_Ext(locationiq, "LocationIQ", "Reverse geocoding APIs.")
  System_Ext(cloudinary, "Cloudinary", "Image storage and CDN.")

  Rel(user, mobile, "Uses", "HTTPS")
  Rel(mobile, apiLayer, "Calls REST API", "HTTPS")

  Rel(apiLayer, authService, "Calls")
  Rel(apiLayer, userService, "Calls")
  Rel(apiLayer, storyService, "Calls")

  Rel(storyService, geoService, "Resolves coordinates / addresses")
  Rel(storyService, mediaService, "Attaches uploaded images")

  Rel(authService, dbAccess, "Reads/writes user auth data")
  Rel(userService, dbAccess, "Reads/writes user profiles")
  Rel(storyService, dbAccess, "Reads/writes stories")

  Rel(geoService, mapbox, "Uses geocoding APIs", "HTTPS")
  Rel(geoService, locationiq, "Uses reverse geocoding APIs", "HTTPS")
  Rel(mediaService, cloudinary, "Uploads and fetches images", "HTTPS")

  Rel(dbAccess, db, "Reads from and writes to", "MongoDB protocol")

```

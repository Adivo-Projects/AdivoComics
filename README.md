# AdivoComics

AdivoComics is a premium yet ultra‑lightweight comic reading platform built with Next.js, TypeScript, Tailwind CSS and Firebase. It wraps the provided `komikstation.js` scraper into a server‑only adapter and layers a clean, mobile‑first UI on top. The focus is on performance, simplicity and elegance – the interface is flat and spacious, with no shadows or unnecessary animations.

## Features

- **Home** – Shows trending titles, latest updates, popular series across weekly/monthly/all‑time ranges and a project list of new releases.
- **Browse** – Filter series by type, status or order with a clean grid of covers. Simple pagination enables exploration of large lists.
- **Search** – Server‑side search via the content source. A minimal GET form keeps it lightweight and sharable.
- **Series detail** – Detailed pages include metadata, synopsis, chapter list and recommendations. All chapters link directly to the reader.
- **Reader** – A long‑scroll reader with responsive images, previous/next navigation and minimal chrome. Optimised for mobile reading.
- **Library** – Logged‑in users can favourite series and track reading progress. A simple list of favourite slugs is displayed for now.
- **Authentication** – Email/password login and registration backed by Firebase Authentication. Auth state is exposed throughout the client via a context provider.
- **Firebase integration** – Realtime Database stores user favourites and progress. A detailed `rules.json` implements fine‑grained security rules based on the actual schema.

## Getting started

1. **Install dependencies**

   ```sh
   npm install
   ```

2. **Run the development server**

   ```sh
   npm run dev
   ```

   The site will be available at `http://localhost:3000`.

3. **Build for production**

   ```sh
   npm run build
   npm start
   ```

## Architecture overview

### Server‑side data

All scraping is performed on the server. The `lib/komikstation-source.js` module contains the original scraper adapted from the provided `komikstation.js`. The wrapper in `lib/komikstation.ts` enforces server‑only execution and casts the results into typed domain models. Server components and API routes can call these functions to fetch content without exposing any scraping logic to the client.

### Client‑side UI

The user interface is built using the Next.js app router. Pages are organised under `app/` and leverage server components for data fetching. Tailwind CSS provides a flat, dark theme with gold accents. A fixed bottom navigation bar makes the key screens accessible with a thumb on mobile devices. Auth state and Firebase client instances are provided via context.

### Firebase

Firebase Authentication handles login and registration. User data such as favourites and progress is persisted in the Realtime Database. The structure and security rules are defined in `database-map.md` and `rules.json`. When deploying your database rules, import `rules.json` into the Firebase console under Realtime Database > Rules.

## Extending the platform

AdivoComics is a foundation. To build upon it:

- Implement rich library features such as bookmarks, history, continue reading and reader preferences by adding paths under `users/{uid}/library` and updating the rules accordingly.
- Build a commenting and rating UI by writing to `/comments` and `/votes` and displaying aggregated counts on series pages.
- Optimise the reader further with preloading and offline caching.
- Improve the library UI by fetching series details on the server via an API route and exposing them to the client.

Whenever making changes, remember to respect the global rules laid out in the specification: performance first, flat visuals, no unnecessary features, real dynamic routes, disciplined request handling and rigorous validation.
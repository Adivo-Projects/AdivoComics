# Database Structure for AdivoComics

This document outlines the structure of the Firebase Realtime Database used by AdivoComics. It describes each top‑level path, what data it stores, who can read/write it, and how it relates to the application features. The structure is designed to be simple, secure and efficient while supporting the required functionality without unnecessary bloat.

## Top‑level paths

### `/users/{uid}`
Stores all per‑user data. Each `uid` corresponds to a Firebase Authentication user. Access is restricted so that only the authenticated user can read and write their own data.

#### `profile`
Contains optional user profile information such as display name or avatar. Used to personalise the profile screen. Only the user may read/write.

#### `library`
Under `library` there are several collections representing a user’s personal library:

- **`favorites/{seriesSlug}`** – A set of series slugs that the user has favourited. Each entry stores an `addedAt` timestamp. The UI uses this to populate the favourites section in the Library. Only the user may add or remove favourites. Entries must include an `addedAt` number.
- **`progress/{seriesSlug}`** – Tracks the user’s progress within a series. Each entry stores the current `chapter` slug, the `pageIndex` within that chapter and an `updatedAt` timestamp. This supports the “Continue Reading” functionality. Only the user may update or read their own progress. Entries are validated to ensure they include a string `chapter`, numeric `pageIndex` and numeric `updatedAt`.

Other per‑user structures such as bookmarks or preferences can be added under `library` using the same pattern. Always ensure write rules restrict access to the owning user and validate the expected schema.

### `/comments`
Stores comments posted by users on series and chapters. Comments are public; anyone can read them. Only authenticated users can create comments, and they may only write comments that include their own `uid`, a textual `message` and a numeric `createdAt` timestamp. The structure separates series and chapter comments:

- **`/comments/series/{seriesSlug}/{commentId}`** – Each comment under a series slug is keyed by a generated `commentId`. It stores fields: `uid`, `message` and `createdAt`. All users can read; only the author can write.
- **`/comments/chapters/{chapterSlug}/{commentId}`** – Same as above but scoped to chapter slugs.

This structure supports listing comments for a given series or chapter and ensures that comments cannot be spoofed or overwritten by other users.

### `/votes`
Stores rating votes by users for series. Each series has a subnode keyed by user IDs. A vote is simply a numeric rating. Any user can read the aggregated votes (for example, to compute an average rating) but only the owning user may write or update their vote:

- **`/votes/series/{seriesSlug}/{uid}`** – The numeric rating given by user `uid` for the series. Writes are only allowed if the authenticated user ID matches the key and the value is a number.

Other vote types could be added using similar structure if needed in future.

## Security considerations

- Global reads are set to `true` so public content like comments and votes can be read by anyone, but writes are denied by default.
- Each user’s personal data is protected by requiring `auth.uid === $uid` for both reads and writes. No user can read or modify another user’s data.
- Comments and votes enforce that the `uid` in the data matches the authenticated user to prevent impersonation.
- Validation rules ensure that required fields are present and of the expected type to avoid malformed writes.

## Indexing

Because most queries in this application are simple lookups by key, explicit `.indexOn` declarations are not strictly necessary. If in future you introduce orderByChild queries on comment timestamps or want to query favourites by `addedAt`, you can add `.indexOn`: ["createdAt"] or similar at the appropriate node to optimise those queries.

## Extensibility

The schema is intentionally simple but can be extended. For example:

- Add a `bookmarks` collection under `users/{uid}/library` to track bookmarks inside a series using chapter and page identifiers.
- Add an `appPreferences` node under `users/{uid}` for storing reader preferences like spacing or theme.
- Introduce moderation metadata under `/comments` if needed to support comment moderation.

Whenever adding new paths, ensure the rules in `rules.json` are updated accordingly to maintain security and data integrity.
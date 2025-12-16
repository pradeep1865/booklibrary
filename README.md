# booklibrary

A simple app with a static form plus a Vercel-ready API endpoint for adding book entries into MongoDB.

## Deploying to Vercel
1. Push this repository to your own Git provider.
2. Create a new Vercel project and import the repo.
3. In **Environment Variables** set at least:
   - `MONGODB_URI` – your MongoDB connection string.
   - `MONGODB_DB` – optional (defaults to `booklibrary`).
4. Deploy. The static form lives at `/` and the serverless API is at `/api/books`.

## Running locally
1. Install dependencies (requires internet access):
   ```bash
   npm install
   ```
2. Start the local Express server:
   ```bash
   npm start
   ```
3. Open http://localhost:3000 to load the book entry form.

## Data model
Submitting the form creates a `books` collection entry with:
- Auto-incrementing `bookId` (global counter).
- Daily `batchId` shared for each day; it increments by 1 whenever the date changes.
- `createdAt` and `updatedAt` timestamps recorded at insertion.

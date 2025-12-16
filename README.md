# booklibrary

A simple app with a static form plus a Vercel-ready API endpoint for adding book entries into MongoDB.

## Deploying to Vercel
1. Push this repository to your own Git provider.
2. Create a new Vercel project and import the repo.
3. In **Environment Variables** set at least:
   - `MONGODB_URI` – your MongoDB connection string (must point to a TLS-enabled cluster; SRV URLs are recommended).
   - `MONGODB_DB` – optional (defaults to `booklibrary`).
4. Deploy. The static form lives at `/` and the serverless API is at `/api/books`.

### TLS / SSL errors on save
If you see an error like `tlsv1 alert internal error` when saving:
- Confirm your MongoDB Atlas IP access list allows the Vercel deployment (try `0.0.0.0/0` temporarily).
- Verify the username/password and database in `MONGODB_URI` are correct.
- Ensure TLS is enabled on the cluster; SRV connection strings (`mongodb+srv://...`) expect TLS.

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

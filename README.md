# booklibrary

A simple Express app with a form for adding book entries into MongoDB.

## Getting started
1. Install dependencies (requires internet access to npm):
   ```bash
   npm install
   ```
2. Start the server:
   ```bash
   npm start
   ```
3. Open http://localhost:3000 to load the book entry form.

## Configuration
Set `MONGODB_URI` to override the default connection string. By default the app uses:
```
mongodb+srv://pradeep1865_lib_owner:cooldude12@clusterlib1.scu8jvu.mongodb.net/?appName=ClusterLib1
```

## Data model
Submitting the form creates a `books` collection entry with:
- Auto-incrementing `bookId` (global counter).
- Daily `batchId` that stays consistent for the same date and increments when the date changes.
- `createdAt` and `updatedAt` timestamps recorded at insertion.

import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI as string); // Store your URI in .env

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so the MongoClient is not repeatedly created
  let globalClient = global as any;
  if (!globalClient._mongoClientPromise) {
    globalClient._mongoClientPromise = client.connect();
  }
  clientPromise = globalClient._mongoClientPromise;
} else {
  // In production mode, it's safe to directly connect
  clientPromise = client.connect();
}

export default clientPromise;
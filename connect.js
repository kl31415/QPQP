const { MongoClient } = require("mongodb");

const url = "mongodb+srv://kevinli7:Li662468!@qpqp.xv43y.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(url);

async function run() {
    try {
        await client.connect();
        console.log("✅ Successfully connected to Atlas");

        const db = client.db("testDB"); // Change this to an existing database or create a new one
        const collection = db.collection("testCollection");

        // Insert a document
        const insertResult = await collection.insertOne({ name: "Test User", age: 25 });
        console.log("📝 Inserted document ID:", insertResult.insertedId);

        // Retrieve the document
        const result = await collection.findOne({ _id: insertResult.insertedId });
        console.log("🔍 Retrieved document:", result);

    } catch (err) {
        console.error("❌ Connection error:", err);
    } finally {
        await client.close();
    }
}

run();

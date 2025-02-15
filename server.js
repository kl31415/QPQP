const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");  // ✅ Import CORS

const app = express();

// ✅ Use CORS middleware before routes
app.use(cors());
app.use(express.json());

const url = "mongodb+srv://kevinli7:Li662468!@qpqp.xv43y.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(url);
let db;

async function connectDB() {
    await client.connect();
    db = client.db("testDB");
    console.log("✅ Connected to MongoDB");
}
connectDB();

app.post("/submissions", async (req, res) => {
    try {
        const result = await db.collection("submissions").insertOne(req.body);
        res.json({ message: "Data inserted", id: result.insertedId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/submissions", async (req, res) => {
    try {
        const data = await db.collection("submissions").find().toArray();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const { ObjectId } = require("mongodb");
app.delete("/submissions/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.collection("submissions").deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "Entry not found" });
        }

        res.json({ message: "Entry deleted", id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(4000, () => console.log("🚀 Server running on http://localhost:4000"));

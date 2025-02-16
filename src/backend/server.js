const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");

const messagesRouter = require('./routes/messages');
const itemsRouter = require('./routes/items');
const tradesRouter = require('./routes/trades');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection setup
const url = "mongodb+srv://kevinli7:Li662468!@qpqp.xv43y.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(url);
let db;

// Connect to MongoDB
async function connectDB() {
    try {
        await client.connect();
        db = client.db("testDB");
        console.log("✅ Connected to MongoDB");
    } catch (err) {
        console.error("❌ Failed to connect to MongoDB:", err);
        process.exit(1); // Exit the process if DB connection fails
    }
}
connectDB();

// Middleware to attach `db` to the request object
app.use((req, res, next) => {
    req.db = db; // Attach the database instance to the request
    next();
});

// Routes
app.use('/messages', messagesRouter);
app.use('/items', itemsRouter);
app.use('/trades', tradesRouter);

// Messages Endpoint
app.get("/messages", async (req, res) => {
    try {
        const { userId, recipientId } = req.query;

        if (!userId || !recipientId) {
            return res.status(400).json({ error: "userId and recipientId are required" });
        }

        const messages = await db.collection("messages").find({
            $or: [
                { sender: userId, recipient: recipientId },
                { sender: recipientId, recipient: userId }
            ]
        }).sort({ timestamp: 1 }).toArray();

        res.json(messages);
    } catch (err) {
        console.error("Error fetching messages:", err);
        res.status(500).json({ error: "Failed to fetch messages" });
    }
});

// Trade Endpoint
app.post("/accept-trade", async (req, res) => {
    try {
        const { senderOfferId, recipientUserId, senderUserId } = req.body;

        // Validate input
        if (!senderOfferId || !recipientUserId || !senderUserId) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Verify both items exist
        const [senderOffer, recipientOffer] = await Promise.all([
            db.collection("offers").findOne({ _id: new ObjectId(senderOfferId) }),
            db.collection("offers").findOne({ userId: recipientUserId })
        ]);

        if (!senderOffer) {
            return res.status(404).json({ error: "Sender offer not found" });
        }
        if (!recipientOffer) {
            return res.status(404).json({ error: "Recipient does not have an item available for trade" });
        }

        // Delete both items
        await Promise.all([
            db.collection("offers").deleteOne({ _id: new ObjectId(senderOfferId) }),
            db.collection("offers").deleteOne({ _id: new ObjectId(recipientOffer._id) })
        ]);

        // Create trade record
        const trade = {
            participants: [senderUserId, recipientUserId],
            items: [senderOfferId, recipientOffer._id],
            completedAt: new Date()
        };
        await db.collection("trades").insertOne(trade);

        // Create system message
        const message = {
            text: `Trade completed between ${senderOffer.product} and ${recipientOffer.product}`,
            sender: 'system',
            recipient: recipientUserId,
            timestamp: new Date(),
            type: 'text'
        };
        await db.collection("messages").insertOne(message);

        res.json({ success: true, trade });
    } catch (err) {
        console.error("Error accepting trade:", err);
        res.status(500).json({ error: "Failed to accept trade" });
    }
});

// Submissions Endpoints
app.post("/submissions", async (req, res) => {
    try {
        const result = await db.collection("submissions").insertOne(req.body);
        res.json({ message: "Data inserted", id: result.insertedId });
    } catch (err) {
        console.error("Error inserting submission:", err);
        res.status(500).json({ error: "Failed to insert data" });
    }
});

app.get("/submissions", async (req, res) => {
    try {
        const data = await db.collection("submissions").find().toArray();
        res.json(data);
    } catch (err) {
        console.error("Error fetching submissions:", err);
        res.status(500).json({ error: "Failed to fetch data" });
    }
});

app.delete("/submissions/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.collection("submissions").deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "Entry not found" });
        }

        res.json({ message: "Entry deleted", id });
    } catch (err) {
        console.error("Error deleting submission:", err);
        res.status(500).json({ error: "Failed to delete data" });
    }
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
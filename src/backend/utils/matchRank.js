const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const natural = require('natural');
const word2vec = require('word2vec');
const cosineSimilarity = require('compute-cosine-similarity');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Database Setup
const url = "mongodb+srv://kevinli7:Li662468%21@qpqp.xv43y.mongodb.net/testDB?retryWrites=true&w=majority";
const client = new MongoClient(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

let db;
async function connectDB() {
  try {
    await client.connect();
    db = client.db("testDB");
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ DB connection failed:", err);
    process.exit(1);
  }
}

// Word2Vec Setup
let wordVectors = { getVector: () => null };
word2vec.loadModel('src/backend/models/GoogleNews-vectors-negative300.bin', (err, model) => {
  if (err) console.log("⚠️  Word2Vec not loaded, using fallback");
  else {
    wordVectors = model;
    console.log("✅ Word2Vec loaded");
  }
});

// Helper Functions
function computeSimilarity(text1, text2) {
  if (!text1 || !text2) return 0;

  const vec1 = text1.split(' ').reduce((acc, word) => {
    const vec = wordVectors.getVector(word) || new Array(300).fill(0);
    return acc.map((v, i) => v + (vec[i] || 0));
  }, new Array(300).fill(0));
  
  const vec2 = text2.split(' ').reduce((acc, word) => {
    const vec = wordVectors.getVector(word) || new Array(300).fill(0);
    return acc.map((v, i) => v + (vec[i] || 0));
  }, new Array(300).fill(0));

  try {
    const similarity = cosineSimilarity(vec1, vec2);
    return similarity || 0;
  } catch (err) {
    console.error("Cosine similarity error:", err);
    return 0;
  }
}

// API Endpoints
app.post('/submit-offer', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { product, category, distance, details, userId, userName } = req.body;
    if (!product || !category || !userId || !userName) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const result = await db.collection("submissions").insertOne({
      product,
      category,
      distance: parseInt(distance) || 0,
      details,
      userId,
      userName,
      timestamp: new Date()
    });

    res.json({ success: true, id: result.insertedId });
  } catch (err) {
    console.error("Submit error:", err);
    res.status(500).json({ error: 'Internal error' });
  }
});

app.post('/ranked-submissions', async (req, res) => {
  try {
    const { product, category, details, distance } = req.body;
    if (!product || !category || !details) {
      return res.status(400).json({ error: "Missing product, category, or details" });
    }

    const offers = await db.collection("submissions").find().toArray();

    const scoredOffers = offers.map(offer => {
      const detailsSimilarity = computeSimilarity(details.toString(), offer.details?.toString() || "");
      const productSimilarity = computeSimilarity(product.toString(), offer.product?.toString() || "");

      const userDistance = parseInt(distance) || 0;
      const offerDistance = parseInt(offer.distance) || 0;
      const distanceScore = 1 / (1 + Math.abs(userDistance - offerDistance));

      const score = {
        categoryScore: offer.category === category ? 10000 : 0,
        similarityScore: (detailsSimilarity + productSimilarity) * 50,
        distanceScore: distanceScore * 25
      };

      return {
        ...offer,
        scores: score,
        score: score.categoryScore + score.similarityScore + score.distanceScore
      };
    });

    const results = scoredOffers
      .sort((a, b) => {
        if (b.score - a.score !== 0) return b.score - a.score;
        return new Date(b.timestamp) - new Date(a.timestamp);
      })
      .map(({ _id, scores, ...rest }) => ({
        id: _id.toString(),
        similarity: scores.similarityScore,
        userName: rest.userName,
        ...rest
      }));

    res.json(results);
  } catch (err) {
    console.error("Ranking error:", err);
    res.status(500).json({ error: 'Internal error' });
  }
});

async function startServer() {
  await connectDB();
  app.listen(4002, () => console.log('🚀 Server running on 4002'));
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
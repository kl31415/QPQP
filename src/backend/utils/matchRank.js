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
const url = "mongodb+srv://kevinli7:Li662468!@qpqp.xv43y.mongodb.net/?retryWrites=true&w=majority";
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
connectDB();

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
  const vec1 = text1.split(' ').reduce((acc, word) => {
    const vec = wordVectors.getVector(word) || new Array(300).fill(0);
    return acc.map((v, i) => v + vec[i]);
  }, new Array(300).fill(0));
  
  const vec2 = text2.split(' ').reduce((acc, word) => {
    const vec = wordVectors.getVector(word) || new Array(300).fill(0);
    return acc.map((v, i) => v + vec[i]);
  }, new Array(300).fill(0));

  return cosineSimilarity(vec1, vec2) || 0;
}

// API Endpoints
app.post('/submit-offer', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { product, category, distance, details, userId } = req.body;
    if (!product || !category || !userId) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const result = await db.collection("submissions").insertOne({
      product,
      category,
      distance: parseInt(distance) || 0,
      details,
      userId,
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
    const { product, category, details } = req.body;
    const offers = await db.collection("submissions").find().toArray();

    const scoredOffers = offers.map(offer => ({
      ...offer,
      score: (offer.category === category ? 2 : 0) +
             (offer.product.includes(product) ? 3 : 0) +
             computeSimilarity(details, offer.details)
    }));

    const results = scoredOffers
      .filter(o => o.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(({ _id, ...rest }) => ({ id: _id.toString(), ...rest }));

    res.json(results.length > 0 ? results : offers.slice(0, 3));
  } catch (err) {
    console.error("Ranking error:", err);
    res.status(500).json({ error: 'Internal error' });
  }
});

app.listen(4002, () => console.log('🚀 Server running on 4002'));
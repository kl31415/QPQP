const { connectDB } = require('./server.js');

(async () => {
    await connectDB();
    console.log("DB is connected");
  
    const testOffers = await db.collection("submissions").find().toArray();
    console.log("Test fetch:", testOffers);
  
    const sim = computeSimilarity("apple phone", "iphone");
    console.log("Test similarity:", sim);
  })();
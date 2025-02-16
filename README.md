# QPQP: Quid Pro Quo Plaza

The ultimate exchange platform: swap anything for anything!



## Instructions

First, use gensim and obtain the word2vec embeddings:

```bash
conda create -n "gensim_env" python==3.12
conda activate gensim_env
python3 src/backend/word2vec_service.py
```

Then, open another terminal and set up the backend server:

```bash
node src/backend/server.js
```

Make sure you're connected to MongoDB before moving on!
Next, in a third terminal, load the word2vec model:

```bash
node --max-old-space-size=8192 src/backend/utils/matchRank.js
```

Make sure you've seen the "Word2Vec loaded" message before moving on!
Finally, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
You can also visit [https://qpqp.vercel.app/](https://qpqp.vercel.app/) or [https://www.qpqp.site/](https://www.qpqp.site/).

Stay tuned for updates!

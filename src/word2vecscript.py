import gensim.downloader as api

model = api.load("word2vec-google-news-300")
model.save_word2vec_format("src/backend/models/GoogleNews-vectors-negative300.bin", binary=True)
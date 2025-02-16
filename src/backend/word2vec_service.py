from flask import Flask, request, jsonify
import gensim

app = Flask(__name__)

# Load the pre-trained Word2Vec model
MODEL_PATH = "src/backend/models/GoogleNews-vectors-negative300.bin"
word_vectors = gensim.models.KeyedVectors.load_word2vec_format(MODEL_PATH, binary=True)

def compute_similarity(text1, text2):
    words1 = [w for w in text1.split() if w in word_vectors]
    words2 = [w for w in text2.split() if w in word_vectors]

    if not words1 or not words2:
        return 0  # No similarity if words are missing

    vec1 = sum(word_vectors[w] for w in words1) / len(words1)
    vec2 = sum(word_vectors[w] for w in words2) / len(words2)

    return word_vectors.cosine_similarities(vec1, [vec2])[0]

@app.route("/similarity", methods=["POST"])
def get_similarity():
    data = request.json
    score = compute_similarity(data["text1"], data["text2"])
    return jsonify({"similarity": score})

if __name__ == "__main__":
    app.run(port=5000)

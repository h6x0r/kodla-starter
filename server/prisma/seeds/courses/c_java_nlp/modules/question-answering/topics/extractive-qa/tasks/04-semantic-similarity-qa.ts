import { Task } from '../../../../../../../types';

const task: Task = {
	slug: 'jnlp-semantic-similarity-qa',
	title: 'Semantic Similarity QA',
	difficulty: 'hard',
	tags: ['nlp', 'qa', 'semantic-similarity', 'embeddings'],
	estimatedTime: '35m',
	isPremium: true,
	order: 4,
	description: `# Semantic Similarity QA

Build a QA system using semantic similarity with sentence embeddings.

## Task

Implement a semantic QA system that:
- Encodes questions and passages into embeddings
- Finds semantically similar passages
- Handles paraphrased questions
- Ranks answers by semantic relevance

## Example

\`\`\`java
SemanticQA qa = new SemanticQA();
qa.addPassages(passages);
String answer = qa.answer("What does ML stand for?");
// Finds: "Machine learning (ML) is a branch of AI."
\`\`\``,

	initialCode: `import java.util.*;

public class SemanticQA {

    /**
     */
    public void addPassages(List<String> passages) {
    }

    /**
     */
    public String answer(String question) {
        return null;
    }

    /**
     */
    public double[] encode(String text) {
        return null;
    }

    /**
     */
    public double semanticSimilarity(String text1, String text2) {
        return 0.0;
    }
}`,

	solutionCode: `import java.util.*;

public class SemanticQA {

    private List<String> passages;
    private List<double[]> passageEmbeddings;
    private Map<String, double[]> wordVectors;
    private int embeddingDim;
    private Random random;

    public SemanticQA() {
        this.passages = new ArrayList<>();
        this.passageEmbeddings = new ArrayList<>();
        this.wordVectors = new HashMap<>();
        this.embeddingDim = 100;
        this.random = new Random(42);
        initializeWordVectors();
    }

    private void initializeWordVectors() {
        // Simulated word embeddings (real impl would use Word2Vec/GloVe)
        // Similar words have similar vectors
        String[][] synonymGroups = {
            {"machine", "learning", "ml", "ai", "artificial", "intelligence"},
            {"neural", "network", "deep", "layer", "model"},
            {"text", "language", "nlp", "natural", "processing", "word"},
            {"data", "information", "dataset", "training", "sample"},
            {"algorithm", "method", "approach", "technique", "solution"}
        };

        for (int g = 0; g < synonymGroups.length; g++) {
            double[] baseVector = createRandomVector();
            for (String word : synonymGroups[g]) {
                double[] wordVector = addNoise(baseVector, 0.1);
                wordVectors.put(word.toLowerCase(), wordVector);
            }
        }
    }

    private double[] createRandomVector() {
        double[] vector = new double[embeddingDim];
        for (int i = 0; i < embeddingDim; i++) {
            vector[i] = random.nextGaussian();
        }
        return normalize(vector);
    }

    private double[] addNoise(double[] vector, double noiseLevel) {
        double[] noisy = new double[vector.length];
        for (int i = 0; i < vector.length; i++) {
            noisy[i] = vector[i] + random.nextGaussian() * noiseLevel;
        }
        return normalize(noisy);
    }

    private double[] normalize(double[] vector) {
        double norm = 0;
        for (double v : vector) norm += v * v;
        norm = Math.sqrt(norm);
        if (norm > 0) {
            for (int i = 0; i < vector.length; i++) {
                vector[i] /= norm;
            }
        }
        return vector;
    }

    /**
     * Encode text into embedding vector.
     */
    public double[] encode(String text) {
        String[] words = text.toLowerCase().split("\\\\W+");
        double[] embedding = new double[embeddingDim];
        int count = 0;

        for (String word : words) {
            double[] wordVec = wordVectors.get(word);
            if (wordVec == null) {
                // Create vector for unknown word
                wordVec = createRandomVector();
                wordVectors.put(word, wordVec);
            }
            for (int i = 0; i < embeddingDim; i++) {
                embedding[i] += wordVec[i];
            }
            count++;
        }

        if (count > 0) {
            for (int i = 0; i < embeddingDim; i++) {
                embedding[i] /= count;
            }
        }

        return normalize(embedding);
    }

    /**
     * Add passages to the knowledge base.
     */
    public void addPassages(List<String> newPassages) {
        for (String passage : newPassages) {
            passages.add(passage);
            passageEmbeddings.add(encode(passage));
        }
    }

    /**
     * Calculate semantic similarity between texts.
     */
    public double semanticSimilarity(String text1, String text2) {
        double[] emb1 = encode(text1);
        double[] emb2 = encode(text2);
        return cosineSimilarity(emb1, emb2);
    }

    private double cosineSimilarity(double[] a, double[] b) {
        double dot = 0, normA = 0, normB = 0;
        for (int i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        if (normA == 0 || normB == 0) return 0;
        return dot / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    /**
     * Answer using semantic similarity.
     */
    public String answer(String question) {
        if (passages.isEmpty()) return null;

        double[] questionEmb = encode(question);
        int bestIdx = 0;
        double bestSim = -1;

        for (int i = 0; i < passageEmbeddings.size(); i++) {
            double sim = cosineSimilarity(questionEmb, passageEmbeddings.get(i));
            if (sim > bestSim) {
                bestSim = sim;
                bestIdx = i;
            }
        }

        return passages.get(bestIdx);
    }

    /**
     * Get top K passages by semantic similarity.
     */
    public List<RankedPassage> getTopPassages(String question, int k) {
        double[] questionEmb = encode(question);
        List<RankedPassage> ranked = new ArrayList<>();

        for (int i = 0; i < passages.size(); i++) {
            double sim = cosineSimilarity(questionEmb, passageEmbeddings.get(i));
            ranked.add(new RankedPassage(passages.get(i), sim));
        }

        ranked.sort((a, b) -> Double.compare(b.score, a.score));
        return ranked.subList(0, Math.min(k, ranked.size()));
    }

    /**
     * Check if two questions are semantically equivalent.
     */
    public boolean areQuestionsEquivalent(String q1, String q2, double threshold) {
        return semanticSimilarity(q1, q2) >= threshold;
    }

    public static class RankedPassage {
        public String passage;
        public double score;

        public RankedPassage(String passage, double score) {
            this.passage = passage;
            this.score = score;
        }
    }
}`,

	testCode: `import org.junit.jupiter.api.Test;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;

public class SemanticQATest {

    @Test
    void testAddPassages() {
        SemanticQA qa = new SemanticQA();
        List<String> passages = Arrays.asList(
            "Machine learning is a branch of artificial intelligence.",
            "Deep learning uses neural networks for pattern recognition."
        );
        qa.addPassages(passages);

        String answer = qa.answer("What is ML?");
        assertNotNull(answer);
    }

    @Test
    void testSemanticSimilarity() {
        SemanticQA qa = new SemanticQA();

        double similar = qa.semanticSimilarity(
            "machine learning algorithm",
            "artificial intelligence method"
        );

        double different = qa.semanticSimilarity(
            "machine learning algorithm",
            "cooking recipe"
        );

        assertTrue(similar > different);
    }

    @Test
    void testEncode() {
        SemanticQA qa = new SemanticQA();
        double[] emb = qa.encode("machine learning");

        assertNotNull(emb);
        assertTrue(emb.length > 0);
    }

    @Test
    void testGetTopPassages() {
        SemanticQA qa = new SemanticQA();
        qa.addPassages(Arrays.asList(
            "Machine learning is AI.",
            "Deep learning neural networks.",
            "Cooking recipes collection."
        ));

        List<SemanticQA.RankedPassage> top = qa.getTopPassages("artificial intelligence", 2);
        assertEquals(2, top.size());
    }

    @Test
    void testAreQuestionsEquivalent() {
        SemanticQA qa = new SemanticQA();

        boolean equivalent = qa.areQuestionsEquivalent(
            "What is machine learning?",
            "What is ML?",
            0.3
        );

        assertTrue(equivalent);
    }

    @Test
    void testRankedPassageClass() {
        SemanticQA.RankedPassage rp = new SemanticQA.RankedPassage("test passage", 0.9);
        assertEquals("test passage", rp.passage);
        assertEquals(0.9, rp.score, 0.001);
    }

    @Test
    void testEmptyPassages() {
        SemanticQA qa = new SemanticQA();
        String answer = qa.answer("any question");
        assertNull(answer);
    }

    @Test
    void testSimilarityRange() {
        SemanticQA qa = new SemanticQA();
        double sim = qa.semanticSimilarity("hello world", "goodbye moon");
        assertTrue(sim >= -1 && sim <= 1);
    }

    @Test
    void testEmbeddingNotNull() {
        SemanticQA qa = new SemanticQA();
        double[] emb = qa.encode("test sentence");
        assertNotNull(emb);
        assertTrue(emb.length > 0);
    }

    @Test
    void testNotEquivalentQuestions() {
        SemanticQA qa = new SemanticQA();
        boolean equivalent = qa.areQuestionsEquivalent(
            "What is machine learning?",
            "How do you cook pasta?",
            0.9
        );
        assertFalse(equivalent);
    }
}`,

	hint1: 'Average word embeddings to get sentence embeddings (mean pooling)',
	hint2: 'Initialize similar words with similar vectors to capture synonymy',

	whyItMatters: `Semantic similarity QA captures meaning beyond keywords:

- **Paraphrase handling**: "What is ML?" matches "machine learning"
- **Dense retrieval**: Modern approach using transformer embeddings
- **Zero-shot capability**: Generalizes to unseen questions
- **State-of-the-art**: DPR, ColBERT, and other dense retrievers

This approach powers modern conversational AI and search systems.`,

	translations: {
		ru: {
			title: 'Семантическое сходство QA',
			description: `# Семантическое сходство QA

Создайте QA-систему с использованием семантического сходства и sentence embeddings.

## Задача

Реализуйте семантическую QA-систему:
- Кодирование вопросов и пассажей в эмбеддинги
- Поиск семантически похожих пассажей
- Обработка перефразированных вопросов
- Ранжирование ответов по семантической релевантности

## Пример

\`\`\`java
SemanticQA qa = new SemanticQA();
qa.addPassages(passages);
String answer = qa.answer("What does ML stand for?");
// Finds: "Machine learning (ML) is a branch of AI."
\`\`\``,
			hint1: 'Усредняйте эмбеддинги слов для получения эмбеддингов предложений (mean pooling)',
			hint2: 'Инициализируйте похожие слова похожими векторами для захвата синонимии',
			whyItMatters: `Семантическое сходство QA захватывает смысл за пределами ключевых слов:

- **Обработка парафраз**: "Что такое ML?" совпадает с "machine learning"
- **Dense retrieval**: Современный подход с эмбеддингами трансформеров
- **Zero-shot способность**: Обобщение на невиденные вопросы
- **State-of-the-art**: DPR, ColBERT и другие dense retrievers`,
		},
		uz: {
			title: "Semantik o'xshashlik QA",
			description: `# Semantik o'xshashlik QA

Sentence embeddinglar bilan semantik o'xshashlikdan foydalanib QA tizimini yarating.

## Topshiriq

Semantik QA tizimini amalga oshiring:
- Savol va passagelarni embeddingga practixsh
- Semantik jihatdan o'xshash passagelarni topish
- Qayta ifodalangan savollarni qayta ishlash
- Javoblarni semantik relevantlik bo'yicha tartiblash

## Misol

\`\`\`java
SemanticQA qa = new SemanticQA();
qa.addPassages(passages);
String answer = qa.answer("What does ML stand for?");
// Finds: "Machine learning (ML) is a branch of AI."
\`\`\``,
			hint1: "Sentence embeddinglarni olish uchun so'z embeddinglarni o'rtacha qiling (mean pooling)",
			hint2: "Sinonimiyani ushlab olish uchun o'xshash so'zlarni o'xshash vektorlar bilan initsializatsiya qiling",
			whyItMatters: `Semantik o'xshashlik QA kalit so'zlardan tashqari ma'noni ushlab oladi:

- **Parafraz qayta ishlash**: "ML nima?" "machine learning" bilan mos keladi
- **Dense retrieval**: Transformer embeddinglaridan foydalanadigan zamonaviy yondashuv
- **Zero-shot qobiliyat**: Ko'rilmagan savollarga umumlashtirish
- **State-of-the-art**: DPR, ColBERT va boshqa dense retrieverlar`,
		},
	},
};

export default task;

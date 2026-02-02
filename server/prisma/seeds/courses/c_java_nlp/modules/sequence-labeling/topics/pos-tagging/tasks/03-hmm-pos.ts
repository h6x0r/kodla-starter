import { Task } from '../../../../../../../types';

const task: Task = {
	slug: 'jnlp-hmm-pos',
	title: 'HMM POS Tagger',
	difficulty: 'hard',
	tags: ['nlp', 'pos-tagging', 'hmm', 'viterbi', 'ml'],
	estimatedTime: '35m',
	isPremium: true,
	order: 3,
	description: `# HMM POS Tagger

Implement a Hidden Markov Model for POS tagging with Viterbi decoding.

## Task

Build an HMM-based POS tagger:
- Train transition and emission probabilities
- Implement Viterbi algorithm for decoding
- Handle unknown words with smoothing

## Example

\`\`\`java
HMMPOSTagger tagger = new HMMPOSTagger();
tagger.train(trainingData);
List<String> tags = tagger.predict("The cat sat");
\`\`\``,

	initialCode: `import java.util.*;

public class HMMPOSTagger {

    /**
     */
    public void train(List<List<TaggedWord>> sentences) {
    }

    /**
     */
    public List<String> predict(String sentence) {
        return null;
    }

    /**
     */
    public double getEmissionProb(String word, String tag) {
        return 0.0;
    }

    /**
     */
    public double getTransitionProb(String tag1, String tag2) {
        return 0.0;
    }

    public static class TaggedWord {
        public String word;
        public String tag;

        public TaggedWord(String word, String tag) {
            this.word = word;
            this.tag = tag;
        }
    }
}`,

	solutionCode: `import java.util.*;

public class HMMPOSTagger {

    private Map<String, Map<String, Integer>> emissionCounts;
    private Map<String, Map<String, Integer>> transitionCounts;
    private Map<String, Integer> tagCounts;
    private Set<String> vocabulary;
    private Set<String> tagSet;
    private double smoothingFactor = 0.001;

    public HMMPOSTagger() {
        this.emissionCounts = new HashMap<>();
        this.transitionCounts = new HashMap<>();
        this.tagCounts = new HashMap<>();
        this.vocabulary = new HashSet<>();
        this.tagSet = new HashSet<>();
    }

    /**
     * Train the HMM from tagged sentences.
     */
    public void train(List<List<TaggedWord>> sentences) {
        for (List<TaggedWord> sentence : sentences) {
            String prevTag = "<START>";
            tagCounts.merge(prevTag, 1, Integer::sum);

            for (TaggedWord tw : sentence) {
                String word = tw.word.toLowerCase();
                String tag = tw.tag;

                vocabulary.add(word);
                tagSet.add(tag);

                // Emission counts
                emissionCounts.computeIfAbsent(tag, k -> new HashMap<>())
                    .merge(word, 1, Integer::sum);

                // Transition counts
                transitionCounts.computeIfAbsent(prevTag, k -> new HashMap<>())
                    .merge(tag, 1, Integer::sum);

                tagCounts.merge(tag, 1, Integer::sum);
                prevTag = tag;
            }

            // End transition
            transitionCounts.computeIfAbsent(prevTag, k -> new HashMap<>())
                .merge("<END>", 1, Integer::sum);
        }
    }

    /**
     * Predict tags using Viterbi algorithm.
     */
    public List<String> predict(String sentence) {
        if (sentence == null || sentence.isEmpty()) {
            return new ArrayList<>();
        }

        String[] words = sentence.toLowerCase().split("\\\\s+");
        int n = words.length;

        if (tagSet.isEmpty()) {
            // Return default tags if not trained
            List<String> defaultTags = new ArrayList<>();
            for (int i = 0; i < n; i++) defaultTags.add("NN");
            return defaultTags;
        }

        List<String> tags = new ArrayList<>(tagSet);
        int numTags = tags.size();

        // Viterbi tables
        double[][] viterbi = new double[n][numTags];
        int[][] backpointer = new int[n][numTags];

        // Initialize
        for (int t = 0; t < numTags; t++) {
            double trans = getTransitionProb("<START>", tags.get(t));
            double emit = getEmissionProb(words[0], tags.get(t));
            viterbi[0][t] = Math.log(trans) + Math.log(emit);
            backpointer[0][t] = -1;
        }

        // Recursion
        for (int i = 1; i < n; i++) {
            for (int t = 0; t < numTags; t++) {
                double maxProb = Double.NEGATIVE_INFINITY;
                int maxPrev = 0;

                for (int p = 0; p < numTags; p++) {
                    double prob = viterbi[i-1][p] +
                                  Math.log(getTransitionProb(tags.get(p), tags.get(t)));
                    if (prob > maxProb) {
                        maxProb = prob;
                        maxPrev = p;
                    }
                }

                viterbi[i][t] = maxProb + Math.log(getEmissionProb(words[i], tags.get(t)));
                backpointer[i][t] = maxPrev;
            }
        }

        // Find best final state
        double maxFinal = Double.NEGATIVE_INFINITY;
        int bestLast = 0;
        for (int t = 0; t < numTags; t++) {
            if (viterbi[n-1][t] > maxFinal) {
                maxFinal = viterbi[n-1][t];
                bestLast = t;
            }
        }

        // Backtrack
        List<String> result = new ArrayList<>();
        int current = bestLast;
        for (int i = n - 1; i >= 0; i--) {
            result.add(0, tags.get(current));
            if (i > 0) {
                current = backpointer[i][current];
            }
        }

        return result;
    }

    /**
     * Get emission probability P(word|tag).
     */
    public double getEmissionProb(String word, String tag) {
        int tagCount = tagCounts.getOrDefault(tag, 0);
        if (tagCount == 0) return smoothingFactor;

        Map<String, Integer> emissions = emissionCounts.get(tag);
        if (emissions == null) return smoothingFactor;

        int wordCount = emissions.getOrDefault(word.toLowerCase(), 0);
        return (wordCount + smoothingFactor) / (tagCount + smoothingFactor * vocabulary.size());
    }

    /**
     * Get transition probability P(tag2|tag1).
     */
    public double getTransitionProb(String tag1, String tag2) {
        int tag1Count = tagCounts.getOrDefault(tag1, 0);
        if (tag1Count == 0) return smoothingFactor;

        Map<String, Integer> transitions = transitionCounts.get(tag1);
        if (transitions == null) return smoothingFactor;

        int transCount = transitions.getOrDefault(tag2, 0);
        return (transCount + smoothingFactor) / (tag1Count + smoothingFactor * tagSet.size());
    }

    /**
     * Get tag set.
     */
    public Set<String> getTagSet() {
        return new HashSet<>(tagSet);
    }

    public static class TaggedWord {
        public String word;
        public String tag;

        public TaggedWord(String word, String tag) {
            this.word = word;
            this.tag = tag;
        }
    }
}`,

	testCode: `import org.junit.jupiter.api.Test;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;

public class HMMPOSTaggerTest {

    private List<List<HMMPOSTagger.TaggedWord>> createTrainingData() {
        List<List<HMMPOSTagger.TaggedWord>> data = new ArrayList<>();

        // Sentence 1: The cat sat
        List<HMMPOSTagger.TaggedWord> s1 = new ArrayList<>();
        s1.add(new HMMPOSTagger.TaggedWord("the", "DT"));
        s1.add(new HMMPOSTagger.TaggedWord("cat", "NN"));
        s1.add(new HMMPOSTagger.TaggedWord("sat", "VBD"));
        data.add(s1);

        // Sentence 2: The dog ran
        List<HMMPOSTagger.TaggedWord> s2 = new ArrayList<>();
        s2.add(new HMMPOSTagger.TaggedWord("the", "DT"));
        s2.add(new HMMPOSTagger.TaggedWord("dog", "NN"));
        s2.add(new HMMPOSTagger.TaggedWord("ran", "VBD"));
        data.add(s2);

        return data;
    }

    @Test
    void testTrain() {
        HMMPOSTagger tagger = new HMMPOSTagger();
        tagger.train(createTrainingData());

        Set<String> tagSet = tagger.getTagSet();
        assertTrue(tagSet.contains("DT"));
        assertTrue(tagSet.contains("NN"));
        assertTrue(tagSet.contains("VBD"));
    }

    @Test
    void testEmissionProb() {
        HMMPOSTagger tagger = new HMMPOSTagger();
        tagger.train(createTrainingData());

        double prob = tagger.getEmissionProb("the", "DT");
        assertTrue(prob > 0);
    }

    @Test
    void testTransitionProb() {
        HMMPOSTagger tagger = new HMMPOSTagger();
        tagger.train(createTrainingData());

        double prob = tagger.getTransitionProb("DT", "NN");
        assertTrue(prob > 0);
    }

    @Test
    void testPredict() {
        HMMPOSTagger tagger = new HMMPOSTagger();
        tagger.train(createTrainingData());

        List<String> tags = tagger.predict("the cat sat");
        assertEquals(3, tags.size());
    }

    @Test
    void testPredictEmpty() {
        HMMPOSTagger tagger = new HMMPOSTagger();
        tagger.train(createTrainingData());
        List<String> tags = tagger.predict("");
        assertTrue(tags.isEmpty());
    }

    @Test
    void testPredictNull() {
        HMMPOSTagger tagger = new HMMPOSTagger();
        tagger.train(createTrainingData());
        List<String> tags = tagger.predict(null);
        assertTrue(tags.isEmpty());
    }

    @Test
    void testUntrainedPredict() {
        HMMPOSTagger tagger = new HMMPOSTagger();
        List<String> tags = tagger.predict("hello world");
        assertEquals(2, tags.size());
        assertEquals("NN", tags.get(0));
    }

    @Test
    void testUnknownWordEmission() {
        HMMPOSTagger tagger = new HMMPOSTagger();
        tagger.train(createTrainingData());
        double prob = tagger.getEmissionProb("unknownword", "DT");
        assertTrue(prob > 0);
    }

    @Test
    void testGetTagSetEmpty() {
        HMMPOSTagger tagger = new HMMPOSTagger();
        Set<String> tagSet = tagger.getTagSet();
        assertTrue(tagSet.isEmpty());
    }

    @Test
    void testTransitionProbUnknownTag() {
        HMMPOSTagger tagger = new HMMPOSTagger();
        tagger.train(createTrainingData());
        double prob = tagger.getTransitionProb("UNKNOWN", "NN");
        assertTrue(prob > 0);
    }
}`,

	hint1: 'Viterbi uses dynamic programming to find the most likely tag sequence',
	hint2: 'Apply Laplace smoothing to handle unseen word-tag pairs',

	whyItMatters: `HMM POS tagging demonstrates core ML concepts:

- **Probabilistic modeling**: Emission and transition probabilities
- **Viterbi algorithm**: Dynamic programming for sequence labeling
- **Smoothing**: Handling unseen events in probability estimation
- **Generative models**: Understanding P(words|tags)

This foundational algorithm inspired modern neural sequence models.`,

	translations: {
		ru: {
			title: 'HMM POS Tagger',
			description: `# HMM POS Tagger

Реализуйте скрытую марковскую модель для POS-теггинга с декодированием Витерби.

## Задача

Создайте POS-теггер на основе HMM:
- Обучение вероятностей переходов и эмиссий
- Реализация алгоритма Витерби для декодирования
- Обработка неизвестных слов со сглаживанием

## Пример

\`\`\`java
HMMPOSTagger tagger = new HMMPOSTagger();
tagger.train(trainingData);
List<String> tags = tagger.predict("The cat sat");
\`\`\``,
			hint1: 'Витерби использует динамическое программирование для нахождения наиболее вероятной последовательности тегов',
			hint2: 'Применяйте сглаживание Лапласа для обработки невиденных пар слово-тег',
			whyItMatters: `HMM POS-теггинг демонстрирует ключевые концепции ML:

- **Вероятностное моделирование**: Вероятности эмиссий и переходов
- **Алгоритм Витерби**: Динамическое программирование для разметки
- **Сглаживание**: Обработка невиденных событий
- **Генеративные модели**: Понимание P(слова|теги)`,
		},
		uz: {
			title: 'HMM POS Tagger',
			description: `# HMM POS Tagger

Viterbi depractixsh bilan POS teglash uchun Hidden Markov Model ni amalga oshiring.

## Topshiriq

HMMga asoslangan POS tagger yarating:
- O'tish va emissiya ehtimolliklarini o'rgatish
- Depractixsh uchun Viterbi algoritmini amalga oshirish
- Smoothing bilan noma'lum so'zlarni qayta ishlash

## Misol

\`\`\`java
HMMPOSTagger tagger = new HMMPOSTagger();
tagger.train(trainingData);
List<String> tags = tagger.predict("The cat sat");
\`\`\``,
			hint1: "Viterbi eng ehtimolli teg ketma-ketligini topish uchun dinamik dasturlashdan foydalanadi",
			hint2: "Ko'rilmagan so'z-teg juftliklarini qayta ishlash uchun Laplace smoothing qo'llang",
			whyItMatters: `HMM POS teglash asosiy ML konseptlarini namoyish etadi:

- **Ehtimoliy modellashtirish**: Emissiya va o'tish ehtimolliklari
- **Viterbi algoritmi**: Ketma-ketlikni belgilash uchun dinamik dasturlash
- **Smoothing**: Ko'rilmagan hodisalarni qayta ishlash
- **Generativ modellar**: P(so'zlar|teglar) ni tushunish`,
		},
	},
};

export default task;

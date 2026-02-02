import { Task } from '../../../../../../../types';

const task: Task = {
	slug: 'jnlp-beam-search',
	title: 'Beam Search Decoding',
	difficulty: 'hard',
	tags: ['nlp', 'text-generation', 'beam-search', 'decoding'],
	estimatedTime: '35m',
	isPremium: true,
	order: 4,
	description: `# Beam Search Decoding

Implement beam search for better text generation quality.

## Task

Build a beam search decoder that:
- Maintains top-k candidate sequences
- Scores sequences by cumulative probability
- Handles sequence termination
- Returns best complete sequence

## Example

\`\`\`java
BeamSearch decoder = new BeamSearch(model, 5); // beam width 5
List<String> result = decoder.decode("The quick", 20);
\`\`\``,

	initialCode: `import java.util.*;

public class BeamSearch {

    private int beamWidth;

    public BeamSearch(int beamWidth) {
        this.beamWidth = beamWidth;
    }

    /**
     * Set the language model for scoring.
     */
    public void setModel(LanguageModel model) {
    }

    /**
     * Decode sequence using beam search.
     */
    public List<String> decode(String prefix, int maxLength) {
        return null;
    }

    /**
     * Get top-k sequences with scores.
     */
    public List<ScoredSequence> getTopSequences(String prefix, int maxLength, int k) {
        return null;
    }

    public interface LanguageModel {
        Map<String, Double> getNextWordProbs(String context);
    }

    public static class ScoredSequence {
        public List<String> tokens;
        public double score;

        public ScoredSequence(List<String> tokens, double score) {
            this.tokens = tokens;
            this.score = score;
        }
    }
}`,

	solutionCode: `import java.util.*;

public class BeamSearch {

    private int beamWidth;
    private LanguageModel model;

    public BeamSearch(int beamWidth) {
        this.beamWidth = beamWidth;
        // Default simple model
        this.model = new SimpleLanguageModel();
    }

    /**
     * Set the language model for scoring.
     */
    public void setModel(LanguageModel model) {
        this.model = model;
    }

    /**
     * Beam class to track candidate sequences.
     */
    private static class Beam {
        List<String> tokens;
        double logProb;
        boolean complete;

        Beam(List<String> tokens, double logProb, boolean complete) {
            this.tokens = new ArrayList<>(tokens);
            this.logProb = logProb;
            this.complete = complete;
        }

        Beam extend(String token, double tokenLogProb) {
            List<String> newTokens = new ArrayList<>(tokens);
            newTokens.add(token);
            boolean isComplete = "<END>".equals(token) || ".".equals(token);
            return new Beam(newTokens, logProb + tokenLogProb, isComplete);
        }

        double normalizedScore() {
            // Length normalization to avoid favoring short sequences
            return logProb / Math.pow(tokens.size(), 0.6);
        }
    }

    /**
     * Decode sequence using beam search.
     */
    public List<String> decode(String prefix, int maxLength) {
        List<ScoredSequence> results = getTopSequences(prefix, maxLength, 1);
        if (results.isEmpty()) {
            return Arrays.asList(prefix.split("\\\\s+"));
        }
        return results.get(0).tokens;
    }

    /**
     * Get top-k sequences with scores.
     */
    public List<ScoredSequence> getTopSequences(String prefix, int maxLength, int k) {
        // Initialize beams with prefix
        String[] prefixTokens = prefix.toLowerCase().split("\\\\s+");
        List<Beam> beams = new ArrayList<>();
        beams.add(new Beam(Arrays.asList(prefixTokens), 0.0, false));

        List<Beam> completed = new ArrayList<>();

        for (int step = 0; step < maxLength; step++) {
            List<Beam> allCandidates = new ArrayList<>();

            for (Beam beam : beams) {
                if (beam.complete) {
                    completed.add(beam);
                    continue;
                }

                // Get context from last tokens
                String context = getContext(beam.tokens);
                Map<String, Double> probs = model.getNextWordProbs(context);

                if (probs.isEmpty()) {
                    beam.complete = true;
                    completed.add(beam);
                    continue;
                }

                // Extend beam with each possible next word
                for (Map.Entry<String, Double> entry : probs.entrySet()) {
                    double logProb = Math.log(Math.max(entry.getValue(), 1e-10));
                    allCandidates.add(beam.extend(entry.getKey(), logProb));
                }
            }

            // Keep top beamWidth candidates
            allCandidates.sort((a, b) -> Double.compare(b.normalizedScore(), a.normalizedScore()));
            beams = new ArrayList<>();
            for (int i = 0; i < Math.min(beamWidth, allCandidates.size()); i++) {
                Beam candidate = allCandidates.get(i);
                if (candidate.complete) {
                    completed.add(candidate);
                } else {
                    beams.add(candidate);
                }
            }

            if (beams.isEmpty()) break;
        }

        // Add remaining beams to completed
        completed.addAll(beams);

        // Sort by normalized score
        completed.sort((a, b) -> Double.compare(b.normalizedScore(), a.normalizedScore()));

        // Return top k
        List<ScoredSequence> results = new ArrayList<>();
        for (int i = 0; i < Math.min(k, completed.size()); i++) {
            Beam beam = completed.get(i);
            results.add(new ScoredSequence(beam.tokens, beam.normalizedScore()));
        }

        return results;
    }

    private String getContext(List<String> tokens) {
        int contextSize = Math.min(2, tokens.size());
        List<String> context = tokens.subList(tokens.size() - contextSize, tokens.size());
        return String.join(" ", context);
    }

    public interface LanguageModel {
        Map<String, Double> getNextWordProbs(String context);
    }

    public static class ScoredSequence {
        public List<String> tokens;
        public double score;

        public ScoredSequence(List<String> tokens, double score) {
            this.tokens = tokens;
            this.score = score;
        }

        @Override
        public String toString() {
            return String.join(" ", tokens) + " (score: " + String.format("%.4f", score) + ")";
        }
    }

    /**
     * Simple language model for testing.
     */
    private static class SimpleLanguageModel implements LanguageModel {
        private Map<String, Map<String, Double>> transitions;

        SimpleLanguageModel() {
            transitions = new HashMap<>();
            // Sample transitions
            transitions.put("the", Map.of("quick", 0.3, "brown", 0.2, "lazy", 0.2, "dog", 0.15, "cat", 0.15));
            transitions.put("the quick", Map.of("brown", 0.4, "fox", 0.3, "red", 0.2, "dog", 0.1));
            transitions.put("quick brown", Map.of("fox", 0.6, "dog", 0.2, "cat", 0.2));
            transitions.put("brown fox", Map.of("jumps", 0.5, "runs", 0.3, "walks", 0.2));
            transitions.put("fox jumps", Map.of("over", 0.7, "around", 0.3));
            transitions.put("jumps over", Map.of("the", 0.8, "a", 0.2));
            transitions.put("over the", Map.of("lazy", 0.5, "brown", 0.3, "quick", 0.2));
            transitions.put("the lazy", Map.of("dog", 0.6, "cat", 0.3, "fox", 0.1));
            transitions.put("lazy dog", Map.of("<END>", 0.5, "sleeps", 0.3, "runs", 0.2));
        }

        @Override
        public Map<String, Double> getNextWordProbs(String context) {
            return transitions.getOrDefault(context.toLowerCase(), new HashMap<>());
        }
    }
}`,

	testCode: `import org.junit.jupiter.api.Test;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;

public class BeamSearchTest {

    @Test
    void testDecode() {
        BeamSearch decoder = new BeamSearch(3);
        List<String> result = decoder.decode("the quick", 10);

        assertNotNull(result);
        assertTrue(result.size() >= 2);
    }

    @Test
    void testGetTopSequences() {
        BeamSearch decoder = new BeamSearch(5);
        List<BeamSearch.ScoredSequence> results = decoder.getTopSequences("the", 8, 3);

        assertFalse(results.isEmpty());
        assertTrue(results.size() <= 3);
    }

    @Test
    void testSequenceScoring() {
        BeamSearch decoder = new BeamSearch(5);
        List<BeamSearch.ScoredSequence> results = decoder.getTopSequences("the quick", 6, 5);

        // Scores should be in descending order
        for (int i = 0; i < results.size() - 1; i++) {
            assertTrue(results.get(i).score >= results.get(i + 1).score);
        }
    }

    @Test
    void testBeamWidth() {
        BeamSearch narrow = new BeamSearch(1);
        BeamSearch wide = new BeamSearch(10);

        List<BeamSearch.ScoredSequence> narrowResults = narrow.getTopSequences("the", 5, 5);
        List<BeamSearch.ScoredSequence> wideResults = wide.getTopSequences("the", 5, 5);

        // Wider beam should generally find better or equal score
        assertTrue(wideResults.get(0).score >= narrowResults.get(0).score - 0.1);
    }

    @Test
    void testScoredSequenceClass() {
        List<String> tokens = Arrays.asList("the", "quick", "fox");
        BeamSearch.ScoredSequence seq = new BeamSearch.ScoredSequence(tokens, -2.5);
        assertEquals(3, seq.tokens.size());
        assertEquals(-2.5, seq.score, 0.001);
    }

    @Test
    void testScoredSequenceToString() {
        List<String> tokens = Arrays.asList("hello", "world");
        BeamSearch.ScoredSequence seq = new BeamSearch.ScoredSequence(tokens, -1.0);
        String str = seq.toString();
        assertTrue(str.contains("hello"));
        assertTrue(str.contains("world"));
    }

    @Test
    void testDecodeReturnsPrefix() {
        BeamSearch decoder = new BeamSearch(3);
        List<String> result = decoder.decode("the quick", 1);
        assertTrue(result.contains("the") || result.contains("quick"));
    }

    @Test
    void testTopSequencesNotExceedK() {
        BeamSearch decoder = new BeamSearch(5);
        List<BeamSearch.ScoredSequence> results = decoder.getTopSequences("the", 10, 2);
        assertTrue(results.size() <= 2);
    }

    @Test
    void testDecodeMinimumLength() {
        BeamSearch decoder = new BeamSearch(3);
        List<String> result = decoder.decode("the", 3);
        assertTrue(result.size() >= 1);
    }

    @Test
    void testSetModelNotNull() {
        BeamSearch decoder = new BeamSearch(3);
        decoder.setModel(context -> Map.of("test", 1.0));
        List<String> result = decoder.decode("any", 5);
        assertNotNull(result);
    }
}`,

	hint1: 'Maintain beam_width candidate sequences at each step, sorted by cumulative log probability',
	hint2: 'Apply length normalization to avoid favoring shorter sequences',

	whyItMatters: `Beam search is essential for neural text generation:

- **Quality**: Better outputs than greedy decoding
- **Diversity**: Returns multiple candidate sequences
- **Control**: Beam width trades off quality vs. speed
- **Universal**: Used in machine translation, summarization, and chatbots

Understanding beam search is crucial for working with modern LLMs.`,

	translations: {
		ru: {
			title: 'Декодирование Beam Search',
			description: `# Декодирование Beam Search

Реализуйте beam search для улучшения качества генерации текста.

## Задача

Создайте декодер beam search:
- Поддержка top-k кандидатных последовательностей
- Оценка последовательностей по кумулятивной вероятности
- Обработка завершения последовательностей
- Возврат лучшей полной последовательности

## Пример

\`\`\`java
BeamSearch decoder = new BeamSearch(model, 5); // beam width 5
List<String> result = decoder.decode("The quick", 20);
\`\`\``,
			hint1: 'Поддерживайте beam_width кандидатных последовательностей на каждом шаге',
			hint2: 'Применяйте нормализацию по длине чтобы не предпочитать короткие последовательности',
			whyItMatters: `Beam search необходим для нейронной генерации текста:

- **Качество**: Лучшие результаты чем жадное декодирование
- **Разнообразие**: Возвращает несколько кандидатных последовательностей
- **Контроль**: Ширина луча - компромисс качество/скорость
- **Универсальность**: Используется в переводе, суммаризации, чатботах`,
		},
		uz: {
			title: 'Beam Search depractixsh',
			description: `# Beam Search depractixsh

Matn generatsiyasi sifatini yaxshilash uchun beam search ni amalga oshiring.

## Topshiriq

Beam search dekoderini yarating:
- Top-k kandidat ketma-ketliklarni saqlash
- Ketma-ketliklarni kumulyativ ehtimollik bo'yicha baholash
- Ketma-ketlik tugashini qayta ishlash
- Eng yaxshi to'liq ketma-ketlikni qaytarish

## Misol

\`\`\`java
BeamSearch decoder = new BeamSearch(model, 5); // beam width 5
List<String> result = decoder.decode("The quick", 20);
\`\`\``,
			hint1: "Har bir qadamda beam_width kandidat ketma-ketliklarni saqlang",
			hint2: "Qisqa ketma-ketliklarni afzal ko'rmaslik uchun uzunlik normalizatsiyasini qo'llang",
			whyItMatters: `Beam search neyron matn generatsiyasi uchun zarur:

- **Sifat**: Ochko'z depractixshdan yaxshiroq natijalar
- **Xilma-xillik**: Bir nechta kandidat ketma-ketliklarni qaytaradi
- **Nazorat**: Nur kengligi sifat va tezlik o'rtasidagi kelishuv
- **Universal**: Tarjima, xulosa chiqarish va chatbotlarda ishlatiladi`,
		},
	},
};

export default task;

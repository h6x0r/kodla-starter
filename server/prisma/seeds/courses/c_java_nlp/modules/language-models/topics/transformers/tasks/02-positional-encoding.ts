import { Task } from '../../../../../../../types';

const task: Task = {
	slug: 'jnlp-positional-encoding',
	title: 'Positional Encoding',
	difficulty: 'medium',
	tags: ['nlp', 'transformers', 'positional-encoding'],
	estimatedTime: '20m',
	isPremium: true,
	order: 2,
	description: `# Positional Encoding

Implement positional encodings for sequence position information.

## Task

Build positional encoding:
- Sinusoidal encoding
- Add to embeddings
- Handle variable sequence lengths

## Example

\`\`\`java
PositionalEncoding pe = new PositionalEncoding(512, 1000);
double[][] encodings = pe.getEncoding(100);
\`\`\``,

	initialCode: `import java.util.*;

public class PositionalEncoding {

    private int dModel;
    private int maxLen;
    private double[][] encodings;

    /**
     */
    public PositionalEncoding(int dModel, int maxLen) {
    }

    /**
     */
    private void computeEncodings() {
    }

    /**
     */
    public double[][] getEncoding(int seqLen) {
        return null;
    }

    /**
     */
    public double[][] addToEmbeddings(double[][] embeddings) {
        return null;
    }
}`,

	solutionCode: `import java.util.*;

public class PositionalEncoding {

    private int dModel;
    private int maxLen;
    private double[][] encodings;

    /**
     * Initialize with model dimension and max length.
     */
    public PositionalEncoding(int dModel, int maxLen) {
        this.dModel = dModel;
        this.maxLen = maxLen;
        this.encodings = new double[maxLen][dModel];
        computeEncodings();
    }

    /**
     * Compute sinusoidal positional encoding.
     * PE(pos, 2i) = sin(pos / 10000^(2i/d_model))
     * PE(pos, 2i+1) = cos(pos / 10000^(2i/d_model))
     */
    private void computeEncodings() {
        for (int pos = 0; pos < maxLen; pos++) {
            for (int i = 0; i < dModel; i++) {
                double angle = pos / Math.pow(10000, (2.0 * (i / 2)) / dModel);
                if (i % 2 == 0) {
                    encodings[pos][i] = Math.sin(angle);
                } else {
                    encodings[pos][i] = Math.cos(angle);
                }
            }
        }
    }

    /**
     * Get encoding for sequence length.
     */
    public double[][] getEncoding(int seqLen) {
        if (seqLen > maxLen) {
            throw new IllegalArgumentException("Sequence length exceeds max length");
        }

        double[][] result = new double[seqLen][dModel];
        for (int i = 0; i < seqLen; i++) {
            System.arraycopy(encodings[i], 0, result[i], 0, dModel);
        }
        return result;
    }

    /**
     * Add positional encoding to embeddings.
     */
    public double[][] addToEmbeddings(double[][] embeddings) {
        int seqLen = embeddings.length;
        int dim = embeddings[0].length;

        if (dim != dModel) {
            throw new IllegalArgumentException("Embedding dimension mismatch");
        }

        double[][] result = new double[seqLen][dim];
        for (int i = 0; i < seqLen; i++) {
            for (int j = 0; j < dim; j++) {
                result[i][j] = embeddings[i][j] + encodings[i][j];
            }
        }
        return result;
    }

    /**
     * Get single position encoding.
     */
    public double[] getPositionEncoding(int position) {
        if (position >= maxLen) {
            throw new IllegalArgumentException("Position exceeds max length");
        }
        return encodings[position].clone();
    }

    /**
     * Relative positional encoding (distance between positions).
     */
    public double[] getRelativeEncoding(int pos1, int pos2) {
        double[] enc1 = getPositionEncoding(pos1);
        double[] enc2 = getPositionEncoding(pos2);
        double[] relative = new double[dModel];

        for (int i = 0; i < dModel; i++) {
            relative[i] = enc1[i] - enc2[i];
        }
        return relative;
    }

    /**
     * Compute similarity between two positions.
     */
    public double positionSimilarity(int pos1, int pos2) {
        double[] enc1 = getPositionEncoding(pos1);
        double[] enc2 = getPositionEncoding(pos2);

        double dot = 0, norm1 = 0, norm2 = 0;
        for (int i = 0; i < dModel; i++) {
            dot += enc1[i] * enc2[i];
            norm1 += enc1[i] * enc1[i];
            norm2 += enc2[i] * enc2[i];
        }

        return dot / (Math.sqrt(norm1) * Math.sqrt(norm2));
    }
}`,

	testCode: `import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class PositionalEncodingTest {

    @Test
    void testGetEncoding() {
        PositionalEncoding pe = new PositionalEncoding(64, 100);
        double[][] encoding = pe.getEncoding(10);

        assertEquals(10, encoding.length);
        assertEquals(64, encoding[0].length);
    }

    @Test
    void testAddToEmbeddings() {
        PositionalEncoding pe = new PositionalEncoding(4, 100);
        double[][] embeddings = {{1, 1, 1, 1}, {2, 2, 2, 2}};

        double[][] result = pe.addToEmbeddings(embeddings);

        assertEquals(2, result.length);
        // Result should be embeddings + positional encoding
        assertNotEquals(1.0, result[0][0], 0.001);
    }

    @Test
    void testPositionSimilarity() {
        PositionalEncoding pe = new PositionalEncoding(64, 100);

        // Same position should have similarity 1
        double sameSim = pe.positionSimilarity(5, 5);
        assertEquals(1.0, sameSim, 0.001);

        // Adjacent positions should be more similar than distant ones
        double nearSim = pe.positionSimilarity(5, 6);
        double farSim = pe.positionSimilarity(5, 50);
        assertTrue(nearSim > farSim);
    }

    @Test
    void testSinusoidalPattern() {
        PositionalEncoding pe = new PositionalEncoding(4, 100);
        double[][] encoding = pe.getEncoding(10);

        // Values should be between -1 and 1 (sin/cos range)
        for (int i = 0; i < 10; i++) {
            for (int j = 0; j < 4; j++) {
                assertTrue(encoding[i][j] >= -1 && encoding[i][j] <= 1);
            }
        }
    }

    @Test
    void testGetPositionEncoding() {
        PositionalEncoding pe = new PositionalEncoding(64, 100);
        double[] enc = pe.getPositionEncoding(5);
        assertEquals(64, enc.length);
    }

    @Test
    void testGetRelativeEncoding() {
        PositionalEncoding pe = new PositionalEncoding(64, 100);
        double[] rel = pe.getRelativeEncoding(10, 5);
        assertEquals(64, rel.length);
    }

    @Test
    void testGetEncodingExceedsMax() {
        PositionalEncoding pe = new PositionalEncoding(64, 10);
        assertThrows(IllegalArgumentException.class, () -> pe.getEncoding(20));
    }

    @Test
    void testAddToEmbeddingsDimensionMismatch() {
        PositionalEncoding pe = new PositionalEncoding(64, 100);
        double[][] embeddings = {{1, 2, 3}};
        assertThrows(IllegalArgumentException.class, () -> pe.addToEmbeddings(embeddings));
    }

    @Test
    void testPositionEncodingNotNull() {
        PositionalEncoding pe = new PositionalEncoding(64, 100);
        double[][] encoding = pe.getEncoding(1);
        assertNotNull(encoding);
        assertNotNull(encoding[0]);
    }

    @Test
    void testDifferentPositionsHaveDifferentEncodings() {
        PositionalEncoding pe = new PositionalEncoding(64, 100);
        double[] enc0 = pe.getPositionEncoding(0);
        double[] enc1 = pe.getPositionEncoding(1);
        boolean different = false;
        for (int i = 0; i < 64; i++) {
            if (enc0[i] != enc1[i]) different = true;
        }
        assertTrue(different);
    }
}`,

	hint1: 'Use sin for even dimensions, cos for odd dimensions',
	hint2: 'The denominator 10000^(2i/d) creates different frequencies per dimension',

	whyItMatters: `Positional encoding enables sequence understanding:

- **Order matters**: "dog bites man" differs from "man bites dog"
- **No recurrence needed**: Transformers process all positions in parallel
- **Relative positions**: Sinusoidal encodings capture relative distances
- **Generalizable**: Works for sequences longer than training

Essential component of all transformer architectures.`,

	translations: {
		ru: {
			title: 'Позиционное кодирование',
			description: `# Позиционное кодирование

Реализуйте позиционные кодировки для информации о позиции в последовательности.

## Задача

Создайте позиционное кодирование:
- Синусоидальное кодирование
- Добавление к эмбеддингам
- Обработка переменной длины последовательности

## Пример

\`\`\`java
PositionalEncoding pe = new PositionalEncoding(512, 1000);
double[][] encodings = pe.getEncoding(100);
\`\`\``,
			hint1: 'Используйте sin для четных измерений, cos для нечетных',
			hint2: 'Знаменатель 10000^(2i/d) создает разные частоты для каждого измерения',
			whyItMatters: `Позиционное кодирование позволяет понимать последовательности:

- **Порядок важен**: "собака кусает человека" отличается от "человек кусает собаку"
- **Без рекуррентности**: Трансформеры обрабатывают все позиции параллельно
- **Относительные позиции**: Синусоидальные кодировки захватывают относительные расстояния
- **Обобщаемость**: Работает для последовательностей длиннее обучающих`,
		},
		uz: {
			title: 'Pozitsion practixsh',
			description: `# Pozitsion practixsh

Ketma-ketlikdagi pozitsiya ma'lumotlari uchun pozitsion practixshlarni amalga oshiring.

## Topshiriq

Pozitsion practixshni yarating:
- Sinusoidal practixsh
- Embeddinglarga qo'shish
- O'zgaruvchan ketma-ketlik uzunligini boshqarish

## Misol

\`\`\`java
PositionalEncoding pe = new PositionalEncoding(512, 1000);
double[][] encodings = pe.getEncoding(100);
\`\`\``,
			hint1: "Juft o'lchamlar uchun sin, toq o'lchamlar uchun cos dan foydalaning",
			hint2: "Maxraj 10000^(2i/d) har bir o'lcham uchun turli chastotalarni yaratadi",
			whyItMatters: `Pozitsion practixsh ketma-ketlikni tushunishni yoqadi:

- **Tartib muhim**: "it odamni tislaydi" "odam itni tislaydi" dan farq qiladi
- **Rekurrentsiya kerak emas**: Transformerlar barcha pozitsiyalarni parallel qayta ishlaydi
- **Nisbiy pozitsiyalar**: Sinusoidal practixshlar nisbiy masofalarni oladi
- **Umumlashtiriladi**: O'qitishdan uzunroq ketma-ketliklar uchun ishlaydi`,
		},
	},
};

export default task;

import { Task } from '../../../../../../../types';

const task: Task = {
	slug: 'jml-categorical-encoding',
	title: 'Categorical Encoding',
	difficulty: 'medium',
	tags: ['datavec', 'encoding', 'categorical'],
	estimatedTime: '20m',
	isPremium: false,
	order: 2,
	description: `# Categorical Encoding

Convert categorical features to numerical representations.

## Task

Implement encoding strategies:
- One-hot encoding
- Label encoding
- Handle unknown categories

## Example

\`\`\`java
// One-hot encoding
TransformProcess tp = new TransformProcess.Builder(schema)
    .categoricalToOneHot("color")
    .build();

// Label encoding
TransformProcess tp2 = new TransformProcess.Builder(schema)
    .categoricalToInteger("size")
    .build();
\`\`\``,

	initialCode: `import org.datavec.api.transform.TransformProcess;
import org.datavec.api.transform.schema.Schema;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

public class CategoricalEncoder {

    /**
     * Create one-hot encoding transform.
     */
    public static TransformProcess createOneHotEncoder(Schema schema,
                                                        String columnName) {
        return null;
    }

    /**
     * Create label encoding transform.
     */
    public static TransformProcess createLabelEncoder(Schema schema,
                                                       String columnName) {
        return null;
    }

    /**
     * Build label mapping manually.
     */
    public static Map<String, Integer> buildLabelMapping(List<String> categories) {
        return null;
    }
}`,

	solutionCode: `import org.datavec.api.transform.TransformProcess;
import org.datavec.api.transform.schema.Schema;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

public class CategoricalEncoder {

    /**
     * Create one-hot encoding transform.
     */
    public static TransformProcess createOneHotEncoder(Schema schema,
                                                        String columnName) {
        return new TransformProcess.Builder(schema)
            .categoricalToOneHot(columnName)
            .build();
    }

    /**
     * Create label encoding transform.
     */
    public static TransformProcess createLabelEncoder(Schema schema,
                                                       String columnName) {
        return new TransformProcess.Builder(schema)
            .categoricalToInteger(columnName)
            .build();
    }

    /**
     * Build label mapping manually.
     */
    public static Map<String, Integer> buildLabelMapping(List<String> categories) {
        Map<String, Integer> mapping = new HashMap<>();
        for (int i = 0; i < categories.size(); i++) {
            mapping.put(categories.get(i), i);
        }
        return mapping;
    }

    /**
     * Create multiple one-hot encodings.
     */
    public static TransformProcess createMultiColumnOneHot(Schema schema,
                                                             String... columnNames) {
        TransformProcess.Builder builder = new TransformProcess.Builder(schema);
        for (String column : columnNames) {
            builder.categoricalToOneHot(column);
        }
        return builder.build();
    }

    /**
     * Encode string to integer using mapping.
     */
    public static int encodeCategory(Map<String, Integer> mapping, String category) {
        Integer encoded = mapping.get(category);
        if (encoded == null) {
            throw new IllegalArgumentException("Unknown category: " + category);
        }
        return encoded;
    }

    /**
     * Decode integer back to category.
     */
    public static String decodeCategory(Map<String, Integer> mapping, int encoded) {
        for (Map.Entry<String, Integer> entry : mapping.entrySet()) {
            if (entry.getValue() == encoded) {
                return entry.getKey();
            }
        }
        throw new IllegalArgumentException("Unknown encoding: " + encoded);
    }
}`,

	testCode: `import org.junit.jupiter.api.Test;
import org.datavec.api.transform.schema.Schema;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.*;

public class CategoricalEncoderTest {

    @Test
    void testBuildLabelMapping() {
        List<String> categories = Arrays.asList("red", "green", "blue");
        Map<String, Integer> mapping = CategoricalEncoder.buildLabelMapping(categories);

        assertEquals(3, mapping.size());
        assertEquals(0, mapping.get("red"));
        assertEquals(1, mapping.get("green"));
        assertEquals(2, mapping.get("blue"));
    }

    @Test
    void testEncodeCategory() {
        List<String> categories = Arrays.asList("small", "medium", "large");
        Map<String, Integer> mapping = CategoricalEncoder.buildLabelMapping(categories);

        assertEquals(1, CategoricalEncoder.encodeCategory(mapping, "medium"));
    }

    @Test
    void testDecodeCategory() {
        List<String> categories = Arrays.asList("A", "B", "C");
        Map<String, Integer> mapping = CategoricalEncoder.buildLabelMapping(categories);

        assertEquals("B", CategoricalEncoder.decodeCategory(mapping, 1));
    }

    @Test
    void testUnknownCategory() {
        List<String> categories = Arrays.asList("a", "b");
        Map<String, Integer> mapping = CategoricalEncoder.buildLabelMapping(categories);

        assertThrows(IllegalArgumentException.class, () -> {
            CategoricalEncoder.encodeCategory(mapping, "unknown");
        });
    }

    @Test
    void testEmptyMapping() {
        List<String> categories = Arrays.asList();
        Map<String, Integer> mapping = CategoricalEncoder.buildLabelMapping(categories);
        assertEquals(0, mapping.size());
    }

    @Test
    void testSingleCategory() {
        List<String> categories = Arrays.asList("only");
        Map<String, Integer> mapping = CategoricalEncoder.buildLabelMapping(categories);
        assertEquals(1, mapping.size());
        assertEquals(0, mapping.get("only"));
    }

    @Test
    void testDecodeFirstCategory() {
        List<String> categories = Arrays.asList("first", "second");
        Map<String, Integer> mapping = CategoricalEncoder.buildLabelMapping(categories);
        assertEquals("first", CategoricalEncoder.decodeCategory(mapping, 0));
    }

    @Test
    void testMappingContainsAll() {
        List<String> categories = Arrays.asList("x", "y", "z", "w");
        Map<String, Integer> mapping = CategoricalEncoder.buildLabelMapping(categories);
        assertTrue(mapping.containsKey("x"));
        assertTrue(mapping.containsKey("y"));
        assertTrue(mapping.containsKey("z"));
        assertTrue(mapping.containsKey("w"));
    }

    @Test
    void testUnknownDecoding() {
        List<String> categories = Arrays.asList("a", "b");
        Map<String, Integer> mapping = CategoricalEncoder.buildLabelMapping(categories);
        assertThrows(IllegalArgumentException.class, () -> {
            CategoricalEncoder.decodeCategory(mapping, 99);
        });
    }
}`,

	hint1: 'categoricalToOneHot() creates binary columns for each category',
	hint2: 'categoricalToInteger() maps categories to consecutive integers',

	whyItMatters: `Encoding is essential for ML with categorical data:

- **Algorithm compatibility**: Most algorithms need numeric input
- **One-hot**: No ordinal assumption, but increases dimensionality
- **Label encoding**: Compact, but implies ordering
- **Choice matters**: Wrong encoding can hurt model performance

Understanding encoding helps select the right approach.`,

	translations: {
		ru: {
			title: 'Кодирование категорий',
			description: `# Кодирование категорий

Конвертируйте категориальные признаки в числовые представления.

## Задача

Реализуйте стратегии кодирования:
- One-hot кодирование
- Label кодирование
- Обработка неизвестных категорий

## Пример

\`\`\`java
// One-hot encoding
TransformProcess tp = new TransformProcess.Builder(schema)
    .categoricalToOneHot("color")
    .build();

// Label encoding
TransformProcess tp2 = new TransformProcess.Builder(schema)
    .categoricalToInteger("size")
    .build();
\`\`\``,
			hint1: 'categoricalToOneHot() создает бинарные столбцы для каждой категории',
			hint2: 'categoricalToInteger() отображает категории в последовательные целые числа',
			whyItMatters: `Кодирование важно для ML с категориальными данными:

- **Совместимость алгоритмов**: Большинству нужен числовой вход
- **One-hot**: Нет порядкового предположения, но увеличивает размерность
- **Label encoding**: Компактно, но подразумевает порядок
- **Выбор важен**: Неправильное кодирование может ухудшить модель`,
		},
		uz: {
			title: 'Kategorik practixsh',
			description: `# Kategorik practixsh

Kategorik xususiyatlarni raqamli ko'rinishga aylantiring.

## Topshiriq

Practixsh strategiyalarini amalga oshiring:
- One-hot practixsh
- Label practixsh
- Noma'lum kategoriyalarni boshqarish

## Misol

\`\`\`java
// One-hot encoding
TransformProcess tp = new TransformProcess.Builder(schema)
    .categoricalToOneHot("color")
    .build();

// Label encoding
TransformProcess tp2 = new TransformProcess.Builder(schema)
    .categoricalToInteger("size")
    .build();
\`\`\``,
			hint1: "categoricalToOneHot() har bir kategoriya uchun binary ustunlar yaratadi",
			hint2: "categoricalToInteger() kategoriyalarni ketma-ket butun sonlarga xaritalashtiradi",
			whyItMatters: `Kategorik ma'lumotlar bilan ML uchun practixsh muhim:

- **Algoritm muvofiqligi**: Ko'p algoritmlarga raqamli kirish kerak
- **One-hot**: Tartib taxmini yo'q, lekin o'lchamni oshiradi
- **Label practixsh**: Ixcham, lekin tartibni bildiradi
- **Tanlov muhim**: Noto'g'ri practixsh model samaradorligiga zarar yetkazishi mumkin`,
		},
	},
};

export default task;

import { Task } from '../../../../../../../types';

const task: Task = {
	slug: 'pydl-text-classification-rnn',
	title: 'Text Classification with RNN',
	difficulty: 'medium',
	tags: ['pytorch', 'rnn', 'nlp', 'text'],
	estimatedTime: '18m',
	isPremium: false,
	order: 6,
	description: `# Text Classification with RNN

Build a complete text classification model using LSTM.

## Task

Implement a \`TextClassifier\` class with:
- Embedding layer for word indices
- LSTM layer for sequence processing
- Linear layer for classification

## Example

\`\`\`python
model = TextClassifier(
    vocab_size=10000,
    embed_dim=128,
    hidden_size=256,
    num_classes=5
)

# Input: batch of word indices
x = torch.randint(0, 10000, (32, 100))  # batch, seq_len
output = model(x)
# output.shape = (32, 5)
\`\`\``,

	initialCode: `import torch
import torch.nn as nn

class TextClassifier(nn.Module):
    """LSTM-based text classifier."""

    def __init__(self, vocab_size: int, embed_dim: int,
                 hidden_size: int, num_classes: int):
        super().__init__()
        # Your code here
        pass

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # Your code here
        pass
`,

	solutionCode: `import torch
import torch.nn as nn

class TextClassifier(nn.Module):
    """LSTM-based text classifier."""

    def __init__(self, vocab_size: int, embed_dim: int,
                 hidden_size: int, num_classes: int):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim)
        self.lstm = nn.LSTM(embed_dim, hidden_size, batch_first=True)
        self.fc = nn.Linear(hidden_size, num_classes)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # x: (batch, seq_len) - word indices
        embedded = self.embedding(x)  # (batch, seq_len, embed_dim)
        _, (hidden, _) = self.lstm(embedded)  # hidden: (1, batch, hidden)
        out = self.fc(hidden.squeeze(0))  # (batch, num_classes)
        return out
`,

	testCode: `import torch
import torch.nn as nn
import unittest

class TestTextClassifier(unittest.TestCase):
    def test_output_shape(self):
        model = TextClassifier(10000, 128, 256, 5)
        x = torch.randint(0, 10000, (32, 100))
        out = model(x)
        self.assertEqual(out.shape, (32, 5))

    def test_has_embedding(self):
        model = TextClassifier(10000, 128, 256, 5)
        self.assertIsInstance(model.embedding, nn.Embedding)
        self.assertEqual(model.embedding.num_embeddings, 10000)

    def test_different_seq_len(self):
        model = TextClassifier(5000, 64, 128, 3)
        x = torch.randint(0, 5000, (8, 50))
        out = model(x)
        self.assertEqual(out.shape, (8, 3))

    def test_is_nn_module(self):
        model = TextClassifier(10000, 128, 256, 5)
        self.assertIsInstance(model, nn.Module)

    def test_has_lstm(self):
        model = TextClassifier(10000, 128, 256, 5)
        self.assertTrue(hasattr(model, 'lstm'))
        self.assertIsInstance(model.lstm, nn.LSTM)

    def test_has_fc(self):
        model = TextClassifier(10000, 128, 256, 5)
        self.assertTrue(hasattr(model, 'fc'))
        self.assertIsInstance(model.fc, nn.Linear)

    def test_embed_dim(self):
        model = TextClassifier(10000, 64, 256, 5)
        self.assertEqual(model.embedding.embedding_dim, 64)

    def test_single_sample(self):
        model = TextClassifier(10000, 128, 256, 5)
        x = torch.randint(0, 10000, (1, 100))
        out = model(x)
        self.assertEqual(out.shape, (1, 5))

    def test_output_not_nan(self):
        model = TextClassifier(10000, 128, 256, 5)
        x = torch.randint(0, 10000, (4, 50))
        out = model(x)
        self.assertFalse(torch.isnan(out).any())

    def test_large_batch(self):
        model = TextClassifier(10000, 128, 256, 5)
        x = torch.randint(0, 10000, (64, 100))
        out = model(x)
        self.assertEqual(out.shape, (64, 5))
`,

	hint1: 'Embedding converts word indices to dense vectors',
	hint2: 'Use hidden state (not outputs) for classification',

	whyItMatters: `Text classification is a fundamental NLP task:

- **Embeddings**: Learn dense word representations
- **LSTM encoding**: Capture sequential context
- **Sentiment analysis**: Classify reviews as positive/negative
- **Topic classification**: Categorize documents

This architecture is the basis for many NLP applications.`,

	translations: {
		ru: {
			title: 'Классификация текста с RNN',
			description: `# Классификация текста с RNN

Создайте полную модель классификации текста на LSTM.

## Задача

Реализуйте класс \`TextClassifier\` с:
- Embedding слой для индексов слов
- LSTM слой для обработки последовательности
- Linear слой для классификации

## Пример

\`\`\`python
model = TextClassifier(
    vocab_size=10000,
    embed_dim=128,
    hidden_size=256,
    num_classes=5
)

# Input: batch of word indices
x = torch.randint(0, 10000, (32, 100))  # batch, seq_len
output = model(x)
# output.shape = (32, 5)
\`\`\``,
			hint1: 'Embedding преобразует индексы слов в плотные векторы',
			hint2: 'Используйте hidden state (не outputs) для классификации',
			whyItMatters: `Классификация текста - фундаментальная задача NLP:

- **Embeddings**: Обучаемые плотные представления слов
- **LSTM кодирование**: Захват последовательного контекста
- **Анализ тональности**: Классификация отзывов
- **Тематическая классификация**: Категоризация документов`,
		},
		uz: {
			title: "RNN bilan matnni tasniflash",
			description: `# RNN bilan matnni tasniflash

LSTM yordamida to'liq matn tasniflash modelini yarating.

## Topshiriq

\`TextClassifier\` sinfini amalga oshiring:
- So'z indekslari uchun Embedding qatlami
- Ketma-ketlikni qayta ishlash uchun LSTM qatlami
- Tasniflash uchun Linear qatlami

## Misol

\`\`\`python
model = TextClassifier(
    vocab_size=10000,
    embed_dim=128,
    hidden_size=256,
    num_classes=5
)

# Input: batch of word indices
x = torch.randint(0, 10000, (32, 100))  # batch, seq_len
output = model(x)
# output.shape = (32, 5)
\`\`\``,
			hint1: "Embedding so'z indekslarini zich vektorlarga aylantiradi",
			hint2: "Tasniflash uchun hidden state dan (outputs emas) foydalaning",
			whyItMatters: `Matn tasniflash asosiy NLP vazifasi:

- **Embeddings**: Zich so'z tasvirlarini o'rganish
- **LSTM practixsh**: Ketma-ket kontekstni olish
- **Tuyg'u tahlili**: Sharhlarni ijobiy/salbiy deb tasniflash
- **Mavzu tasniflash**: Hujjatlarni kategoriyalash`,
		},
	},
};

export default task;

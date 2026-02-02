import { Task } from '../../../../../../../types';

const task: Task = {
	slug: 'pydl-seq2seq',
	title: 'Sequence to Sequence',
	difficulty: 'hard',
	tags: ['pytorch', 'rnn', 'seq2seq', 'encoder-decoder'],
	estimatedTime: '20m',
	isPremium: true,
	order: 7,
	description: `# Sequence to Sequence

Build an encoder-decoder architecture for sequence-to-sequence tasks.

## Task

Implement two classes:
1. \`Encoder\` - LSTM that encodes input sequence to context
2. \`Decoder\` - LSTM that generates output sequence from context

## Example

\`\`\`python
encoder = Encoder(input_size=100, hidden_size=256)
decoder = Decoder(output_size=100, hidden_size=256)

src = torch.randint(0, 100, (4, 20))  # source sequence
tgt = torch.randint(0, 100, (4, 15))  # target sequence

context = encoder(src)
outputs = decoder(tgt, context)
# outputs.shape = (4, 15, 100)
\`\`\``,

	initialCode: `import torch
import torch.nn as nn

class Encoder(nn.Module):
    """Encoder for seq2seq."""

    def __init__(self, input_size: int, hidden_size: int, embed_dim: int = 128):
        super().__init__()
        # Your code here
        pass

    def forward(self, x: torch.Tensor) -> tuple:
        """Return (hidden, cell) context."""
        # Your code here
        pass

class Decoder(nn.Module):
    """Decoder for seq2seq."""

    def __init__(self, output_size: int, hidden_size: int, embed_dim: int = 128):
        super().__init__()
        # Your code here
        pass

    def forward(self, x: torch.Tensor, context: tuple) -> torch.Tensor:
        """Generate output sequence given context."""
        # Your code here
        pass
`,

	solutionCode: `import torch
import torch.nn as nn

class Encoder(nn.Module):
    """Encoder for seq2seq."""

    def __init__(self, input_size: int, hidden_size: int, embed_dim: int = 128):
        super().__init__()
        self.embedding = nn.Embedding(input_size, embed_dim)
        self.lstm = nn.LSTM(embed_dim, hidden_size, batch_first=True)

    def forward(self, x: torch.Tensor) -> tuple:
        """Return (hidden, cell) context."""
        embedded = self.embedding(x)
        _, (hidden, cell) = self.lstm(embedded)
        return hidden, cell

class Decoder(nn.Module):
    """Decoder for seq2seq."""

    def __init__(self, output_size: int, hidden_size: int, embed_dim: int = 128):
        super().__init__()
        self.embedding = nn.Embedding(output_size, embed_dim)
        self.lstm = nn.LSTM(embed_dim, hidden_size, batch_first=True)
        self.fc = nn.Linear(hidden_size, output_size)

    def forward(self, x: torch.Tensor, context: tuple) -> torch.Tensor:
        """Generate output sequence given context."""
        embedded = self.embedding(x)
        output, _ = self.lstm(embedded, context)
        output = self.fc(output)
        return output
`,

	testCode: `import torch
import torch.nn as nn
import unittest

class TestSeq2Seq(unittest.TestCase):
    def test_encoder_context(self):
        encoder = Encoder(100, 256)
        src = torch.randint(0, 100, (4, 20))
        hidden, cell = encoder(src)
        self.assertEqual(hidden.shape, (1, 4, 256))
        self.assertEqual(cell.shape, (1, 4, 256))

    def test_decoder_output(self):
        encoder = Encoder(100, 256)
        decoder = Decoder(100, 256)
        src = torch.randint(0, 100, (4, 20))
        tgt = torch.randint(0, 100, (4, 15))
        context = encoder(src)
        output = decoder(tgt, context)
        self.assertEqual(output.shape, (4, 15, 100))

    def test_different_lengths(self):
        encoder = Encoder(50, 128)
        decoder = Decoder(50, 128)
        src = torch.randint(0, 50, (2, 30))
        tgt = torch.randint(0, 50, (2, 10))
        context = encoder(src)
        output = decoder(tgt, context)
        self.assertEqual(output.shape, (2, 10, 50))

    def test_encoder_is_module(self):
        encoder = Encoder(100, 256)
        self.assertIsInstance(encoder, nn.Module)

    def test_decoder_is_module(self):
        decoder = Decoder(100, 256)
        self.assertIsInstance(decoder, nn.Module)

    def test_encoder_has_lstm(self):
        encoder = Encoder(100, 256)
        self.assertTrue(hasattr(encoder, 'lstm'))

    def test_decoder_has_fc(self):
        decoder = Decoder(100, 256)
        self.assertTrue(hasattr(decoder, 'fc'))

    def test_single_sample(self):
        encoder = Encoder(100, 256)
        decoder = Decoder(100, 256)
        src = torch.randint(0, 100, (1, 20))
        tgt = torch.randint(0, 100, (1, 15))
        context = encoder(src)
        output = decoder(tgt, context)
        self.assertEqual(output.shape, (1, 15, 100))

    def test_output_not_nan(self):
        encoder = Encoder(100, 256)
        decoder = Decoder(100, 256)
        src = torch.randint(0, 100, (2, 20))
        tgt = torch.randint(0, 100, (2, 15))
        context = encoder(src)
        output = decoder(tgt, context)
        self.assertFalse(torch.isnan(output).any())

    def test_encoder_has_embedding(self):
        encoder = Encoder(100, 256)
        self.assertTrue(hasattr(encoder, 'embedding'))
        self.assertIsInstance(encoder.embedding, nn.Embedding)
`,

	hint1: 'Encoder returns (hidden, cell) as context for decoder',
	hint2: 'Decoder LSTM is initialized with encoder context',

	whyItMatters: `Seq2Seq is foundational for many tasks:

- **Machine translation**: Translate between languages
- **Summarization**: Compress long texts
- **Chatbots**: Generate conversational responses
- **Foundation for transformers**: Attention was added to this

Understanding seq2seq is essential for modern NLP architectures.`,

	translations: {
		ru: {
			title: 'Sequence to Sequence',
			description: `# Sequence to Sequence

Создайте архитектуру encoder-decoder для задач последовательность-в-последовательность.

## Задача

Реализуйте два класса:
1. \`Encoder\` - LSTM кодирующий входную последовательность в контекст
2. \`Decoder\` - LSTM генерирующий выходную последовательность из контекста

## Пример

\`\`\`python
encoder = Encoder(input_size=100, hidden_size=256)
decoder = Decoder(output_size=100, hidden_size=256)

src = torch.randint(0, 100, (4, 20))  # source sequence
tgt = torch.randint(0, 100, (4, 15))  # target sequence

context = encoder(src)
outputs = decoder(tgt, context)
# outputs.shape = (4, 15, 100)
\`\`\``,
			hint1: 'Encoder возвращает (hidden, cell) как контекст для decoder',
			hint2: 'LSTM decoder инициализируется контекстом encoder',
			whyItMatters: `Seq2Seq - основа многих задач:

- **Машинный перевод**: Перевод между языками
- **Суммаризация**: Сжатие длинных текстов
- **Чат-боты**: Генерация разговорных ответов
- **Основа трансформеров**: Attention был добавлен к этой архитектуре`,
		},
		uz: {
			title: 'Sequence to Sequence',
			description: `# Sequence to Sequence

Ketma-ketlikdan-ketma-ketlikka vazifalari uchun encoder-decoder arxitekturasini yarating.

## Topshiriq

Ikki sinf amalga oshiring:
1. \`Encoder\` - Kirish ketma-ketligini kontekstga practixydigan LSTM
2. \`Decoder\` - Kontekstdan chiqish ketma-ketligini yaratadigan LSTM

## Misol

\`\`\`python
encoder = Encoder(input_size=100, hidden_size=256)
decoder = Decoder(output_size=100, hidden_size=256)

src = torch.randint(0, 100, (4, 20))  # source sequence
tgt = torch.randint(0, 100, (4, 15))  # target sequence

context = encoder(src)
outputs = decoder(tgt, context)
# outputs.shape = (4, 15, 100)
\`\`\``,
			hint1: "Encoder decoder uchun kontekst sifatida (hidden, cell) qaytaradi",
			hint2: "Decoder LSTM encoder konteksti bilan boshlangan",
			whyItMatters: `Seq2Seq ko'p vazifalar uchun asos:

- **Mashina tarjimasi**: Tillar o'rtasida tarjima
- **Qisqartirish**: Uzun matnlarni siqish
- **Chatbotlar**: Suhbat javoblarini yaratish
- **Transformerlar asosi**: Attention shu arxitekturaga qo'shilgan`,
		},
	},
};

export default task;

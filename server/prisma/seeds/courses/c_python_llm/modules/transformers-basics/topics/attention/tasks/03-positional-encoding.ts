import { Task } from '../../../../../../../types';

const task: Task = {
	slug: 'pyllm-positional-encoding',
	title: 'Positional Encoding',
	difficulty: 'medium',
	tags: ['pytorch', 'transformer', 'encoding'],
	estimatedTime: '15m',
	isPremium: false,
	order: 3,
	description: `# Positional Encoding

Implement sinusoidal positional encodings to give transformers position information.

## Task

Implement a \`PositionalEncoding\` module that:
- Generates sinusoidal position embeddings
- Adds them to input embeddings
- Supports variable sequence lengths

## Formula

\\[PE_{(pos, 2i)} = \\sin(pos / 10000^{2i/d_{model}})\\]
\\[PE_{(pos, 2i+1)} = \\cos(pos / 10000^{2i/d_{model}})\\]

## Example

\`\`\`python
pe = PositionalEncoding(d_model=512, max_len=1000)

x = torch.randn(2, 100, 512)  # batch, seq_len, d_model
output = pe(x)
# output.shape = (2, 100, 512)
\`\`\``,

	initialCode: `import torch
import torch.nn as nn
import math

class PositionalEncoding(nn.Module):
    """Sinusoidal positional encoding."""

    def __init__(self, d_model: int, max_len: int = 5000, dropout: float = 0.1):
        super().__init__()
        # Your code here
        pass

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """Add positional encoding to input embeddings."""
        # Your code here
        pass
`,

	solutionCode: `import torch
import torch.nn as nn
import math

class PositionalEncoding(nn.Module):
    """Sinusoidal positional encoding."""

    def __init__(self, d_model: int, max_len: int = 5000, dropout: float = 0.1):
        super().__init__()
        self.dropout = nn.Dropout(dropout)

        # Create positional encoding matrix
        pe = torch.zeros(max_len, d_model)
        position = torch.arange(0, max_len, dtype=torch.float).unsqueeze(1)
        div_term = torch.exp(torch.arange(0, d_model, 2).float() * (-math.log(10000.0) / d_model))

        pe[:, 0::2] = torch.sin(position * div_term)
        pe[:, 1::2] = torch.cos(position * div_term)

        pe = pe.unsqueeze(0)  # (1, max_len, d_model)
        self.register_buffer('pe', pe)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """Add positional encoding to input embeddings."""
        x = x + self.pe[:, :x.size(1)]
        return self.dropout(x)
`,

	testCode: `import torch
import torch.nn as nn
import unittest

class TestPositionalEncoding(unittest.TestCase):
    def test_output_shape(self):
        pe = PositionalEncoding(d_model=512)
        x = torch.randn(2, 100, 512)
        output = pe(x)
        self.assertEqual(output.shape, (2, 100, 512))

    def test_different_seq_lengths(self):
        pe = PositionalEncoding(d_model=256)
        x1 = torch.randn(2, 50, 256)
        x2 = torch.randn(2, 100, 256)
        out1 = pe(x1)
        out2 = pe(x2)
        self.assertEqual(out1.shape, (2, 50, 256))
        self.assertEqual(out2.shape, (2, 100, 256))

    def test_pe_is_buffer(self):
        pe = PositionalEncoding(d_model=512)
        self.assertIn('pe', dict(pe.named_buffers()))

    def test_unique_positions(self):
        pe = PositionalEncoding(d_model=64, dropout=0.0)
        x = torch.zeros(1, 10, 64)
        output = pe(x)
        # Each position should have unique encoding
        for i in range(10):
            for j in range(i+1, 10):
                self.assertFalse(torch.allclose(output[0, i], output[0, j]))

    def test_is_nn_module(self):
        pe = PositionalEncoding(d_model=256)
        self.assertIsInstance(pe, nn.Module)

    def test_has_dropout(self):
        pe = PositionalEncoding(d_model=256, dropout=0.5)
        self.assertTrue(hasattr(pe, 'dropout'))

    def test_output_not_nan(self):
        pe = PositionalEncoding(d_model=128)
        x = torch.randn(2, 20, 128)
        output = pe(x)
        self.assertFalse(torch.isnan(output).any())

    def test_single_sample(self):
        pe = PositionalEncoding(d_model=64)
        x = torch.randn(1, 10, 64)
        output = pe(x)
        self.assertEqual(output.shape, (1, 10, 64))

    def test_max_len_respected(self):
        pe = PositionalEncoding(d_model=64, max_len=100)
        self.assertEqual(pe.pe.shape[1], 100)

    def test_no_learnable_params(self):
        pe = PositionalEncoding(d_model=64)
        # PE should be registered as buffer, not parameter
        params = list(pe.parameters())
        # Only dropout has no parameters
        pe_buffers = dict(pe.named_buffers())
        self.assertIn('pe', pe_buffers)
`,

	hint1: 'Use register_buffer to store PE so it moves with the model',
	hint2: 'Even indices use sin, odd indices use cos',

	whyItMatters: `Positional encoding gives transformers position awareness:

- **No recurrence**: Transformers have no inherent position info
- **Sinusoidal**: Generalizes to longer sequences
- **Relative positions**: Can learn relative position relationships
- **Efficient**: Precomputed, no learnable parameters

This enables transformers to understand word order.`,

	translations: {
		ru: {
			title: 'Позиционное кодирование',
			description: `# Позиционное кодирование

Реализуйте синусоидальное позиционное кодирование для передачи информации о позиции трансформерам.

## Задача

Реализуйте модуль \`PositionalEncoding\`, который:
- Генерирует синусоидальные позиционные эмбеддинги
- Добавляет их к входным эмбеддингам
- Поддерживает переменную длину последовательности

## Пример

\`\`\`python
pe = PositionalEncoding(d_model=512, max_len=1000)

x = torch.randn(2, 100, 512)  # batch, seq_len, d_model
output = pe(x)
# output.shape = (2, 100, 512)
\`\`\``,
			hint1: 'Используйте register_buffer для хранения PE, чтобы он перемещался с моделью',
			hint2: 'Четные индексы используют sin, нечетные - cos',
			whyItMatters: `Позиционное кодирование дает трансформерам осознание позиции:

- **Нет рекуррентности**: Трансформеры не имеют встроенной информации о позиции
- **Синусоидальное**: Обобщается на более длинные последовательности
- **Относительные позиции**: Может учить относительные связи позиций
- **Эффективность**: Предвычислено, нет обучаемых параметров`,
		},
		uz: {
			title: 'Pozitsion practixsh',
			description: `# Pozitsion practixsh

Transformerlarga pozitsiya ma'lumotini berish uchun sinusoidal pozitsion practixshni amalga oshiring.

## Topshiriq

\`PositionalEncoding\` modulini amalga oshiring:
- Sinusoidal pozitsiya embeddinglarini yaratadi
- Ularni kirish embeddinglariga qo'shadi
- O'zgaruvchan ketma-ketlik uzunliklarini qo'llab-quvvatlaydi

## Misol

\`\`\`python
pe = PositionalEncoding(d_model=512, max_len=1000)

x = torch.randn(2, 100, 512)  # batch, seq_len, d_model
output = pe(x)
# output.shape = (2, 100, 512)
\`\`\``,
			hint1: "PE ni saqlash uchun register_buffer dan foydalaning, u model bilan birga harakatlanadi",
			hint2: "Juft indekslar sin, toq indekslar cos dan foydalanadi",
			whyItMatters: `Pozitsion practixsh transformerlarga pozitsiya xabardorligini beradi:

- **Rekursiya yo'q**: Transformerlarda o'rnatilgan pozitsiya ma'lumoti yo'q
- **Sinusoidal**: Uzunroq ketma-ketliklarga umumlashadi
- **Nisbiy pozitsiyalar**: Nisbiy pozitsiya munosabatlarini o'rganishi mumkin
- **Samarali**: Oldindan hisoblangan, o'rganadigan parametrlar yo'q`,
		},
	},
};

export default task;

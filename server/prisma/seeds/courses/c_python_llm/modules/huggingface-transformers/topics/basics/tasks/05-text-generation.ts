import { Task } from '../../../../../../../types';

const task: Task = {
	slug: 'pyllm-text-generation-hf',
	title: 'Text Generation',
	difficulty: 'medium',
	tags: ['huggingface', 'generation', 'gpt'],
	estimatedTime: '15m',
	isPremium: true,
	order: 5,
	description: `# Text Generation with HuggingFace

Implement text generation with various decoding strategies.

## Task

Implement a \`TextGenerator\` class that supports:
- Greedy decoding
- Sampling with temperature
- Top-k and top-p sampling
- Beam search

## Decoding Strategies

- **Greedy**: Always pick highest probability token
- **Sampling**: Sample from probability distribution
- **Top-k**: Sample from top k tokens
- **Top-p (nucleus)**: Sample from smallest set with cumulative prob >= p
- **Beam search**: Keep top n sequences at each step

## Example

\`\`\`python
generator = TextGenerator("gpt2")

text = generator.generate("Once upon a time", max_length=50)
text = generator.generate("The future of AI", strategy="top_p", top_p=0.9)
\`\`\``,

	initialCode: `import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

class TextGenerator:
    """Text generation with multiple decoding strategies."""

    def __init__(self, model_name: str, device: str = None):
        # Your code here
        pass

    def generate(self, prompt: str, max_length: int = 50,
                 strategy: str = "greedy", **kwargs) -> str:
        """Generate text with specified strategy."""
        # Your code here
        pass

    def generate_greedy(self, input_ids, max_length: int) -> torch.Tensor:
        """Greedy decoding."""
        # Your code here
        pass

    def generate_sample(self, input_ids, max_length: int,
                        temperature: float = 1.0) -> torch.Tensor:
        """Sampling with temperature."""
        # Your code here
        pass
`,

	solutionCode: `import torch
import torch.nn.functional as F
from transformers import AutoModelForCausalLM, AutoTokenizer

class TextGenerator:
    """Text generation with multiple decoding strategies."""

    def __init__(self, model_name: str, device: str = None):
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForCausalLM.from_pretrained(model_name)

        if self.tokenizer.pad_token is None:
            self.tokenizer.pad_token = self.tokenizer.eos_token

        if device is None:
            self.device = "cuda" if torch.cuda.is_available() else "cpu"
        else:
            self.device = device

        self.model.to(self.device)
        self.model.eval()

    def generate(self, prompt: str, max_length: int = 50,
                 strategy: str = "greedy", **kwargs) -> str:
        """Generate text with specified strategy."""
        input_ids = self.tokenizer.encode(prompt, return_tensors="pt").to(self.device)

        if strategy == "greedy":
            output_ids = self.generate_greedy(input_ids, max_length)
        elif strategy == "sample":
            temperature = kwargs.get("temperature", 1.0)
            output_ids = self.generate_sample(input_ids, max_length, temperature)
        elif strategy == "top_k":
            k = kwargs.get("k", 50)
            output_ids = self.model.generate(
                input_ids, max_length=max_length, do_sample=True, top_k=k
            )
        elif strategy == "top_p":
            p = kwargs.get("top_p", 0.9)
            output_ids = self.model.generate(
                input_ids, max_length=max_length, do_sample=True, top_p=p
            )
        elif strategy == "beam":
            num_beams = kwargs.get("num_beams", 5)
            output_ids = self.model.generate(
                input_ids, max_length=max_length, num_beams=num_beams
            )
        else:
            raise ValueError(f"Unknown strategy: {strategy}")

        return self.tokenizer.decode(output_ids[0], skip_special_tokens=True)

    def generate_greedy(self, input_ids, max_length: int) -> torch.Tensor:
        """Greedy decoding."""
        generated = input_ids

        for _ in range(max_length - input_ids.size(1)):
            with torch.no_grad():
                outputs = self.model(generated)
                next_token_logits = outputs.logits[:, -1, :]
                next_token = next_token_logits.argmax(dim=-1, keepdim=True)
                generated = torch.cat([generated, next_token], dim=1)

                if next_token.item() == self.tokenizer.eos_token_id:
                    break

        return generated

    def generate_sample(self, input_ids, max_length: int,
                        temperature: float = 1.0) -> torch.Tensor:
        """Sampling with temperature."""
        generated = input_ids

        for _ in range(max_length - input_ids.size(1)):
            with torch.no_grad():
                outputs = self.model(generated)
                next_token_logits = outputs.logits[:, -1, :] / temperature
                probs = F.softmax(next_token_logits, dim=-1)
                next_token = torch.multinomial(probs, num_samples=1)
                generated = torch.cat([generated, next_token], dim=1)

                if next_token.item() == self.tokenizer.eos_token_id:
                    break

        return generated
`,

	testCode: `import torch
import unittest
from unittest.mock import MagicMock, patch

class TestTextGenerator(unittest.TestCase):
    @patch('transformers.AutoTokenizer.from_pretrained')
    @patch('transformers.AutoModelForCausalLM.from_pretrained')
    def test_init(self, mock_model, mock_tokenizer):
        mock_tokenizer.return_value = MagicMock()
        mock_tokenizer.return_value.pad_token = None
        mock_tokenizer.return_value.eos_token = "<|endoftext|>"
        mock_model.return_value = MagicMock()
        generator = TextGenerator("gpt2", device="cpu")
        self.assertIsNotNone(generator.model)

    @patch('transformers.AutoTokenizer.from_pretrained')
    @patch('transformers.AutoModelForCausalLM.from_pretrained')
    def test_generate_greedy(self, mock_model, mock_tokenizer):
        mock_tokenizer_instance = MagicMock()
        mock_tokenizer_instance.encode.return_value = torch.tensor([[1, 2, 3]])
        mock_tokenizer_instance.decode.return_value = "Generated text"
        mock_tokenizer_instance.eos_token_id = 50256
        mock_tokenizer_instance.pad_token = None
        mock_tokenizer_instance.eos_token = "<|endoftext|>"
        mock_tokenizer.return_value = mock_tokenizer_instance

        mock_model_instance = MagicMock()
        mock_outputs = MagicMock()
        mock_outputs.logits = torch.randn(1, 3, 50257)
        mock_model_instance.return_value = mock_outputs
        mock_model.return_value = mock_model_instance

        generator = TextGenerator("gpt2", device="cpu")
        # Just test that it doesn't crash
        self.assertIsNotNone(generator)

    @patch('transformers.AutoTokenizer.from_pretrained')
    @patch('transformers.AutoModelForCausalLM.from_pretrained')
    def test_has_tokenizer(self, mock_model, mock_tokenizer):
        mock_tokenizer.return_value = MagicMock()
        mock_tokenizer.return_value.pad_token = None
        mock_tokenizer.return_value.eos_token = "<|endoftext|>"
        mock_model.return_value = MagicMock()
        generator = TextGenerator("gpt2", device="cpu")
        self.assertIsNotNone(generator.tokenizer)

    @patch('transformers.AutoTokenizer.from_pretrained')
    @patch('transformers.AutoModelForCausalLM.from_pretrained')
    def test_has_device(self, mock_model, mock_tokenizer):
        mock_tokenizer.return_value = MagicMock()
        mock_tokenizer.return_value.pad_token = None
        mock_tokenizer.return_value.eos_token = "<|endoftext|>"
        mock_model.return_value = MagicMock()
        generator = TextGenerator("gpt2", device="cpu")
        self.assertEqual(generator.device, "cpu")

    @patch('transformers.AutoTokenizer.from_pretrained')
    @patch('transformers.AutoModelForCausalLM.from_pretrained')
    def test_model_in_eval_mode(self, mock_model, mock_tokenizer):
        mock_tokenizer.return_value = MagicMock()
        mock_tokenizer.return_value.pad_token = None
        mock_tokenizer.return_value.eos_token = "<|endoftext|>"
        mock_model_instance = MagicMock()
        mock_model.return_value = mock_model_instance
        generator = TextGenerator("gpt2", device="cpu")
        mock_model_instance.eval.assert_called_once()

    @patch('transformers.AutoTokenizer.from_pretrained')
    @patch('transformers.AutoModelForCausalLM.from_pretrained')
    def test_generate_returns_string(self, mock_model, mock_tokenizer):
        mock_tokenizer_instance = MagicMock()
        mock_tokenizer_instance.encode.return_value = torch.tensor([[1, 2, 3]])
        mock_tokenizer_instance.decode.return_value = "Generated text"
        mock_tokenizer_instance.eos_token_id = 50256
        mock_tokenizer_instance.pad_token = None
        mock_tokenizer_instance.eos_token = "<|endoftext|>"
        mock_tokenizer.return_value = mock_tokenizer_instance

        mock_model_instance = MagicMock()
        mock_outputs = MagicMock()
        mock_outputs.logits = torch.randn(1, 3, 50257)
        mock_model_instance.return_value = mock_outputs
        mock_model.return_value = mock_model_instance

        generator = TextGenerator("gpt2", device="cpu")
        result = generator.generate("Test", max_length=5)
        self.assertIsInstance(result, str)

    @patch('transformers.AutoTokenizer.from_pretrained')
    @patch('transformers.AutoModelForCausalLM.from_pretrained')
    def test_pad_token_set_when_none(self, mock_model, mock_tokenizer):
        mock_tokenizer_instance = MagicMock()
        mock_tokenizer_instance.pad_token = None
        mock_tokenizer_instance.eos_token = "<eos>"
        mock_tokenizer.return_value = mock_tokenizer_instance
        mock_model.return_value = MagicMock()
        generator = TextGenerator("gpt2", device="cpu")
        self.assertEqual(generator.tokenizer.pad_token, "<eos>")

    @patch('transformers.AutoTokenizer.from_pretrained')
    @patch('transformers.AutoModelForCausalLM.from_pretrained')
    def test_invalid_strategy_raises(self, mock_model, mock_tokenizer):
        mock_tokenizer.return_value = MagicMock()
        mock_tokenizer.return_value.pad_token = "<pad>"
        mock_tokenizer.return_value.encode.return_value = torch.tensor([[1, 2]])
        mock_model.return_value = MagicMock()
        generator = TextGenerator("gpt2", device="cpu")
        with self.assertRaises(ValueError):
            generator.generate("Test", strategy="unknown")

    @patch('transformers.AutoTokenizer.from_pretrained')
    @patch('transformers.AutoModelForCausalLM.from_pretrained')
    def test_has_model_attribute(self, mock_model, mock_tokenizer):
        mock_tokenizer.return_value = MagicMock()
        mock_tokenizer.return_value.pad_token = None
        mock_tokenizer.return_value.eos_token = "<|endoftext|>"
        mock_model.return_value = MagicMock()
        generator = TextGenerator("gpt2", device="cpu")
        self.assertTrue(hasattr(generator, 'model'))

    @patch('transformers.AutoTokenizer.from_pretrained')
    @patch('transformers.AutoModelForCausalLM.from_pretrained')
    def test_generate_greedy_returns_tensor(self, mock_model, mock_tokenizer):
        mock_tokenizer.return_value = MagicMock()
        mock_tokenizer.return_value.pad_token = None
        mock_tokenizer.return_value.eos_token = "<|endoftext|>"
        mock_tokenizer.return_value.eos_token_id = 50256

        mock_model_instance = MagicMock()
        mock_outputs = MagicMock()
        mock_outputs.logits = torch.randn(1, 3, 50257)
        mock_model_instance.return_value = mock_outputs
        mock_model.return_value = mock_model_instance

        generator = TextGenerator("gpt2", device="cpu")
        input_ids = torch.tensor([[1, 2, 3]])
        result = generator.generate_greedy(input_ids, max_length=5)
        self.assertIsInstance(result, torch.Tensor)
`,

	hint1: 'Temperature > 1 makes output more random, < 1 makes it more focused',
	hint2: 'Use model.generate() for built-in strategies like beam search',

	whyItMatters: `Generation strategies control LLM output quality:

- **Greedy**: Fast but repetitive
- **Temperature**: Balance creativity vs coherence
- **Top-p**: Nucleus sampling for natural text
- **Beam search**: Best for translation, summarization

Choosing the right strategy is crucial for application quality.`,

	translations: {
		ru: {
			title: 'Генерация текста',
			description: `# Генерация текста с HuggingFace

Реализуйте генерацию текста с различными стратегиями декодирования.

## Задача

Реализуйте класс \`TextGenerator\` с поддержкой:
- Greedy декодирования
- Sampling с temperature
- Top-k и top-p sampling
- Beam search

## Пример

\`\`\`python
generator = TextGenerator("gpt2")

text = generator.generate("Once upon a time", max_length=50)
text = generator.generate("The future of AI", strategy="top_p", top_p=0.9)
\`\`\``,
			hint1: 'Temperature > 1 делает выход более случайным, < 1 более сфокусированным',
			hint2: 'Используйте model.generate() для встроенных стратегий типа beam search',
			whyItMatters: `Стратегии генерации контролируют качество выхода LLM:

- **Greedy**: Быстро, но повторяющееся
- **Temperature**: Баланс креативности и связности
- **Top-p**: Nucleus sampling для естественного текста
- **Beam search**: Лучше для перевода, суммаризации`,
		},
		uz: {
			title: 'Matn generatsiyasi',
			description: `# HuggingFace bilan matn generatsiyasi

Turli depractixsh strategiyalari bilan matn generatsiyasini amalga oshiring.

## Topshiriq

\`TextGenerator\` sinfini amalga oshiring:
- Greedy depractixsh
- Temperature bilan sampling
- Top-k va top-p sampling
- Beam search

## Misol

\`\`\`python
generator = TextGenerator("gpt2")

text = generator.generate("Once upon a time", max_length=50)
text = generator.generate("The future of AI", strategy="top_p", top_p=0.9)
\`\`\``,
			hint1: "Temperature > 1 chiqishni tasodifiyroq qiladi, < 1 fokuslanganroq",
			hint2: "Beam search kabi o'rnatilgan strategiyalar uchun model.generate() dan foydalaning",
			whyItMatters: `Generatsiya strategiyalari LLM chiqish sifatini boshqaradi:

- **Greedy**: Tez lekin takrorlanuvchi
- **Temperature**: Ijodkorlik va bog'liqlik balansi
- **Top-p**: Tabiiy matn uchun nucleus sampling
- **Beam search**: Tarjima, xulosa chiqarish uchun eng yaxshi`,
		},
	},
};

export default task;

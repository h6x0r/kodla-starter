import { Task } from '../../../../../../../types';

export const task: Task = {
	slug: 'algo-string-compression',
	title: 'String Compression',
	difficulty: 'medium',
	tags: ['python', 'strings', 'run-length-encoding'],
	estimatedTime: '20m',
	isPremium: false,
	youtubeUrl: '',
	description: `Implement basic string compression using counts of repeated characters.

**Problem:**

Given a string \`s\`, compress it using the following rules:
- Replace consecutive repeated characters with the character followed by the count
- If the compressed string is not smaller, return the original string

**Examples:**

\`\`\`
Input: s = "aabcccccaaa"
Output: "a2b1c5a3"
Explanation: Groups are aa, b, ccccc, aaa

Input: s = "abcdef"
Output: "abcdef"
Explanation: Compressed "a1b1c1d1e1f1" is longer, return original

Input: s = "aaaaaa"
Output: "a6"
Explanation: 6 a's become "a6"
\`\`\`

**Algorithm:**

1. Iterate through string, tracking current character and count
2. When character changes, append char + count to result
3. Compare lengths and return appropriate string

**Time Complexity:** O(n)
**Space Complexity:** O(n) for result`,
	initialCode: `def compress(s: str) -> str:
    # TODO: Compress string using run-length encoding (return original if not smaller)

    return s`,
	solutionCode: `def compress(s: str) -> str:
    """
    Compress string using run-length encoding.
    Returns original if compressed is not smaller.

    Args:
        s: Input string

    Returns:
        Compressed string or original if not smaller
    """
    # Edge cases
    if len(s) <= 1:
        return s

    # Build compressed string
    result = []
    count = 1

    for i in range(1, len(s) + 1):
        # If end of string or character changed
        if i == len(s) or s[i] != s[i - 1]:
            # Append character and count
            result.append(s[i - 1])
            result.append(str(count))
            count = 1
        else:
            count += 1

    # Return shorter string
    compressed = "".join(result)
    return compressed if len(compressed) < len(s) else s`,
	testCode: `import pytest
from solution import compress

class TestCompress:
    def test_basic(self):
        """Test basic compression"""
        assert compress("aabcccccaaa") == "a2b1c5a3"

    def test_no_compression(self):
        """Test when compression doesn't help"""
        assert compress("abcdef") == "abcdef"

    def test_all_same(self):
        """Test all same characters"""
        assert compress("aaaaaa") == "a6"

    def test_empty(self):
        """Test empty string"""
        assert compress("") == ""

    def test_single(self):
        """Test single character"""
        assert compress("a") == "a"

    def test_two_same(self):
        """Test two same characters (no benefit)"""
        assert compress("aa") == "aa"

    def test_three_same(self):
        """Test three same characters"""
        assert compress("aaa") == "a3"

    def test_pairs(self):
        """Test pairs of characters (no benefit)"""
        assert compress("aabbcc") == "aabbcc"

    def test_long_run(self):
        """Test long run of characters"""
        assert compress("aaaaaaaaaa") == "a10"

    def test_alternating_chars(self):
        """Test alternating characters (worst case)"""
        assert compress("abcdefgh") == "abcdefgh"`,
	hint1: `Iterate from index 1, comparing each character with the previous one. Track a count variable that increments when characters match.`,
	hint2: `When characters differ (or at end of string), append the previous character and str(count) to a result list. Use "".join() at the end for efficiency.`,
	whyItMatters: `Run-length encoding is a fundamental compression technique.

**Why This Matters:**

**1. Data Compression**

RLE is used in real compression:
\`\`\`
# Image formats (BMP, TIFF)
# Fax machines (Group 3/4)
# Simple game data (tilemaps)
\`\`\`

**2. When RLE Works Well**

Effective for data with many consecutive repeats:
\`\`\`
"WWWWWBBBWWW" -> "W5B3W3"  # 67% compression
"WBWBWBWBWB" -> "W1B1W1B1W1B1W1B1W1B1"  # Worse!
\`\`\`

**3. String Building Efficiency**

\`\`\`python
# BAD: String concatenation creates new strings
result = result + char + str(count)

# GOOD: Use list and join
result = []
result.append(char)
result.append(str(count))
return "".join(result)

# Also works: list comprehension
[char + str(count) for ...]
\`\`\`

**4. Edge Case Awareness**

The "return original if not smaller" requirement teaches:
- Think about when algorithm fails
- Always validate output makes sense
- Consider degenerate inputs`,
	order: 5,
	translations: {
		ru: {
			title: 'Сжатие строки',
			description: `Реализуйте базовое сжатие строки с использованием подсчёта повторяющихся символов.

**Задача:**

Дана строка \`s\`, сожмите её по следующим правилам:
- Замените последовательные повторяющиеся символы на символ, за которым следует счётчик
- Если сжатая строка не меньше, верните исходную строку

**Примеры:**

\`\`\`
Вход: s = "aabcccccaaa"
Выход: "a2b1c5a3"
Объяснение: Группы: aa, b, ccccc, aaa

Вход: s = "abcdef"
Выход: "abcdef"
Объяснение: Сжатая "a1b1c1d1e1f1" длиннее, возвращаем оригинал

Вход: s = "aaaaaa"
Выход: "a6"
\`\`\`

**Алгоритм:**

1. Итерируйте по строке, отслеживая текущий символ и счётчик
2. При смене символа добавьте char + count к результату
3. Сравните длины и верните подходящую строку

**Временная сложность:** O(n)
**Пространственная сложность:** O(n) для результата`,
			hint1: `Итерируйте с индекса 1, сравнивая каждый символ с предыдущим. Отслеживайте переменную count, которая увеличивается при совпадении символов.`,
			hint2: `Когда символы различаются (или в конце строки), добавьте предыдущий символ и str(count) в список результата. Используйте "".join() в конце для эффективности.`,
			whyItMatters: `Кодирование длин серий - фундаментальная техника сжатия.

**Почему это важно:**

**1. Сжатие данных**

RLE используется в реальном сжатии:
- Форматы изображений (BMP, TIFF)
- Факсимильные аппараты
- Простые игровые данные

**2. Когда RLE работает хорошо**

Эффективно для данных с множеством последовательных повторов.

**3. Осознание граничных случаев**

Требование "вернуть оригинал если не меньше" учит:
- Думать о том, когда алгоритм не работает
- Всегда проверять, что выход имеет смысл`,
			solutionCode: `def compress(s: str) -> str:
    """
    Сжимает строку используя кодирование длин серий.
    Возвращает оригинал если сжатая не меньше.

    Args:
        s: Входная строка

    Returns:
        Сжатая строка или оригинал если не меньше
    """
    # Граничные случаи
    if len(s) <= 1:
        return s

    # Строим сжатую строку
    result = []
    count = 1

    for i in range(1, len(s) + 1):
        # Если конец строки или символ изменился
        if i == len(s) or s[i] != s[i - 1]:
            # Добавляем символ и счётчик
            result.append(s[i - 1])
            result.append(str(count))
            count = 1
        else:
            count += 1

    # Возвращаем более короткую строку
    compressed = "".join(result)
    return compressed if len(compressed) < len(s) else s`
		},
		uz: {
			title: 'Satrni siqish',
			description: `Takrorlanuvchi belgilarni hisoblash yordamida asosiy satr siqishni amalga oshiring.

**Masala:**

Satr \`s\` berilgan, uni quyidagi qoidalar bo'yicha siqing:
- Ketma-ket takrorlanuvchi belgilarni belgi va undan keyin soni bilan almashtiring
- Agar siqilgan satr kichikroq bo'lmasa, asl satrni qaytaring

**Misollar:**

\`\`\`
Kirish: s = "aabcccccaaa"
Chiqish: "a2b1c5a3"
Tushuntirish: Guruhlar: aa, b, ccccc, aaa

Kirish: s = "abcdef"
Chiqish: "abcdef"
Tushuntirish: Siqilgan "a1b1c1d1e1f1" uzunroq, aslini qaytaramiz

Kirish: s = "aaaaaa"
Chiqish: "a6"
\`\`\`

**Algoritm:**

1. Satr bo'ylab takrorlang, joriy belgi va hisoblagichni kuzating
2. Belgi o'zgarganda char + count ni natijaga qo'shing
3. Uzunliklarni solishtiring va tegishli satrni qaytaring

**Vaqt murakkabligi:** O(n)
**Xotira murakkabligi:** O(n) natija uchun`,
			hint1: `Indeks 1 dan boshlab takrorlang, har bir belgini oldingi bilan solishtiring. Belgilar mos kelganda ortadigan count o'zgaruvchisini kuzating.`,
			hint2: `Belgilar farq qilganda (yoki satr oxirida), oldingi belgi va str(count) ni natija ro'yxatiga qo'shing. Samaradorlik uchun oxirida "".join() dan foydalaning.`,
			whyItMatters: `Uzunlik seriyalarini practixsh asosiy siqish texnikasi.

**Bu nima uchun muhim:**

**1. Ma'lumotlarni siqish**

RLE haqiqiy siqishda ishlatiladi:
- Rasm formatlari (BMP, TIFF)
- Faks mashinalari
- Oddiy o'yin ma'lumotlari`,
			solutionCode: `def compress(s: str) -> str:
    """
    Satrni uzunlik seriyalarini practixsh yordamida siqadi.
    Agar siqilgan kichikroq bo'lmasa aslini qaytaradi.

    Args:
        s: Kirish satri

    Returns:
        Siqilgan satr yoki kichikroq bo'lmasa asligi
    """
    # Chegara holatlari
    if len(s) <= 1:
        return s

    # Siqilgan satrni quramiz
    result = []
    count = 1

    for i in range(1, len(s) + 1):
        # Agar satr oxiri yoki belgi o'zgargan bo'lsa
        if i == len(s) or s[i] != s[i - 1]:
            # Belgi va hisobni qo'shamiz
            result.append(s[i - 1])
            result.append(str(count))
            count = 1
        else:
            count += 1

    # Qisqaroq satrni qaytaramiz
    compressed = "".join(result)
    return compressed if len(compressed) < len(s) else s`
		}
	}
};

export default task;

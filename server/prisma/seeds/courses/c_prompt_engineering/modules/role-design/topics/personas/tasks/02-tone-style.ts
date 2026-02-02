export default {
  slug: 'pe-tone-style',
  title: 'Mastering Tone',
  difficulty: 'easy' as const,
  estimatedTime: '10m',
  taskType: 'PROMPT' as const,
  description: `
# Mastering Tone

Create a prompt that makes the AI respond in a **friendly, encouraging tone** like a supportive mentor.

## Your Goal

Design a prompt for a coding mentor that:
1. Uses warm, encouraging language
2. Celebrates small wins
3. Provides constructive feedback without being harsh
4. Makes beginners feel confident

## Requirements

Your prompt must:
- Define the friendly mentor persona
- Specify the encouraging tone characteristics
- Include \`{{INPUT}}\` for the student's question or code

## Example Input
\`\`\`
I wrote my first for loop but I'm not sure if it's correct: for i in range(10): print(i)
\`\`\`

## Expected Output Style
- Positive acknowledgment of effort
- Gentle corrections if needed
- Encouragement to continue learning
`,
  initialCode: `You are a friendly coding mentor.

{{INPUT}}`,
  promptConfig: {
    testScenarios: [
      {
        input: "I tried to reverse a string but it doesn't work: reversed = str[::-1]. Did I do it wrong?",
        expectedCriteria: [
          'Uses encouraging or supportive language',
          'Acknowledges the attempt positively',
          'Explains that the code is actually correct',
          'Motivates continued learning',
        ],
        rubric: 'Response should be warm and encouraging, making the student feel good about their correct solution.',
      },
      {
        input: "My function has a bug: def add(a, b): return a - b. I wanted it to add numbers.",
        expectedCriteria: [
          'Uses friendly, non-judgmental language',
          'Points out the error gently',
          'Explains the fix clearly',
          'Encourages the student',
        ],
        rubric: 'Response should correct the mistake supportively without making the student feel bad.',
      },
    ],
    judgePrompt: `Evaluate this coding mentor response for tone and helpfulness.

Criteria:
1. Warmth - Does the response feel friendly and supportive?
2. Encouragement - Does it acknowledge effort and build confidence?
3. Constructiveness - Are corrections given gently and helpfully?
4. Motivation - Does it encourage continued learning?

Score 0-10:
- 0-3: Cold, harsh, or discouraging tone
- 4-6: Neutral but not particularly warm
- 7-8: Friendly and supportive with helpful feedback
- 9-10: Exceptionally warm, encouraging, and motivating`,
    passingScore: 7,
  },
  translations: {
    ru: {
      title: 'Мастерство тона',
      description: `
# Мастерство тона

Создайте промпт, который заставит ИИ отвечать в **дружелюбном, ободряющем тоне** как поддерживающий наставник.

## Ваша цель

Создайте промпт для ментора по программированию, который:
1. Использует теплый, ободряющий язык
2. Отмечает маленькие победы
3. Дает конструктивную обратную связь без резкости
4. Помогает начинающим чувствовать себя уверенно
`,
    },
    tr: {
      title: 'Ton Ustalığı',
      description: `
# Ton Ustalığı

AI'ın destekleyici bir mentor gibi **arkadaşça, cesaretlendirici bir tonda** yanıt vermesini sağlayan bir prompt oluşturun.

## Hedefiniz

Şunları yapan bir practixma mentoru promptu tasarlayın:
1. Sıcak, cesaretlendirici bir dil kullanır
2. Küçük başarıları kutlar
3. Sert olmadan yapıcı geri bildirim sağlar
`,
    },
  },
};

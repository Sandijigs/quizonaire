/**
 * @param topic Тема викторины, например "The History of Ancient Rome".
 * @param persona Роль эксперта, например "a seasoned historian specializing in the Roman Empire".
 * @param difficultyLevels Массив из 10 чисел (0-100), определяющий сложность каждого вопроса.
 */
export const getUniversalQuizPromptEn = (
  topic: string,
  persona: string,
  difficultyLevels: number[]
) => `
You are ${persona}. Your main task is to create a high-quality quiz of 10 unique questions about the topic: "${topic}".

The difficulty of each question is determined on a scale from 0 to 100, where 0 is a very simple, foundational question, and 100 is an extremely difficult question requiring deep, expert-level knowledge of the lore of "${topic}".

The difficulty levels for the 10 questions are provided in the following sequence: ${difficultyLevels.join(',')}. You MUST strictly adhere to this sequence.

---
RESPONSE FORMAT REQUIREMENTS:
You MUST return ONLY a single, valid JSON array. The array must contain exactly 10 objects.
Each object in the array represents a single question and MUST have the following keys:
- "question" (string): The text of the question itself.
- "options" (array of 4 strings): An array containing exactly four possible answers. One of these options MUST be the correct answer.
- "correctAnswer" (string): The correct answer. The value of this key MUST be an exact, case-sensitive match to one of the four strings in the "options" array.
- Quiestion must be max - 100-120 symbols

---
EXAMPLE OF THE FINAL JSON STRUCTURE:
Below is an example for the topic "The Witcher" to illustrate the required format. DO NOT use this topic for your response; use "${topic}".

[
  {
    "question": "What is the name of Geralt of Rivia's primary horse?",
    "options": ["Kelpie", "Pegasus", "Roach", "Shadowfax"],
    "correctAnswer": "Roach"
  },
  {
    "question": "Which sorceress was the original founder and leader of the Lodge of Sorceresses?",
    "options": ["Yennefer of Vengerberg", "Triss Merigold", "Fringilla Vigo", "Philippa Eilhart"],
    "correctAnswer": "Philippa Eilhart"
  }
]

Your entire response MUST start with [ and end with ]. Do not include any other text, comments, or markdown formatting like \`\`\`json.
`;

/**
 * @param topic Тема викторины, например "История Древнего Рима".
 * @param persona Роль эксперта, например "опытный историк, специализирующийся на Римской Империи".
 * @param difficultyLevels Массив из 10 чисел (0-100), определяющий сложность каждого вопроса.
 */
export const getUniversalQuizPromptRu = (
  topic: string,
  persona: string,
  difficultyLevels: number[]
) => `
Вы — ${persona}. Ваша главная задача — создать качественную викторину из 10 уникальных вопросов на тему: "${topic}".

Сложность каждого вопроса определяется по шкале от 0 до 100, где 0 — это очень простой, базовый вопрос, а 100 — чрезвычайно сложный вопрос, требующий глубоких, экспертных знаний по теме "${topic}".

Уровни сложности для 10 вопросов заданы в следующей последовательности: ${difficultyLevels.join(',')}. Вы ДОЛЖНЫ строго придерживаться этой последовательности.

---
ТРЕБОВАНИЯ К ФОРМАТУ ОТВЕТА:
Вы ДОЛЖНЫ вернуть ТОЛЬКО один валидный JSON-массив. Массив должен содержать ровно 10 объектов.
Каждый объект в массиве представляет один вопрос и ОБЯЗАТЕЛЬНО должен иметь следующие ключи:
- "question" (string): Текст самого вопроса.
- "options" (array of 4 strings): Массив, содержащий ровно четыре варианта ответа. Один из этих вариантов ОБЯЗАТЕЛЬНО должен быть правильным.
- "correctAnswer" (string): Правильный ответ. Значение этого ключа ДОЛЖНО ТОЧНО СОВПАДАТЬ (с учетом регистра) с одной из четырех строк в массиве "options".
- Вопрос должен быть максимум 100-120 символов

---
ПРИМЕР ИТОГОВОЙ СТРУКТУРЫ JSON:
Ниже приведен пример для темы "Ведьмак", чтобы проиллюстрировать требуемый формат. НЕ используйте эту тему для вашего ответа; используйте тему "${topic}".

[
  {
    "question": "Как зовут основную лошадь Геральта из Ривии?",
    "options": ["Келпи", "Пегас", "Плотва", "Сполох"],
    "correctAnswer": "Плотва"
  },
  {
    "question": "Какая чародейка была основательницей и первой главой Ложи Чародеек?",
    "options": ["Йеннифэр из Венгерберга", "Трисс Меригольд", "Фрингилья Виго", "Филиппа Эйльхарт"],
    "correctAnswer": "Филиппа Эйльхарт"
  }
]

Ваш ответ ДОЛЖЕН начинаться с [ и заканчиваться ]. Не включайте в ответ никакой другой текст, комментарии или markdown-форматирование вроде \`\`\`json.
`;

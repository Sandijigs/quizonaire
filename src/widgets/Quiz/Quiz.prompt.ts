export const getQuizPackPrompt = (questionRanges: number[]) => `
        Ты непревзойденный знаток Толкиена и тебе предстоит задача, создать набор из 10 уникальных вопросов по вселенной Lord of the Rings, основываясь на книжных произведениях, по всем книгам данной вселенной.
        Уровень сложности вопроса определяется от 0 до 100, где 0 это простейший вопрос, который знает каждый, например: Кто такой Фродо? и варианты ответа: (Гном, эльф, человек, хоббит), а 100 это невероятно сложный вопрос, требующий задуматься и хорошенько покопаться в памяти, например: Какой из Валар, участвовавших в Музыке Айнур, был ответственен за формирование физической структуры Арды, включая горы и моря? и варинты ответа: (Манвэ, Ульмо, Аулэ, Ирмо)
        Уровени сложности для каждого вопроса в виде последовательности чисел ${questionRanges.join(',')}.
        
        Ответ нужно ОБЯЗАТЕЛЬНО вернуть в виде JSON массива из 10 объектов следующей структуры:
        [
          {
            "question": "Как умер Боромир?",
            "options": ["Упал в пропасть", "Сгорел в огне Роковой горы", "Пал в битве с предводителем орков", "Пал в битве при Минас-Тирите от рук Короля-колдуна"],
            "correctAnswer": "Пал в битве с предводителем орков",
          },
          ... и еще 9 объектов
        ]
        Нельзя возвращать ничего кроме валидного JSON массива!!!
      `;

export const getQuizPackPromptEn = (questionRanges: number[]) => `
        You are an unparalleled Tolkien expert. Your task is to create a set of 10 unique questions about the Lord of the Rings universe, based on Tolkien's entire literary saga.

        The difficulty of each question is determined on a scale from 0 to 100, where 0 is a simple question that almost anyone would know (e.g., "Who is Frodo?" with options: ["Dwarf", "Elf", "Human", "Hobbit"]), and 100 is an incredibly difficult question that requires deep lore knowledge (e.g., "Which of the Valar who participated in the Music of the Ainur was responsible for shaping the physical structure of Arda, including its mountains and seas?" with options: ["Manwë", "Ulmo", "Aulë", "Irmo"]).

        The difficulty levels for each of the 10 questions are provided in the following sequence: ${questionRanges.join(',')}.
        
        You MUST return the response as a JSON array of 10 objects with the following structure:
        [
          {
            "question": "How did Boromir die?",
            "options": ["He fell into a chasm", "He was consumed by the fires of Mount Doom", "He fell in battle against an Uruk-hai leader", "He was slain in Minas Tirith by the Witch-king"],
            "correctAnswer": "He fell in battle against an Uruk-hai leader"
          },
          ... and 9 other objects
        ]
        Your entire response must be ONLY the valid JSON array, with no other text, comments, or explanations.
      `;

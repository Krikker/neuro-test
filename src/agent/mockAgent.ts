import type { SavedMessage } from '@/stores/chats';

export type AgentEvent =
  | { type: 'started' }
  | { type: 'status'; message: string }
  | { type: 'tool_call'; tool: 'calculator' }
  | { type: 'tool_result'; tool: 'calculator'; result: string }
  | { type: 'text_delta'; text: string }
  | { type: 'completed' }
  | { type: 'error'; message: string };

type Subject = 'newton' | 'ohm' | 'math' | null;

const wait = async (ms: number, signal?: AbortSignal) => {
  if (signal?.aborted) return false;

  await new Promise((resolve) => setTimeout(resolve, ms));
  return !signal?.aborted;
};

function subject(text: string): Subject {
  if (/ньютон|ускорени|F\s*\*?=\s*m/i.test(text)) return 'newton';
  if (/закон.{0,5}ома|сопротивлен|напряжени|I\s*\*?=\s*U/i.test(text)) return 'ohm';
  if (/уравнени|математ|умнож|\d\s*[×*÷/+-]\s*\d/i.test(text)) return 'math';
  return null;
}

function previousSubject(history: SavedMessage[]) {
  for (const message of [...history].reverse()) {
    if (message.role === 'user') {
      const found = subject(message.content);
      if (found) return found;
    }
  }

  return null;
}

function calculateExpression(message: string) {
  const match = message.match(
    /(-?\d+(?:[.,]\d+)?)\s*(\+|-|\*|×|x|х|÷|\/)(?:\s*)(-?\d+(?:[.,]\d+)?)/i,
  );

  if (!match) return null;

  const left = Number(match[1]?.replace(',', '.'));
  const operator = match[2] ?? '';
  const right = Number(match[3]?.replace(',', '.'));

  if (Number.isNaN(left) || Number.isNaN(right)) return null;
  if ((operator === '÷' || operator === '/') && right === 0)
    return { error: 'На ноль делить нельзя.' };

  const result =
    operator === '+'
      ? left + right
      : operator === '-'
        ? left - right
        : operator === '÷' || operator === '/'
          ? left / right
          : left * right;

  return { left, operator, right, result };
}

function correctAnswer(message: string, history: SavedMessage[]) {
  const simplify = /проще|простыми|попроще|не понял|не понимаю/i.test(message);
  const topic = subject(message) ?? previousSubject(history);

  if (topic === 'newton') {
    if (/перв|трет|(?:1|3)[-\s]?(?:й|ый)?\s*закон/i.test(message)) {
      return 'В этой демоверсии есть подробный сценарий только для второго закона Ньютона. Попробуй попросить объяснить именно второй закон, а затем — объяснить его проще.';
    }

    if (simplify) {
      return 'Представь тележку в магазине. Пустую легко разогнать, а полную — заметно труднее. Чем сильнее толкаешь, тем быстрее она набирает скорость, а чем тяжелее тележка, тем больше усилий нужно. Это и описывает второй закон Ньютона.';
    }

    return 'Второй закон Ньютона связывает силу, массу и ускорение: F = m × a. Чем больше сила, тем больше ускорение. Чем больше масса, тем труднее изменить скорость. Например, сила 6 Н для тела массой 2 кг создаёт ускорение 3 м/с².';
  }

  if (topic === 'ohm') {
    if (simplify) {
      return 'Представь воду в трубе: напряжение похоже на напор, ток — на поток воды, а сопротивление — на препятствие. Больше напряжение — больше ток, а больше сопротивление — меньше ток.';
    }

    return 'Закон Ома: I = U / R. Сила тока равна напряжению, делённому на сопротивление. Например, при U = 12 В и R = 4 Ом получаем I = 3 А.';
  }

  if (simplify && !topic) {
    return 'Конечно. Сначала назови тему, которую нужно объяснить проще. Например: «Объясни второй закон Ньютона» или «Что такое закон Ома?».';
  }

  if (topic === 'math') {
    return 'Давай разберём решение по шагам. Напиши выражение или уравнение, и я подскажу следующий шаг, не выдавая ответ сразу.';
  }

  return 'Давай разберёмся вместе. Я могу объяснить второй закон Ньютона, закон Ома, помочь с математикой и показать работу калькулятора. Попробуй: «Сколько будет 17 × 24?».';
}

export async function* runMockAgent(
  newMessage: string,
  history: SavedMessage[],
  signal?: AbortSignal,
  options?: { retry?: boolean },
): AsyncGenerator<AgentEvent> {
  const slowMode = /медленно|медленный|slow|\/slow/i.test(newMessage);
  const timings = slowMode
    ? { start: 950, analysis: 900, tool: 1400, delta: 180 }
    : { start: 450, analysis: 450, tool: 650, delta: 55 };

  yield { type: 'started' };
  if (!(await wait(timings.start, signal))) return;

  yield {
    type: 'status',
    message: slowMode ? 'Выполняю медленную генерацию' : 'Анализирую вопрос',
  };
  if (!(await wait(timings.analysis, signal))) return;

  if (/ошибка/i.test(newMessage) && !options?.retry) {
    yield { type: 'error', message: 'Не удалось обработать запрос. Попробуй ещё раз.' };
    return;
  }

  const calculation = calculateExpression(newMessage);
  let answer: string;

  if (calculation && 'error' in calculation) {
    yield { type: 'tool_call', tool: 'calculator' };
    yield { type: 'error', message: calculation.error ?? 'Не удалось выполнить вычисление.' };
    return;
  }

  if (calculation) {
    yield { type: 'status', message: 'Использую калькулятор' };
    yield { type: 'tool_call', tool: 'calculator' };
    if (!(await wait(timings.tool, signal))) return;

    const result = String(calculation.result);
    yield { type: 'tool_result', tool: 'calculator', result };
    answer = `Я использовал калькулятор: ${calculation.left} ${calculation.operator ?? '*'} ${calculation.right} = ${result}.`;
  } else {
    answer = correctAnswer(newMessage, history);
  }

  yield { type: 'status', message: 'Формирую ответ' };

  for (const part of answer.split(/(?=\s)|(?<=\s)/)) {
    if (!(await wait(timings.delta, signal))) return;
    yield { type: 'text_delta', text: part };
  }

  yield { type: 'completed' };
}

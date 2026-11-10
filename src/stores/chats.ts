import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export type Stage =
  'queued' | 'thinking' | 'tool' | 'streaming' | 'completed' | 'error' | 'stopped';

export interface ToolState {
  name: 'calculator';
  status: 'running' | 'completed' | 'error' | 'stopped';
  result?: string;
}

export interface SavedMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  createdAt: string;
  stage: Stage;
  status: string;
  tool?: ToolState;
}

export interface SavedChat {
  id: string;
  title: string;
  messages: SavedMessage[];
}

const isStage = (value: unknown): value is Stage =>
  ['queued', 'thinking', 'tool', 'streaming', 'completed', 'error', 'stopped'].includes(
    value as string,
  );

const finishInterruptedTool = (
  tool: ToolState | undefined,
  stage: Stage,
): ToolState | undefined => {
  if (tool?.status === 'running' && (stage === 'error' || stage === 'stopped')) {
    return { ...tool, status: stage };
  }
  return tool;
};

const normalizeMessage = (message: Partial<SavedMessage>): SavedMessage => {
  const savedStage = isStage(message.stage) ? message.stage : 'completed';
  const interrupted =
    message.role === 'assistant' &&
    ['queued', 'thinking', 'tool', 'streaming'].includes(savedStage);
  const stage = interrupted ? 'stopped' : savedStage;

  return {
    id: message.id ?? crypto.randomUUID(),
    role: message.role === 'assistant' ? 'assistant' : 'user',
    content: message.content ?? '',
    createdAt: message.createdAt ?? new Date().toISOString(),
    stage,
    status: interrupted
      ? 'Генерация прервана обновлением страницы. Можно повторить запрос.'
      : (message.status ?? ''),
    tool: finishInterruptedTool(message.tool, stage),
  };
};

const loadChats = (): SavedChat[] => {
  try {
    const raw = localStorage.getItem('chats');
    const parsed: unknown = raw ? JSON.parse(raw) : [];

    if (!Array.isArray(parsed)) return [];

    return parsed.map((chat) => {
      const value = chat as Partial<SavedChat>;
      const messages = Array.isArray(value.messages)
        ? value.messages.map((message) => normalizeMessage(message))
        : [];

      return {
        id: value.id ?? crypto.randomUUID(),
        title: value.title ?? 'Новый диалог',
        messages,
      };
    });
  } catch {
    return [];
  }
};

export const useChatsStore = defineStore('chats', () => {
  const userChats = ref<SavedChat[]>(loadChats());
  const currentIdChat = ref<string | undefined>(userChats.value[0]?.id);

  watch(
    userChats,
    (newValue) => {
      localStorage.setItem('chats', JSON.stringify(newValue));
    },
    { deep: true },
  );

  const createNewChat = () => {
    const newChat: SavedChat = {
      id: crypto.randomUUID(),
      title: 'Новый диалог',
      messages: [],
    };

    userChats.value.unshift(newChat);
    currentIdChat.value = newChat.id;

    return newChat.id;
  };

  const deleteChat = (chatId: string) => {
    const index = userChats.value.findIndex((chat) => chat.id === chatId);
    if (index === -1) return;

    const wasActive = currentIdChat.value === chatId;
    userChats.value.splice(index, 1);

    if (wasActive) {
      currentIdChat.value = userChats.value[index]?.id ?? userChats.value[0]?.id;
    }
  };

  const addMessage = (chatId: string, role: SavedMessage['role'], content: string) => {
    const chat = userChats.value.find((item) => item.id === chatId);
    if (!chat) return undefined;

    if (role === 'user' && chat.messages.length === 0) {
      chat.title = content.slice(0, 42);
    }

    const message: SavedMessage = {
      id: crypto.randomUUID(),
      role,
      content,
      createdAt: new Date().toISOString(),
      stage: role === 'assistant' ? 'queued' : 'completed',
      status: '',
    };

    chat.messages.push(message);
    return message.id;
  };

  const updateMessage = (
    chatId: string,
    messageId: string,
    changes: Partial<Pick<SavedMessage, 'content' | 'stage' | 'status' | 'tool'>>,
  ) => {
    const chat = userChats.value.find((item) => item.id === chatId);
    const message = chat?.messages.find((item) => item.id === messageId);
    if (!message) return;

    Object.assign(message, changes);
    message.tool = finishInterruptedTool(message.tool, message.stage);
  };

  const appendToMessage = (chatId: string, messageId: string, text: string) => {
    const chat = userChats.value.find((item) => item.id === chatId);
    const message = chat?.messages.find((item) => item.id === messageId);
    if (message) message.content += text;
  };

  return {
    currentIdChat,
    userChats,
    createNewChat,
    deleteChat,
    addMessage,
    updateMessage,
    appendToMessage,
  };
});

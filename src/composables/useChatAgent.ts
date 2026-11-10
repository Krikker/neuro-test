import { computed, onBeforeUnmount } from 'vue';
import { runMockAgent } from '@/agent/mockAgent';
import { useChatsStore } from '@/stores/chats';

type ChatsStore = ReturnType<typeof useChatsStore>;

type SubmitOptions = {
  retry?: boolean;
};

export function useChatAgent(chats: ChatsStore) {
  const activeControllers = new Map<string, AbortController>();

  const currentChat = computed(() =>
    chats.userChats.find((chat) => chat.id === chats.currentIdChat),
  );

  const isGenerating = computed(() => {
    const lastMessage = currentChat.value?.messages.at(-1);

    return (
      lastMessage?.role === 'assistant' &&
      ['queued', 'thinking', 'tool', 'streaming'].includes(lastMessage.stage)
    );
  });

  const submit = async (value: string, options?: SubmitOptions) => {
    const text = value.trim();
    if (!text || isGenerating.value) return;

    const chatId = chats.currentIdChat ?? chats.createNewChat();
    chats.addMessage(chatId, 'user', text);

    const chat = chats.userChats.find((item) => item.id === chatId);
    if (!chat) return;

    const history = [...chat.messages];
    const assistantMessageId = chats.addMessage(chatId, 'assistant', '');
    if (!assistantMessageId) return;

    const controller = new AbortController();
    activeControllers.set(chatId, controller);

    try {
      for await (const event of runMockAgent(text, history, controller.signal, options)) {
        switch (event.type) {
          case 'started':
            chats.updateMessage(chatId, assistantMessageId, {
              stage: 'thinking',
              status: 'Анализирую вопрос',
            });
            break;

          case 'status':
            chats.updateMessage(chatId, assistantMessageId, {
              status: event.message,
            });
            break;

          case 'tool_call':
            chats.updateMessage(chatId, assistantMessageId, {
              stage: 'tool',
              status: 'Использую калькулятор',
              tool: { name: event.tool, status: 'running' },
            });
            break;

          case 'tool_result':
            chats.updateMessage(chatId, assistantMessageId, {
              stage: 'tool',
              status: `Калькулятор получил результат: ${event.result}`,
              tool: { name: event.tool, status: 'completed', result: event.result },
            });
            break;

          case 'text_delta':
            chats.updateMessage(chatId, assistantMessageId, {
              stage: 'streaming',
              status: 'Формирую ответ',
            });
            chats.appendToMessage(chatId, assistantMessageId, event.text);
            break;

          case 'completed':
            chats.updateMessage(chatId, assistantMessageId, {
              stage: 'completed',
              status: 'Ответ готов',
            });
            break;

          case 'error':
            chats.updateMessage(chatId, assistantMessageId, {
              stage: 'error',
              status: event.message,
            });
            break;
        }
      }
    } finally {
      if (controller.signal.aborted) {
        chats.updateMessage(chatId, assistantMessageId, {
          stage: 'stopped',
          status: 'Генерация остановлена',
        });
      }

      if (activeControllers.get(chatId) === controller) {
        activeControllers.delete(chatId);
      }
    }
  };

  const stop = () => {
    if (!chats.currentIdChat) return;
    activeControllers.get(chats.currentIdChat)?.abort();
  };

  const retry = () => {
    const lastUserMessage = [...(currentChat.value?.messages ?? [])]
      .reverse()
      .find((message) => message.role === 'user');

    if (lastUserMessage) void submit(lastUserMessage.content, { retry: true });
  };

  onBeforeUnmount(() => {
    activeControllers.forEach((controller) => controller.abort());
  });

  return {
    currentChat,
    isGenerating,
    submit,
    stop,
    retry,
  };
}

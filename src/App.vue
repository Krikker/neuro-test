<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { useChatsStore } from '@/stores/chats';
import { useChatAgent } from './composables/useChatAgent';
import AppIcon from './components/icons/AppIcon.vue';
import ChatEmpty from './components/ChatEmpty.vue';
import ChatMain from './components/ChatMain.vue';
import ChatAside from './components/ChatAside.vue';

const chats = useChatsStore();
const userInput = ref('');
const sidebarOpen = ref(false);
const messageInput = ref<HTMLTextAreaElement | null>(null);

const {
  currentChat: thisChat,
  isGenerating,
  submit,
  stop: stopGeneration,
  retry: retryLastRequest,
} = useChatAgent(chats);

const resetInputHeight = () => {
  if (!messageInput.value) return;
  messageInput.value.style.height = '43px';
  messageInput.value.style.overflowY = 'hidden';
};

const resizeInput = (event: Event) => {
  const textarea = event.currentTarget as HTMLTextAreaElement;
  textarea.style.height = 'auto';
  textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
  textarea.style.overflowY = textarea.scrollHeight > 150 ? 'auto' : 'hidden';
};

const handleSubmit = (value = userInput.value) => {
  const text = value.trim();
  if (!text) return;

  userInput.value = '';
  void nextTick(resetInputHeight);
  void submit(text);
};

const handlePrompt = (prompt: string) => {
  sidebarOpen.value = false;
  handleSubmit(prompt);
};

const closeSidebar = () => {
  sidebarOpen.value = false;
};

const goHome = () => {
  chats.currentIdChat = undefined;
  userInput.value = '';
  sidebarOpen.value = false;
  void nextTick(resetInputHeight);
};

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') closeSidebar();
};

onMounted(() => window.addEventListener('keydown', handleEscape));
onBeforeUnmount(() => window.removeEventListener('keydown', handleEscape));
</script>

<template>
  <div class="container">
    <ChatAside :open="sidebarOpen" @close="closeSidebar" @home="goHome" />
    <main>
      <header class="chat-topbar">
        <span>
          <button
            type="button"
            class="mobile-menu-button"
            aria-label="Открыть список диалогов"
            :aria-expanded="sidebarOpen"
            @click="sidebarOpen = true"
          >
            <AppIcon name="menu" />
          </button>
          <AppIcon name="book" />
          {{ thisChat?.title || 'Пространство для вопросов' }}
        </span>
      </header>

      <Transition name="chat-view" mode="out-in">
        <ChatEmpty
          v-if="!thisChat || thisChat.messages.length === 0"
          key="empty-chat"
          @prompt="handlePrompt"
        />
        <ChatMain v-else :key="thisChat.id" @retry="retryLastRequest" />
      </Transition>

      <div class="input-block">
        <form @submit.prevent="() => handleSubmit()">
          <textarea
            id="message-input"
            ref="messageInput"
            v-model="userInput"
            rows="1"
            maxlength="4000"
            :disabled="isGenerating"
            placeholder="Что разберём сегодня?"
            @input="resizeInput"
            @keydown.enter.exact.prevent="() => handleSubmit()"
          />
          <button
            v-if="isGenerating"
            class="stop-button"
            type="button"
            aria-label="Остановить ответ"
            @click="stopGeneration"
          >
            <AppIcon name="stop" :size="20" />
          </button>
          <button
            v-else
            class="send-button"
            type="submit"
            aria-label="Отправить сообщение"
            :disabled="!userInput.trim()"
          >
            <AppIcon name="arrow" :size="20" />
          </button>
        </form>
        <span>Enter - отправить · Shift + Enter - новая строка</span>
        <span>Демо-помощник · может ошибаться</span>
      </div>
    </main>
  </div>
</template>

<style scoped>
.container {
  display: grid;
  grid-template-columns: 272px minmax(0, 1fr);
  min-height: 100vh;
  background: #fbfaf6;
}

main {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 100vh;
  overflow: hidden;
}

.chat-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 72px;
  padding: 0 42px;
  border-bottom: 1px solid #ecece4;
  color: #68786a;
  font-size: 14px;
}

.chat-topbar > span {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.chat-topbar :deep(svg) {
  color: #82947c;
}

.mobile-menu-button {
  display: none;
  place-items: center;
  width: 40px;
  height: 40px;
  margin-left: -10px;
  border-radius: 9px;
  background: transparent;
  color: #66806b;
  cursor: pointer;
}

.mobile-menu-button:hover {
  background: #e8eddf;
}

.input-block {
  width: min(770px, calc(100% - 48px));
  margin: auto auto 24px;
  color: #718070;
  font-size: 12px;
}

.input-block form {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  min-height: 76px;
  padding: 12px 14px 12px 18px;
  border: 1px solid #bdcbaa;
  border-radius: 16px;
  background: #fffefa;
  box-shadow: 0 7px 20px rgb(57 77 55 / 5%);
}

.input-block textarea {
  flex: 1;
  min-width: 0;
  min-height: 43px;
  max-height: 150px;
  overflow-x: hidden;
  overflow-y: hidden;
  overflow-wrap: anywhere;
  resize: none;
  border: 0;
  outline: 0;
  background: transparent;
  color: #34493a;
  font-size: 16px;
  line-height: 1.5;
  white-space: pre-wrap;
}

.input-block textarea::placeholder {
  color: #849182;
}

.input-block button {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  flex: 0 0 auto;
  border-radius: 11px;
  cursor: pointer;
}

.input-block button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.send-button {
  background: #e6eddc;
  color: #6d865a;
}

.send-button:hover:not(:disabled) {
  background: #d5e2c6;
  transform: translateY(-1px);
}

.stop-button {
  background: #f5e3d9;
  color: #ad745b;
}

.input-block > span {
  display: inline-block;
  margin-top: 9px;
}

.input-block > span:last-child {
  float: right;
}

.chat-view-enter-active,
.chat-view-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.chat-view-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.chat-view-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 760px) {
  .container {
    grid-template-columns: 1fr;
  }

  .chat-topbar {
    padding: 0 20px;
  }

  .mobile-menu-button {
    display: grid;
  }

  .input-block {
    width: calc(100% - 28px);
  }

  .input-block > span {
    margin-left: 8px;
  }

  .input-block > span:last-child {
    float: none;
    margin-top: 5px;
  }
}
</style>

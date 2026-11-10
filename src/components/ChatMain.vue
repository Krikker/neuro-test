<script setup lang="ts">
import { useChatsStore } from '@/stores/chats';
import AppIcon from './icons/AppIcon.vue';
import { computed, onMounted, ref, watch } from 'vue';

const chats = useChatsStore();
const emit = defineEmits<{
  retry: [];
}>();
const thisChat = computed(() => {
  return chats.userChats.find((chat) => chat.id === chats.currentIdChat)?.messages;
});

const messagesElement = ref<HTMLElement | null>(null);

const scrollToBottom = () => {
  const element = messagesElement.value;
  if (element) element.scrollTop = element.scrollHeight;
};

onMounted(async () => {
  scrollToBottom();
  await document.fonts.ready;
  scrollToBottom();
});
watch(thisChat, scrollToBottom, { deep: true, flush: 'post' });
</script>

<template>
  <section ref="messagesElement" class="messages">
    <div v-for="message in thisChat" :key="message.id">
      <div v-if="message.role === 'user'" class="user-message">
        <span>Ты</span>
        <span>{{ message.content }}</span>
      </div>
      <div v-else class="assistant-message">
        <span><AppIcon name="spark" />LOM AI</span>
        <div v-if="message.tool" class="tool-badge" :class="message.tool.status">
          <AppIcon name="calc" :size="15" />
          <span v-if="message.tool.status === 'running'">Проверяю на калькуляторе</span>
          <span v-else-if="message.tool.status === 'completed'">Проверено калькулятором</span>
          <span v-else-if="message.tool.status === 'error'">Ошибка калькулятора</span>
          <span v-else>Работа калькулятора остановлена</span>
        </div>
        <span class="message-content">{{ message.content }}</span>
        <span
          v-if="message.status && ['error', 'stopped'].includes(message.stage)"
          class="message-status"
        >
          {{ message.status }}
        </span>
        <div
          v-if="['thinking', 'tool', 'streaming'].includes(message.stage)"
          class="generation-label"
        >
          <span class="live-dot" />{{ message.status }}
        </div>
        <div v-if="message.stage === 'completed'" class="completed-label">
          <AppIcon name="check" :size="13" />Ответ готов
        </div>
        <button
          v-if="['error', 'stopped'].includes(message.stage)"
          type="button"
          class="retry-button"
          @click="emit('retry')"
        >
          <AppIcon name="retry" :size="14" /> Повторить запрос
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.messages {
  flex: 1 1 auto;
  height: 0;
  min-height: 0;
  overflow-y: auto;
  width: 100%;
  padding: 42px max(24px, calc((100% - 770px) / 2)) 26px;
  scrollbar-gutter: stable;
}

.messages > div {
  width: min(100%, 680px);
  margin-bottom: 28px;
}

.user-message {
  max-width: calc(100% - 68px);
  margin-left: 68px;
  margin-right: 0;
  padding: 16px 20px;
  border-radius: 14px;
  background: #e6eedb;
  color: #2f4d3d;
}

.user-message > span:first-child {
  display: block;
  margin-bottom: 8px;
  color: #71856f;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
}

.user-message > span:last-child,
.message-content {
  display: block;
  font-size: 15px;
  line-height: 1.75;
  white-space: pre-line;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.assistant-message {
  max-width: 680px;
  margin: 0 auto;
  color: #3f5b4b;
}

.assistant-message > span:first-child {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 13px;
  color: #285c48;
  font-size: 13px;
  font-weight: 700;
}

.assistant-message > span:first-child :deep(svg) {
  padding: 5px;
  border-radius: 8px;
  background: #205a47;
  color: #d9e9ad;
}

.message-status {
  display: block;
  margin-top: 10px;
  color: #789075;
  font-size: 12px;
}

.generation-label,
.completed-label {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 12px;
  color: #6f866b;
  font-size: 12px;
}

.completed-label {
  color: #6d865a;
}

.live-dot {
  width: 6px;
  height: 6px;
  flex: 0 0 6px;
  border-radius: 50%;
  background: #78975f;
  animation: pulse 1.2s ease-in-out infinite;
}

.tool-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin: 10px 0;
  padding: 7px 10px;
  border-radius: 8px;
  font-size: 12px;
}

.tool-badge.running {
  color: #8a6b32;
  background: #fff5dd;
}

.tool-badge.error {
  color: #a26d59;
  background: #fff0e8;
}

.tool-badge.stopped {
  color: #718070;
  background: #f0f1eb;
}

.tool-badge.completed {
  color: #527046;
  background: #edf5e8;
}

.retry-button {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-top: 12px;
  padding: 7px 10px;
  border: 1px solid #e4cfc4;
  border-radius: 8px;
  background: #fff9f5;
  color: #a26d59;
  font-size: 12px;
  cursor: pointer;
}

.retry-button:hover {
  background: #f9eee7;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.35;
    transform: scale(0.85);
  }
  50% {
    opacity: 1;
    transform: scale(1.15);
  }
}

@media (max-width: 760px) {
  .messages {
    padding: 28px 14px 22px;
  }

  .user-message {
    max-width: calc(100% - 29px);
    margin-left: 29px;
  }
}
</style>

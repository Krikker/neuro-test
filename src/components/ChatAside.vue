<script setup lang="ts">
import AppIcon from './icons/AppIcon.vue';
import { useChatsStore } from '@/stores/chats.js';

const chats = useChatsStore();
defineProps<{ open: boolean }>();
const emit = defineEmits<{ close: []; home: [] }>();

const goHome = () => {
  emit('home');
  emit('close');
};

const selectChat = (id: string) => {
  chats.currentIdChat = id;
  emit('close');
};

const createChat = () => {
  chats.createNewChat();
  emit('close');
};

const deleteChat = (id: string) => {
  chats.deleteChat(id);
};
</script>

<template>
  <button
    v-if="open"
    type="button"
    class="sidebar-backdrop"
    aria-label="Закрыть список диалогов"
    @click="emit('close')"
  />
  <aside class="chat-sidebar" :class="{ 'is-open': open }" aria-label="Диалоги">
    <div class="logo-block">
      <a class="logo-link" href="#" aria-label="На главную" @click.prevent="goHome">
        <AppIcon name="spark" :size="27" />
        LOM
        <span>AI</span>
      </a>
      <button type="button" class="mobile-close" aria-label="Закрыть меню" @click="emit('close')">
        <AppIcon name="close" />
      </button>
      <p class="brand-caption">Твой напарник в учёбе</p>
    </div>
    <button
      type="button"
      class="new-chat--create"
      aria-label="Создать новый чат"
      @click="createChat"
    >
      <AppIcon name="plus" /> Новый чат
    </button>
    <div class="my-chats">
      <span>Мои чаты</span><span>{{ chats.userChats.length }}</span>
    </div>
    <TransitionGroup
      v-if="chats.userChats.length > 0"
      name="chat-list"
      tag="ul"
      class="my-chats-list"
    >
      <li
        v-for="chat in chats.userChats"
        :key="chat.id"
        @click="selectChat(chat.id)"
        :class="{ active: chat.id === chats.currentIdChat }"
      >
        <AppIcon name="chat" />
        <div>
          <strong>{{ chat.messages.length > 0 ? chat.title : 'Новый диалог' }}</strong>
          <span>{{
            chat.messages.length > 0 ? chat.messages.at(-1)?.content : 'С чего начнем?'
          }}</span>
        </div>
        <button
          type="button"
          class="delete-chat"
          :aria-label="`Удалить чат ${chat.title}`"
          @click.stop="deleteChat(chat.id)"
        >
          <AppIcon name="trash" :size="16" />
        </button>
      </li>
    </TransitionGroup>
    <span v-else>Тут пока ничего нет, задавай вопросы!</span>
    <div class="profile">
      <AppIcon name="student" />
      Учиться - значит спрашивать
    </div>
  </aside>
</template>

<style scoped>
.chat-sidebar {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  min-height: 100vh;
  max-height: 100dvh;
  overflow: hidden;
  padding: 24px 16px 18px;
  border-right: 1px solid #e5e9dc;
  background: #f0f3e9;
  color: #58705d;
  z-index: 40;
}

.sidebar-backdrop {
  display: none;
}

.logo-block {
  position: relative;
  padding: 0 4px 27px;
}

.mobile-close {
  display: none;
}

.brand-caption {
  margin: 10px 0 0 4px;
  color: #59684f;
  font-size: 13px;
}

.logo-link {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #173f35;
  font-size: 29px;
  font-weight: 700;
  letter-spacing: -1.5px;
  text-decoration: none;
}

.logo-link :deep(svg) {
  width: 42px;
  height: 42px;
  padding: 9px;
  border-radius: 13px;
  background: #1f5846;
  color: #d9e9ad;
  transform: rotate(-5deg);
}

.logo-link span {
  margin-left: -3px;
  color: #6b776e;
  font-size: 17px;
  font-weight: 500;
  letter-spacing: 0;
}

.new-chat--create {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 48px;
  padding: 0 15px;
  border: 0;
  border-radius: 11px;
  background: #205a47;
  color: #fffdf4;
  font-size: 14px;
  font-weight: 650;
  cursor: pointer;
  box-shadow: 0 4px 10px rgb(31 88 70 / 13%);
}

.new-chat--create:hover {
  background: #174b3b;
}

.my-chats {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 32px 8px 12px;
  color: #819082;
  font-size: 11px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
}

.my-chats > span:last-child {
  padding: 2px 7px;
  border-radius: 6px;
  background: #e1e8d8;
  letter-spacing: 0;
}

.my-chats-list {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  gap: 5px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.my-chats-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  padding: 12px 9px;
  border-radius: 10px;
  color: #6d7e70;
  cursor: pointer;
  transition:
    background 0.18s ease,
    color 0.18s ease,
    transform 0.18s ease;
}

.my-chats-list li > :deep(svg) {
  flex: 0 0 20px;
}

.delete-chat {
  display: grid;
  place-items: center;
  flex: 0 0 28px;
  width: 28px;
  height: 28px;
  border-radius: 7px;
  background: transparent;
  color: #9a7567;
  opacity: 0;
  cursor: pointer;
  transition:
    opacity 0.18s ease,
    background 0.18s ease,
    color 0.18s ease;
}

.my-chats-list li:hover .delete-chat,
.my-chats-list li:focus-within .delete-chat {
  opacity: 1;
}

.delete-chat:hover {
  background: #f4e4dc;
  color: #a45842;
}

.my-chats-list li:hover,
.my-chats-list li.active {
  background: #dfe8d3;
  color: #315d4b;
}

.chat-list-enter-active,
.chat-list-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.chat-list-enter-from,
.chat-list-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}

.my-chats-list li > div {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-width: 0;
  gap: 5px;
}

.my-chats-list strong,
.my-chats-list span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.my-chats-list strong {
  color: #3e634e;
  font-size: 13px;
  font-weight: 650;
}

.my-chats-list span,
.chat-sidebar > span {
  color: #778578;
  font-size: 12px;
}

.profile {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: auto;
  padding: 17px 5px 0;
  border-top: 1px solid #dfe6d7;
  color: #71806f;
  font-size: 12px;
  line-height: 1.5;
}

.profile :deep(svg) {
  color: #6f8e60;
}

@media (max-width: 760px) {
  .chat-sidebar {
    position: fixed;
    inset: 0 auto 0 0;
    width: min(310px, 86vw);
    height: 100dvh;
    min-height: 100dvh;
    max-height: 100dvh;
    padding: max(18px, env(safe-area-inset-top)) 16px max(18px, env(safe-area-inset-bottom));
    transform: translateX(-100%);
    visibility: hidden;
    transition:
      transform 0.22s ease,
      visibility 0.22s ease;
    box-shadow: 18px 0 60px rgb(33 59 46 / 12%);
  }

  .chat-sidebar.is-open {
    transform: translateX(0);
    visibility: visible;
  }

  .sidebar-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 39;
    border: 0;
    background: rgb(35 57 47 / 34%);
    backdrop-filter: blur(3px);
  }

  .mobile-close {
    display: grid;
    place-items: center;
    position: absolute;
    top: -3px;
    right: 0;
    width: 40px;
    height: 40px;
    border-radius: 9px;
    background: transparent;
    color: #66806b;
    cursor: pointer;
  }

  .mobile-close:hover {
    background: #e2e9da;
  }

  .delete-chat {
    opacity: 0.75;
  }
}
</style>

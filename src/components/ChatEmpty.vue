<script setup lang="ts">
import AppIcon from './icons/AppIcon.vue';

const prompts = [
  {
    icon: 'bolt',
    category: 'ФИЗИКА',
    title: 'Понять, а не зазубрить',
    text: 'Объясни второй закон Ньютона простыми словами',
    tone: 'green',
  },
  {
    icon: 'book',
    category: 'ШАГ ЗА ШАГОМ',
    title: 'Дойти до решения самому',
    text: 'Помоги решить 17 × 24, но не давай ответ сразу',
    tone: 'orange',
  },
  {
    icon: 'spark',
    category: 'НА ПОНЯТНОМ ЯЗЫКЕ',
    title: 'Разобраться в сложном',
    text: 'Объясни закон Ома на простом примере',
    tone: 'blue',
  },
  {
    icon: 'calc',
    category: 'МАТЕМАТИКА',
    title: 'Проверить вычисление',
    text: 'Сколько будет 17 × 24? Давай выясним вместе!',
    tone: 'rose',
  },
];

const emit = defineEmits<{
  prompt: [text: string];
}>();
</script>

<template>
  <div class="empty-chat">
    <div class="hello-illustration" aria-hidden="true">
      <span class="orbit orbit-one" /><span class="orbit orbit-two" />
      <span class="doodle doodle-formula">a² + b²</span><span class="doodle doodle-plus">+</span>
      <span class="doodle doodle-star">✧</span><span class="doodle doodle-dot" />
      <span class="notebook">
        <span class="notebook-lines" />
        <AppIcon name="spark" :size="38" />
        <span class="notebook-sticker">?</span>
      </span>
    </div>
    <div class="eyebrow"><span />ДЛЯ БОЛЬШИХ И МАЛЕНЬКИХ «ПОЧЕМУ»</div>
    <h1>Сложное станет<br /><em>понятным.</em></h1>
    <p class="empty-description">
      Спроси, что не получается. Разберёмся вместе:<br class="desktop-break" />
      с примерами, подсказками и в твоём темпе.
    </p>
    <div class="prompt-grid">
      <button
        v-for="prompt in prompts"
        :key="prompt.category"
        class="prompt-card"
        @click="emit('prompt', prompt.text)"
      >
        <span class="prompt-top">
          <span class="prompt-icon" :class="prompt.tone">
            <AppIcon :name="prompt.icon" :size="20" />
          </span>
          <span class="prompt-category">{{ prompt.category }}</span>
          <AppIcon class="prompt-arrow" name="chevron" :size="16" />
        </span>
        <strong>{{ prompt.title }}</strong>
        <span class="prompt-example">{{ prompt.text }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.empty-chat {
  max-width: 720px;
  margin: 0 auto;
  padding: 28px 28px 26px;
  text-align: center;
}
.hello-illustration {
  position: relative;
  width: 206px;
  height: 116px;
  margin: 0 auto 14px;
}
.orbit {
  position: absolute;
  border: 1px solid #e1e7d5;
  border-radius: 50%;
  width: 176px;
  height: 74px;
  transform: rotate(-22deg);
  left: 15px;
  top: 26px;
}
.orbit-two {
  transform: rotate(20deg);
  border-style: dashed;
  width: 163px;
  height: 93px;
  left: 23px;
  top: 14px;
}
.notebook {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 73px;
  height: 88px;
  border: 1px solid #a4b78c;
  border-left: 9px solid #91a66d;
  background: #dce8c9;
  border-radius: 4px 12px 12px 4px;
  color: #426240;
  position: absolute;
  top: 17px;
  left: 70px;
  transform: rotate(-12deg);
  box-shadow: 5px 6px 0 #e8eddd;
}
.notebook-lines {
  position: absolute;
  width: 1px;
  background: #a7b890;
  left: 4px;
  top: 0;
  bottom: 0;
}
.notebook-sticker {
  position: absolute;
  display: grid;
  place-items: center;
  width: 25px;
  height: 25px;
  background: #f4d6a1;
  border: 1px solid #e6c58a;
  border-radius: 50%;
  bottom: -7px;
  right: -11px;
  color: #72552e;
  font-family: 'Lora Variable', Georgia, serif;
  font-weight: 600;
  transform: rotate(25deg);
}
.doodle {
  position: absolute;
}
.doodle-formula {
  left: 1px;
  top: 21px;
  font:
    italic 14px 'Lora Variable',
    Georgia,
    serif;
  color: #59684f;
  transform: rotate(-11deg);
}
.doodle-plus {
  right: 3px;
  bottom: 20px;
  color: #98a489;
  font-size: 22px;
  font-weight: 300;
  transform: rotate(13deg);
}
.doodle-star {
  right: 19px;
  top: 10px;
  color: #b0986e;
  font-size: 23px;
}
.doodle-dot {
  width: 5px;
  height: 5px;
  background: #9aa989;
  border-radius: 50%;
  left: 20px;
  bottom: 15px;
}
.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 11px;
  letter-spacing: 1.5px;
  color: #59684f;
  margin-top: 8px;
}
.eyebrow > span {
  width: 15px;
  height: 1px;
  background: #9aa98c;
}
h1 {
  margin: 14px 0 17px;
  font:
    500 clamp(40px, 4.1vw, 61px)/1.08 'Lora Variable',
    Georgia,
    serif;
  letter-spacing: -2.7px;
  color: #2f4033;
}
h1 em {
  font-weight: 500;
  color: #58733f;
}
.empty-description {
  font-size: 14px;
  line-height: 1.85;
  color: #59684f;
  margin: 0 auto;
}
.prompt-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 29px;
  text-align: left;
}
.prompt-card {
  text-align: left;
  padding: 17px 19px 16px;
  background: #fffefa;
  border: 1px solid #e6e7dc;
  border-radius: 12px;
  min-width: 0;
  position: relative;
  transition:
    border-color 0.18s ease,
    background 0.18s ease,
    transform 0.18s ease,
    box-shadow 0.18s ease;
}
.prompt-card:hover {
  border-color: #aebd98;
  background: #f9fbf2;
  transform: translateY(-2px);
  box-shadow: 0 5px 12px #31472f06;
}
.prompt-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.prompt-icon {
  display: grid;
  place-items: center;
  flex: 0 0 32px;
  width: 32px;
  height: 32px;
  border-radius: 9px;
}
.prompt-icon.green {
  background: #eaf0e1;
  color: #6a8050;
}
.prompt-icon.orange {
  background: #fbefdc;
  color: #bd9161;
}
.prompt-icon.blue {
  background: #e9eff0;
  color: #78949c;
}
.prompt-icon.rose {
  background: #f5eaea;
  color: #b18a83;
}
.prompt-category {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 10px;
  letter-spacing: 1px;
  color: #59684f;
  font-weight: 500;
}
.prompt-arrow {
  flex: 0 0 16px;
  margin-left: auto;
  color: #a3aa97;
}
.prompt-card > strong {
  font-size: 13px;
  font-weight: 550;
  display: block;
  margin-bottom: 7px;
}
.prompt-example {
  display: block;
  color: #59684f;
  font-size: 12px;
  line-height: 1.65;
  max-width: 235px;
}

@media (max-width: 760px) {
  .prompt-top {
    flex-direction: row;
    align-items: center;
    gap: 7px;
    min-height: 0;
    padding-right: 0;
  }
  .prompt-card:last-child .prompt-top {
    padding-bottom: 6px;
    padding-top: 6px;
  }

  .prompt-icon {
    flex-basis: 28px;
    width: 28px;
    height: 28px;
  }

  .prompt-category {
    flex: 1 1 auto;
    overflow: visible;
    text-overflow: unset;
    white-space: normal;
    line-height: 1.35;
  }

  .prompt-arrow {
    display: none;
  }

  .prompt-card > strong {
    line-height: 1.45;
  }

  .prompt-example {
    max-width: none;
    line-height: 1.5;
  }
}
</style>

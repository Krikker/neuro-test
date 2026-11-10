<script setup lang="ts">
withDefaults(defineProps<{ name: string; size?: number }>(), { size: 20 });
const paths: Record<string, string> = {
  plus: 'M12 5v14M5 12h14',
  arrow: 'M12 19V5m-6 6 6-6 6 6',
  chat: 'M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z',
  book: 'M4 4h6a3 3 0 0 1 3 3v14a4 4 0 0 0-3-2H4V4Zm16 0h-4a3 3 0 0 0-3 3v14a4 4 0 0 1 3-2h4V4Z',
  spark: 'm12 3 2.7 6.3L21 12l-6.3 2.7L12 21l-2.7-6.3L3 12l6.3-2.7L12 3Z',
  bolt: 'm13 2-9 12h7l-1 8 10-13h-7l1-7Z',
  calc: 'M6 3h12v18H6V3Zm3 4h6M9 11h1m4 0h1m-6 4h1m4 0h1m-6 3h1m4 0h1',
  retry: 'M3 10a9 9 0 1 1 1 7M3 4v6h6',
  check: 'm5 12 4 4L19 6',
  close: 'm6 6 12 12M6 18 18 6',
  menu: 'M4 6h16M4 12h16M4 18h16',
  trash: 'M4 7h16M10 11v6m4-6v6M9 7V4h6v3m-9 0 1 13h10l1-13',
  stop: 'M6 6h12v12H6V6Z',
  chevron: 'm9 5 7 7-7 7',
  student:
    'M12 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm-7.5 8.5c.5-3.2 3.5-5.5 7.5-5.5s7 2.3 7.5 5.5',
};
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.65"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path :d="paths[name] || paths.spark" />
  </svg>
</template>

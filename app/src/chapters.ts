import type { Component } from 'vue';
import Ch1 from './chapters/Ch1Problem.vue';
import Ch2 from './chapters/Ch2Data.vue';
import Ch3 from './chapters/Ch3Approach.vue';
import Ch4 from './chapters/Ch4Run1.vue';
import Ch5 from './chapters/Ch5Fixes.vue';
import Ch6 from './chapters/Ch6Run2.vue';
import Ch7 from './chapters/Ch7Timeline.vue';
import Ch8 from './chapters/Ch8TryIt.vue';

export const CHAPTERS: { title: string; component: Component }[] = [
  { title: 'The problem', component: Ch1 },
  { title: 'What I* asked for', component: Ch2 },
  { title: 'The approach', component: Ch3 },
  { title: 'Run 1', component: Ch4 },
  { title: 'What went wrong and what I changed', component: Ch5 },
  { title: 'Run 2', component: Ch6 },
  { title: 'The timeline', component: Ch7 },
  { title: 'Try it', component: Ch8 },
];

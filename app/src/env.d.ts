declare module 'virtual:phase1' {
  const data: import('./phase1-types').Phase1Data;
  export default data;
}
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<object, object, unknown>;
  export default component;
}

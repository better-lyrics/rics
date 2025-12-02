/// <reference types="vite/client" />

declare module '*.rics?raw' {
  const content: string;
  export default content;
}

declare module '*.rics' {
  const content: string;
  export default content;
}

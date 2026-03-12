/// <reference types="vite/client" />

// 以下を追記：glbファイルをURL文字列として認識させる設定
declare module '*.glb?url' {
    const src: string;
    export default src;
  }
  
  // （念のため、?urlがない通常の読み込み用も書いておくと安心です）
  declare module '*.glb' {
    const src: string;
    export default src;
  }
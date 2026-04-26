export {};

declare global {
  interface PuterChatPart { text?: string; delta?: string; [k: string]: any }
  interface PuterResponseIterator extends AsyncIterable<PuterChatPart> {}

  interface Window {
    puter?: {
      ai: {
        chat: (prompt: string, imageOrOptions?: any, options?: any) => Promise<any> | PuterResponseIterator;
      }
    }
  }
}

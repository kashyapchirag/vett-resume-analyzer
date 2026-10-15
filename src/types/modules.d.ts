declare module "mammoth" {
  export interface MammothResult {
    value: string;
    messages: Array<{
      type: string;
      message: string;
    }>;
  }

  export interface ExtractRawTextInput {
    buffer?: Buffer | ArrayBuffer | Uint8Array;
    path?: string;
  }

  export function extractRawText(
    input: ExtractRawTextInput
  ): Promise<MammothResult>;
}

declare module "pdfjs-dist/legacy/build/pdf.worker.mjs" {
  const content: unknown;
  export default content;
}


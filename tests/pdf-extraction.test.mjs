import test from "node:test";
import assert from "node:assert/strict";
import { extractPdfText, ResumeParseError } from "../src/lib/resume/extract-pdf.ts";

// Minimal valid single-page PDF containing "Hello World from Vett Resume" with exact xref offsets
const VALID_TEXT_PDF_BASE64 =
  "JVBERi0xLjQKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4K" +
  "ZW5kb2JqCjIgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzIC9LaWRzIFszIDAgUl0gL0NvdW50" +
  "IDEgPj4KZW5kb2JqCjMgMCBvYmoKPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAv" +
  "UmVzb3VyY2VzIDw8IC9Gb250IDw8IC9GMSA0IDAgUiA+PiA+PiAvTWVkaWFCb3ggWzAg" +
  "MCA2MTIgNzkyXSAvQ29udGVudHMgNSAwIFIgPj4KZW5kb2JqCjQgMCBvYmoKPDwgL1R5" +
  "cGUgL0ZvbnQgL1N1YnR5cGUgL1R5cGUxIC9CYXNlRm9udCAvSGVsdmV0aWNhID4+CmVu" +
  "ZG9iago1IDAgb2JqCjw8IC9MZW5ndGggNDQgPj4Kc3RyZWFtCkJUCi9GMSAyNCBUZgox" +
  "MDAgNzAwIFRkCihIZWxsbyBXb3JsZCBmcm9tIFZldHQgUmVzdW1lKSBUagpFVAplbmRz" +
  "dHJlYW0KZW5kb2JqCnhyZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAw" +
  "OSAwMDAwMCBuIAowMDAwMDAwMDU4IDAwMDAwIG4gCjAwMDAwMDAxMTUgMDAwMDAgbiAK" +
  "MDAwMDAwMDI0MSAwMDAwMCBuIAowMDAwMDAwMzExIDAwMDAwIG4gCnRyYWlsZXIKPDwg" +
  "L1NpemUgNiAvUm9vdCAxIDAgUiA+PgpzdGFydHhyZWYKNDIxCiUlRU9G";

// Valid PDF structure with empty stream (simulating a scanned/image-only PDF with zero extractable text)
const SCANNED_EMPTY_PDF_BASE64 =
  "JVBERi0xLjQKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4K" +
  "ZW5kb2JqCjIgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzIC9LaWRzIFszIDAgUl0gL0NvdW50" +
  "IDEgPj4KZW5kb2JqCjMgMCBvYmoKPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAv" +
  "TWVkaWFCb3ggWzAgMCA2MTIgNzkyXSAvQ29udGVudHMgNCAwIFIgPj4KZW5kb2JqCjQg" +
  "MCBvYmoKPDwgL0xlbmd0aCAwID4+CnN0cmVhbQplbmRzdHJlYW0KZW5kb2JqCnhyZWYK" +
  "MCA1CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAw" +
  "MDU4IDAwMDAwIG4gCjAwMDAwMDAxMTUgMDAwMDAgbiAKMDAwMDAwMDIwMiAwMDAwMCBu" +
  "IAp0cmFpbGVyCjw8IC9TaXplIDUgL1Jvb3QgMSAwIFIgPj4Kc3RhcnR4cmVmCjI1MAol" +
  "JUVPRg==";

test("extractPdfText - extracts plain text and pageCount from valid PDF", async () => {
  const validBuffer = Buffer.from(VALID_TEXT_PDF_BASE64, "base64");
  const result = await extractPdfText(validBuffer);

  assert.equal(result.pageCount, 1);
  assert.equal(typeof result.text, "string");
  assert.match(result.text, /Hello World from Vett Resume/);
});

test("extractPdfText - throws SCANNED_PDF when extractable alphanumeric characters < 10", async () => {
  const emptyBuffer = Buffer.from(SCANNED_EMPTY_PDF_BASE64, "base64");

  await assert.rejects(
    async () => {
      await extractPdfText(emptyBuffer);
    },
    (err) => {
      assert.equal(err instanceof ResumeParseError, true);
      assert.equal(err.code, "SCANNED_PDF");
      assert.match(err.message, /scanned or image-only/i);
      return true;
    }
  );
});

test("extractPdfText - throws CORRUPTED_FILE on malformed PDF bytes", async () => {
  const corruptBuffer = Buffer.from("%PDF-1.4 corrupt byte sequence not adhering to pdf format");

  await assert.rejects(
    async () => {
      await extractPdfText(corruptBuffer);
    },
    (err) => {
      assert.equal(err instanceof ResumeParseError, true);
      assert.equal(err.code, "CORRUPTED_FILE");
      assert.match(err.message, /corrupted or could not be parsed/i);
      return true;
    }
  );
});

test("extractPdfText - handles empty buffer as corrupted/parse failure", async () => {
  const emptyBuffer = Buffer.from([]);

  await assert.rejects(
    async () => {
      await extractPdfText(emptyBuffer);
    },
    (err) => {
      assert.equal(err instanceof ResumeParseError, true);
      assert.ok(err.code === "CORRUPTED_FILE" || err.code === "PARSE_FAILED");
      return true;
    }
  );
});

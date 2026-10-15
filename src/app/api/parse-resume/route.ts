import { NextRequest, NextResponse } from "next/server";
import { extractResumeText, ResumeParseError } from "@/lib/resume/extract-text";
import {
  ParseResumeSuccessSchema,
  ParseResumeError,
} from "@/lib/validation/resume-schema";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("resume");

    if (!file || !(file instanceof File)) {
      const errorResponse: ParseResumeError = {
        success: false,
        error: "No resume file was provided in the request.",
        code: "NO_FILE",
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Convert file to in-memory Uint8Array
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Validate and extract text in-memory (never permanently saved)
    const result = await extractResumeText(file.name, buffer);

    // Validate the response payload with Zod schema
    const payload = {
      success: true,
      text: result.text,
      metadata: result.metadata,
    };

    const parseCheck = ParseResumeSuccessSchema.safeParse(payload);
    if (!parseCheck.success) {
      console.error(
        "[POST /api/parse-resume] Schema validation failed:",
        JSON.stringify(
          parseCheck.error.issues.map((i) => ({
            path: i.path,
            code: i.code,
            message: i.message,
          })),
          null,
          2
        )
      );
      const errorResponse: ParseResumeError = {
        success: false,
        error: "Internal error: extracted document payload did not match response schema.",
        code: "PARSE_FAILED",
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    return NextResponse.json(parseCheck.data, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof ResumeParseError) {
      const errorResponse: ParseResumeError = {
        success: false,
        error: err.message,
        code: err.code,
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const unexpectedError: ParseResumeError = {
      success: false,
      error: "An unexpected error occurred while processing the document.",
      code: "PARSE_FAILED",
    };
    return NextResponse.json(unexpectedError, { status: 500 });
  }
}

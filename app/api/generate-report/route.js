// app/api/generate-report/route.js
import { NextResponse } from 'next/server';
import Replicate from 'replicate';

// Inisialisasi Replicate dengan API key dari environment variable
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const output = await replicate.run(
      "ibm-granite/granite-3.3-8b-instruct",
      {
        input: {
          prompt: prompt,
          max_tokens: 512,
          temperature: 0.7,
        }
      }
    );

    const aiResponseString = output.join("")
    try {
      const parsedReport = JSON.parse(aiResponseString)
      return NextResponse.json(parsedReport)
    } catch (parseError) {
      console.error("Failed to parse AI JSON response:", aiResponseString)
      throw new Error("AI memberikan format jawaban yang tidak valid.")
  }
  } catch (error) {
    console.error("AI report generation failed:", error)
    return NextResponse.json({ error: "Gagal membuat laporan dari AI." }, { status: 500 })
  }
}
// app/api/generate-report/route.js
import { NextResponse } from 'next/server';
import Replicate from 'replicate';

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

export async function POST(request) {
  try {
    const { prompt } = await request.json()
    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    const output = await replicate.run(
      "ibm-granite/granite-3.3-8b-instruct",
      {
        input: {
          prompt,
          max_tokens: 1024,
          temperature: 0.7,
          system_prompt: "You are a JSON API that only returns valid JSON. Never add explanatory text before or after the JSON."
        }
      }
    );

    let aiResponseString = output.join("").trim()
    console.log("Raw AI Response:", aiResponseString)

    let parsedReport = null;

    // Strategi 1: Cari JSON block yang valid
    const jsonMatch = aiResponseString.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        parsedReport = JSON.parse(jsonMatch[0]);
        console.log("JSON extracted successfully with regex");
      } catch (e) {
        console.log("Failed to parse with regex extraction");
      }
    }

    if (!parsedReport) {
      console.log("Creating JSON from text response");

      // Pisahkan response menjadi bagian-bagian
      const lines = aiResponseString.split(/\d+\.\s*/);
      let summary = "";
      let advice = "";

      // Coba deteksi apakah ada pola tertentu
      if (lines.length > 1) {
        summary = lines.slice(1, Math.ceil(lines.length / 2)).join(" ").trim();
        advice = lines.slice(Math.ceil(lines.length / 2)).join("\n").trim();
      } else {
        summary = aiResponseString.substring(0, Math.floor(aiResponseString.length / 2));
        advice = aiResponseString.substring(Math.floor(aiResponseString.length / 2));
      }

      parsedReport = {
        summary: summary || "Analisis keuangan Anda menunjukkan kondisi yang perlu diperhatikan.",
        advice: advice || "1. **Pantau pengeluaran** secara rutin\n2. **Buat anggaran** bulanan yang realistis"
      };
    }

    if (!parsedReport.summary || !parsedReport.advice) {
      throw new Error("Response tidak memiliki struktur yang diharapkan");
    }

    return NextResponse.json(parsedReport)

  } catch (error) {
    console.error("AI report generation failed:", error.message)

    // Fallback response jika semua gagal
    const fallbackReport = {
      summary: "**Analisis Keuangan Saat Ini**\n\nBerdasarkan data yang tersedia, sistem sedang memproses informasi keuangan Anda. Mohon coba lagi dalam beberapa saat untuk mendapatkan analisis yang lebih detail.",
      advice: "1. **Coba Generate Ulang** - Klik tombol generate kembali untuk analisis yang lebih akurat\n2. **Periksa Data** - Pastikan data pemasukan dan pengeluaran sudah lengkap"
    };

    return NextResponse.json(fallbackReport)
  }
}
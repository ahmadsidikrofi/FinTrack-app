"use client"

import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Lightbulb, LoaderCircle, Sparkles, Wallet } from 'lucide-react';
import axios from "axios"
import api from "@/lib/axios"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"

export default function ReportsPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [reportData, setReportData] = useState(() => {
        const savedReport = localStorage.getItem('last-Ai-Report')
        return savedReport ? JSON.parse(savedReport) : null
    })
    const handleGenerateReport = async () => {
        setIsLoading(true)
        setReportData(null)
        setError(null)

        try {
            const [summaryResponse, spendingResponse] = await Promise.all([
                api.get('/dashboard/summary'),
                api.get('/reports/spending-by-category')
            ])

            if (summaryResponse.status !== 200 || spendingResponse.status !== 200) {
                throw new Error("Gagal mengambil data keuangan dari server.");
            }

            const summaryData = summaryResponse.data;
            const spendingData = spendingResponse.data;
            const topExpenseCategory = spendingData.data.length > 0 ? spendingData.data[0].category_name : "Tidak ada pengeluaran"

            console.log("Data berhasil diambil:", { summaryData, topExpenseCategory })

            const prompt = `
            Anda adalah Fin-AI, asisten keuangan pribadi yang cerdas, ramah, dan memberikan analisis mendalam berdasarkan data.
            Buatlah laporan keuangan dalam bentuk JSON.
            PENTING: Kembalikan HANYA format JSON yang valid tanpa teks tambahan.

            ATURAN UTAMA:
            - JAWAB HANYA dengan JSON string yang valid.
            - JANGAN PERNAH menambahkan teks pembuka atau penutup di luar JSON.
            - Nilai dari "summary" dan "advice" HARUS berupa satu string tunggal.
            - Di dalam nilai "summary", JANGAN gunakan kalimat pembuka seperti "Berikut adalah analisis..." atau "Dari data yang diberikan...". Langsung mulai dengan analisisnya.
            - Gunakan bahasa Indonesia.

            --- CONTOH ---
            DATA INPUT:
            - Total Pemasukan: Rp 10.000.000
            - Total Pengeluaran: Rp 7.000.000
            - Kategori pengeluaran terbesar: "Transportasi"

            JSON OUTPUT YANG DIHARAPKAN:
            {
                "summary": "Dengan surplus sebesar Rp 3.000.000, kondisi keuangan Anda bulan ini **sangat sehat**. Pengeluaran terbesar Anda ada pada kategori Transportasi.",
                "advice": "1. **Evaluasi Biaya Transportasi**: Coba cari alternatif untuk mengurangi pengeluaran di pos ini.\\n2. **Alokasikan Surplus**: Manfaatkan sisa dana untuk investasi atau dana darurat."
            }
            ---

            SEKARANG, PROSES DATA DI BAWAH INI DAN BERIKAN JSON OUTPUT-NYA SESUAI ATURAN DI ATAS:

            DATA INPUT:
            - Total Pemasukan: Rp ${parseInt(summaryData.total_income).toLocaleString('id-ID')}
            - Total Pengeluaran: Rp ${parseInt(summaryData.total_expense).toLocaleString('id-ID')}
            - Kategori pengeluaran terbesar: "${topExpenseCategory}"

            JSON OUTPUT:
            
            `

            const aiResponse = await axios.post('/api/generate-report', { prompt })
            if (aiResponse.status !== 200) {
                throw new Error(aiResponse.data.error || "Gagal membuat laporan.")
            }

            const newReportData = aiResponse.data
            setReportData(newReportData)
            if (newReportData.summary && newReportData.advice) {
                localStorage.setItem('last-Ai-Report', JSON.stringify(newReportData))
            }
        } catch (err) {
            setError(err.message)
            console.log(err)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <SidebarInset>
            <div>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="-ml-1" />
                    <div className="flex flex-1 items-center justify-between">
                        <h1 className="text-xl font-semibold">Laporan Keuangan Based on IBM-AI</h1>
                    </div>
                </header >
                <Button onClick={handleGenerateReport} disabled={isLoading} className="m-6">
                    {isLoading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isLoading ? "Membuat Laporan..." : "Buat Analisis dari AI"}
                </Button>

                {error && <p className="text-red-500 mt-3 mx-6">Error: {error}</p>}

                {reportData && (
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Analisis Keuangan Anda</CardTitle>
                        </CardHeader>
                        <CardContent className="prose dark:prose-invert max-w-full">
                            <div>
                                {!isLoading && reportData && (
                                    <div className="space-y-6 mt-6">
                                        {/* Main Title Section */}
                                        <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 rounded-xl border">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
                                                <Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div className="flex-1">
                                                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                                                    Analisis Keuangan Personal Anda
                                                </h2>
                                                <p className="text-sm text-muted-foreground">Dibuat oleh AI FinTrack</p>
                                            </div>
                                        </div>

                                        {/* Summary Section */}
                                        <Card>
                                            <CardHeader>
                                                <div className="flex items-center gap-2">
                                                    <Wallet className="h-5 w-5 text-green-600" />
                                                    <CardTitle>Ringkasan Bulan Ini</CardTitle>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                        {typeof reportData.summary === 'string' ? reportData.summary : String(reportData.summary)}
                                                    </ReactMarkdown>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Advice Section */}
                                        <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
                                            <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                            <AlertTitle className="font-bold text-amber-800 dark:text-amber-200">Saran Praktis untuk Anda</AlertTitle>
                                            <AlertDescription className="mt-2">
                                                <div className="prose prose-sm dark:prose-invert max-w-none prose-amber">
                                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                        {typeof reportData.advice === 'string'
                                                            ? reportData.advice
                                                            : Array.isArray(reportData.advice)
                                                                ? reportData.advice.join('\n')
                                                                : String(reportData.advice)
                                                        }
                                                    </ReactMarkdown>
                                                </div>
                                            </AlertDescription>
                                        </Alert>

                                        {/* Disclaimer */}
                                        <div className="text-center pt-4">
                                            <p className="text-xs text-muted-foreground max-w-2xl mx-auto">
                                                Analisis ini dibuat oleh AI dan hanya bersifat sebagai referensi. Selalu pertimbangkan kondisi Anda
                                                sendiri sebelum mengambil keputusan keuangan.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </SidebarInset>
    );
}
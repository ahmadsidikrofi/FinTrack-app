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

export default function ReportsPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [reportData, setReportData] = useState(() => {
        const savedReport = localStorage.getItem('lastAiReport')
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
            const topExpenseCategory = spendingData.length > 0 ? spendingData[0].category_name : "Tidak ada pengeluaran"

            console.log("Data berhasil diambil:", { summaryData, topExpenseCategory })

            const prompt = `
                Anda adalah sebuah API service yang tugasnya menganalisis data keuangan dan mengembalikan HANYA format JSON string yang valid.

                Analisis data berikut:
                - Total Pemasukan: Rp ${parseInt(summaryData.total_income).toLocaleString('id-ID')}
                - Total Pengeluaran: Rp ${parseInt(summaryData.total_expense).toLocaleString('id-ID')}
                - Kategori pengeluaran terbesar: "${topExpenseCategory}"

                Buat ringkasan dan 2-3 saran praktis dalam format Markdown.
                
                PENTING: Struktur output Anda HARUS berupa JSON string tunggal, tanpa teks pembuka atau penutup. Pastikan semua tanda kutip (") di dalam teks Markdown di-escape dengan benar menggunakan backslash (\\").

                Contoh struktur JSON yang WAJIB diikuti:
                {
                "summary": "Tulis paragraf ringkasan keuangan bulan ini di sini. Gunakan **teks tebal** untuk poin penting.",
                "advice": "Tulis saran praktis di sini. Gunakan daftar bernomor seperti '1. **Optimalisasi...**\\n2. **Bangun Dana Darurat...**'"
                }
            `

            const aiResponse = await axios.post('/api/generate-report', { prompt })
            if (aiResponse.status !== 200) {
                throw new Error(aiResponse.data.error || "Gagal membuat laporan.")
            }

            const newReportData = aiResponse.data
            setReportData(newReportData)
            localStorage.setItem('lastAiReport', JSON.stringify(newReportData))
        } catch (err) {
            setError(err.message)
            console.log(err)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="p-4 md:p-8">
            <h1 className="text-2xl font-bold mb-4">Laporan Keuangan AI</h1>
            <Button onClick={handleGenerateReport} disabled={isLoading}>
                {isLoading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isLoading ? "Membuat Laporan..." : "Buat Analisis dari AI"}
            </Button>

            {error && <p className="text-red-500 mt-4">Error: {error}</p>}

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
                                                {/* Ambil data summary */}
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{reportData.summary}</ReactMarkdown>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Advice Section */}
                                    <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
                                        <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                        <AlertTitle className="font-bold text-amber-800 dark:text-amber-200">Saran Praktis untuk Anda</AlertTitle>
                                        <AlertDescription className="mt-2">
                                            <div className="prose prose-sm dark:prose-invert max-w-none prose-amber">
                                                {/* Ambil data advice */}
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{reportData.advice}</ReactMarkdown>
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
    );
}
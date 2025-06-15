"use client"

import { useState } from "react"
import { ArrowDown, ArrowRight, CalendarIcon, ChevronDown } from "lucide-react"
import { format, subDays, subMonths } from "date-fns"
import { id } from "date-fns/locale"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"

// Time period options
const timePeriods = [
    { label: "Bulan Ini", value: "month" },
    { label: "3 Bulan Terakhir", value: "quarter" },
    { label: "Tahun Ini", value: "year" },
]

// Helper function to generate dates for the selected time period
const generateDatesForPeriod = (period) => {
    const today = new Date()
    const dates = []

    switch (period) {
        case "month":
            // Generate daily data for last 30 days
            for (let i = 29; i >= 0; i--) {
                dates.push(subDays(today, i))
            }
            break
        case "quarter":
            // Generate weekly data for last 12 weeks
            for (let i = 11; i >= 0; i--) {
                dates.push(subDays(today, i * 7))
            }
            break
        case "year":
            // Generate monthly data for last 12 months
            for (let i = 11; i >= 0; i--) {
                dates.push(subMonths(today, i))
            }
            break
        default:
            // Fallback to monthly data
            for (let i = 11; i >= 0; i--) {
                dates.push(subMonths(today, i))
            }
            break
    }

    return dates
}

// Helper function to generate financial data
const generateFinancialData = (dates, period) => {
    if (!dates || dates.length === 0) {
        return []
    }

    let saldo = 1500000
    const baseIncome = 5000000
    const baseExpense = 3500000

    return dates.map((date, index) => {
        if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
            // Return default data for invalid dates
            return {
                date: `Day ${index + 1}`,
                pemasukan: 0,
                pengeluaran: 0,
                saldo: saldo,
            }
        }

        // Calculate income and expense for this period
        let pemasukan = Math.round(baseIncome)
        let pengeluaran = Math.round(baseExpense)

        // Adjust values based on period
        if (period === "month") {
            // Daily values
            pemasukan = Math.round(pemasukan / 30)
            pengeluaran = Math.round(pengeluaran / 30)
        } else if (period === "quarter") {
            // Weekly values
            pemasukan = Math.round(pemasukan / 4)
            pengeluaran = Math.round(pengeluaran / 4)
        }

        // Update running balance
        saldo = saldo + pemasukan - pengeluaran

        try {
            return {
                date: format(date, period === "year" ? "MMM" : "dd MMM", { locale: id }),
                pemasukan,
                pengeluaran,
                saldo,
            }
        } catch (error) {
            // Fallback if date formatting fails
            return {
                date: `${date.getDate()}/${date.getMonth() + 1}`,
                pemasukan,
                pengeluaran,
                saldo,
            }
        }
    })
}

// Generate category spending data
const generateCategoryData = () => {
    const categories = [
        { name: "Makanan", color: "#0088FE" },
        { name: "Transportasi", color: "#00C49F" },
        { name: "Hiburan", color: "#FFBB28" },
        { name: "Belanja", color: "#FF8042" },
        { name: "Utilitas", color: "#8884D8" },
        { name: "Kesehatan", color: "#82CA9D" },
        { name: "Pendidikan", color: "#FCCDE5" },
    ]

    const totalSpending = 3500000
    let remainingPercentage = 100

    return categories
        .map((category, index) => {
            // Generate a percentage for this category
            // Make the first few categories have higher percentages
            let percentage
            if (index === 0) percentage = 30
            else if (index === 1) percentage = 20
            else if (index === 2) percentage = 15
            else percentage = Math.min(remainingPercentage - 2, 5)

            remainingPercentage -= percentage

            const amount = Math.round((percentage / 100) * totalSpending)

            return {
                ...category,
                amount,
                percentage,
            }
        })
        .sort((a, b) => b.amount - a.amount) // Sort by amount descending
}

// Helper function to format currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount)
}

export default function ReportsPage() {
    const [selectedPeriod, setSelectedPeriod] = useState(timePeriods[0])

    // Generate data based on selected period with error handling
    let financialData = []
    let categoryData = []

    try {
        const dates = generateDatesForPeriod(selectedPeriod.value)
        financialData = generateFinancialData(dates, selectedPeriod.value)
        categoryData = generateCategoryData()
    } catch (error) {
        console.error("Error generating data:", error)
        // Provide fallback data
        financialData = [{ date: "Today", pemasukan: 0, pengeluaran: 0, saldo: 1500000 }]
        categoryData = [
            { name: "Makanan", color: "#0088FE", amount: 1000000, percentage: 50 },
            { name: "Transportasi", color: "#00C49F", amount: 500000, percentage: 25 },
        ]
    }

    // Calculate total spending safely
    const totalSpending = categoryData.reduce((sum, category) => {
        return sum + (category?.amount || 0)
    }, 0)

    return (
        <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                <SidebarTrigger className="-ml-1" />
                <div className="flex flex-1 items-center justify-between">
                    <h1 className="text-xl font-semibold">Laporan & Analitik</h1>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {selectedPeriod.label}
                                <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {timePeriods.map((period) => (
                                <DropdownMenuItem key={period.value} onClick={() => setSelectedPeriod(period)}>
                                    {period.label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>

            <div className="flex flex-1 flex-col gap-6 p-4">
                {/* Main Financial Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Tren Keuangan - {selectedPeriod.label}</CardTitle>
                        <CardDescription>
                            Visualisasi pemasukan, pengeluaran, dan saldo selama {selectedPeriod.label.toLowerCase()}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer
                            config={{
                                pemasukan: {
                                    label: "Pemasukan",
                                    color: "#FFBB28",
                                },
                                pengeluaran: {
                                    label: "Pengeluaran",
                                    color: "#0088FE",
                                },
                                saldo: {
                                    label: "Saldo",
                                    color: "#00C49F",
                                },
                            }}
                            className="h-[350px] max-sm:max-w-sm xl:w-full"
                        >
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={financialData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorPemasukan" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--color-pemasukan)" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="var(--color-pemasukan)" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorPengeluaran" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--color-pengeluaran)" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="var(--color-pengeluaran)" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--color-saldo)" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="var(--color-saldo)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Area
                                        type="monotone"
                                        dataKey="pemasukan"
                                        stroke="var(--color-pemasukan)"
                                        fillOpacity={1}
                                        fill="url(#colorPemasukan)"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="pengeluaran"
                                        stroke="var(--color-pengeluaran)"
                                        fillOpacity={1}
                                        fill="url(#colorPengeluaran)"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="saldo"
                                        stroke="var(--color-saldo)"
                                        fillOpacity={1}
                                        fill="url(#colorSaldo)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Expense Analysis Section */}
                <div>
                    <h2 className="mb-4 text-xl font-semibold">Analisis Pengeluaran</h2>

                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Bar Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Pengeluaran per Kategori</CardTitle>
                                <CardDescription>
                                    Total pengeluaran berdasarkan kategori selama {selectedPeriod.label.toLowerCase()}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {/* <ChartContainer className="h-[350px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={categoryData || []} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                            <XAxis type="number" />
                                            <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <Tooltip
                                                formatter={(value) => [formatCurrency(value), "Jumlah"]}
                                                labelFormatter={(value) => `Kategori: ${value}`}
                                            />
                                            <Bar dataKey="amount" name="Jumlah" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </ChartContainer> */}
                            </CardContent>
                        </Card>

                        {/* Top Spending Categories */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Top Spending</CardTitle>
                                <CardDescription>
                                    Kategori dengan pengeluaran tertinggi ({formatCurrency(totalSpending)} total)
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {categoryData.slice(0, 5).map((category, index) => (
                                        <div key={category.name} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">
                                                        {index + 1}
                                                    </Badge>
                                                    <span className="font-medium">{category.name}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-muted-foreground">{category.percentage.toFixed(1)}%</span>
                                                    <span className="font-medium">{formatCurrency(category.amount)}</span>
                                                </div>
                                            </div>
                                            <Progress value={category.percentage} className="h-2" />
                                        </div>
                                    ))}

                                    {/* Other categories summary */}
                                    {categoryData.length > 5 && (
                                        <div className="mt-4 pt-4 border-t">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">
                                                        <ArrowDown className="h-3 w-3" />
                                                    </Badge>
                                                    <span className="font-medium">Kategori Lainnya</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-muted-foreground">
                                                        {categoryData
                                                            .slice(5)
                                                            .reduce((sum, cat) => sum + cat.percentage, 0)
                                                            .toFixed(1)}
                                                        %
                                                    </span>
                                                    <span className="font-medium">
                                                        {formatCurrency(categoryData.slice(5).reduce((sum, cat) => sum + cat.amount, 0))}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* View all link */}
                                    <Button variant="ghost" className="w-full mt-2" size="sm">
                                        Lihat Semua Kategori
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </SidebarInset>
    )
}
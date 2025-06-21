"use client"

import { ArrowDown, ArrowUp, Calendar, LoaderCircle, Wallet } from "lucide-react"
import { Bar, BarChart, Cell, Legend, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useEffect, useState } from "react"
import axios from "axios"
import api from "@/lib/axios"

export default function Dashboard() {
  const [recentTransactions, setResentTransaction] = useState([])
  const [countTransaction, setCountTransaction] = useState([])
  const [income, setIncome] = useState('')
  const [expense, setExpense] = useState('')
  const [currentBudget, setCurrentBudget] = useState('')
  const [expenseData, setExpenseData] = useState([])
  const [incomeExpeseData, setIncomeExpenseData] = useState([])
  const [refreshData, setRefreshData] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const Get5recentTransactions = async () => {
    const res = await api.get('/dashboard/recent-transactions')
    setCountTransaction(res.data.count)
    setResentTransaction(res.data.transactions)
  }

  const GetSummaryBudget = async () => {
    const res = await api.get('/dashboard/summary')
    setIncome(res.data.total_income)
    setExpense(res.data.total_expense)
    setCurrentBudget(res.data.current_balance)
  }

  const SpendingByCategory = async () => {
    setIsLoading(true)
    try {
      const res = await api.get('/reports/spending-by-category')
      const formattedData = res.data.data.map(item => ({
        ...item,
        total_amount: parseFloat(item.total_amount)
      }))
      setExpenseData(formattedData)
    } catch (error) {
      console.error("Gagal mengambil data pie chart:", error);
    } finally {
      setIsLoading(false)
    }
  }

  const ChartIncomeExpense = async () => {
    const res = await api.get('/reports/income-expense-trend')
    if (res.data && Array.isArray(res.data)) {
      const formattedData = res.data.map(item => ({
        month_name: item.month_name,
        pemasukan: parseFloat(item.income) || 0,
        pengeluaran: parseFloat(item.expense) || 0,
      }))
      
      setIncomeExpenseData(formattedData)
    }
  }

  useEffect(() => {
    Get5recentTransactions()
    GetSummaryBudget()
    SpendingByCategory()
    ChartIncomeExpense()
  }, [refreshData])

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF']

  const ChartTooltipContent = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload

      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col">
              <span className="font-bold text-foreground break-words max-w-[150px]">
                {data.category_name}
              </span>
              <span className="text-xs text-muted-foreground">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(data?.total_amount)}
              </span>
            </div>
            <div className="flex items-center justify-end">
              <span className="font-medium text-lg">
                {data?.percentage?.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      );
    }

    return null
  }

  const CustomBarChartTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <div className="grid grid-cols-1 gap-1 text-center">
            <p className="font-bold text-foreground mb-1">{label}</p>
            {payload.map((entry, index) => (
              <div key={`item-${index}`} className="flex items-center justify-between gap-4">
                <div className="flex items-center">
                  <span
                    className="w-2.5 h-2.5 rounded-full mr-2"
                    style={{ backgroundColor: entry.color }}
                  ></span>
                  <p className="text-sm text-muted-foreground">{entry.name}</p>
                </div>
                <p className="text-sm font-medium">
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(entry.value)}
                </p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return null
  }

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <div className="flex flex-1 items-center justify-between">
          <h1 className="text-xl font-semibold">Dashboard</h1>
          {/* <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Jan 1 - Jan 31, 2024
          </Button> */}
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4">
        {/* Financial Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="w-full md:max-w-md max-sm:max-w-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">Total Pemasukan</CardTitle>
              <ArrowUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(income)}</div>
              <p className="text-xs text-muted-foreground">dari beberapa bulan lalu</p>
            </CardContent>
          </Card>

          <Card className="w-full md:max-w-md max-sm:max-w-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">Total Pengeluaran</CardTitle>
              <ArrowDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(expense)}</div>
              <p className="text-xs text-muted-foreground">dari beberapa bulan lalu</p>
            </CardContent>
          </Card>

          <Card className="w-full md:max-w-md max-sm:max-w-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">Saldo Saat Ini</CardTitle>
              <Wallet className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(currentBudget)}</div>
              <p className="text-xs text-muted-foreground">Saldo tersedia</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="max-sm:w-full max-sm:max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl">Pengeluaran per Kategori</CardTitle>
              <CardDescription>Distribusi pengeluaran bulan ini</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  value: {
                    label: "Amount",
                  },
                }}
                className="[&_.recharts-pie-label-text]:fill-foreground mx-auto aspect-square max-h-[250px] pb-0"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <LoaderCircle className="h-10 w-10 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                      <Pie
                        data={expenseData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="total_amount"
                        nameKey="category_name"
                        label={({ percentage }) => `${percentage.toFixed(0)}%`}
                      >
                        {expenseData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend
                        verticalAlign="bottom"
                        align="center"
                        iconSize={12}
                        wrapperStyle={{ paddingBottom: '20px', lineHeight: '20px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="max-sm:w-full max-sm:max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl">Pemasukan vs. Pengeluaran</CardTitle>
              <CardDescription>6 bulan terakhir</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                    pemasukan: { label: "Pemasukan", color: "#00C49F" },
                    pengeluaran: { label: "Pengeluaran", color: "#0088FE" },
                }}
                className="h-[250px] w-full">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <LoaderCircle className="h-10 w-10 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={incomeExpeseData}>
                      <XAxis
                        dataKey="month_name"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        fontSize={12}
                      />
                      <YAxis
                        tickFormatter={(value) => `Rp ${value / 1000}k`}
                        tickLine={false}
                        axisLine={false}
                        fontSize={12}
                      />
                      <ChartTooltip
                          cursor={false}
                          content={<CustomBarChartTooltip />}
                      />
                      <Bar dataKey="pemasukan" fill="var(--color-pemasukan)" radius={4} />
                      <Bar dataKey="pengeluaran" fill="var(--color-pengeluaran)" radius={4} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Transaksi Terakhir</CardTitle>
            <CardDescription>{countTransaction} transaksi terbaru</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-slate-600">Tanggal</TableHead>
                  <TableHead className="text-slate-600">Deskripsi</TableHead>
                  <TableHead className="text-right text-slate-600">Jumlah</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.map((transaction, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium pb-6">{transaction.transaction_date}</TableCell>
                    <TableCell className="pb-6">{transaction.description}</TableCell>
                    <TableCell
                      className={`text-right font-medium pb-6 ${transaction.category.type === "Pemasukan" ? "text-green-600" : "text-red-600"
                        }`}
                    >
                      {transaction.category.type === "Pemasukan" ? `+${transaction.amount}` : `-${transaction.amount}`}

                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </SidebarInset>
  )
}

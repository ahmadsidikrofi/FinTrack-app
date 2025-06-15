"use client"

import { ArrowDown, ArrowUp, Calendar, Wallet } from "lucide-react"
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useEffect, useState } from "react"
import axios from "axios"

const expenseData = [
  { name: "Makanan", value: 1200000, fill: "#0088FE" },
  { name: "Transportasi", value: 800000, fill: "#00C49F" },
  { name: "Hiburan", value: 600000, fill: "#FFBB28" },
  { name: "Belanja", value: 500000, fill: "#FF8042" },
  { name: "Lainnya", value: 400000, fill: "#8884D8" },
]

const monthlyData = [
  { month: "Jul", pemasukan: 4800000, pengeluaran: 3200000 },
  { month: "Aug", pemasukan: 5200000, pengeluaran: 3800000 },
  { month: "Sep", pemasukan: 4900000, pengeluaran: 3500000 },
  { month: "Oct", pemasukan: 5300000, pengeluaran: 3900000 },
  { month: "Nov", pemasukan: 5100000, pengeluaran: 3600000 },
  { month: "Dec", pemasukan: 5000000, pengeluaran: 3500000 },
]

export default function Dashboard() {
  const [recentTransactions, setResentTransaction] = useState([])
  const [countTransaction, setCountTransaction] = useState([])
  const [refreshData, setRefreshData] = useState(false)
  
  const Get5recentTransactions = async () => {
    const token = localStorage.getItem('user_token')
    if (token) {
      const res = await axios.get('http://127.0.0.1:8000/api/dashboad/recent-transactions', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      setCountTransaction(res.data.count)
      setResentTransaction(res.data.transactions)
    }
  }

  useEffect(() => {
    Get5recentTransactions()
  }, [refreshData])
  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <div className="flex flex-1 items-center justify-between">
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Jan 1 - Jan 31, 2024
          </Button>
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
              <div className="text-2xl font-bold text-green-600">Rp 5.000.000</div>
              <p className="text-xs text-muted-foreground">+12% dari bulan lalu</p>
            </CardContent>
          </Card>

          <Card className="w-full md:max-w-md max-sm:max-w-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">Total Pengeluaran</CardTitle>
              <ArrowDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">Rp 3.500.000</div>
              <p className="text-xs text-muted-foreground">-5% dari bulan lalu</p>
            </CardContent>
          </Card>

          <Card className="w-full md:max-w-md max-sm:max-w-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">Saldo Saat Ini</CardTitle>
              <Wallet className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">Rp 1.500.000</div>
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
                className="mx-auto aspect-square max-h-[250px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {expenseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
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
                  pemasukan: {
                    label: "Pemasukan",
                    color: "#00C49F",
                  },
                  pengeluaran: {
                    label: "Pengeluaran",
                    color: "#0088FE",
                  },
                }}
                className="h-[250px] max-sm:w-[350px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="pemasukan" fill="var(--color-pemasukan)" />
                    <Bar dataKey="pengeluaran" fill="var(--color-pengeluaran)" />
                  </BarChart>
                </ResponsiveContainer>
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
                      className={`text-right font-medium pb-6 ${
                        transaction.category.type === "Pemasukan" ? "text-green-600" : "text-red-600"
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

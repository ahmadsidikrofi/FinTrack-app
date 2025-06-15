"use client"

import { Coffee, Home, Music, Plus, ShoppingBag, Smartphone, Utensils, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"

// Mock data for budget categories
const budgetCategories = [
  {
    id: 1,
    name: "Makanan & Minuman",
    icon: Utensils,
    spent: 1250000,
    budget: 2000000,
    color: "blue",
  },
  {
    id: 2,
    name: "Transportasi",
    icon: Home,
    spent: 850000,
    budget: 1000000,
    color: "green",
  },
  {
    id: 3,
    name: "Hiburan",
    icon: Music,
    spent: 600000,
    budget: 500000,
    color: "yellow",
  },
  {
    id: 4,
    name: "Belanja",
    icon: ShoppingBag,
    spent: 1200000,
    budget: 1500000,
    color: "purple",
  },
  {
    id: 5,
    name: "Utilitas",
    icon: Zap,
    spent: 450000,
    budget: 600000,
    color: "orange",
  },
  {
    id: 6,
    name: "Kopi",
    icon: Coffee,
    spent: 350000,
    budget: 300000,
    color: "brown",
  },
  {
    id: 7,
    name: "Internet & Pulsa",
    icon: Smartphone,
    spent: 200000,
    budget: 300000,
    color: "cyan",
  },
]

// Helper function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Helper function to determine budget status
const getBudgetStatus = (spent, budget) => {
  const percentage = (spent / budget) * 100

  if (percentage > 100) {
    return {
      status: "Over Budget",
      variant: "destructive",
      color: "red",
    }
  } else if (percentage >= 80) {
    return {
      status: "Warning",
      variant: "warning",
      color: "yellow",
    }
  } else {
    return {
      status: "On Track",
      variant: "outline",
      color: "green",
    }
  }
}

export default function BudgetsPage() {
  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <div className="flex flex-1 items-center justify-between">
          <h1 className="text-xl font-semibold">Anggaran Saya</h1>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Buat Anggaran Baru
          </Button>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {budgetCategories.map((category) => {
            const percentage = Math.min(Math.round((category.spent / category.budget) * 100), 100)
            const remaining = category.budget - category.spent
            const status = getBudgetStatus(category.spent, category.budget)

            return (
              <Card key={category.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-${status.color}-100`}>
                        <category.icon className={`h-4 w-4 text-${status.color}-500`} />
                      </div>
                      <CardTitle className="text-base">{category.name}</CardTitle>
                    </div>
                    <Badge variant={status.variant} className="ml-auto">
                      {status.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="mb-2">
                    <Progress
                      value={percentage}
                      className={`h-2 ${percentage > 100 ? "bg-red-100" : ""}`}
                      indicatorClassName={percentage > 100 ? "bg-red-500" : ""}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {formatCurrency(category.spent)} / {formatCurrency(category.budget)}
                    </span>
                    <span className="font-medium">{percentage}%</span>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  {remaining >= 0 ? (
                    <p className="text-sm text-green-600">Sisa {formatCurrency(remaining)}</p>
                  ) : (
                    <p className="text-sm text-red-600">Melebihi {formatCurrency(Math.abs(remaining))}</p>
                  )}
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </div>
    </SidebarInset>
  )
}
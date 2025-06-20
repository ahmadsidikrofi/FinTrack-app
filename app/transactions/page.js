"use client"

import { useEffect, useState } from "react"
import { CalendarIcon, ChevronLeft, ChevronRight, Edit, LoaderCircle, MoreHorizontal, Plus, Search, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import axios from "axios"
import api from "@/lib/axios"

const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount)
}

export default function TransactionsPage() {
    const [date, setDate] = useState({
        from: undefined,
        to: undefined,
    })
    const [page, setPage] = useState(1)
    const [searchQuery, setSearchQuery] = useState("")
    const [typeFilter, setTypeFilter] = useState("all")
    const [categoryFilter, setCategoryFilter] = useState("all")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingTransaction, setEditingTransaction] = useState(null)
    const [refreshData, setRefreshData] = useState(false)
    const [formData, setFormData] = useState ({
        amount: 0,
        category_id: '',
        description: "",
        transaction_date: ""
    })
    const [categories, setCategories] = useState([])
    const [isLoadingCategories, setIsLoadingCategories] = useState(false)
    const [transactions, setTransactions] = useState([])
    const [deletingTransactionId, setDeletingTransactionId] = useState(false)

    const getCategoryBadgeColor = (categoryName) => {
        const category = categories?.find((cat) => cat?.name === categoryName)
        return category?.color || "gray"
    }
    // Items per page
    const itemsPerPage = 5

    // Filter and paginate transactions
    const filteredTransactions = transactions.filter((transaction) => {
        // Filter by search query
        if (searchQuery && !transaction.description.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false
        }

        // Filter by type
        if (typeFilter !== "all" && transaction.category.type !== typeFilter) {
            return false
        }

        // Filter by category
        if (categoryFilter !== "all" && transaction.category.name !== categoryFilter) {
            return false
        }

        // Filter by date range
        if (date?.from && date?.to) {
            const transactionDate = new Date(transaction.transaction_date)
            if (transactionDate < date?.from || transactionDate > date?.to) {
                return false
            }
        }
        return true
    })

    // Calculate pagination
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
    const paginatedTransactions = filteredTransactions.slice((page - 1) * itemsPerPage, page * itemsPerPage)

    const handleAddNew = () => {
        setEditingTransaction(null)
        setFormData({ category_id: '', amount: 0, description: "", transaction_date: "" })
        setIsDialogOpen(true)
    }

    const handleDialogClose = () => {
        setIsDialogOpen(false)
        setFormData({ category_id: '', amount: 0, description: "", transaction_date: "" })
        setEditingTransaction(null)
    }

    const handleEdit = (transaction) => {
        setEditingTransaction(transaction)
        setFormData({ category_id: transaction.category_id, amount: transaction.amount, description: transaction.description, transaction_date: transaction.transaction_date })
        setIsDialogOpen(true)
    }

    const GetCategoriesFromDB = async () => {
        const res = await api.get('/categories')
        setCategories(res.data)
    }

    const GetTransactionsFromDB = async () => {
        const res = await api.get('/transactions')
        setTransactions(res?.data?.data || [])
    }

    const StoreTransactionsToDB = async (transaction) => {
        const res = api.post('/transactions', transaction)
        return res.data
    }

    const UpdateTransactionFromDB = async (transaction) => {
        const res = api.put('/transactions', transaction)
        setTransactions(res.data)
    }

    const handleSave = async () => {
        if (!formData.amount || !formData.category_id || !formData.transaction_date) {
            alert("Jumlah, kategori, dan tanggal tidak boleh kosong!");
            return;
        }

        if (editingTransaction) {
            const updatedTransaction = {
                ...editingTransaction,
                amount: formData.amount,
                category_id: formData.category_id,
                description: formData.description,
                transaction_date: formData.transaction_date
            }
            const updatedTransactionData = await UpdateTransactionFromDB(updatedTransaction)
            if (updatedTransaction) {
                setTransactions(
                    transactions.map((transaction) => {
                        return transaction.id === editingTransaction.id ? updatedTransactionData : transaction
                    })
                );
            }
        } else {
            const newTransaction = {
                id: Math.max(...categories.map((c) => c.id)) + 1,
                category_id: formData.category_id,
                amount: formData.amount,
                description: formData.description,
                transaction_date: formData.transaction_date
            }
            const saveTransaction = await StoreTransactionsToDB(newTransaction)
            setRefreshData((prev) => !prev)
        }

        setIsDialogOpen(false)
        setFormData({ category_id: '', amount: 0, description: "", transaction_date: new Date() })
        setEditingTransaction(null)
    }

    const handleDeleteTransaction = async (transactionId) => {
        try {
            setDeletingTransactionId(transactionId)
            const res = await api.delete(`/transactions/${transactionId}`)
            if (res.status === 204) {
                setTransactions(transactions.filter((transaction) => transaction.id !== transactionId))
            }
        } catch (error) {
            console.log("Gagal menghapus transaksi", error)
        } finally {
            setDeletingTransactionId(null)
        }
    }

    useEffect(() => {
        GetCategoriesFromDB()
        GetTransactionsFromDB()
    }, [refreshData])

    return (
        <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                <SidebarTrigger className="-ml-1" />
                <div className="flex flex-1 items-center justify-between">
                    <h1 className="text-xl font-semibold">Transactions</h1>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={handleAddNew}>
                                <Plus className="mr-2 h-4 w-4" />
                                Tambah Transaksi Baru
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>{editingTransaction ? "Edit Transaksi" : "Tambah Transaksi Baru"}</DialogTitle>
                                <DialogDescription>
                                    {editingTransaction
                                        ? "Ubah informasi transaksi di bawah ini."
                                        : "Buat transaksi baru pencatatan  Anda."}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="amount">Jumlah Transaksi</Label>
                                    <Input
                                        id="amount"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        placeholder="Masukkan jumlah transaksi"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="category">Kategori</Label>
                                    <Select
                                        // `onValueChange` akan mengupdate formData.category_id
                                        onValueChange={(value) => {
                                            setFormData({ ...formData, category_id: parseInt(value) });
                                        }}
                                        value={String(formData.category_id)}
                                    >
                                        <SelectTrigger id="category">
                                            <SelectValue placeholder="Pilih kategori transaksi..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {isLoadingCategories ? (
                                                <SelectItem value="loading" disabled>Memuat kategori...</SelectItem>
                                            ) : (
                                                categories.map((category) => (
                                                    <SelectItem
                                                        key={category.id}
                                                        value={String(category.id)}
                                                    >
                                                        {category?.name}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-3">
                                <Label htmlFor="description">Deskripsi</Label>
                                    <Input
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Masukkan penjelasan transaksi"
                                    />
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button id="transaction_date" variant={"outline"} className={`w-full justify-start text-left font-normal ${!formData.transaction_date && "text-muted-foreground"}`}>
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {formData.transaction_date ? (
                                                    format(new Date(formData.transaction_date), "dd MMMM yyyy", { locale: id })
                                                ) : (
                                                    <span>Pilih tanggal transaksi</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={formData.transaction_date ? new Date(formData.transaction_date) : undefined}
                                                onSelect={(selectedDate) => {
                                                    if (selectedDate) {
                                                        setFormData({
                                                            ...formData,
                                                            transaction_date: format(selectedDate, 'yyyy-MM-dd'),
                                                        });
                                                    }
                                                }}
                                                initialFocus
                                                disabled={(date) => date > new Date()}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={handleDialogClose}>
                                    Batal
                                </Button>
                                <Button onClick={handleSave}>
                                    Simpan
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </header>

            <div className="flex flex-1 flex-col gap-4 p-4">
                {/* Filter Bar */}
                <div className="flex flex-col gap-4 md:flex-row">
                    {/* Date Range Picker */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button id="date" variant={"outline"} className="w-full justify-start text-left font-normal md:w-auto">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date?.from ? (
                                    date?.to ? (
                                        <>
                                            {format(date?.from, "dd MMM yyyy", { locale: id })} -{" "}
                                            {format(date?.to, "dd MMM yyyy", { locale: id })}
                                        </>
                                    ) : (
                                        format(date?.from, "dd MMM yyyy", { locale: id })
                                    )
                                ) : (
                                    <span>Pick a date range</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={date?.from}
                                selected={date}
                                onSelect={setDate}
                                numberOfMonths={2}
                            />
                        </PopoverContent>
                    </Popover>

                    {/* Type Filter */}
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder="Filter by Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="Pemasukan">Pemasukan</SelectItem>
                            <SelectItem value="Pengeluaran">Pengeluaran</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Category Filter */}
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder="Filter by Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map((category) => (
                                <SelectItem key={category.id} value={category?.name}>
                                    {category?.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Search Input */}
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search by description..."
                            className="w-full pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Transactions Table */}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-slate-500 p-4">Tanggal</TableHead>
                                <TableHead className="text-slate-500 p-4">Deskripsi</TableHead>
                                <TableHead className="text-slate-500 p-4">Kategori</TableHead>
                                <TableHead className="text-slate-500 p-4">Tipe</TableHead>
                                <TableHead className="text-slate-500 text-right p-4">Jumlah</TableHead>
                                <TableHead className="text-slate-500 w-[80px] p-4">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className='text-slate-800'>
                            {paginatedTransactions.length > 0 ? (
                                paginatedTransactions.map((transaction) => (
                                    <TableRow key={transaction.id}>
                                        <TableCell className="font-medium p-5">
                                            {format(new Date(transaction.transaction_date), "dd MMM yyyy", { locale: id })}
                                        </TableCell>
                                        <TableCell className="p-5">{transaction.description}</TableCell>
                                        <TableCell className="p-5">
                                            <Badge variant="outline" className={`rounded-full bg-${getCategoryBadgeColor(transaction?.category?.name)}-100 text-${getCategoryBadgeColor(transaction?.category?.name)}-800 border-${getCategoryBadgeColor(transaction?.category?.name)}-200`}>
                                                {transaction?.category?.name}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="p-5">
                                            <span className={transaction?.category?.type === "Pemasukan" ? "text-green-600" : "text-red-600"}>
                                                {transaction?.category?.type}
                                            </span>
                                        </TableCell>
                                        <TableCell
                                            className={`text-right font-medium ${transaction.category?.type === "Pemasukan" ? "text-green-600" : "text-red-600"}`}
                                        >
                                            {transaction.category?.type === "Pemasukan" ? "+" : "-"}
                                            {formatCurrency(transaction.amount)}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleEdit(transaction)}> 
                                                        <Edit className="h-4 w-4" />
                                                        <p>Edit</p>
                                                    </DropdownMenuItem>
                                                    <Button variant="ghost" disabled={deletingTransactionId === transaction.id} onClick={() => handleDeleteTransaction(transaction.id)} className="text-red-600">
                                                        {deletingTransactionId === transaction.id ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-red-600" />}
                                                        <p>Hapus</p>
                                                    </Button>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        No transactions found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 0 && (
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                            Showing {(page - 1) * itemsPerPage + 1} to {Math.min(page * itemsPerPage, filteredTransactions.length)} of{" "}
                            {filteredTransactions.length} entries
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                <span className="sr-only">Previous page</span>
                            </Button>
                            <div className="text-sm font-medium">
                                Page {page} of {totalPages}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                            >
                                <ChevronRight className="h-4 w-4" />
                                <span className="sr-only">Next page</span>
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </SidebarInset>
    )
}

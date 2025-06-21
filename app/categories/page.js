"use client"

import { useEffect, useState } from "react"
import { Edit, Loader, LoaderCircle, Plus, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import axios from "axios"
import api from "@/lib/axios"

export default function CategoriesPage() {
    const [refreshData, setRefreshData] = useState(false)
    const [categories, setCategories] = useState([])
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState(null)
    const [deletingCategoryId, setDeletingCategoryId] = useState(null)
    const [formData, setFormData] = useState ({
        name: "",
        type: "Pengeluaran",
    })
    const [isLoading, setIsLoading] = useState(false)

    const fetchCategories =  async () => {
        try {
            const res = await api.get('/categories')
            setCategories(res.data)
        } catch (error) {
            console.log("Gagal mengambil kategori:", error)
        }
    }
    useEffect(() => {
        fetchCategories()
    }, [refreshData])

    // Handle opening dialog for new category
    const handleAddNew = () => {
        setEditingCategory(null)
        setFormData({ name: "", type: "Pengeluaran" })
        setIsDialogOpen(true)
    }

    // Handle opening dialog for editing category
    const handleEdit = (category) => {
        setEditingCategory(category)
        setFormData({ name: category.name, type: category.type })
        setIsDialogOpen(true)
    }

    const StoreCategoryToDB = async (category) => {
        setIsLoading(true)
        try {
            const res = await api.post('/categories', category)
            return res.data
        } catch (error) {
            console.log("Gagal menyimpan kategori:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const UpdateCategoryFromDB = async (category) => {
        setIsLoading(true)
        try {
            const res = await api.put(`/categories/${category.id}`, category)
            return res.data
        } catch(err) {
            console.log("Gagal menyimpan kategori:", err)
        } finally {
            setIsLoading(false)
        }
    }

    // Handle saving category
    const handleSave = async () => {
        if (!formData.name.trim()) return

        if (editingCategory) {
            // Update existing category
            const updatedCategory = {
                ...editingCategory,
                name: formData.name,
                type: formData.type,
            }
            const updatedCategoryData = await UpdateCategoryFromDB(updatedCategory)
            setCategories(
                categories.map((cat) =>
                    cat.id === editingCategory.id ? updatedCategoryData : cat,
                ),
            )
        } else {
            // Add new category
            const newCategory = {
                id: Math.max(...categories.map((c) => c.id)) + 1,
                name: formData.name,
                type: formData.type,
            }
            const saveCategory = await StoreCategoryToDB(newCategory)
            setRefreshData((prev) => !prev)
            // setCategories([...categories, newCategory])
        }

        setIsDialogOpen(false)
        setFormData({ name: "", type: "Pengeluaran" })
        setEditingCategory(null)
    }

    // Menghapus kategori
    const handleDelete = async (categoryId) => {
        try {
            setDeletingCategoryId(categoryId)
            const res = await api.delete(`/categories/${categoryId}`)
            if (res.status === 200) {
                // setRefreshData(prev =>  !prev)
                // setCategories(categories.filter((cat) => cat.id !== categoryId))
                setCategories(prevCategories => 
                    prevCategories.filter(category => category.id !== categoryId)
                )
            }
        } catch (error) {
            console.error('Gagal menghapus kategori:', error)
        } finally {
            setDeletingCategoryId(null)
        }
    }

    // Handle dialog close
    const handleDialogClose = () => {
        setIsDialogOpen(false)
        setFormData({ name: "", type: "Pengeluaran" })
        setEditingCategory(null)
    }

    return (
        <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                <SidebarTrigger className="-ml-1" />
                <div className="flex flex-1 items-center justify-between">
                    <h1 className="text-xl font-semibold">Manajemen Kategori</h1>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={handleAddNew}>
                                <Plus className="mr-2 h-4 w-4" />
                                Tambah Kategori Baru
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>{editingCategory ? "Edit Kategori" : "Tambah Kategori Baru"}</DialogTitle>
                                <DialogDescription>
                                    {editingCategory
                                        ? "Ubah informasi kategori di bawah ini."
                                        : "Buat kategori baru untuk mengorganisir transaksi Anda."}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nama Kategori</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Masukkan nama kategori"
                                    />
                                </div>
                                <div className="grid gap-3">
                                    <Label>Tipe</Label>
                                    <RadioGroup
                                        value={formData.type}
                                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Pemasukan" id="pemasukan" />
                                            <Label htmlFor="pemasukan">Pemasukan</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Pengeluaran" id="pengeluaran" />
                                            <Label htmlFor="pengeluaran">Pengeluaran</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={handleDialogClose}>
                                    Batal
                                </Button>
                                <Button onClick={handleSave} disabled={!formData.name.trim() || isLoading === true}>
                                    {isLoading ? <Loader className="h-4 w-4 animate-spin"/> : "Simpan"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </header>

            <div className="flex flex-1 flex-col gap-4 p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Kategori</CardTitle>
                        <CardDescription>Kelola kategori pemasukan dan pengeluaran Anda</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama Kategori</TableHead>
                                        <TableHead>Tipe</TableHead>
                                        <TableHead className="w-[100px]">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {categories.length > 0 ? (
                                        categories.map((category) => (
                                            <TableRow key={category.id}>
                                                <TableCell className="font-medium">{category.name}</TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={category.type === "Pemasukan" ? "outline" : "destructive"}
                                                        className={
                                                            category.type === "Pemasukan" ? "border-green-200 bg-green-100 text-green-600" : ""
                                                        }
                                                    >
                                                        {category.type}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleEdit(category)}
                                                            className="h-8 w-8"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                            <span className="sr-only">Edit kategori</span>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDelete(category.id)}
                                                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            disabled={deletingCategoryId === category.id}
                                                        >
                                                            {deletingCategoryId === category.id ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" /> }
                                                            <span className="sr-only">Hapus kategori</span>
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={3} className="h-24 text-center">
                                                Belum ada kategori. Tambahkan kategori pertama Anda.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </SidebarInset>
    )
}

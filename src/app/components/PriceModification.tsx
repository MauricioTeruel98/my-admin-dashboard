import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { Product } from '../types'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowUpDown, Search, Save } from 'lucide-react'
import { Preloader } from './Preloader'
import { Card, CardContent } from "@/components/ui/card"
import { formatPrice } from '@/lib/utils'

export default function PriceModification() {
    const [isLoading, setIsLoading] = useState(true)
    const [products, setProducts] = useState<Product[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [modificationMethod, setModificationMethod] = useState<'percentage' | 'value'>('percentage')
    const [modificationAmount, setModificationAmount] = useState<number>(0)
    const [priceChanges, setPriceChanges] = useState<{ [key: number]: number }>({})
    const [selectedProducts, setSelectedProducts] = useState<{ [key: number]: boolean }>({})

    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        setIsLoading(true)
        try {
            const response = await fetch('/api/products', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) {
                throw new Error('Error fetching products');
            }
            const data = await response.json();
            setProducts(data);
            const initialSelectedProducts = data.reduce((acc: { [key: number]: boolean }, product: Product) => {
                acc[product.id] = false;
                return acc;
            }, {});
            setSelectedProducts(initialSelectedProducts);
        } catch (error) {
            console.error('Error fetching products:', error)
            toast.error('No se pudieron cargar los productos')
        }
        setIsLoading(false)
    }

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value)
    }

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.code.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handlePriceChange = (productId: number, newPrice: number) => {
        setPriceChanges(prev => ({
            ...prev,
            [productId]: newPrice
        }))
    }

    const handleCheckboxChange = (productId: number) => {
        setSelectedProducts(prev => ({
            ...prev,
            [productId]: !prev[productId]
        }))
    }

    const applyModification = () => {
        if (modificationMethod === 'percentage') {
            const updatedPriceChanges = { ...priceChanges }
            filteredProducts.forEach(product => {
                if (selectedProducts[product.id]) {
                    const currentPrice = product.price
                    updatedPriceChanges[product.id] = Number((currentPrice * (1 + modificationAmount / 100)).toFixed(2))
                }
            })
            setPriceChanges(updatedPriceChanges)
        }
    }

    const savePriceChanges = async () => {
        const updates = Object.entries(priceChanges).map(([productId, newPrice]) => ({
            id: parseInt(productId),
            price: newPrice
        }))

        try {
            const response = await fetch('/api/updatePrices', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(updates)
            });

            if (!response.ok) {
                throw new Error('Error updating prices');
            }

            setProducts(products.map(p => {
                const update = updates.find(u => u.id === p.id)
                return update ? { ...p, price: update.price } : p
            }))
            setPriceChanges({})
            toast.success('Precios actualizados exitosamente')
        } catch (error) {
            console.error('Error updating prices:', error)
            toast.error('No se pudieron actualizar los precios')
        }
    }

    return (
        <div className="space-y-4 p-4">
            {isLoading ? (
                <Preloader />
            ) : products.length === 0 ? (
                <p className="text-center text-muted-foreground">No hay productos disponibles para modificar precios. Añade algunos productos primero.</p>
            ) : (
                <>
                    <h2 className="text-xl font-bold">Modificación de Precios</h2>
                    <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                        <div className="relative flex-grow">
                            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Buscar productos por nombre o código..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="pl-8 bg-input text-foreground border-primary w-full"
                            />
                        </div>
                        <Select value={modificationMethod} onValueChange={(value: 'percentage' | 'value') => setModificationMethod(value)}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Método de modificación" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="percentage">Porcentaje</SelectItem>
                                <SelectItem value="value">Valor</SelectItem>
                            </SelectContent>
                        </Select>
                        {modificationMethod === 'percentage' && (
                            <>
                                <div className="flex items-center space-x-2">
                                    <Label htmlFor="modificationAmount" className="text-foreground whitespace-nowrap">
                                        Porcentaje:
                                    </Label>
                                    <Input
                                        id="modificationAmount"
                                        type="number"
                                        value={modificationAmount}
                                        onChange={(e) => setModificationAmount(parseFloat(e.target.value))}
                                        className="w-24 border-primary"
                                    />
                                </div>
                                <Button onClick={applyModification}>Aplicar</Button>

                            </>
                        )}
                    </div>
                    {Object.keys(priceChanges).length > 0 && (
                        <div className="flex justify-end">
                            <Button onClick={savePriceChanges} className="bg-green-500 hover:bg-green-600 text-white">
                                <Save className="mr-2 h-4 w-4" /> Guardar cambios
                            </Button>
                        </div>
                    )}
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {modificationMethod === 'percentage' && (
                                        <TableHead className="text-foreground">Seleccionar</TableHead>
                                    )}
                                    <TableHead className="text-foreground">Producto</TableHead>
                                    <TableHead className="text-foreground">Código</TableHead>
                                    <TableHead className="text-foreground">Precio Actual</TableHead>
                                    <TableHead className="text-foreground">Nuevo Precio</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredProducts.map((product) => (
                                    <TableRow key={product.id}>
                                        {modificationMethod === 'percentage' && (
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedProducts[product.id]}
                                                    onCheckedChange={() => handleCheckboxChange(product.id)}
                                                />
                                            </TableCell>
                                        )}
                                        <TableCell className="text-foreground">{product.name}</TableCell>
                                        <TableCell className="text-foreground">{product.code}</TableCell>
                                        <TableCell className="text-foreground">{formatPrice(product.price)}</TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                value={priceChanges[product.id] || product.price}
                                                onChange={(e) => handlePriceChange(product.id, parseFloat(e.target.value))}
                                                className="w-24 border-primary"
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </>
            )}
        </div>
    )
}
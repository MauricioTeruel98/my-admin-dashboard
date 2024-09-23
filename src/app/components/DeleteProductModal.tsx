import { toast } from 'react-hot-toast'
import { Product } from '../types'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface DeleteProductModalProps {
  productToDelete: Product | null
  isDeleteModalOpen: boolean
  setIsDeleteModalOpen: (isOpen: boolean) => void
  refreshData: () => Promise<void>
}

export default function DeleteProductModal({
  productToDelete,
  isDeleteModalOpen,
  setIsDeleteModalOpen,
  refreshData
}: DeleteProductModalProps) {
  const handleProductDelete = async () => {
    if (!productToDelete) return

    try {
      const response = await fetch(`/api/products?id=${productToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        throw new Error('Error al desactivar producto')
      }

      await refreshData()
      setIsDeleteModalOpen(false)
      toast.success('Producto desactivado exitosamente')
    } catch (error) {
      console.error('Error al desactivar producto:', error)
      toast.error('No se pudo desactivar el producto')
    }
  }

  return (
    <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
      <DialogContent className="bg-background text-foreground">
        <DialogHeader>
          <DialogTitle className="text-foreground">Desactivar Producto</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            ¿Estás seguro de que quieres desactivar este producto? Esta acción no afectará las ventas realizadas.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} className="border-primary text-primary">Cancelar</Button>
          <Button variant="destructive" onClick={handleProductDelete} className="bg-destructive text-destructive-foreground">Desactivar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
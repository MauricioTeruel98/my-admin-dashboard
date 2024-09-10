import { supabase } from '@/supabase/supabase'
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

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productToDelete.id)

    if (error) {
      console.error('Error al eliminar producto:', error)
      toast.error('No se pudo eliminar el producto')
    } else {
      refreshData()
      setIsDeleteModalOpen(false)
      toast.success('Producto eliminado exitosamente')
    }
  }

  return (
    <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar Producto</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</Button>
          <Button variant="destructive" onClick={handleProductDelete}>Eliminar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
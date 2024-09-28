import { useState } from 'react'
import { Sale } from '../types'
import { supabase } from '@/supabase/supabase'
import { toast } from 'react-hot-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2 } from 'lucide-react'

interface DeleteSaleModalProps {
  sale: Sale | null
  isOpen: boolean
  onClose: () => void
  onDelete: () => Promise<void>
  isLoading: boolean
}

export default function DeleteSaleModal({ sale, isOpen, onClose, onDelete, isLoading }: DeleteSaleModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (sale) {
      setIsDeleting(true)
      try {
        // Actualizar el stock de los productos
        for (const item of sale.items) {
          const { error: stockError } = await supabase
            .rpc('update_stock', { p_product_id: item.product_id, p_quantity: item.quantity })

          if (stockError) throw stockError
        }

        // Eliminar los registros de product_sale
        const { error: productSaleError } = await supabase
          .from('product_sale')
          .delete()
          .eq('sale_id', sale.id)

        if (productSaleError) throw productSaleError

        // Eliminar la venta
        const { error: deleteError } = await supabase
          .from('sales')
          .delete()
          .eq('id', sale.id)

        if (deleteError) throw deleteError

        toast.success('Venta eliminada exitosamente')
        onClose()
        await onDelete()
      } catch (error) {
        console.error('Error deleting sale:', error)
        toast.error('No se pudo eliminar la venta')
      } finally {
        setIsDeleting(false)
      }
    }
  }

  if (!sale) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar Venta #{sale.id}</DialogTitle>
        </DialogHeader>
        <p>¿Estás seguro de que quieres eliminar esta venta? Esta acción no se puede deshacer.</p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting || isLoading}>
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              'Eliminar'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
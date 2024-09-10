import { useState } from "react"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface PaginationProps {
  totalItems: number
  itemsPerPage: number
}

export function PaginationDemo({ totalItems, itemsPerPage }: PaginationProps) {
  // Estado de la página actual
  const [currentPage, setCurrentPage] = useState(1)

  // Cálculo del total de páginas
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  // Función para cambiar de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Función para la página siguiente
  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  // Función para la página anterior
  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" onClick={handlePrevious} />
        </PaginationItem>

        {/* Renderizar los enlaces de las páginas */}
        {Array.from({ length: totalPages }, (_, index) => (
          <PaginationItem key={index}>
            <PaginationLink
              href="#"
              isActive={currentPage === index + 1}
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </PaginationLink>
          </PaginationItem>
        ))}

        {/* Ellipsis si hay muchas páginas */}
        {totalPages > 5 && <PaginationEllipsis />}

        <PaginationItem>
          <PaginationNext href="#" onClick={handleNext} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

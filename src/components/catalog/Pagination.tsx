import Link from "next/link";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

// Propiedades para la paginación.
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}

export function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    // Siempre mostrar 1
    // Mostrar current - 1, current, current + 1
    // Siempre mostrar last
    
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const createPageUrl = (page: number | string) => {
    if (typeof page === 'string') return '#';
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}page=${page}`;
  };

  if (totalPages <= 1) return null;
  return (
    <div className="flex justify-center items-center gap-2 mt-12">
      {/* First Page Button */}
      <Link
        href={currentPage > 1 ? createPageUrl(1) : '#'}
        className={`p-2 rounded-lg border border-white/10 transition-all ${
          currentPage > 1 
            ? 'bg-white/5 text-white hover:bg-white/10 hover:border-white/20' 
            : 'bg-transparent text-gray-600 cursor-not-allowed border-transparent'
        }`}
        aria-disabled={currentPage <= 1}
        title="Primera página"
      >
        <ChevronsLeft size={20} />
      </Link>

      {/* Previous Button */}
      <Link
        href={currentPage > 1 ? createPageUrl(currentPage - 1) : '#'}
        className={`p-2 rounded-lg border border-white/10 transition-all ${
          currentPage > 1 
            ? 'bg-white/5 text-white hover:bg-white/10 hover:border-white/20' 
            : 'bg-transparent text-gray-600 cursor-not-allowed border-transparent'
        }`}
        aria-disabled={currentPage <= 1}
      >
        <ChevronLeft size={20} />
      </Link>

      {/* Numeros de pagina */}
      <div className="flex items-center gap-2">
        {getPageNumbers().map((page, index) => (
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="text-gray-500 px-2">...</span>
          ) : (
            <Link
              key={page}
              href={createPageUrl(page)}
              className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-all font-medium ${
                currentPage === page
                  ? 'bg-primary text-white border-primary shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                  : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 hover:border-white/20 hover:text-white'
              }`}
            >
              {page}
            </Link>
          )
        ))}
      </div>

      {/* Boton siguiente */}
      <Link
        href={currentPage < totalPages ? createPageUrl(currentPage + 1) : '#'}
        className={`p-2 rounded-lg border border-white/10 transition-all ${
          currentPage < totalPages
            ? 'bg-white/5 text-white hover:bg-white/10 hover:border-white/20'
            : 'bg-transparent text-gray-600 cursor-not-allowed border-transparent'
        }`}
        aria-disabled={currentPage >= totalPages}
        title="Página siguiente"
      >
        {/* Icono de flecha derecha */}
        <ChevronRight size={20} />
      </Link>

      {/* Last Page Button */}
      <Link
        href={currentPage < totalPages ? createPageUrl(totalPages) : '#'}
        className={`p-2 rounded-lg border border-white/10 transition-all ${
          currentPage < totalPages
            ? 'bg-white/5 text-white hover:bg-white/10 hover:border-white/20'
            : 'bg-transparent text-gray-600 cursor-not-allowed border-transparent'
        }`}
        aria-disabled={currentPage >= totalPages}
        title="Última página"
      >
        <ChevronsRight size={20} />
      </Link>
    </div>
  );
}

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Check } from "lucide-react";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

/**
 * POR QUÉ: Los select nativos tienen menús desplegables que no se pueden estilizar con CSS.
 * QUÉ: Componente Select totalmente personalizado para dropdowns que mantiene la compatibilidad con FormData.
 */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ className, children, defaultValue, value, onChange, name, id, required, disabled, ...props }, ref) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [selectedValue, setSelectedValue] = React.useState<string | number | readonly string[]>(value || defaultValue || "");
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Sincronizar con props de valor si cambian externamente
    React.useEffect(() => {
      if (value !== undefined) setSelectedValue(value);
    }, [value]);

    // Extraer opciones de los children para renderizarlas en nuestro menú personalizado
    const options = React.useMemo(() => {
      return React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === "option") {
          const props = child.props as React.ComponentPropsWithoutRef<"option">;
          return {
            value: props.value ?? "",
            label: props.children,
          };
        }
        return null;
      })?.filter(Boolean) || [];
    }, [children]);

    const selectedLabel = options.find((opt) => String(opt.value) === String(selectedValue))?.label || "Seleccionar...";

    // Cerrar el menú al hacer clic fuera del componente
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };
      if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
      }
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const handleSelect = (val: string | number | readonly string[]) => {
      if (disabled) return;
      setSelectedValue(val);
      setIsOpen(false);
      
      // Emitir evento onChange sintético para que funcione con controladores de formularios
      if (onChange) {
        const event = {
          target: { name, value: String(val), id },
          currentTarget: { name, value: String(val), id },
        } as React.ChangeEvent<HTMLSelectElement>;
        onChange(event);
      }
    };

    return (
      <div className="relative w-full" ref={containerRef}>
        {/* Input oculto para que FormData capture el valor en el servidor */}
        <input 
          type="hidden" 
          name={name} 
          value={String(selectedValue)} 
          required={required}
          ref={ref as any} // Adjuntamos la ref aquí para compatibilidad con librerías de forms
        />
        
        {/* Botón que actúa como el disparador del select */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={cn(
            "h-10 w-full rounded-md border border-white/10 bg-surface px-3 pr-10 text-left text-sm text-foreground transition-all",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary/50",
            "hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed",
            isOpen && "border-primary/50 ring-2 ring-primary",
            className
          )}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className="block truncate">{selectedLabel}</span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-white/40">
            <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", isOpen && "rotate-180")} />
          </span>
        </button>

        {/* Menú desplegable personalizado */}
        {isOpen && (
          <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-white/10 bg-surface p-1 shadow-2xl animate-fade-in">
            {options.map((opt) => {
              const isSelected = String(opt.value) === String(selectedValue);
              return (
                <button
                  key={String(opt.value)}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={cn(
                    "relative flex w-full cursor-pointer select-none items-center rounded-sm py-2 pl-3 pr-9 text-sm text-white/70 transition-colors",
                    "hover:bg-primary/20 hover:text-white outline-none",
                    isSelected && "bg-primary/10 text-primary-light font-medium"
                  )}
                  role="option"
                  aria-selected={isSelected}
                >
                  <span className="block truncate">{opt.label}</span>
                  {isSelected && (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-primary-light">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }
);

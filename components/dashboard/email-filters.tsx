"use client"

import * as React from "react"
import { Calendar as CalendarIcon, Search, X } from "lucide-react"
import { DateRange } from "react-day-picker"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"

const CATEGORIES = ["Pessoal", "Trabalho", "Promoções", "Notificações", "Spam"];

export interface FilterState {
  searchTerm: string;
  category: string;
  dateRange: DateRange | undefined;
}

interface EmailFiltersProps {
  filters: FilterState;
  onFilterChange: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
}

export default function EmailFilters({
  filters,
  onFilterChange,
  onApplyFilters,
  onClearFilters,
}: EmailFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row items-center gap-4 p-4 bg-card border-b">
      <div className="flex items-center gap-2 flex-1 w-full">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Filtrar por remetente ou assunto..."
          className="bg-transparent border-0 focus-visible:ring-0"
          value={filters.searchTerm}
          onChange={(e) => onFilterChange('searchTerm', e.target.value)}
        />
      </div>
      
      <div className="flex items-center gap-2 w-full md:w-auto">
        <Select value={filters.category} onValueChange={(value) => onFilterChange('category', value)}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filtrar por categoria" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-full md:w-[300px] justify-start text-left font-normal",
                !filters.dateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.dateRange?.from ? (
                filters.dateRange.to ? (
                  <>
                    {format(filters.dateRange.from, "LLL dd, y", { locale: ptBR })} -{" "}
                    {format(filters.dateRange.to, "LLL dd, y", { locale: ptBR })}
                  </>
                ) : (
                  format(filters.dateRange.from, "LLL dd, y", { locale: ptBR })
                )
              ) : (
                <span>Selecione um período</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={filters.dateRange?.from}
              selected={filters.dateRange}
              onSelect={(range) => onFilterChange('dateRange', range)}
              numberOfMonths={2}
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex items-center gap-2 w-full md:w-auto">
        <Button onClick={onApplyFilters} className="flex-1 md:flex-none">
            <Search className="mr-2 h-4 w-4" /> Aplicar
        </Button>
        <Button variant="outline" onClick={onClearFilters} className="flex-1 md:flex-none">
            <X className="mr-2 h-4 w-4" /> Limpar
        </Button>
      </div>
    </div>
  )
}

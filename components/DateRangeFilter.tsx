"use client"

import * as React from "react"
import { format, startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, subMonths } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar as CalendarIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { DateRange as ReactDayPickerDateRange } from "react-day-picker"

type DateRange = {
  startDate: Date | null
  endDate: Date | null
}

interface DateRangeFilterProps {
  onDateRangeChange: (range: DateRange) => void
  className?: string
}

type PresetOption = "todos" | "hoje" | "ultimos_7" | "ultimos_30" | "este_mes" | "mes_passado" | "personalizado"

export function DateRangeFilter({ onDateRangeChange, className }: DateRangeFilterProps) {
  const [preset, setPreset] = React.useState<PresetOption>("todos")
  const [customRange, setCustomRange] = React.useState<ReactDayPickerDateRange | undefined>(undefined)
  const [isCustomOpen, setIsCustomOpen] = React.useState(false)

  const getDateRangeForPreset = (presetValue: PresetOption): DateRange => {
    const now = new Date()
    
    switch (presetValue) {
      case "hoje": {
        const today = startOfDay(now)
        return {
          startDate: today,
          endDate: endOfDay(now),
        }
      }
      case "ultimos_7": {
        return {
          startDate: startOfDay(subDays(now, 7)),
          endDate: endOfDay(now),
        }
      }
      case "ultimos_30": {
        return {
          startDate: startOfDay(subDays(now, 30)),
          endDate: endOfDay(now),
        }
      }
      case "este_mes": {
        return {
          startDate: startOfMonth(now),
          endDate: endOfMonth(now),
        }
      }
      case "mes_passado": {
        const lastMonth = subMonths(now, 1)
        return {
          startDate: startOfMonth(lastMonth),
          endDate: endOfMonth(lastMonth),
        }
      }
      case "personalizado": {
        if (customRange?.from && customRange?.to) {
          return {
            startDate: startOfDay(customRange.from),
            endDate: endOfDay(customRange.to),
          }
        }
        return { startDate: null, endDate: null }
      }
      default:
        return { startDate: null, endDate: null }
    }
  }

  const handlePresetChange = (value: PresetOption) => {
    setPreset(value)
    if (value === "personalizado") {
      setIsCustomOpen(true)
    } else {
      setIsCustomOpen(false)
      const range = getDateRangeForPreset(value)
      onDateRangeChange(range)
    }
  }

  const handleCustomRangeSelect = (range: ReactDayPickerDateRange | undefined) => {
    setCustomRange(range)
    if (range?.from && range?.to) {
      const dateRange = {
        startDate: startOfDay(range.from),
        endDate: endOfDay(range.to),
      }
      onDateRangeChange(dateRange)
      setIsCustomOpen(false)
    }
  }

  const handleClear = () => {
    setPreset("todos")
    setCustomRange(undefined)
    onDateRangeChange({ startDate: null, endDate: null })
  }

  const getDisplayText = () => {
    if (preset === "todos") {
      return "Período"
    }
    if (preset === "personalizado" && customRange?.from && customRange?.to) {
      return `${format(customRange.from, "dd/MM/yyyy", { locale: ptBR })} - ${format(customRange.to, "dd/MM/yyyy", { locale: ptBR })}`
    }
    const range = getDateRangeForPreset(preset)
    if (range.startDate && range.endDate) {
      return `${format(range.startDate, "dd/MM/yyyy", { locale: ptBR })} - ${format(range.endDate, "dd/MM/yyyy", { locale: ptBR })}`
    }
    return "Período"
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Select value={preset} onValueChange={handlePresetChange}>
        <SelectTrigger className="border-primary/20 focus:border-primary w-[180px]">
          <SelectValue placeholder="Período" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos</SelectItem>
          <SelectItem value="hoje">Hoje</SelectItem>
          <SelectItem value="ultimos_7">Últimos 7 dias</SelectItem>
          <SelectItem value="ultimos_30">Últimos 30 dias</SelectItem>
          <SelectItem value="este_mes">Este mês</SelectItem>
          <SelectItem value="mes_passado">Mês passado</SelectItem>
          <SelectItem value="personalizado">Intervalo personalizado</SelectItem>
        </SelectContent>
      </Select>

      {preset === "personalizado" && (
        <Popover open={isCustomOpen} onOpenChange={setIsCustomOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[280px] justify-start text-left font-normal border-primary/20 focus:border-primary",
                !customRange?.from && !customRange?.to && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {customRange?.from && customRange?.to ? (
                `${format(customRange.from, "dd/MM/yyyy", { locale: ptBR })} - ${format(customRange.to, "dd/MM/yyyy", { locale: ptBR })}`
              ) : (
                <span>Selecione o intervalo</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={customRange?.from}
              selected={customRange}
              onSelect={handleCustomRangeSelect}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      )}

      {((preset !== "todos" && preset !== "personalizado") || (preset === "personalizado" && (customRange?.from || customRange?.to))) && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClear}
          className="h-10 w-10"
          title="Limpar filtro"
        >
          <X className="h-4 w-4" />
        </Button>
      )}

      {preset !== "personalizado" && preset !== "todos" && (
        <span className="text-sm text-muted-foreground hidden sm:inline">
          {getDisplayText()}
        </span>
      )}
    </div>
  )
}


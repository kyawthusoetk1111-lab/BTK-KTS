"use client"
import * as React from "react"
import { ChevronsUpDown, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface ComboboxProps {
  options: { label: string; value: string }[]
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyStateMessage?: string
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  searchPlaceholder = "Search...",
  emptyStateMessage = "No results found."
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")

  const filteredOptions = searchTerm
    ? options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options

  const selectedLabel = options.find(option => option.value === value)?.label

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {value ? selectedLabel : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[--radix-popover-trigger-width] p-0"
        onPointerDownOutside={(e) => {
          // This prevents the dialog from closing the popover when interacting with it.
          const target = e.target as HTMLElement;
          if (target.closest('[role="dialog"]')) {
            e.preventDefault();
          }
        }}
      >
        <div className="p-2">
            <Input
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="h-9"
            />
        </div>
        <ScrollArea className="h-60">
            <div className="p-2 pt-0">
                {filteredOptions.length > 0 ? (
                    filteredOptions.map(option => (
                    <Button
                        key={option.value}
                        variant="ghost"
                        className="w-full justify-start font-normal"
                        onClick={() => {
                            onChange(option.value)
                            setOpen(false)
                            setSearchTerm("")
                        }}
                    >
                        <Check
                        className={cn(
                            "mr-2 h-4 w-4",
                            value === option.value ? "opacity-100" : "opacity-0"
                        )}
                        />
                        {option.label}
                    </Button>
                    ))
                ) : (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                        {emptyStateMessage}
                    </div>
                )}
            </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}

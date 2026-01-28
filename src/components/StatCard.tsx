import { cn, formatCurrency } from "@/lib/utils"
import { Card, CardContent } from "./ui/card"

// Reusable Stat Component for cleaner code
export function StatCard({ 
  title, 
  icon, 
  value, 
  isLoading, 
  subtext, 
  isCurrency = false,
  bgClass,
  className="",
}: { 
  title: string, 
  icon: React.ReactNode, 
  value?: number, 
  isLoading: boolean, 
  subtext?: string,
  isCurrency?: boolean,
  bgClass?: string
  className?: string
}) {
  return (
    <Card className={cn(
      "overflow-hidden border-none shadow-sm ring-1",
      className 
    )}>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${bgClass}`}>
            {icon}
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {isLoading ? (
              <div className="h-7 w-20 bg-slate-300 animate-pulse rounded-full" />
            ) : (
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold tracking-tight">
                  {isCurrency && value ? formatCurrency(value) : value ?? 0}
                </h3>
              </div>
            )}
            {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
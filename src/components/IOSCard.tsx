import { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface IOSCardProps {
  children: ReactNode
  title?: string
  subtitle?: string
  icon?: ReactNode
  onPress?: () => void
  showChevron?: boolean
  className?: string
}

export function IOSCard({ 
  children, 
  title, 
  subtitle, 
  icon, 
  onPress, 
  showChevron = false,
  className 
}: IOSCardProps) {
  const isClickable = !!onPress

  return (
    <div 
      className={cn(
        "bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm",
        isClickable && "active:scale-[0.98] transition-transform cursor-pointer",
        className
      )}
      onClick={onPress}
    >
      {(title || subtitle) && (
        <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between min-h-[60px]">
          <div className="flex items-center space-x-3">
            {icon && (
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                {icon}
              </div>
            )}
            <div className="flex-1 min-w-0">
              {title && <h3 className="font-semibold text-base ios-text-fixed">{title}</h3>}
              {subtitle && <p className="text-sm text-muted-foreground ios-text-wrap">{subtitle}</p>}
            </div>
          </div>
          {showChevron && (
            <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          )}
        </div>
      )}
      <div className="p-5">
        {children}
      </div>
    </div>
  )
}
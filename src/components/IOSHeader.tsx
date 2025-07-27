import { ArrowLeft, Settings, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface IOSHeaderProps {
  title: string
  subtitle?: string
  onBack?: () => void
  onSettings?: () => void
  onMore?: () => void
  className?: string
}

export function IOSHeader({ 
  title, 
  subtitle, 
  onBack, 
  onSettings, 
  onMore, 
  className 
}: IOSHeaderProps) {
  return (
    <div className={cn(
      "bg-background/95 backdrop-blur-md border-b border-border/50 px-4 py-4 safe-area-top",
      className
    )}>
      <div className="flex items-center justify-between min-h-[44px]">
        <div className="flex items-center space-x-3">
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="h-10 w-10 rounded-full touch-target"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold leading-tight ios-text-fixed">{title}</h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground ios-text-fixed">{subtitle}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2 flex-shrink-0">
          {onSettings && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onSettings}
              className="h-10 w-10 rounded-full touch-target"
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}
          {onMore && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMore}
              className="h-10 w-10 rounded-full touch-target"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
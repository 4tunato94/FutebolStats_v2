import { useState } from 'react'
import { Maximize2, Play, Pause, RotateCcw, Plus, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FieldGrid } from '@/components/FieldGrid'
import { useFutebolStore } from '@/stores/futebolStore'
import { IOSActionSheet } from '@/components/IOSActionSheet'
import { ActionPanel } from '@/components/ActionPanel'
import { RecentActions } from '@/components/RecentActions'
import { cn } from '@/lib/utils'

export function IOSFieldView() {
  const { currentMatch, togglePlayPause, updateTimer, endMatch } = useFutebolStore()
  const [showFullscreen, setShowFullscreen] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const [showRecentActions, setShowRecentActions] = useState(false)
  const [timer, setTimer] = useState(0)

  // Timer functionality
  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (currentMatch?.isPlaying) {
      interval = setInterval(() => {
        setTimer(prev => {
          const newTime = prev + 1
          updateTimer(newTime)
          return newTime
        })
      }, 1000)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [currentMatch?.isPlaying, updateTimer])

  React.useEffect(() => {
    if (currentMatch) {
      setTimer(currentMatch.currentTime)
    }
  }, [currentMatch])

  if (!currentMatch) return null

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const resetTimer = () => {
    setTimer(0)
    updateTimer(0)
  }

  if (showFullscreen) {
    return <FullscreenField onClose={() => setShowFullscreen(false)} />
  }

  return (
    <div className="flex flex-col h-full">
      {/* Timer and Controls */}
      <div className="bg-card/50 backdrop-blur-sm border-b border-border/50 px-5 py-4">
        <div className="flex items-center justify-between min-h-[44px]">
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="icon"
              onClick={togglePlayPause}
              className="h-12 w-12 rounded-full touch-target"
            >
              {currentMatch.isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>
            
            <div className="text-3xl font-mono font-bold ios-text-fixed">
              {formatTime(timer)}
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={resetTimer}
              className="h-12 w-12 rounded-full touch-target"
            >
              <RotateCcw className="h-5 w-5" />
            </Button>
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFullscreen(true)}
            className="h-12 w-12 rounded-full touch-target"
          >
            <Maximize2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Possession Buttons */}
      <div className="px-5 py-2 bg-muted/30">
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-12 rounded-xl transition-all duration-200 flex items-center justify-center touch-target no-select",
              currentMatch.currentPossession === currentMatch.teamA.id && 
              "ring-2 ring-primary scale-105 bg-primary/10"
            )}
            onClick={() => useFutebolStore.getState().setPossession(currentMatch.teamA.id)}
          >
            <img 
              src={currentMatch.teamA.logoUrl} 
              alt={`${currentMatch.teamA.name} logo`}
              className="w-8 h-8 object-contain"
            />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-12 rounded-xl transition-all duration-200 flex items-center justify-center touch-target no-select",
              currentMatch.currentPossession === currentMatch.teamB.id && 
              "ring-2 ring-primary scale-105 bg-primary/10"
            )}
            onClick={() => useFutebolStore.getState().setPossession(currentMatch.teamB.id)}
          >
            <img 
              src={currentMatch.teamB.logoUrl} 
              alt={`${currentMatch.teamB.name} logo`}
              className="w-8 h-8 object-contain"
            />
          </Button>
        </div>
      </div>

      {/* Field */}
      <div className="flex-1 p-5 relative">
        <div className="h-full rounded-2xl overflow-hidden">
          <FieldGrid />
        </div>
        
        {/* Recent Actions Button */}
        <div className="absolute top-1/2 left-2 transform -translate-y-1/2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowRecentActions(!showRecentActions)}
            className="h-12 w-12 rounded-full shadow-lg touch-target"
          >
            <ChevronLeft className={cn(
              "h-6 w-6 transition-transform duration-200",
              showRecentActions && "rotate-180"
            )} />
          </Button>
        </div>
        
        {/* Floating Actions Button */}
        <div className="absolute bottom-6 right-6 z-10">
          <Button
            variant="default"
            size="icon"
            onClick={() => setShowActions(true)}
            className="h-16 w-16 rounded-full shadow-lg touch-target"
          >
            <Plus className="h-8 w-8" />
          </Button>
        </div>
        
        {/* Recent Actions Panel */}
        {showRecentActions && (
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-background/95 backdrop-blur-sm border-r border-border/50 rounded-r-2xl shadow-lg z-20">
            <RecentActions />
          </div>
        )}
      </div>

      {/* Actions Sheet */}
      <IOSActionSheet
        isOpen={showActions}
        onClose={() => setShowActions(false)}
        title="Registrar Ação"
      >
        <div className="p-5">
          <ActionPanel onClose={() => setShowActions(false)} />
        </div>
      </IOSActionSheet>
    </div>
  )
}

// Componente para tela cheia
function FullscreenField({ onClose }: { onClose: () => void }) {
  const { currentMatch } = useFutebolStore()
  const [showActions, setShowActions] = useState(false)
  const [showRecentActions, setShowRecentActions] = useState(false)

  if (!currentMatch) return null

  return (
    <div className="fixed inset-0 bg-background z-50 flex">
      {/* Recent Actions Panel */}
      {showRecentActions && (
        <div className="w-80 bg-background border-r border-border/50 shadow-lg">
          <RecentActions />
        </div>
      )}
      
      {/* Main Field Area */}
      <div className="flex-1 relative">
        {/* Header Controls */}
        <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
          <Button
            variant="outline"
            size="icon"
            onClick={onClose}
            className="h-12 w-12 rounded-full bg-background/80 backdrop-blur-sm"
          >
            <X className="h-6 w-6" />
          </Button>
          
          <div className="flex items-center space-x-4 bg-background/80 backdrop-blur-sm rounded-full px-6 py-3">
            <div className="text-2xl font-mono font-bold">
              {formatTime(currentMatch.currentTime)}
            </div>
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowRecentActions(!showRecentActions)}
            className="h-12 w-12 rounded-full bg-background/80 backdrop-blur-sm"
          >
            <ChevronLeft className={cn(
              "h-6 w-6 transition-transform duration-200",
              showRecentActions && "rotate-180"
            )} />
          </Button>
        </div>
        
        {/* Possession Buttons */}
        <div className="absolute top-20 left-4 right-4 z-10">
          <div className="flex justify-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-10 px-4 rounded-xl bg-background/80 backdrop-blur-sm",
                currentMatch.currentPossession === currentMatch.teamA.id && 
                "ring-2 ring-primary bg-primary/20"
              )}
              onClick={() => useFutebolStore.getState().setPossession(currentMatch.teamA.id)}
            >
              <img 
                src={currentMatch.teamA.logoUrl} 
                alt={`${currentMatch.teamA.name} logo`}
                className="w-6 h-6 object-contain mr-2"
              />
              {currentMatch.teamA.name}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-10 px-4 rounded-xl bg-background/80 backdrop-blur-sm",
                currentMatch.currentPossession === currentMatch.teamB.id && 
                "ring-2 ring-primary bg-primary/20"
              )}
              onClick={() => useFutebolStore.getState().setPossession(currentMatch.teamB.id)}
            >
              <img 
                src={currentMatch.teamB.logoUrl} 
                alt={`${currentMatch.teamB.name} logo`}
                className="w-6 h-6 object-contain mr-2"
              />
              {currentMatch.teamB.name}
            </Button>
          </div>
        </div>
        
        {/* Field */}
        <div className="absolute inset-0 pt-32 pb-20 px-4">
          <FieldGrid isFullscreen={true} />
        </div>
        
        {/* Actions Button */}
        <div className="absolute bottom-6 right-6 z-10">
          <Button
            variant="default"
            size="icon"
            onClick={() => setShowActions(true)}
            className="h-16 w-16 rounded-full shadow-lg"
          >
            <Plus className="h-8 w-8" />
          </Button>
        </div>
      </div>
      
      {/* Actions Sheet */}
      <IOSActionSheet
        isOpen={showActions}
        onClose={() => setShowActions(false)}
        title="Registrar Ação"
      >
        <div className="p-5">
          <ActionPanel onClose={() => setShowActions(false)} />
        </div>
      </IOSActionSheet>
    </div>
  )
}
import { Clock, Play, Pause, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useFutebolStore } from '@/stores/futebolStore'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export function PossessionControl() {
  const { currentMatch, setPossession, updateTimer, togglePlayPause } = useFutebolStore()
  const [timer, setTimer] = useState(0)

  useEffect(() => {
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

  useEffect(() => {
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

  return (
    <Card className="shadow-card">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Cronômetro */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <Button
                variant="outline"
                size="icon"
                onClick={togglePlayPause}
              >
                {currentMatch.isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
              
              <div className="text-3xl font-mono font-bold">
                {formatTime(timer)}
              </div>
              
              <Button
                variant="outline"
                size="icon"
                onClick={resetTimer}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Controle de Posse */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Posse de Bola
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="teamA"
                size="xl"
                className={cn(
                  "transition-all duration-200 flex items-center justify-center",
                  currentMatch.currentPossession === currentMatch.teamA.id && 
                  "ring-4 ring-team-a/50 scale-105"
                )}
                style={{
                  backgroundColor: currentMatch.teamA.colors.primary,
                  borderColor: currentMatch.teamA.colors.secondary
                }}
                onClick={() => setPossession(currentMatch.teamA.id)}
              >
                {currentMatch.teamA.logoUrl ? (
                  <img 
                    src={currentMatch.teamA.logoUrl} 
                    alt={`${currentMatch.teamA.name} logo`}
                    className="w-8 h-8 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      const parent = target.parentElement
                      if (parent) {
                        parent.innerHTML = `<div class="font-bold text-sm px-2">${currentMatch.teamA.name}</div>`
                      }
                    }}
                  />
                ) : (
                  <div className="font-bold text-sm px-2">{currentMatch.teamA.name}</div>
                )}
              </Button>
              
              <Button
                variant="teamB"
                size="xl"
                className={cn(
                  "transition-all duration-200 flex items-center justify-center",
                  currentMatch.currentPossession === currentMatch.teamB.id && 
                  "ring-4 ring-team-b/50 scale-105"
                )}
                style={{
                  backgroundColor: currentMatch.teamB.colors.primary,
                  borderColor: currentMatch.teamB.colors.secondary
                }}
                onClick={() => setPossession(currentMatch.teamB.id)}
              >
                {currentMatch.teamB.logoUrl ? (
                  <img 
                    src={currentMatch.teamB.logoUrl} 
                    alt={`${currentMatch.teamB.name} logo`}
                    className="w-8 h-8 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      const parent = target.parentElement
                      if (parent) {
                        parent.innerHTML = `<div class="font-bold text-sm px-2">${currentMatch.teamB.name}</div>`
                      }
                    }}
                  />
                ) : (
                  <div className="font-bold text-sm px-2">{currentMatch.teamB.name}</div>
                )}
              </Button>
            </div>
            
            {!currentMatch.currentPossession && (
              <p className="text-center text-sm text-muted-foreground">
                Selecione o time que está com a posse de bola
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
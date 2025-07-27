
import { useState, useEffect } from 'react'
import { useFutebolStore } from '@/stores/futebolStore'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface FieldGridProps {
  isFullscreen?: boolean
}

export function FieldGrid({ isFullscreen = false }: FieldGridProps) {
  const { currentMatch, addAction } = useFutebolStore()
  const [markedZones, setMarkedZones] = useState<Set<string>>(new Set())
  const [lastPossession, setLastPossession] = useState<string | null>(null)

  if (!currentMatch) return null

  // Limpar marcações quando a posse mudar
  useEffect(() => {
    if (currentMatch.currentPossession !== lastPossession) {
      setMarkedZones(new Set())
      setLastPossession(currentMatch.currentPossession)
    }
  }, [currentMatch.currentPossession, lastPossession])
  const handleZoneClick = (row: number, col: number) => {
    if (!currentMatch.currentPossession) {
      alert('Selecione o time que está com a posse de bola!')
      return
    }

    // Marcar a zona clicada
    const zoneKey = `${row}-${col}`
    setMarkedZones(prev => new Set([...prev, zoneKey]))
    addAction({
      type: 'possession',
      teamId: currentMatch.currentPossession,
      zone: { row, col }
    })
  }

  const getZoneIntensity = (row: number, col: number) => {
    const zoneActions = currentMatch.actions.filter(
      action => action.zone?.row === row && action.zone?.col === col && action.type === 'possession'
    )
    
    const teamAActions = zoneActions.filter(a => a.teamId === currentMatch.teamA.id).length
    const teamBActions = zoneActions.filter(a => a.teamId === currentMatch.teamB.id).length
    
    return { teamA: teamAActions, teamB: teamBActions, total: zoneActions.length }
  }

  const getZoneStyle = (row: number, col: number) => {
    const zoneKey = `${row}-${col}`
    const isMarked = markedZones.has(zoneKey)
    
    if (isMarked) {
      return {
        backgroundColor: 'rgba(59, 130, 246, 0.6)', // blue-500 with opacity
      }
    }
    
    const intensity = getZoneIntensity(row, col)
    if (intensity.total === 0) return {}
    
    const dominantTeam = intensity.teamA > intensity.teamB ? currentMatch.teamA : currentMatch.teamB
    const opacity = Math.min(intensity.total * 0.15 + 0.2, 0.7)
    
    return {
      backgroundColor: dominantTeam.colors.primary,
      opacity: opacity
    }
  }

  return (
    <div className={cn(
      "relative rounded-xl overflow-hidden shadow-field",
      isFullscreen 
        ? "w-full h-full min-h-0 min-w-0 landscape:min-w-[800px] landscape:min-h-[500px]" 
        : "aspect-[3/2] w-full max-w-4xl mx-auto"
    )}>
      {/* Imagem do campo como fundo */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/image.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      
      {/* Overlay sutil para melhor contraste */}
      <div className="absolute inset-0 bg-black/10" />
      
      {/* Grid de zonas 5x5 invisível - sem espaçamento */}
      <div className="absolute inset-0 grid grid-cols-5 grid-rows-5">
        {Array.from({ length: 25 }, (_, index) => {
          const row = Math.floor(index / 5)
          const col = index % 5
          const zoneKey = `${row}-${col}`
          const isMarked = markedZones.has(zoneKey)
          
          return (
            <button
              key={`${row}-${col}`}
              className={cn(
                "relative border-0 bg-transparent hover:bg-white/30 transition-all duration-200 touch-target",
                isMarked && "bg-blue-500/60 ring-2 ring-blue-300/80"
              )}
              style={getZoneStyle(row, col)}
              onClick={() => handleZoneClick(row, col)}
            >
              {/* Indicador de intensidade */}
              {getZoneIntensity(row, col).total > 0 && (
                <div className="absolute top-2 right-2 w-4 h-4 bg-white rounded-full opacity-90 shadow-lg border border-gray-300" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SavedGame, Match, ZoneStats } from '@/types/futebol'

interface HeatMapProps {
  game: SavedGame | Match
}

export function HeatMap({ game }: HeatMapProps) {
  const heatMapData = useMemo(() => {
    // Create 5x5 grid
    const grid: ZoneStats[][] = Array(5).fill(null).map(() => 
      Array(5).fill(null).map(() => ({ teamA: 0, teamB: 0, total: 0 }))
    )
    
    // Count actions per zone
    game.actions.forEach(action => {
      const { row, col } = action.zone
      if (row >= 0 && row < 5 && col >= 0 && col < 5) {
        if (action.teamId === game.teamA.id) {
          grid[row][col].teamA++
        } else {
          grid[row][col].teamB++
        }
        grid[row][col].total++
      }
    })
    
    // Find max for normalization
    const maxTotal = Math.max(...grid.flat().map(cell => cell.total))
    
    return { grid, maxTotal }
  }, [game])

  const getHeatColor = (intensity: number, maxIntensity: number) => {
    if (maxIntensity === 0) return 'rgba(255, 255, 0, 0.1)' // Very light yellow
    
    const normalized = intensity / maxIntensity
    
    if (normalized === 0) return 'rgba(255, 255, 0, 0.1)' // Very light yellow
    if (normalized <= 0.25) return 'rgba(255, 255, 0, 0.4)' // Light yellow
    if (normalized <= 0.5) return 'rgba(255, 200, 0, 0.6)' // Yellow-orange
    if (normalized <= 0.75) return 'rgba(255, 100, 0, 0.8)' // Orange-red
    return 'rgba(255, 0, 0, 0.9)' // Dark red
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>Mapa de Calor - Posse de Bola</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Legend */}
          <div className="flex items-center justify-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(255, 255, 0, 0.4)' }}></div>
              <span>Baixa atividade</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(255, 100, 0, 0.8)' }}></div>
              <span>Média atividade</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(255, 0, 0, 0.9)' }}></div>
              <span>Alta atividade</span>
            </div>
          </div>
          
          {/* Heat Map Grid */}
          <div className="relative bg-field-green rounded-lg p-4" style={{ aspectRatio: '16/10' }}>
            {/* Field markings */}
            <div className="absolute inset-0 border-2 border-white rounded-lg">
              {/* Center circle */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 border-2 border-white rounded-full"></div>
              {/* Center line */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-white"></div>
              {/* Penalty areas */}
              <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-12 h-32 border-2 border-white border-l-0"></div>
              <div className="absolute top-1/2 right-0 transform -translate-y-1/2 w-12 h-32 border-2 border-white border-r-0"></div>
            </div>
            
            {/* Heat zones overlay */}
            <div className="absolute inset-0 grid grid-cols-5 grid-rows-5 gap-0">
              {heatMapData.grid.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className="relative border border-transparent hover:border-white/50 transition-colors"
                    style={{
                      backgroundColor: getHeatColor(cell.total, heatMapData.maxTotal)
                    }}
                    title={`Zona ${rowIndex + 1}-${colIndex + 1}: ${cell.total} ações (${game.teamA.name}: ${cell.teamA}, ${game.teamB.name}: ${cell.teamB})`}
                  >
                    {cell.total > 0 && (
                      <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow-lg">
                        {cell.total}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Stats summary */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 rounded bg-muted">
              <div className="font-semibold" style={{ color: game.teamA.colors.primary }}>
                {game.teamA.name}
              </div>
              <div className="text-sm text-muted-foreground">
                {game.actions.filter(a => a.teamId === game.teamA.id).length} ações
              </div>
            </div>
            <div className="p-3 rounded bg-muted">
              <div className="font-semibold" style={{ color: game.teamB.colors.primary }}>
                {game.teamB.name}
              </div>
              <div className="text-sm text-muted-foreground">
                {game.actions.filter(a => a.teamId === game.teamB.id).length} ações
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
import { useState } from 'react'
import { Download, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { SavedGame, Match } from '@/types/futebol'
import { useFutebolStore } from '@/stores/futebolStore'
import html2canvas from 'html2canvas'

interface HeatMapExportDialogProps {
  isOpen: boolean
  onClose: () => void
  game: SavedGame | Match
}

export function HeatMapExportDialog({ isOpen, onClose, game }: HeatMapExportDialogProps) {
  const { actionTypes } = useFutebolStore()
  const [selectedActions, setSelectedActions] = useState<string[]>([])
  const [showCounts, setShowCounts] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  // Get unique action names from the game
  const gameActionNames = Array.from(new Set(
    game.actions
      .filter(action => action.actionName)
      .map(action => action.actionName!)
  ))

  const handleActionToggle = (actionName: string) => {
    if (selectedActions.includes(actionName)) {
      setSelectedActions(selectedActions.filter(name => name !== actionName))
    } else {
      setSelectedActions([...selectedActions, actionName])
    }
  }

  const selectAll = () => {
    setSelectedActions([...gameActionNames, 'Posse de Bola'])
  }

  const selectNone = () => {
    setSelectedActions([])
  }

  const exportHeatMap = async () => {
    setIsExporting(true)
    
    try {
      // Create a temporary container for the heat map
      const container = document.createElement('div')
      container.style.position = 'absolute'
      container.style.left = '-9999px'
      container.style.top = '-9999px'
      container.style.width = '800px'
      container.style.height = '600px'
      container.style.backgroundColor = 'white'
      container.style.padding = '20px'
      document.body.appendChild(container)

      // Filter actions based on selection
      const filteredActions = game.actions.filter(action => {
        if (action.type === 'possession' && selectedActions.includes('Posse de Bola')) {
          return true
        }
        if (action.actionName && selectedActions.includes(action.actionName)) {
          return true
        }
        return false
      })

      // Create heat map data
      const grid = Array(5).fill(null).map(() => 
        Array(5).fill(null).map(() => ({ teamA: 0, teamB: 0, total: 0 }))
      )
      
      filteredActions.forEach(action => {
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

      const maxTotal = Math.max(...grid.flat().map(cell => cell.total))

      const getHeatColor = (intensity: number, maxIntensity: number) => {
        if (maxIntensity === 0) return 'rgba(255, 255, 0, 0.1)'
        const normalized = intensity / maxIntensity
        if (normalized === 0) return 'rgba(255, 255, 0, 0.1)'
        if (normalized <= 0.25) return 'rgba(255, 255, 0, 0.4)'
        if (normalized <= 0.5) return 'rgba(255, 200, 0, 0.6)'
        if (normalized <= 0.75) return 'rgba(255, 100, 0, 0.8)'
        return 'rgba(255, 0, 0, 0.9)'
      }

      // Create the heat map HTML
      container.innerHTML = `
        <div style="font-family: Arial, sans-serif;">
          <h2 style="text-align: center; margin-bottom: 20px; color: #333;">
            Mapa de Calor - ${game.teamA.name} vs ${game.teamB.name}
          </h2>
          
          <div style="position: relative; width: 760px; height: 480px; background: #4ade80; border-radius: 8px; margin: 0 auto;">
            <!-- Field markings -->
            <div style="position: absolute; inset: 0; border: 2px solid white; border-radius: 8px;">
              <!-- Center circle -->
              <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 80px; height: 80px; border: 2px solid white; border-radius: 50%;"></div>
              <!-- Center line -->
              <div style="position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 2px; height: 100%; background: white;"></div>
              <!-- Penalty areas -->
              <div style="position: absolute; top: 50%; left: 0; transform: translateY(-50%); width: 48px; height: 128px; border: 2px solid white; border-left: none;"></div>
              <div style="position: absolute; top: 50%; right: 0; transform: translateY(-50%); width: 48px; height: 128px; border: 2px solid white; border-right: none;"></div>
            </div>
            
            <!-- Heat zones -->
            <div style="position: absolute; inset: 0; display: grid; grid-template-columns: repeat(5, 1fr); grid-template-rows: repeat(5, 1fr);">
              ${grid.map((row, rowIndex) =>
                row.map((cell, colIndex) => `
                  <div style="
                    position: relative;
                    background-color: ${getHeatColor(cell.total, maxTotal)};
                    display: flex;
                    align-items: center;
                    justify-content: center;
                  ">
                    ${showCounts && cell.total > 0 ? `
                      <div style="
                        font-size: 12px;
                        font-weight: bold;
                        color: white;
                        text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
                      ">${cell.total}</div>
                    ` : ''}
                  </div>
                `).join('')
              ).join('')}
            </div>
          </div>
          
          <!-- Legend -->
          <div style="display: flex; justify-content: center; align-items: center; margin-top: 20px; gap: 20px; font-size: 14px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 16px; height: 16px; background: rgba(255, 255, 0, 0.4); border-radius: 2px;"></div>
              <span>Baixa atividade</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 16px; height: 16px; background: rgba(255, 100, 0, 0.8); border-radius: 2px;"></div>
              <span>Média atividade</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 16px; height: 16px; background: rgba(255, 0, 0, 0.9); border-radius: 2px;"></div>
              <span>Alta atividade</span>
            </div>
          </div>
          
          <!-- Stats -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; text-align: center;">
            <div style="padding: 12px; background: #f3f4f6; border-radius: 8px;">
              <div style="font-weight: bold; color: ${game.teamA.colors.primary};">${game.teamA.name}</div>
              <div style="font-size: 12px; color: #666;">
                ${filteredActions.filter(a => a.teamId === game.teamA.id).length} ações
              </div>
            </div>
            <div style="padding: 12px; background: #f3f4f6; border-radius: 8px;">
              <div style="font-weight: bold; color: ${game.teamB.colors.primary};">${game.teamB.name}</div>
              <div style="font-size: 12px; color: #666;">
                ${filteredActions.filter(a => a.teamId === game.teamB.id).length} ações
              </div>
            </div>
          </div>
          
          ${selectedActions.length > 0 ? `
            <div style="margin-top: 20px; padding: 12px; background: #f9fafb; border-radius: 8px;">
              <div style="font-weight: bold; margin-bottom: 8px;">Ações incluídas:</div>
              <div style="font-size: 12px; color: #666;">
                ${selectedActions.join(', ')}
              </div>
            </div>
          ` : ''}
        </div>
      `

      // Generate image
      const canvas = await html2canvas(container, {
        backgroundColor: '#ffffff',
        scale: 2,
        width: 800,
        height: 600
      })

      // Download image
      const link = document.createElement('a')
      link.download = `mapa_calor_${game.teamA.name.replace(/\s/g, '_')}_vs_${game.teamB.name.replace(/\s/g, '_')}.png`
      link.href = canvas.toDataURL()
      link.click()

      // Clean up
      document.body.removeChild(container)
      
    } catch (error) {
      console.error('Erro ao exportar mapa de calor:', error)
    } finally {
      setIsExporting(false)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Exportar Mapa de Calor</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label className="text-base font-medium">Selecionar Ações para Incluir</Label>
            <div className="flex space-x-2 mt-2">
              <Button variant="outline" size="sm" onClick={selectAll}>
                Selecionar Todas
              </Button>
              <Button variant="outline" size="sm" onClick={selectNone}>
                Limpar Seleção
              </Button>
            </div>
          </div>
          
          <div className="max-h-48 overflow-y-auto space-y-2 border rounded-lg p-3">
            {/* Posse de Bola */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="possession"
                checked={selectedActions.includes('Posse de Bola')}
                onCheckedChange={() => handleActionToggle('Posse de Bola')}
              />
              <Label htmlFor="possession" className="text-sm">
                Posse de Bola ({game.actions.filter(a => a.type === 'possession').length})
              </Label>
            </div>
            
            {/* Ações Específicas */}
            {gameActionNames.map((actionName) => {
              const count = game.actions.filter(a => a.actionName === actionName).length
              return (
                <div key={actionName} className="flex items-center space-x-2">
                  <Checkbox
                    id={actionName}
                    checked={selectedActions.includes(actionName)}
                    onCheckedChange={() => handleActionToggle(actionName)}
                  />
                  <Label htmlFor={actionName} className="text-sm">
                    {actionName} ({count})
                  </Label>
                </div>
              )
            })}
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-counts-export"
              checked={showCounts}
              onCheckedChange={setShowCounts}
            />
            <Label htmlFor="show-counts-export" className="text-sm">
              Mostrar contadores na imagem
            </Label>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={exportHeatMap} 
              disabled={selectedActions.length === 0 || isExporting}
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? 'Exportando...' : 'Exportar PNG'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
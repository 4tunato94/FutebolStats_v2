import { useState, useRef } from 'react'
import { Settings, Users, Save, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useFutebolStore } from '@/stores/futebolStore'
import { Team, Player } from '@/types/futebol'
import { cn } from '@/lib/utils'

interface TacticalSetupProps {
  isOpen: boolean
  onClose: () => void
  teamA: Team
  teamB: Team
}

interface DraggablePlayerProps {
  player: Player
  onPositionChange: (playerId: string, position: { x: number; y: number }) => void
  teamColor: string
}

function DraggablePlayer({ player, onPositionChange, teamColor }: DraggablePlayerProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState(player.fieldPosition || { x: 50, y: 50 })
  const dragRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    e.preventDefault()
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragRef.current) return

    const rect = dragRef.current.parentElement?.getBoundingClientRect()
    if (!rect) return

    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    const newPosition = {
      x: Math.max(5, Math.min(95, x)),
      y: Math.max(5, Math.min(95, y))
    }

    setPosition(newPosition)
    onPositionChange(player.id, newPosition)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  return (
    <div
      ref={dragRef}
      className={cn(
        "absolute w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm cursor-move transition-transform hover:scale-110",
        isDragging && "scale-110 z-10"
      )}
      style={{
        backgroundColor: teamColor,
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)'
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {player.number}
    </div>
  )
}

export function TacticalSetup({ isOpen, onClose, teamA, teamB }: TacticalSetupProps) {
  const { updateTeam } = useFutebolStore()
  const [selectedTeam, setSelectedTeam] = useState<'A' | 'B'>('A')
  const [formations, setFormations] = useState({
    A: teamA.formation || '4-4-2',
    B: teamB.formation || '4-4-2'
  })
  const [starters, setStarters] = useState({
    A: teamA.players.filter(p => p.isStarter).map(p => p.id),
    B: teamB.players.filter(p => p.isStarter).map(p => p.id)
  })
  const [captains, setCaptains] = useState({
    A: teamA.players.find(p => p.isCaptain)?.id || null,
    B: teamB.players.find(p => p.isCaptain)?.id || null
  })

  const currentTeam = selectedTeam === 'A' ? teamA : teamB
  const currentStarters = starters[selectedTeam]
  const currentCaptain = captains[selectedTeam]
  const currentFormation = formations[selectedTeam]

  const handleStarterToggle = (playerId: string, checked: boolean) => {
    setStarters(prev => ({
      ...prev,
      [selectedTeam]: checked 
        ? [...prev[selectedTeam], playerId]
        : prev[selectedTeam].filter(id => id !== playerId)
    }))
  }

  const handleCaptainChange = (playerId: string) => {
    setCaptains(prev => ({
      ...prev,
      [selectedTeam]: prev[selectedTeam] === playerId ? null : playerId
    }))
  }

  const handleFormationChange = (formation: string) => {
    setFormations(prev => ({
      ...prev,
      [selectedTeam]: formation
    }))
  }

  const handlePlayerPositionChange = (playerId: string, position: { x: number; y: number }) => {
    const team = selectedTeam === 'A' ? teamA : teamB
    const updatedPlayers = team.players.map(player =>
      player.id === playerId ? { ...player, fieldPosition: position } : player
    )
    
    updateTeam(team.id, { players: updatedPlayers })
  }

  const handleSave = () => {
    // Atualizar Team A
    const updatedTeamAPlayers = teamA.players.map(player => ({
      ...player,
      isStarter: starters.A.includes(player.id),
      isCaptain: captains.A === player.id
    }))
    
    updateTeam(teamA.id, {
      players: updatedTeamAPlayers,
      formation: formations.A,
      tacticalSetup: {
        starters: starters.A,
        captain: captains.A,
        formation: formations.A
      }
    })

    // Atualizar Team B
    const updatedTeamBPlayers = teamB.players.map(player => ({
      ...player,
      isStarter: starters.B.includes(player.id),
      isCaptain: captains.B === player.id
    }))
    
    updateTeam(teamB.id, {
      players: updatedTeamBPlayers,
      formation: formations.B,
      tacticalSetup: {
        starters: starters.B,
        captain: captains.B,
        formation: formations.B
      }
    })

    onClose()
  }

  const resetPositions = () => {
    const team = selectedTeam === 'A' ? teamA : teamB
    const updatedPlayers = team.players.map(player => ({
      ...player,
      fieldPosition: undefined
    }))
    
    updateTeam(team.id, { players: updatedPlayers })
  }

  const starterPlayers = currentTeam.players.filter(p => currentStarters.includes(p.id))

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Configuração Tática
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Painel Esquerdo - Seleção de Times */}
          <div className="space-y-6">
            {/* Seletor de Time */}
            <div className="space-y-4">
              <h3 className="font-semibold">Selecionar Time</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={selectedTeam === 'A' ? 'default' : 'outline'}
                  onClick={() => setSelectedTeam('A')}
                  className="h-12"
                >
                  <img src={teamA.logoUrl} alt={teamA.name} className="w-6 h-6 mr-2" />
                  {teamA.name}
                </Button>
                <Button
                  variant={selectedTeam === 'B' ? 'default' : 'outline'}
                  onClick={() => setSelectedTeam('B')}
                  className="h-12"
                >
                  <img src={teamB.logoUrl} alt={teamB.name} className="w-6 h-6 mr-2" />
                  {teamB.name}
                </Button>
              </div>
            </div>

            {/* Formação */}
            <div className="space-y-2">
              <Label htmlFor="formation">Esquema Tático</Label>
              <Input
                id="formation"
                value={currentFormation}
                onChange={(e) => handleFormationChange(e.target.value)}
                placeholder="Ex: 4-4-2, 3-5-2, 4-3-3"
              />
            </div>

            {/* Lista de Jogadores */}
            <div className="space-y-4">
              <h4 className="font-semibold">Jogadores</h4>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {currentTeam.players.map((player) => (
                  <div key={player.id} className="flex items-center space-x-3 p-2 border rounded">
                    <Checkbox
                      checked={currentStarters.includes(player.id)}
                      onCheckedChange={(checked) => handleStarterToggle(player.id, checked as boolean)}
                    />
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: currentTeam.colors.primary }}
                    >
                      {player.number}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{player.name}</p>
                      <p className="text-xs text-muted-foreground">{player.position}</p>
                    </div>
                    <Button
                      variant={currentCaptain === player.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleCaptainChange(player.id)}
                      disabled={!currentStarters.includes(player.id)}
                    >
                      C
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Painel Direito - Campo */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Campo Tático</h3>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={resetPositions}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Resetar Posições
                </Button>
              </div>
            </div>

            {/* Campo de Futebol */}
            <div 
              className="relative bg-green-600 rounded-lg border-4 border-white overflow-hidden"
              style={{ aspectRatio: '16/10', minHeight: '400px' }}
            >
              {/* Marcações do campo */}
              <div className="absolute inset-0">
                {/* Linha central */}
                <div className="absolute top-0 left-1/2 w-0.5 h-full bg-white transform -translate-x-1/2" />
                
                {/* Círculo central */}
                <div className="absolute top-1/2 left-1/2 w-20 h-20 border-2 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2" />
                
                {/* Áreas */}
                <div className="absolute top-1/2 left-0 w-16 h-32 border-2 border-white border-l-0 transform -translate-y-1/2" />
                <div className="absolute top-1/2 right-0 w-16 h-32 border-2 border-white border-r-0 transform -translate-y-1/2" />
                
                {/* Pequenas áreas */}
                <div className="absolute top-1/2 left-0 w-6 h-16 border-2 border-white border-l-0 transform -translate-y-1/2" />
                <div className="absolute top-1/2 right-0 w-6 h-16 border-2 border-white border-r-0 transform -translate-y-1/2" />
              </div>

              {/* Jogadores Titulares */}
              {starterPlayers.map((player) => (
                <DraggablePlayer
                  key={player.id}
                  player={player}
                  onPositionChange={handlePlayerPositionChange}
                  teamColor={currentTeam.colors.primary}
                />
              ))}

              {/* Informações do esquema */}
              <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                {currentFormation} - {starterPlayers.length} titulares
              </div>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Salvar Configuração
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
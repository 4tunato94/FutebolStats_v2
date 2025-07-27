import { useState } from 'react'
import { Edit, Trash2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useFutebolStore } from '@/stores/futebolStore'
import { GameAction } from '@/types/futebol'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function RecentActions() {
  const { currentMatch, updateCurrentMatchAction, deleteCurrentMatchAction } = useFutebolStore()
  const [editingAction, setEditingAction] = useState<GameAction | null>(null)
  const [editForm, setEditForm] = useState<Partial<GameAction>>({})

  if (!currentMatch) return null

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleEdit = (action: GameAction) => {
    setEditingAction(action)
    setEditForm({
      teamId: action.teamId,
      playerId: action.playerId,
      timestamp: action.timestamp
    })
  }

  const handleSave = () => {
    if (editingAction) {
      updateCurrentMatchAction(editingAction.id, editForm)
      setEditingAction(null)
      setEditForm({})
    }
  }

  const handleDelete = (actionId: string) => {
    deleteCurrentMatchAction(actionId)
  }

  const getPlayerName = (teamId: string, playerId?: string) => {
    if (!playerId) return 'N/A'
    
    const team = teamId === currentMatch.teamA.id ? currentMatch.teamA : currentMatch.teamB
    const player = team.players.find(p => p.id === playerId)
    return player ? `${player.number} - ${player.name}` : 'N/A'
  }

  // Ordenar ações por timestamp decrescente (mais recente primeiro)
  const sortedActions = [...currentMatch.actions].sort((a, b) => b.timestamp - a.timestamp)

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Ações Recentes</h3>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {sortedActions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhuma ação registrada</p>
          </div>
        ) : (
          sortedActions.map((action) => (
            <div key={action.id} className="bg-card border border-border/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                    {formatTime(action.timestamp)}
                  </span>
                  <span className="text-sm font-medium">
                    {action.actionName || (action.type === 'possession' ? 'Posse' : 'Ação')}
                  </span>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(action)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(action.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Time: {action.teamId === currentMatch.teamA.id ? currentMatch.teamA.name : currentMatch.teamB.name}</p>
                {action.playerId && (
                  <p>Jogador: {getPlayerName(action.teamId, action.playerId)}</p>
                )}
                <p>Zona: {action.zone.row + 1},{action.zone.col + 1}</p>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Dialog de Edição */}
      <Dialog open={!!editingAction} onOpenChange={() => setEditingAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Ação</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Tempo (minutos)</Label>
              <Input
                type="number"
                value={Math.floor((editForm.timestamp || 0) / 60)}
                onChange={(e) => {
                  const mins = parseInt(e.target.value) || 0
                  const secs = (editForm.timestamp || 0) % 60
                  setEditForm({ ...editForm, timestamp: mins * 60 + secs })
                }}
              />
            </div>
            
            <div>
              <Label>Time</Label>
              <Select 
                value={editForm.teamId || ''}
                onValueChange={(value) => setEditForm({ ...editForm, teamId: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={currentMatch.teamA.id}>{currentMatch.teamA.name}</SelectItem>
                  <SelectItem value={currentMatch.teamB.id}>{currentMatch.teamB.name}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditingAction(null)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
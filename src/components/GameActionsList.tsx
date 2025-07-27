
import { useState } from 'react'
import { useFutebolStore } from '@/stores/futebolStore'
import { SavedGame, GameAction } from '@/types/futebol'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, Save } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

interface GameActionsListProps {
  game: SavedGame
}

export function GameActionsList({ game }: GameActionsListProps) {
  const { updateGameAction, deleteGameAction } = useFutebolStore()
  const [editingAction, setEditingAction] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<GameAction>>({})

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleEdit = (action: GameAction) => {
    setEditingAction(action.id)
    setEditForm({
      teamId: action.teamId,
      playerId: action.playerId,
      timestamp: action.timestamp
    })
  }

  const handleSave = (actionId: string) => {
    updateGameAction(game.id, actionId, editForm)
    setEditingAction(null)
    setEditForm({})
  }

  const handleDelete = (actionId: string) => {
    deleteGameAction(game.id, actionId)
  }

  const getPlayerName = (teamId: string, playerId?: string) => {
    if (!playerId) return 'N/A'
    
    const team = teamId === game.teamA.id ? game.teamA : game.teamB
    const player = team.players.find(p => p.id === playerId)
    return player ? `${player.number} - ${player.name}` : 'N/A'
  }

  if (game.actions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Nenhuma ação registrada neste jogo</p>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ações do Jogo</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-4 text-left">Tempo</th>
                  <th className="py-2 px-4 text-left">Ação</th>
                  <th className="py-2 px-4 text-left">Time</th>
                  <th className="py-2 px-4 text-left">Jogador</th>
                  <th className="py-2 px-4 text-left">Zona</th>
                  <th className="py-2 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {game.actions.map((action) => (
                  <tr key={action.id} className="border-b hover:bg-muted/50">
                    {editingAction === action.id ? (
                      <>
                        <td className="py-2 px-4">
                          <Input
                            type="number"
                            value={Math.floor((editForm.timestamp || action.timestamp) / 60)}
                            onChange={(e) => {
                              const mins = parseInt(e.target.value) || 0
                              const secs = (editForm.timestamp || action.timestamp) % 60
                              setEditForm({
                                ...editForm,
                                timestamp: mins * 60 + secs
                              })
                            }}
                            className="w-16 mr-1"
                          />
                          :
                          <Input
                            type="number"
                            value={(editForm.timestamp || action.timestamp) % 60}
                            onChange={(e) => {
                              const secs = parseInt(e.target.value) || 0
                              const mins = Math.floor((editForm.timestamp || action.timestamp) / 60)
                              setEditForm({
                                ...editForm,
                                timestamp: mins * 60 + secs
                              })
                            }}
                            className="w-16 ml-1"
                          />
                        </td>
                        <td className="py-2 px-4">
                          {action.actionName || (action.type === 'possession' ? 'Posse de Bola' : 'Ação')}
                        </td>
                        <td className="py-2 px-4">
                          <Select 
                            value={editForm.teamId || action.teamId}
                            onValueChange={(value) => setEditForm({...editForm, teamId: value})}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={game.teamA.id}>{game.teamA.name}</SelectItem>
                              <SelectItem value={game.teamB.id}>{game.teamB.name}</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-2 px-4">
                          {action.type === 'specific' && action.actionName && (
                            <Select 
                              value={editForm.playerId || action.playerId || ''}
                              onValueChange={(value) => setEditForm({...editForm, playerId: value})}
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Selecione um jogador" />
                              </SelectTrigger>
                              <SelectContent>
                                {(editForm.teamId === game.teamA.id || (!editForm.teamId && action.teamId === game.teamA.id)) 
                                  ? game.teamA.players.map(player => (
                                      <SelectItem key={player.id} value={player.id}>
                                        {player.number} - {player.name}
                                      </SelectItem>
                                    ))
                                  : game.teamB.players.map(player => (
                                      <SelectItem key={player.id} value={player.id}>
                                        {player.number} - {player.name}
                                      </SelectItem>
                                    ))
                                }
                              </SelectContent>
                            </Select>
                          )}
                        </td>
                        <td className="py-2 px-4">
                          {action.zone ? `${action.zone.row + 1},${action.zone.col + 1}` : 'N/A'}
                        </td>
                        <td className="py-2 px-4 text-right">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleSave(action.id)}
                          >
                            <Save className="h-4 w-4 mr-1" />
                            Salvar
                          </Button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-2 px-4">{formatTime(action.timestamp)}</td>
                        <td className="py-2 px-4">
                          {action.actionName || (action.type === 'possession' ? 'Posse de Bola' : 'Ação')}
                        </td>
                        <td className="py-2 px-4">
                          {action.teamId === game.teamA.id ? game.teamA.name : game.teamB.name}
                        </td>
                        <td className="py-2 px-4">
                          {action.playerId ? getPlayerName(action.teamId, action.playerId) : 'N/A'}
                        </td>
                        <td className="py-2 px-4">
                          {action.zone ? `${action.zone.row + 1},${action.zone.col + 1}` : 'N/A'}
                        </td>
                        <td className="py-2 px-4 text-right">
                          <div className="flex space-x-1 justify-end">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEdit(action)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDelete(action.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

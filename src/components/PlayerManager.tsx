import { useState } from 'react'
import { Plus, Edit, Trash, Upload, FileText, User, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { useFutebolStore } from '@/stores/futebolStore'
import { Team, Player } from '@/types/futebol'

interface PlayerManagerProps {
  team: Team
  onImportPlayers: (text: string) => void
}

const positions = [
  'Goleiro',
  'Zagueiro',
  'Lateral Esquerdo',
  'Lateral Direito',
  'Meio-campo',
  'Atacante'
]

const roles = [
  'Goleiro Tradicional',
  'Goleiro-Líbero',
  'Zagueiro Central',
  'Zagueiro Construtor',
  'Líbero',
  'Lateral Defensivo',
  'Lateral Apoiador',
  'Lateral Construtor',
  'Ala',
  'Cabeça de Área',
  'Primeiro Volante',
  'Segundo Volante',
  'Meia Box-to-Box',
  'Meia Armador',
  'Meia Central',
  'Meia-atacante',
  'Meia de Ligação',
  'Ponta',
  'Extremo',
  'Ponta Invertido',
  'Segundo Atacante',
  'Centroavante',
  'Homem de Área',
  'Pivô',
  'Falso 9'
]

export function PlayerManager({ team, onImportPlayers }: PlayerManagerProps) {
  const { updateTeam } = useFutebolStore()
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null)
  const [isPlayerDialogOpen, setIsPlayerDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [importText, setImportText] = useState('')
  const [playerForm, setPlayerForm] = useState({
    number: '',
    position: 'Goleiro',
    name: '',
    role: 'Titular'
  })

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault()
    
    const playerNumber = parseInt(playerForm.number)
    if (team.players.some(p => p.number === playerNumber)) {
      alert('Já existe um jogador com esse número!')
      return
    }

    const newPlayer: Player = {
      id: `${team.id}-${playerNumber}`,
      number: playerNumber,
      name: playerForm.name,
      position: playerForm.position,
      role: playerForm.role
    }

    const updatedPlayers = editingPlayer 
      ? team.players.map(p => p.id === editingPlayer.id ? newPlayer : p)
      : [...team.players, newPlayer]

    updateTeam(team.id, { players: updatedPlayers })
    resetPlayerForm()
  }

  const resetPlayerForm = () => {
    setPlayerForm({ number: '', position: 'Goleiro', name: '', role: 'Titular' })
    setEditingPlayer(null)
    setIsPlayerDialogOpen(false)
  }

  const handleEditPlayer = (player: Player) => {
    setEditingPlayer(player)
    setPlayerForm({
      number: player.number.toString(),
      position: player.position,
      name: player.name,
      role: player.role || 'Titular'
    })
    setIsPlayerDialogOpen(true)
  }

  const handleDeletePlayer = (playerId: string) => {
    updateTeam(team.id, { 
      players: team.players.filter(p => p.id !== playerId)
    })
  }

  const handleDeleteAllPlayers = () => {
    updateTeam(team.id, { players: [] })
  }

  const handleImport = () => {
    onImportPlayers(importText)
    setImportText('')
    setIsImportDialogOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">Elenco</h4>
        <div className="flex space-x-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={team.players.length === 0}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir todos os jogadores</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir todos os jogadores do {team.name}? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAllPlayers} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Excluir Todos
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Upload className="h-3 w-3" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Importar Elenco</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="import-text">Lista de Jogadores</Label>
                  <Textarea
                    id="import-text"
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder="1,Lionel Messi,Atacante,Titular&#10;2,Cristiano Ronaldo,Atacante,Capitão&#10;3,Neymar Junior,Meio-campo,Titular&#10;..."
                    rows={10}
                    className="font-mono text-sm"
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Formato: <code>Número,Nome,Posição,Função</code></p>
                  <p>Exemplo: <code>10,Lionel Messi,Atacante,Capitão</code></p>
                  <p>Posições: Goleiro, Zagueiro, Lateral, Volante, Meio-campo, Atacante</p>
                  <p>Funções: Titular, Reserva, Capitão, Vice-capitão</p>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleImport} variant="field">
                    <FileText className="h-4 w-4" />
                    Importar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isPlayerDialogOpen} onOpenChange={setIsPlayerDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-3 w-3" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingPlayer ? 'Editar Jogador' : 'Novo Jogador'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddPlayer} className="space-y-4">
                <div>
                  <Label htmlFor="number">Número</Label>
                  <Input
                    id="number"
                    type="number"
                    value={playerForm.number}
                    onChange={(e) => setPlayerForm(prev => ({ ...prev, number: e.target.value }))}
                    placeholder="10"
                    min="1"
                    max="99"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={playerForm.name}
                    onChange={(e) => setPlayerForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nome do jogador"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="position">Posição</Label>
                  <Select
                    value={playerForm.position}
                    onValueChange={(value) => setPlayerForm(prev => ({ ...prev, position: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map(position => (
                        <SelectItem key={position} value={position}>
                          {position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="role">Função</Label>
                  <Select
                    value={playerForm.role}
                    onValueChange={(value) => setPlayerForm(prev => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map(role => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={resetPlayerForm}>
                    Cancelar
                  </Button>
                  <Button type="submit" variant="field">
                    {editingPlayer ? 'Atualizar' : 'Adicionar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {team.players.length > 0 ? (
        <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
          {team.players
            .sort((a, b) => a.number - b.number)
            .map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-2 rounded border bg-muted/30"
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: team.colors.primary }}
                  >
                    {player.number}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{player.name}</p>
                    <p className="text-xs text-muted-foreground">{player.position} • {player.role}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditPlayer(player)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeletePlayer(player.id)}
                  >
                    <Trash className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="text-center py-6 border rounded-lg bg-muted/30">
          <User className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            Nenhum jogador cadastrado
          </p>
        </div>
      )}
    </div>
  )
}
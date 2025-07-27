
import { useState } from 'react'
import { Plus, Settings, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useFutebolStore } from '@/stores/futebolStore'
import { ActionType } from '@/types/futebol'

export function ActionTypeManager() {
  const { actionTypes, addActionType, deleteActionType, updateActionType } = useFutebolStore()
  
  const [actionForm, setActionForm] = useState({
    name: '',
    icon: '⚽',
    requiresPlayer: true,
    counterAction: 'none',
    reverseAction: false,
    changesPossession: false
  })
  const [editingActionId, setEditingActionId] = useState<string | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  // Lista completa de emojis organizados por categoria
  const emojiCategories = {
    'Futebol': ['⚽', '🥅', '🏟️', '🏆', '🥇', '🏅', '🎖️'],
    'Cartões & Infrações': ['🟨', '🟥', '🔴', '🚩', '✋', '🚑', '⚠️'],
    'Ações': ['🦵', '👊', '🛡️', '🎯', '⭐', '🔥', '⚡', '💪', '🏃', '⚔️'],
    'Posições': ['📍', '🏁', '↔️', '↕️', '↗️', '↖️', '↘️', '↙️', '🔄', '🔃'],
    'Expressões': ['😵', '😤', '😮', '😊', '😢', '😡', '🤔', '😎', '🥳', '😱'],
    'Esportes': ['🏀', '🏈', '🎾', '🏐', '🏓', '🏸', '🥊', '🥋', '⛳', '🏌️'],
    'Celebração': ['🎊', '🎉', '🎈', '🎭', '🎪', '🎨', '🎵', '🎶', '🎺', '🎼'],
    'Símbolos': ['✅', '❌', '❗', '❓', '💯', '🔝', '🆕', '🆒', '🔔', '🔕'],
    'Animais': ['🦁', '🐅', '🦅', '🐺', '🐉', '🦈', '🐆', '🐂', '🐎', '🦏'],
    'Natureza': ['🌟', '⭐', '🌙', '☀️', '⚡', '🔥', '💧', '🌪️', '❄️', '🌈'],
    'Objetos': ['🛡️', '⚔️', '🔨', '🎯', '📱', '💻', '⌚', '🔋', '💡', '🔧'],
    'Bandeiras': ['🏁', '🏳️', '🏴', '🚩', '🎌', '🏳️‍🌈', '🏴‍☠️'],
    'Transporte': ['🚗', '🏎️', '🚙', '🚌', '🚎', '🏍️', '🚲', '🛴', '🛵', '🚁'],
    'Comida': ['🍎', '🍌', '🍊', '🍕', '🍔', '🌭', '🍟', '🍗', '🥖', '🎂'],
    'Diversos': ['💎', '👑', '🎪', '🎨', '🎭', '🎬', '📸', '🎤', '🎧', '🎮']
  }

  const handleAddActionType = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingActionId) {
      updateActionType(editingActionId, {
        name: actionForm.name,
        icon: actionForm.icon,
        requiresPlayer: actionForm.requiresPlayer,
        counterAction: actionForm.counterAction === 'none' ? undefined : actionForm.counterAction || undefined,
        reverseAction: actionForm.reverseAction,
        changesPossession: actionForm.changesPossession
      })
      setEditingActionId(null)
    } else {
      const newActionType: ActionType = {
        id: Date.now().toString(),
        name: actionForm.name,
        icon: actionForm.icon,
        requiresPlayer: actionForm.requiresPlayer,
        counterAction: actionForm.counterAction === 'none' ? undefined : actionForm.counterAction || undefined,
        reverseAction: actionForm.reverseAction,
        changesPossession: actionForm.changesPossession
      }
      
      addActionType(newActionType)
    }
    
    setActionForm({ name: '', icon: '⚽', requiresPlayer: true, counterAction: 'none', reverseAction: false, changesPossession: false })
  }

  const handleEditAction = (actionType: ActionType) => {
    setActionForm({
      name: actionType.name,
      icon: actionType.icon,
      requiresPlayer: actionType.requiresPlayer,
      counterAction: actionType.counterAction || 'none',
      reverseAction: actionType.reverseAction || false,
      changesPossession: actionType.changesPossession || false
    })
    setEditingActionId(actionType.id)
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Zap className="h-5 w-5 mr-2" />
          Ações do Jogo
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {/* Adicionar/Editar ação */}
          <form onSubmit={handleAddActionType} className="space-y-4">
            <div>
              <Label htmlFor="action-name">Nome da Ação</Label>
              <Input
                id="action-name"
                value={actionForm.name}
                onChange={(e) => setActionForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Passe Certeiro"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="action-icon">Ícone</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-12 h-12 border rounded flex items-center justify-center text-2xl bg-muted">
                    {actionForm.icon}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="flex-1"
                  >
                    Selecionar Emoji
                  </Button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="changes-possession"
                    checked={actionForm.changesPossession}
                    onCheckedChange={(checked) => setActionForm(prev => ({ ...prev, changesPossession: checked }))}
                  />
                  <Label htmlFor="changes-possession">Muda posse automaticamente</Label>
                </div>
                
                {showEmojiPicker && (
                  <div className="border rounded-lg p-4 bg-background max-h-96 overflow-y-auto">
                    <div className="space-y-4">
                      {Object.entries(emojiCategories).map(([category, emojis]) => (
                        <div key={category}>
                          <h5 className="font-semibold text-sm mb-2 text-muted-foreground">{category}</h5>
                          <div className="grid grid-cols-8 gap-2">
                            {emojis.map((emoji) => (
                              <Button
                                key={emoji}
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="w-10 h-10 p-0 text-lg hover:bg-accent"
                                onClick={() => {
                                  setActionForm(prev => ({ ...prev, icon: emoji }))
                                  setShowEmojiPicker(false)
                                }}
                              >
                                {emoji}
                              </Button>
                            ))}
                          </div>
                        </div>
                      ))}
                       {actionType.changesPossession && (
                         <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">Muda Posse</span>
                       )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="requires-player"
                checked={actionForm.requiresPlayer}
                onCheckedChange={(checked) => setActionForm(prev => ({ ...prev, requiresPlayer: checked }))}
              />
              <Label htmlFor="requires-player">Requer seleção de jogador</Label>
            </div>
            
            <div>
              <Label htmlFor="counter-action">Ação no Time Adversário (Opcional)</Label>
              <Select
                value={actionForm.counterAction}
                onValueChange={(value) => setActionForm(prev => ({ ...prev, counterAction: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma ação relacionada" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  {actionTypes
                    .filter(at => at.id !== editingActionId) // Não mostrar a própria ação
                    .map((actionType) => (
                      <SelectItem key={actionType.id} value={actionType.id}>
                        {actionType.icon} {actionType.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="reverse-action"
                checked={actionForm.reverseAction}
                onCheckedChange={(checked) => setActionForm(prev => ({ ...prev, reverseAction: checked }))}
              />
              <Label htmlFor="reverse-action">Ação reversa (registra no time adversário)</Label>
            </div>
            
            <Button type="submit" variant="action" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              {editingActionId ? 'Atualizar Ação' : 'Adicionar Ação'}
            </Button>
          </form>
          
          {/* Lista de ações existentes */}
          <div className="space-y-2">
            <h4 className="font-semibold">Ações Cadastradas</h4>
            {actionTypes.map((actionType) => (
              <div key={actionType.id} className="flex items-center justify-between p-2 rounded border">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{actionType.icon}</span>
                  <span>{actionType.name}</span>
                  {actionType.requiresPlayer && (
                    <span className="text-xs bg-muted px-2 py-1 rounded">Jogador</span>
                  )}
                   {actionType.counterAction && (
                     <span className="text-xs bg-accent px-2 py-1 rounded">Contra-ação</span>
                   )}
                   {actionType.reverseAction && (
                     <span className="text-xs bg-destructive text-destructive-foreground px-2 py-1 rounded">Reversa</span>
                   )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditAction(actionType)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteActionType(actionType.id)}
                  >
                    Remover
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

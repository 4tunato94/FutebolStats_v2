import { User, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Team, ActionType } from '@/types/futebol'
import { cn } from '@/lib/utils'

interface MultiplePlayerSelectorProps {
  team: Team
  action: ActionType
  selectedPlayers: string[]
  onSelectPlayers: (playerIds: string[]) => void
  onConfirm: (playerIds: string[]) => void
  onCancel: () => void
}

export function MultiplePlayerSelector({ 
  team, 
  action, 
  selectedPlayers, 
  onSelectPlayers, 
  onConfirm, 
  onCancel 
}: MultiplePlayerSelectorProps) {
  const handlePlayerToggle = (playerId: string) => {
    if (selectedPlayers.includes(playerId)) {
      onSelectPlayers(selectedPlayers.filter(id => id !== playerId))
    } else {
      // Para substituição, limitar a 2 jogadores
      if (action.name === 'Substituição' && selectedPlayers.length >= 2) {
        return
      }
      onSelectPlayers([...selectedPlayers, playerId])
    }
  }

  const canConfirm = () => {
    if (action.name === 'Substituição') {
      return selectedPlayers.length === 2
    }
    return selectedPlayers.length > 0
  }

  const getInstructions = () => {
    if (action.name === 'Substituição') {
      return 'Selecione o jogador que sai e o que entra (2 jogadores)'
    }
    return 'Selecione os jogadores envolvidos na ação'
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end">
      <div className="w-full bg-background rounded-t-3xl border-t border-border/50 animate-in slide-in-from-bottom-full duration-300">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
        </div>
        
        <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between min-h-[60px]">
          <div className="flex items-center space-x-2">
            <span className="text-3xl flex-shrink-0">{action.icon}</span>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg ios-text-fixed">{action.name}</h3>
              <p className="text-sm text-muted-foreground ios-text-fixed">
                {getInstructions()}
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onCancel}
            className="h-10 w-10 rounded-full touch-target flex-shrink-0"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-5 max-h-[70vh] overflow-y-auto pb-safe">
          {team.players.length > 0 ? (
            <div className="space-y-4">
              {/* Jogadores Titulares */}
              <div>
                <h4 className="font-medium mb-3">Titulares</h4>
                <div className="grid grid-cols-4 gap-4">
                  {team.players
                    .filter(p => p.isStarter)
                    .sort((a, b) => a.number - b.number)
                    .map((player) => (
                      <Button
                        key={player.id}
                        variant="outline"
                        onClick={() => handlePlayerToggle(player.id)}
                        className={cn(
                          "h-16 w-16 rounded-2xl flex items-center justify-center touch-target no-select relative",
                          "border-2 border-border/50 hover:border-primary/50",
                          "transition-all duration-200 active:scale-[0.95]",
                          selectedPlayers.includes(player.id) && "bg-primary text-primary-foreground border-primary"
                        )}
                      >
                        <span className="text-xl font-bold ios-text-fixed">
                          {player.number}
                        </span>
                        {selectedPlayers.includes(player.id) && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                            <Check className="h-3 w-3 text-primary-foreground" />
                          </div>
                        )}
                      </Button>
                    ))}
                </div>
              </div>
              
              {/* Jogadores Reservas */}
              {team.players.filter(p => !p.isStarter).length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Reservas</h4>
                  <div className="grid grid-cols-4 gap-4">
                    {team.players
                      .filter(p => !p.isStarter)
                      .sort((a, b) => a.number - b.number)
                      .map((player) => (
                        <Button
                          key={player.id}
                          variant="outline"
                          onClick={() => handlePlayerToggle(player.id)}
                          className={cn(
                            "h-16 w-16 rounded-2xl flex items-center justify-center touch-target no-select relative",
                            "border-2 border-border/50 hover:border-primary/50",
                            "transition-all duration-200 active:scale-[0.95]",
                            selectedPlayers.includes(player.id) && "bg-primary text-primary-foreground border-primary"
                          )}
                        >
                          <span className="text-xl font-bold ios-text-fixed">
                            {player.number}
                          </span>
                          {selectedPlayers.includes(player.id) && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                              <Check className="h-3 w-3 text-primary-foreground" />
                            </div>
                          )}
                        </Button>
                      ))}
                  </div>
                </div>
              )}
              
              {/* Botão de Confirmação */}
              <div className="pt-4">
                <Button
                  onClick={() => onConfirm(selectedPlayers)}
                  disabled={!canConfirm()}
                  className="w-full h-12 rounded-2xl"
                >
                  Confirmar {action.name}
                  {selectedPlayers.length > 0 && ` (${selectedPlayers.length} selecionados)`}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <User className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-base text-muted-foreground ios-text-wrap">
                Nenhum jogador cadastrado para {team.name}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
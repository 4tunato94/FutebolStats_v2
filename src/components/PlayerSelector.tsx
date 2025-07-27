import { User, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Team, ActionType } from '@/types/futebol'
import { cn } from '@/lib/utils'

interface PlayerSelectorProps {
  team: Team
  action: ActionType
  onSelectPlayer: (playerId: string) => void
  onCancel: () => void
}

export function PlayerSelector({ team, action, onSelectPlayer, onCancel }: PlayerSelectorProps) {
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
            <p className="text-sm text-muted-foreground ios-text-fixed">Selecione o jogador</p>
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
            <div className="grid grid-cols-4 gap-4 ios-scroll">
            {team.players
              .sort((a, b) => a.number - b.number)
              .map((player) => (
                <Button
                  key={player.id}
                  variant="outline"
                  onClick={() => onSelectPlayer(player.id)}
                  className={cn(
                      "h-16 w-16 rounded-2xl flex items-center justify-center touch-target no-select",
                    "border-2 border-border/50 hover:border-primary/50",
                    "transition-all duration-200 active:scale-[0.95]"
                  )}
                >
                    <span className="text-xl font-bold ios-text-fixed">
                      {player.number}
                    </span>
                </Button>
              ))}
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
import { useState } from 'react'
import { Target, Grid3X3, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useFutebolStore } from '@/stores/futebolStore'
import { ActionType } from '@/types/futebol'
import { PlayerSelector } from './PlayerSelector'
import { cn } from '@/lib/utils'

interface ActionPanelProps {
  onClose?: () => void
}

export function ActionPanel({ onClose }: ActionPanelProps) {
  const { currentMatch, actionTypes, addAction } = useFutebolStore()
  const [selectedAction, setSelectedAction] = useState<ActionType | null>(null)

  if (!currentMatch) return null

  const handleActionClick = (actionType: ActionType) => {
    if (!currentMatch.currentPossession) {
      alert('Selecione o time que está com a posse de bola!')
      return
    }

    if (actionType.requiresPlayer) {
      setSelectedAction(actionType)
    } else {
      // Determinar qual time registra a ação (normal ou reversa)
      const targetTeamId = actionType.reverseAction 
        ? (currentMatch.currentPossession === currentMatch.teamA.id 
            ? currentMatch.teamB.id 
            : currentMatch.teamA.id)
        : currentMatch.currentPossession

      // Ação direta do time
      addAction({
        type: 'specific',
        teamId: targetTeamId,
        zone: { row: 2, col: 2 }, // Centro do campo por padrão
        actionName: actionType.name
      })

      // Verificar se há contra-ação
      if (actionType.counterAction) {
        const counterActionType = actionTypes.find(at => at.id === actionType.counterAction)
        if (counterActionType) {
          const opposingTeamId = currentMatch.currentPossession === currentMatch.teamA.id 
            ? currentMatch.teamB.id 
            : currentMatch.teamA.id
          
          addAction({
            type: 'specific',
            teamId: opposingTeamId,
            zone: { row: 2, col: 2 },
            actionName: counterActionType.name
          })
        }
      }
      
      // Se a ação muda a posse automaticamente, fechar o painel
      if (actionType.changesPossession && onClose) {
        onClose()
      }
    }
  }

  const handlePlayerAction = (playerId: string) => {
    if (selectedAction && currentMatch.currentPossession) {
      // Determinar qual time registra a ação (normal ou reversa)
      const targetTeamId = selectedAction.reverseAction 
        ? (currentMatch.currentPossession === currentMatch.teamA.id 
            ? currentMatch.teamB.id 
            : currentMatch.teamA.id)
        : currentMatch.currentPossession

      addAction({
        type: 'specific',
        teamId: targetTeamId,
        playerId,
        zone: { row: 2, col: 2 }, // Centro do campo por padrão
        actionName: selectedAction.name
      })

      // Verificar se há contra-ação
      if (selectedAction.counterAction) {
        const counterActionType = actionTypes.find(at => at.id === selectedAction.counterAction)
        if (counterActionType) {
          const opposingTeamId = currentMatch.currentPossession === currentMatch.teamA.id 
            ? currentMatch.teamB.id 
            : currentMatch.teamA.id
          
          addAction({
            type: 'specific',
            teamId: opposingTeamId,
            zone: { row: 2, col: 2 },
            actionName: counterActionType.name
          })
        }
      }
      
      setSelectedAction(null)
      
      // Se a ação muda a posse automaticamente, fechar o painel
      if (selectedAction.changesPossession && onClose) {
        onClose()
      }
    }
  }

  // Determinar qual time deve aparecer no seletor de jogadores
  const getTeamForPlayerSelection = () => {
    if (!selectedAction || !currentMatch.currentPossession) return null
    
    // Se a ação é reversa, mostrar jogadores do time adversário
    if (selectedAction.reverseAction) {
      return currentMatch.currentPossession === currentMatch.teamA.id 
        ? currentMatch.teamB 
        : currentMatch.teamA
    }
    
    // Caso normal: mostrar jogadores do time com posse
    return currentMatch.currentPossession === currentMatch.teamA.id 
      ? currentMatch.teamA 
      : currentMatch.teamB
  }

  const teamForPlayerSelection = getTeamForPlayerSelection()

  return (
    <>
      <div className="space-y-4">
        {onClose && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Grid3X3 className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg ios-text-fixed">Ações Específicas</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-10 w-10 rounded-full touch-target"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        )}
        
      {currentMatch.currentPossession ? (
        <div className="space-y-4">
          {!onClose && (
            <div className="flex items-center space-x-3 mb-4">
            <Grid3X3 className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg ios-text-fixed">Ações Específicas</h3>
          </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            {actionTypes.map((actionType) => (
              <Button
                key={actionType.id}
                variant="outline"
                onClick={() => handleActionClick(actionType)}
                className={cn(
                  "h-24 rounded-2xl flex flex-col items-center justify-center p-4 touch-target no-select",
                  "border-2 border-border/50 hover:border-primary/50",
                  "transition-all duration-200 active:scale-[0.95]",
                  "bg-card hover:bg-accent"
                )}
              >
                <span className="text-3xl mb-2">{actionType.icon}</span>
                <span className="text-sm font-medium text-center leading-tight ios-text-wrap">
                  {actionType.name}
                </span>
              </Button>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <Target className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-base text-muted-foreground ios-text-wrap">
            Selecione a posse de bola para registrar ações
          </p>
        </div>
      )}
      </div>

      {/* Seletor de Jogador */}
      {selectedAction && teamForPlayerSelection && (
        <PlayerSelector
          team={teamForPlayerSelection}
          action={selectedAction}
          onSelectPlayer={handlePlayerAction}
          onCancel={() => setSelectedAction(null)}
        />
      )}
    </>
  )
}
import { useState } from 'react'
import { Play, Users, ChevronRight, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useFutebolStore } from '@/stores/futebolStore'
import { TacticalSetup } from '@/components/TacticalSetup'
import { cn } from '@/lib/utils'

export function MatchSetup() {
  const { teams, startMatch } = useFutebolStore()
  const [teamAId, setTeamAId] = useState('')
  const [teamBId, setTeamBId] = useState('')
  const [showTacticalSetup, setShowTacticalSetup] = useState(false)

  const handleStartMatch = () => {
    if (!teamAId || !teamBId) {
      alert('Selecione ambos os times!')
      return
    }
    if (teamAId === teamBId) {
      alert('Selecione times diferentes!')
      return
    }
    startMatch(teamAId, teamBId)
  }

  const handleTacticalSetup = () => {
    if (!teamAId || !teamBId) {
      alert('Selecione ambos os times primeiro!')
      return
    }
    if (teamAId === teamBId) {
      alert('Selecione times diferentes!')
      return
    }
    setShowTacticalSetup(true)
  }

  const selectedTeamA = teams.find(t => t.id === teamAId)
  const selectedTeamB = teams.find(t => t.id === teamBId)
  if (teams.length < 2) {
    return (
      <div className="text-center py-12">
        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-3 ios-text-fixed">Times Insuficientes</h3>
        <p className="text-muted-foreground text-base ios-text-wrap">
          Cadastre pelo menos 2 times para começar uma análise
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div>
          <Label className="text-base font-medium text-muted-foreground ios-text-fixed">Time A</Label>
          <Select value={teamAId} onValueChange={setTeamAId}>
            <SelectTrigger className="mt-3 h-14 rounded-2xl text-base touch-target">
              <SelectValue placeholder="Selecione o Time A" />
            </SelectTrigger>
            <SelectContent>
              {teams.map(team => (
                <SelectItem key={team.id} value={team.id}>
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-5 h-5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: team.colors.primary }}
                    />
                    <span className="ios-text-fixed">{team.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-base font-medium text-muted-foreground ios-text-fixed">Time B</Label>
          <Select value={teamBId} onValueChange={setTeamBId}>
            <SelectTrigger className="mt-3 h-14 rounded-2xl text-base touch-target">
              <SelectValue placeholder="Selecione o Time B" />
            </SelectTrigger>
            <SelectContent>
              {teams.map(team => (
                <SelectItem key={team.id} value={team.id}>
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-5 h-5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: team.colors.primary }}
                    />
                    <span className="ios-text-fixed">{team.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Configuração Tática */}
      {teamAId && teamBId && teamAId !== teamBId && (
        <div className="space-y-4">
          <Button 
            onClick={handleTacticalSetup}
            variant="outline"
            size="lg"
            className="w-full h-16 rounded-2xl text-base touch-target"
          >
            <Settings className="h-5 w-5 mr-3" />
            <span className="ios-text-fixed">Configurar Táticas</span>
          </Button>
          
          {/* Resumo das configurações */}
          <div className="grid grid-cols-2 gap-4">
            {selectedTeamA && (
              <div className="p-4 border rounded-2xl bg-muted/30">
                <div className="flex items-center space-x-2 mb-2">
                  <img src={selectedTeamA.logoUrl} alt={selectedTeamA.name} className="w-6 h-6" />
                  <span className="font-semibold text-sm">{selectedTeamA.name}</span>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Formação: {selectedTeamA.formation || 'Não definida'}</p>
                  <p>Titulares: {selectedTeamA.players.filter(p => p.isStarter).length}/11</p>
                  <p>Capitão: {selectedTeamA.players.find(p => p.isCaptain)?.name || 'Não definido'}</p>
                </div>
              </div>
            )}
            
            {selectedTeamB && (
              <div className="p-4 border rounded-2xl bg-muted/30">
                <div className="flex items-center space-x-2 mb-2">
                  <img src={selectedTeamB.logoUrl} alt={selectedTeamB.name} className="w-6 h-6" />
                  <span className="font-semibold text-sm">{selectedTeamB.name}</span>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Formação: {selectedTeamB.formation || 'Não definida'}</p>
                  <p>Titulares: {selectedTeamB.players.filter(p => p.isStarter).length}/11</p>
                  <p>Capitão: {selectedTeamB.players.find(p => p.isCaptain)?.name || 'Não definido'}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <Button 
        onClick={handleStartMatch}
        size="lg"
        className={cn(
          "w-full h-16 rounded-2xl text-lg font-semibold touch-target no-select",
          "bg-primary hover:bg-primary/90 text-primary-foreground",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "transition-all duration-200 active:scale-[0.98]"
        )}
        disabled={!teamAId || !teamBId}
      >
        <Play className="h-5 w-5 mr-3" />
        <span className="ios-text-fixed">Iniciar Análise</span>
        <ChevronRight className="h-6 w-6 ml-3" />
      </Button>
      
      {/* Modal de Configuração Tática */}
      {selectedTeamA && selectedTeamB && (
        <TacticalSetup
          isOpen={showTacticalSetup}
          onClose={() => setShowTacticalSetup(false)}
          teamA={selectedTeamA}
          teamB={selectedTeamB}
        />
      )}
    </div>
  )
}
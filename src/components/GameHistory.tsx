
import { useState } from 'react'
import { Calendar, Clock, Play, Trash2, BarChart3, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useFutebolStore } from '@/stores/futebolStore'
import { StatsHeatMapTabs } from './StatsHeatMapTabs'
import { GameActionsList } from './GameActionsList'
import { SavedGame } from '@/types/futebol'

export function GameHistory() {
  const { savedGames, deleteGame, loadSavedGame, setAppState } = useFutebolStore()
  const [selectedGame, setSelectedGame] = useState<SavedGame | null>(null)
  const [activeTab, setActiveTab] = useState<'stats' | 'actions'>('stats')

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR')
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleResumeGame = (game: SavedGame) => {
    loadSavedGame(game)
    setAppState('playing')
  }

  if (savedGames.length === 0) {
    return (
      <div className="text-center py-12">
        <Play className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Nenhum jogo salvo</h3>
        <p className="text-muted-foreground">
          Inicie uma partida para começar a salvar jogos
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Histórico de Jogos</h2>
        <p className="text-muted-foreground">
          {savedGames.length} jogo{savedGames.length !== 1 ? 's' : ''} salvo{savedGames.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="grid gap-4">
        {savedGames.map((game) => (
          <Card key={game.id} className="shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {game.teamA.name} vs {game.teamB.name}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleResumeGame(game)}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Continuar Jogo
                  </Button>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedGame(game)
                          setActiveTab('stats')
                        }}
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Ver Detalhes
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {game.teamA.name} vs {game.teamB.name}
                        </DialogTitle>
                      </DialogHeader>
                      {selectedGame && (
                        <div className="space-y-6">
                          <div className="flex border-b">
                            <Button 
                              variant={activeTab === 'stats' ? 'default' : 'ghost'}
                              onClick={() => setActiveTab('stats')}
                              className="rounded-none"
                            >
                              Estatísticas
                            </Button>
                            <Button
                              variant={activeTab === 'actions' ? 'default' : 'ghost'}
                              onClick={() => setActiveTab('actions')}
                              className="rounded-none"
                            >
                              Ações do Jogo
                            </Button>
                          </div>
                          
                          {activeTab === 'stats' ? (
                            <StatsHeatMapTabs game={selectedGame} />
                          ) : (
                            <GameActionsList game={selectedGame} />
                          )}
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteGame(game.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(game.startTime)}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {formatDuration(game.duration)}
                  </div>
                </div>
                <div>
                  {game.actions.length} ações registradas
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

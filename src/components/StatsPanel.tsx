import { useFutebolStore } from '@/stores/futebolStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, FileText, Image } from 'lucide-react'
import { SavedGame, Match } from '@/types/futebol'
import html2canvas from 'html2canvas'
import { useRef } from 'react'

interface StatsPanelProps {
  game: SavedGame | Match
}

export function StatsPanel({ game }: StatsPanelProps) {
  const { getGameStats } = useFutebolStore()
  const statsRef = useRef<HTMLDivElement>(null)
  
  const stats = getGameStats(game)
  
  const exportToTXT = () => {
    const content = `
ESTATÍSTICAS DA PARTIDA
${game.teamA.name} vs ${game.teamB.name}

POSSE DE BOLA
${game.teamA.name}: ${stats.possession.teamA}%
${game.teamB.name}: ${stats.possession.teamB}%

AÇÕES TOTAIS
${game.teamA.name}: ${stats.actions.teamA}
${game.teamB.name}: ${stats.actions.teamB}

AÇÕES ESPECÍFICAS
${Object.entries(stats.specificActions)
  .filter(([_, counts]) => counts.teamA > 0 || counts.teamB > 0)
  .map(([action, counts]) => `${action}: ${game.teamA.name} ${counts.teamA} x ${counts.teamB} ${game.teamB.name}`)
  .join('\n')}
`
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `estatisticas_${game.teamA.name.replace(/\s/g, '_')}_vs_${game.teamB.name.replace(/\s/g, '_')}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }
  
  const exportToPNG = async () => {
    if (statsRef.current) {
      try {
        const canvas = await html2canvas(statsRef.current, {
          backgroundColor: '#ffffff',
          scale: 2
        })
        
        const link = document.createElement('a')
        link.download = `estatisticas_${game.teamA.name.replace(/\s/g, '_')}_vs_${game.teamB.name.replace(/\s/g, '_')}.png`
        link.href = canvas.toDataURL()
        link.click()
      } catch (error) {
        console.error('Erro ao exportar PNG:', error)
      }
    }
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Estatísticas da Partida</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportToTXT}>
              <FileText className="h-4 w-4 mr-2" />
              TXT
            </Button>
            <Button variant="outline" size="sm" onClick={exportToPNG}>
              <Image className="h-4 w-4 mr-2" />
              PNG
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div ref={statsRef} className="bg-white p-6 rounded">
          {/* Header com 3 colunas */}
          <div className="grid grid-cols-3 gap-4 mb-6 text-center font-bold text-lg border-b-2 pb-4">
            <div className="text-team-a" style={{ color: game.teamA.colors.primary }}>
              {game.teamA.name}
            </div>
            <div className="text-muted-foreground">
              Estatísticas
            </div>
            <div className="text-team-b" style={{ color: game.teamB.colors.primary }}>
              {game.teamB.name}
            </div>
          </div>
          
          {/* Posse de Bola */}
          <div className="grid grid-cols-3 gap-4 mb-4 text-center py-2 border-b">
            <div className="text-2xl font-bold text-team-a">
              {stats.possession.teamA}%
            </div>
            <div className="text-muted-foreground font-semibold">
              Posse de Bola
            </div>
            <div className="text-2xl font-bold text-team-b">
              {stats.possession.teamB}%
            </div>
          </div>
          
          {/* Ações Totais */}
          <div className="grid grid-cols-3 gap-4 mb-4 text-center py-2 border-b">
            <div className="text-xl font-bold text-team-a">
              {stats.actions.teamA}
            </div>
            <div className="text-muted-foreground font-semibold">
              Ações Gerais
            </div>
            <div className="text-xl font-bold text-team-b">
              {stats.actions.teamB}
            </div>
          </div>
          
          {/* Ações Específicas */}
          <div className="space-y-2">
            {Object.entries(stats.specificActions)
              .filter(([_, counts]) => counts.teamA > 0 || counts.teamB > 0)
              .map(([action, counts]) => (
                <div key={action} className="grid grid-cols-3 gap-4 text-center py-1">
                  <div className="font-semibold text-team-a">
                    {counts.teamA}
                  </div>
                  <div className="text-sm" style={{ color: '#000000' }}>
                    {action}
                  </div>
                  <div className="font-semibold text-team-b">
                    {counts.teamB}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
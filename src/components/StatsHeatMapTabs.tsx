import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SavedGame, Match } from '@/types/futebol'
import { StatsPanel } from './StatsPanel'
import { HeatMap } from './HeatMap'
import { TeamHeatMap } from './TeamHeatMap'

interface StatsHeatMapTabsProps {
  game: SavedGame | Match
}

export function StatsHeatMapTabs({ game }: StatsHeatMapTabsProps) {
  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="general">Estatísticas Gerais</TabsTrigger>
        <TabsTrigger value="heatmap">Mapa de Calor Geral</TabsTrigger>
        <TabsTrigger value="teamA">Mapa {game.teamA.name}</TabsTrigger>
        <TabsTrigger value="teamB">Mapa {game.teamB.name}</TabsTrigger>
      </TabsList>
      
      <TabsContent value="general" className="space-y-4">
        <StatsPanel game={game} />
      </TabsContent>
      
      <TabsContent value="heatmap" className="space-y-4">
        <HeatMap game={game} />
      </TabsContent>
      
      <TabsContent value="teamA" className="space-y-4">
        <TeamHeatMap game={game} team="teamA" />
      </TabsContent>
      
      <TabsContent value="teamB" className="space-y-4">
        <TeamHeatMap game={game} team="teamB" />
      </TabsContent>
    </Tabs>
  )
}
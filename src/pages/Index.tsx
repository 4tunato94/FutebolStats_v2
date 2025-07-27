
import { useState, useEffect } from 'react'
import { Settings, Home, History, Zap, Users, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useFutebolStore } from '@/stores/futebolStore'
import { TeamManager } from '@/components/TeamManager'
import { MatchSetup } from '@/components/MatchSetup'
import { StatsHeatMapTabs } from '@/components/StatsHeatMapTabs'
import { GameHistory } from '@/components/GameHistory'
import { ActionTypeManager } from '@/components/ActionTypeManager'
import { IOSHeader } from '@/components/IOSHeader'
import { IOSTabBar } from '@/components/IOSTabBar'
import { IOSCard } from '@/components/IOSCard'
import { IOSFieldView } from '@/components/IOSFieldView'

const Index = () => {
  const { appState, currentMatch, endMatch, setAppState } = useFutebolStore()
  const [activeTab, setActiveTab] = useState('setup')

  // Prevent zoom on iOS
  useEffect(() => {
    const preventDefault = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault()
      }
    }
    
    document.addEventListener('touchstart', preventDefault, { passive: false })
    document.addEventListener('touchmove', preventDefault, { passive: false })
    
    return () => {
      document.removeEventListener('touchstart', preventDefault)
      document.removeEventListener('touchmove', preventDefault)
    }
  }, [])

  if (appState === 'playing' && currentMatch) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <IOSHeader
          title="Partida"
          subtitle={`${currentMatch.teamA.name} vs ${currentMatch.teamB.name}`}
          onBack={endMatch}
        />
        
        <div className="flex-1 overflow-hidden">
          <IOSFieldView />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <IOSHeader
        title="⚽ FutebolStats"
        subtitle="Análise Tática em Tempo Real"
      />
      
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="p-4 space-y-4">
          {activeTab === 'setup' && (
            <IOSCard title="Iniciar Partida" icon={<Home className="h-5 w-5 text-primary" />}>
              <MatchSetup />
            </IOSCard>
          )}
          
          {activeTab === 'teams' && (
            <IOSCard title="Gerenciar Times" icon={<Users className="h-5 w-5 text-primary" />}>
              <TeamManager />
            </IOSCard>
          )}
          
          {activeTab === 'actions' && (
            <IOSCard title="Ações do Jogo" icon={<Zap className="h-5 w-5 text-primary" />}>
              <ActionTypeManager />
            </IOSCard>
          )}
          
          {activeTab === 'history' && (
            <IOSCard title="Histórico de Jogos" icon={<History className="h-5 w-5 text-primary" />}>
              <GameHistory />
            </IOSCard>
          )}
        </div>
      </div>
      
      <IOSTabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
};

export default Index;

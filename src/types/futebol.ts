export interface Player {
  id: string
  number: number
  name: string
  position: 'Goleiro' | 'Zagueiro' | 'Lateral Esquerdo' | 'Lateral Direito' | 'Meio-campista' | 'Atacante'
  role: 'Goleiro Tradicional' | 'Goleiro-Líbero' | 'Zagueiro Central' | 'Zagueiro Construtor' | 'Líbero' | 'Lateral Defensivo' | 'Lateral Apoiador' | 'Lateral Construtor' | 'Ala' | 'Cabeça de Área' | 'Primeiro Volante' | 'Segundo Volante' | 'Meia Box-to-Box' | 'Meia Armador' | 'Meia Central' | 'Meia-atacante' | 'Meia de Ligação' | 'Ponta' | 'Extremo' | 'Ponta Invertido' | 'Segundo Atacante' | 'Centroavante' | 'Homem de Área' | 'Pivô' | 'Falso 9'
  isStarter?: boolean
  isCaptain?: boolean
  fieldPosition?: { x: number; y: number }
}

export interface Team {
  id: string
  name: string
  logo?: string
  logoUrl: string
  colors: {
    primary: string
    secondary: string
  }
  players: Player[]
  formation?: string
  tacticalSetup?: {
    starters: string[]
    captain: string | null
    formation: string
  }
}

export interface GameAction {
  id: string
  type: 'possession' | 'specific'
  teamId: string
  playerId?: string
  playerIds?: string[] // Para ações que envolvem múltiplos jogadores
  zone: { row: number; col: number }
  timestamp: number
  actionName?: string
  substitution?: {
    playerOut: string
    playerIn: string
  }
}

export interface Match {
  id: string
  teamA: Team
  teamB: Team
  actions: GameAction[]
  startTime: Date
  currentTime: number
  isPlaying: boolean
  currentPossession: string | null
}

export interface ActionType {
  id: string
  name: string
  requiresPlayer: boolean | 'multiple'
  icon: string
  counterAction?: string // ID da ação que deve ser registrada no time adversário
  reverseAction?: boolean // Se true, registra a ação no time adversário ao invés do time com posse
  changesPossession?: boolean // Se true, muda automaticamente a posse para o time adversário
  requiresMultiplePlayers?: boolean // Para ações como substituição
}

export interface ZoneStats {
  teamA: number
  teamB: number
  total: number
}

export interface SavedGame {
  id: string
  teamA: Team
  teamB: Team
  actions: GameAction[]
  startTime: Date
  endTime: Date
  duration: number
}

export interface GameStats {
  possession: {
    teamA: number
    teamB: number
  }
  actions: {
    teamA: number
    teamB: number
  }
  specificActions: Record<string, { teamA: number; teamB: number }>
}

export type AppState = 'setup' | 'playing' | 'fullscreen' | 'reports' | 'history'
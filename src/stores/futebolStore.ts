
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Team, Match, GameAction, ActionType, AppState, SavedGame, GameStats } from '@/types/futebol'

interface FutebolState {
  // Data
  teams: Team[]
  currentMatch: Match | null
  savedGames: SavedGame[]
  actionTypes: ActionType[]
  appState: AppState
  
  // Actions
  addTeam: (team: Team) => void
  updateTeam: (teamId: string, updates: Partial<Team>) => void
  deleteTeam: (teamId: string) => void
  
  startMatch: (teamAId: string, teamBId: string) => void
  endMatch: () => void
  saveGame: (game: SavedGame) => void
  deleteGame: (gameId: string) => void
  loadSavedGame: (game: SavedGame) => void
  
  updateGameAction: (gameId: string, actionId: string, updates: Partial<GameAction>) => void
  deleteGameAction: (gameId: string, actionId: string) => void
  
  setPossession: (teamId: string) => void
  addAction: (action: Omit<GameAction, 'id' | 'timestamp'>) => void
  
  updateTimer: (time: number) => void
  togglePlayPause: () => void
  
  setAppState: (state: AppState) => void
  
  addActionType: (actionType: ActionType) => void
  updateActionType: (actionTypeId: string, updates: Partial<ActionType>) => void
  deleteActionType: (actionTypeId: string) => void
  
  // Stats
  getGameStats: (game: SavedGame | Match) => GameStats
  
  clearAllData: () => void
}

const defaultActionTypes: ActionType[] = [
  { id: '1', name: 'Chute no Alvo', requiresPlayer: true, icon: '⚽' },
  { id: '2', name: 'Chute Fora do Alvo', requiresPlayer: true, icon: '🥅' },
  { id: '3', name: 'Falta Cometida', requiresPlayer: true, icon: '🟨', counterAction: '14', changesPossession: true },
  { id: '4', name: 'Cartão Amarelo', requiresPlayer: true, icon: '🟨' },
  { id: '5', name: 'Cartão Vermelho', requiresPlayer: true, icon: '🟥' },
  { id: '6', name: 'Cartão Vermelho Direto', requiresPlayer: true, icon: '🔴' },
  { id: '7', name: 'Escanteio', requiresPlayer: true, icon: '🏁', changesPossession: true },
  { id: '8', name: 'Impedimento', requiresPlayer: true, icon: '🚩', changesPossession: true },
  { id: '9', name: 'Lateral', requiresPlayer: true, icon: '↔️', changesPossession: true },
  { id: '10', name: 'Desarme', requiresPlayer: true, icon: '🦵' },
  { id: '11', name: 'Chute Bloqueado', requiresPlayer: true, icon: '🛡️' },
  { id: '12', name: 'Gol Contra', requiresPlayer: true, icon: '😵', reverseAction: true },
  { id: '13', name: 'Mão na Bola', requiresPlayer: true, icon: '✋' },
  { id: '14', name: 'Falta Sofrida', requiresPlayer: false, icon: '🚑' },
]

export const useFutebolStore = create<FutebolState>()(
  persist(
    (set, get) => ({
      teams: [],
      currentMatch: null,
      savedGames: [],
      actionTypes: defaultActionTypes,
      appState: 'setup',
      
      addTeam: (team) => set((state) => ({
        teams: [...state.teams, team]
      })),
      
      updateTeam: (teamId, updates) => set((state) => ({
        teams: state.teams.map(team => {
          if (team.id === teamId) {
            return { ...team, ...updates }
          }
          return team
        }),
        // Atualizar também o currentMatch se estiver ativo
        currentMatch: state.currentMatch ? {
          ...state.currentMatch,
          teamA: state.currentMatch.teamA.id === teamId 
            ? { ...state.currentMatch.teamA, ...updates }
            : state.currentMatch.teamA,
          teamB: state.currentMatch.teamB.id === teamId 
            ? { ...state.currentMatch.teamB, ...updates }
            : state.currentMatch.teamB
        } : null
      })),
      
      deleteTeam: (teamId) => set((state) => ({
        teams: state.teams.filter(team => team.id !== teamId)
      })),
      
      startMatch: (teamAId, teamBId) => {
        const teams = get().teams
        const teamA = teams.find(t => t.id === teamAId)
        const teamB = teams.find(t => t.id === teamBId)
        
        if (teamA && teamB) {
          set({
            currentMatch: {
              id: Date.now().toString(),
              teamA,
              teamB,
              actions: [],
              startTime: new Date(),
              currentTime: 0,
              isPlaying: false,
              currentPossession: null
            },
            appState: 'playing'
          })
        }
      },
      
      loadSavedGame: (game) => {
        // Convert the saved game to a current match, updating teams with current data
        const state = get()
        const currentTeamA = state.teams.find(t => t.id === game.teamA.id) || game.teamA
        const currentTeamB = state.teams.find(t => t.id === game.teamB.id) || game.teamB
        
        set({
          currentMatch: {
            id: game.id,
            teamA: currentTeamA,
            teamB: currentTeamB,
            actions: [...game.actions], // Create a new array to avoid reference issues
            startTime: new Date(game.startTime),
            currentTime: game.duration,
            isPlaying: false,
            currentPossession: null
          },
          appState: 'playing'
        })
      },
      
      endMatch: () => {
        const currentMatch = get().currentMatch
        if (currentMatch) {
          const savedGame: SavedGame = {
            id: currentMatch.id,
            teamA: currentMatch.teamA,
            teamB: currentMatch.teamB,
            actions: currentMatch.actions,
            startTime: currentMatch.startTime,
            endTime: new Date(),
            duration: currentMatch.currentTime
          }
          
          // If the game already exists in savedGames, update it instead of adding a new one
          const existingIndex = get().savedGames.findIndex(g => g.id === currentMatch.id)
          if (existingIndex >= 0) {
            set((state) => ({
              savedGames: state.savedGames.map((g, i) => 
                i === existingIndex ? savedGame : g
              ),
              currentMatch: null,
              appState: 'setup'
            }))
          } else {
            set((state) => ({
              savedGames: [...state.savedGames, savedGame],
              currentMatch: null,
              appState: 'setup'
            }))
          }
        } else {
          set({
            currentMatch: null,
            appState: 'setup'
          })
        }
      },
      
      saveGame: (game) => set((state) => ({
        savedGames: [...state.savedGames, game]
      })),
      
      deleteGame: (gameId) => set((state) => ({
        savedGames: state.savedGames.filter(game => game.id !== gameId)
      })),
      
      updateGameAction: (gameId, actionId, updates) => set((state) => {
        // Find the game
        const gameIndex = state.savedGames.findIndex(g => g.id === gameId)
        if (gameIndex === -1) return state
        
        // Create a new copy of the game
        const updatedGame = { 
          ...state.savedGames[gameIndex],
          actions: state.savedGames[gameIndex].actions.map(action => 
            action.id === actionId 
              ? { ...action, ...updates } 
              : action
          )
        }
        
        // Update the savedGames array
        return {
          savedGames: [
            ...state.savedGames.slice(0, gameIndex),
            updatedGame,
            ...state.savedGames.slice(gameIndex + 1)
          ]
        }
      }),
      
      deleteGameAction: (gameId, actionId) => set((state) => {
        // Find the game
        const gameIndex = state.savedGames.findIndex(g => g.id === gameId)
        if (gameIndex === -1) return state
        
        // Create a new copy of the game with the action filtered out
        const updatedGame = { 
          ...state.savedGames[gameIndex],
          actions: state.savedGames[gameIndex].actions.filter(action => action.id !== actionId)
        }
        
        // Update the savedGames array
        return {
          savedGames: [
            ...state.savedGames.slice(0, gameIndex),
            updatedGame,
            ...state.savedGames.slice(gameIndex + 1)
          ]
        }
      }),
      
      setPossession: (teamId) => set((state) => ({
        currentMatch: state.currentMatch ? {
          ...state.currentMatch,
          currentPossession: teamId
        } : null
      })),
      
      addAction: (action) => set((state) => {
        if (!state.currentMatch) return state
        
        const newAction: GameAction = {
          ...action,
          id: Date.now().toString(),
          timestamp: state.currentMatch.currentTime
        }
        
        const actions = [newAction]
        let newPossession = state.currentMatch.currentPossession
        
        // Se a ação tem uma contra-ação, adicionar automaticamente
        if (action.type === 'specific' && action.actionName) {
          const actionType = state.actionTypes.find(at => at.name === action.actionName)
          
          // Verificar se a ação muda a posse automaticamente
          if (actionType?.changesPossession && state.currentMatch.currentPossession) {
            newPossession = state.currentMatch.currentPossession === state.currentMatch.teamA.id 
              ? state.currentMatch.teamB.id 
              : state.currentMatch.teamA.id
          }
          
          if (actionType?.counterAction) {
            const counterActionType = state.actionTypes.find(at => at.id === actionType.counterAction)
            if (counterActionType) {
              const oppositeTeamId = action.teamId === state.currentMatch.teamA.id 
                ? state.currentMatch.teamB.id 
                : state.currentMatch.teamA.id
                
              const counterAction: GameAction = {
                id: (Date.now() + 1).toString(),
                type: 'specific',
                teamId: oppositeTeamId,
                zone: action.zone,
                timestamp: state.currentMatch.currentTime,
                actionName: counterActionType.name
              }
              actions.push(counterAction)
            }
          }
        }
        
        return {
          currentMatch: {
            ...state.currentMatch,
            actions: [...state.currentMatch.actions, ...actions],
            currentPossession: newPossession
          }
        }
      }),
      
      updateTimer: (time) => set((state) => ({
        currentMatch: state.currentMatch ? {
          ...state.currentMatch,
          currentTime: time
        } : null
      })),
      
      togglePlayPause: () => set((state) => ({
        currentMatch: state.currentMatch ? {
          ...state.currentMatch,
          isPlaying: !state.currentMatch.isPlaying
        } : null
      })),
      
      setAppState: (appState) => set({ appState }),
      
      addActionType: (actionType) => set((state) => ({
        actionTypes: [...state.actionTypes, actionType]
      })),
      
      updateActionType: (actionTypeId, updates) => set((state) => ({
        actionTypes: state.actionTypes.map(actionType => 
          actionType.id === actionTypeId ? { ...actionType, ...updates } : actionType
        )
      })),
      
      deleteActionType: (actionTypeId) => set((state) => ({
        actionTypes: state.actionTypes.filter(at => at.id !== actionTypeId)
      })),
      
      getGameStats: (game) => {
        const actions = game.actions
        const totalActions = actions.length
        
        const teamAActions = actions.filter(a => a.teamId === game.teamA.id).length
        const teamBActions = actions.filter(a => a.teamId === game.teamB.id).length
        
        const specificActions: Record<string, { teamA: number; teamB: number }> = {}
        
        get().actionTypes.forEach(actionType => {
          const teamACount = actions.filter(a => 
            a.teamId === game.teamA.id && a.actionName === actionType.name
          ).length
          const teamBCount = actions.filter(a => 
            a.teamId === game.teamB.id && a.actionName === actionType.name
          ).length
          
          specificActions[actionType.name] = {
            teamA: teamACount,
            teamB: teamBCount
          }
        })
        
        return {
          possession: {
            teamA: totalActions > 0 ? Math.round((teamAActions / totalActions) * 100) : 0,
            teamB: totalActions > 0 ? Math.round((teamBActions / totalActions) * 100) : 0
          },
          actions: {
            teamA: teamAActions,
            teamB: teamBActions
          },
          specificActions
        }
      },
      
      clearAllData: () => set({
        teams: [],
        currentMatch: null,
        savedGames: [],
        actionTypes: defaultActionTypes,
        appState: 'setup'
      })
    }),
    {
      name: 'futebol-stats-storage',
      partialize: (state) => ({
        teams: state.teams,
        savedGames: state.savedGames,
        actionTypes: state.actionTypes
      })
    }
  )
)

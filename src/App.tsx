import { useState } from 'react'
import { Sidebar, type View } from './components/Layout/Sidebar'
import { Dashboard } from './components/Dashboard/Dashboard'
import { FitnessTest } from './components/Test/FitnessTest'
import { WorkoutScreen } from './components/Training/WorkoutScreen'
import { History } from './components/History/History'
import { ProgressView } from './components/Progress/ProgressView'
import { Calculator } from './components/Calculator/Calculator'
import { Settings } from './components/Settings/Settings'
import { useAppState } from './hooks/useAppState'
import { getCurrentWeek, getNextWorkoutLetter } from './logic/planGenerator'

export default function App() {
  const [view, setView] = useState<View>('dashboard')
  const {
    data,
    saveTestResult,
    setGoals,
    setProfile,
    startNewProgram,
    completeWorkout,
    resetProgram,
    exportJson,
    importJson,
  } = useAppState()

  const program = data.program

  return (
    <div className="app-shell">
      <Sidebar active={view === 'training' ? 'dashboard' : view} onNavigate={setView} />

      {view === 'dashboard' && (
        <Dashboard data={data} onStartTraining={() => setView('training')} onGoToTest={() => setView('test')} />
      )}

      {view === 'test' && (
        <FitnessTest
          hasProgram={!!program}
          onSave={saveTestResult}
          onGenerateProgram={(test) => {
            startNewProgram(test)
            setView('dashboard')
          }}
        />
      )}

      {view === 'training' && program && (
        <WorkoutScreen
          template={program.templates.find((t) => t.letter === getNextWorkoutLetter(program))!}
          onComplete={(entries, difficulty) => {
            completeWorkout(getNextWorkoutLetter(program), getCurrentWeek(program), entries, difficulty)
            setView('dashboard')
          }}
          onCancel={() => setView('dashboard')}
        />
      )}

      {view === 'history' && <History history={data.history} />}

      {view === 'progress' && <ProgressView tests={data.tests} goals={data.goals} />}

      {view === 'calculator' && <Calculator profile={data.profile} onSave={setProfile} />}

      {view === 'settings' && (
        <Settings
          goals={data.goals}
          hasProgram={!!program}
          onSaveGoals={setGoals}
          onExport={exportJson}
          onImport={importJson}
          onResetProgram={resetProgram}
        />
      )}
    </div>
  )
}

export type View = 'dashboard' | 'test' | 'training' | 'history' | 'progress' | 'calculator' | 'settings'

const NAV_ITEMS: Array<{ id: View; label: string }> = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'test', label: 'Test' },
  { id: 'history', label: 'Historia' },
  { id: 'progress', label: 'Progres' },
  { id: 'calculator', label: 'Kalkulator' },
  { id: 'settings', label: 'Ustawienia' },
]

interface Props {
  active: View
  onNavigate: (view: View) => void
}

export function Sidebar({ active, onNavigate }: Props) {
  return (
    <nav className="sidebar">
      <div className="sidebar__brand">TRAINING SYSTEM</div>
      <div className="sidebar__nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`sidebar__item ${active === item.id ? 'sidebar__item--active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  )
}

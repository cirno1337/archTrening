import { useEffect, useRef, useState } from 'react'

interface Props {
  seconds: number
}

export function RestTimer({ seconds }: Props) {
  const [remaining, setRemaining] = useState<number | null>(null)
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    setRemaining(null)
    if (intervalRef.current) window.clearInterval(intervalRef.current)
  }, [seconds])

  useEffect(() => {
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current)
    }
  }, [])

  function start() {
    setRemaining(seconds)
    if (intervalRef.current) window.clearInterval(intervalRef.current)
    intervalRef.current = window.setInterval(() => {
      setRemaining((prev) => {
        if (prev === null || prev <= 1) {
          if (intervalRef.current) window.clearInterval(intervalRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
      <span className="rest-badge">Przerwa: {remaining ?? seconds} s</span>
      <button className="btn" onClick={start}>
        Start timer
      </button>
    </div>
  )
}

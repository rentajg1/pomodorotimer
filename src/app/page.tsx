'use client'
import { useEffect, useRef, useState } from 'react'

type phase = 'work' | 'break'

export default function Home() {
  const WORK = 25 * 60 // 25分
  const REST = 5 * 60 // 5分

  // === State ===
  const [phase, setPhase] = useState<phase>('work')
  const [secondsLeft, setSecondsLeft] = useState(WORK)
  const [isRunning, setIsRunning] = useState(false)
  const [cycles, setCycles] = useState(0) // 「25→5→25」を1カウントにしたいなら break→work 切替で +1

  // === 真実は endTime（UNIX ms）。UIはこれから逆算 ===
  const endTimeRef = useRef<number>(0)

  // ===== タイマー（UI更新専用） =====
  useEffect(() => {
    if (!isRunning) return
    const id = setInterval(() => {
      const left = Math.max(
        0,
        Math.ceil((endTimeRef.current - Date.now()) / 1000)
      )
      setSecondsLeft(left)
      if (left === 0) handlePhaseEnd() // 0到達でフェーズ切替
    }, 1000)
    return () => clearInterval(id)
  }, [isRunning])

  // ===== タブ復帰時に一発補正 =====
  useEffect(() => {
    const sync = () => {
      const left = Math.max(
        0,
        Math.ceil((endTimeRef.current - Date.now()) / 1000)
      )
      setSecondsLeft(left)
      if (isRunning && left <= 0) handlePhaseEnd()
    }
    document.addEventListener('visibilitychange', sync)
    window.addEventListener('focus', sync)
    return () => {
      document.removeEventListener('visibilitychange', sync)
      window.removeEventListener('focus', sync)
    }
  }, [isRunning])

  // ===== フェーズ終了時の処理 =====
  const handlePhaseEnd = () => {
    if (phase === 'work') {
      // 作業 → 休憩（ここでは cycles は増やさない）
      setPhase('break')
      setSecondsLeft(REST)
      endTimeRef.current = Date.now() + REST * 1000
      setIsRunning(false)
    } else {
      // 休憩 → 作業（「25→5」が1セット完了とみなすならここで +1）
      setPhase('work')
      setSecondsLeft(WORK)
      endTimeRef.current = Date.now() + WORK * 1000
      setIsRunning(false)
      setCycles((prev) => prev + 1) // ★ サイクル+1
    }
  }

  // ===== スタート/ポーズ =====
  const toggleTimer = () => {
    if (isRunning) {
      // 一時停止：残りを固定
      const left = Math.max(
        0,
        Math.ceil((endTimeRef.current - Date.now()) / 1000)
      )
      endTimeRef.current = 0
      setSecondsLeft(left)
      setIsRunning(false)
    } else {
      // 再開：今の残りから endTime を再設定
      const dur = secondsLeft > 0 ? secondsLeft : phase === 'work' ? WORK : REST
      endTimeRef.current = Date.now() + dur * 1000
      setSecondsLeft(dur)
      setIsRunning(true)
    }
  }

  // ===== リセット =====
  const resetTimer = () => {
    setIsRunning(false)
    setPhase('work')
    setSecondsLeft(WORK)
    endTimeRef.current = 0
  }

  // ===== 表示用 =====
  const minutes = Math.floor(secondsLeft / 60)
    .toString()
    .padStart(2, '0')
  const seconds = (secondsLeft % 60).toString().padStart(2, '0')

  return (
    <main className='flex flex-col items-center justify-center min-h-screen gap-6 bg-gray-900 text-white'>
      <h1 className='text-3xl font-bold'>Pomodoro Timer</h1>
      <div className='text-sm opacity-80'>
        Phase: <b>{phase}</b> / Cycles: <b>{cycles}</b>
      </div>
      <p className='text-6xl font-mono'>
        {minutes}:{seconds}
      </p>
      <div className='flex gap-4'>
        <button
          onClick={toggleTimer}
          className='px-4 py-2 bg-green-500 rounded'
        >
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button onClick={resetTimer} className='px-4 py-2 bg-red-500 rounded'>
          Reset
        </button>
      </div>
      <p>create by :kawak</p>
    </main>
  )
}

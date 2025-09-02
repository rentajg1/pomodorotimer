'use client'
import { useEffect, useState } from 'react'

export default function Home() {
  const initialTime = 25 * 60 // 25分
  const [secondsLeft, setSecondsLeft] = useState(initialTime)
  const [isRunning, setIsRunning] = useState(false)
  const [cycles, setCycles] = useState(0)

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isRunning && secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => prev - 1)
      }, 1000)
    } else if (isRunning && secondsLeft === 0) {
      const audio = new Audio('/alarm.mp3')
      audio.play()
      setIsRunning(false)
      setCycles((prev) => prev + 1)
      setSecondsLeft(5 * 60) // 5分休憩
    }
    return () => clearInterval(timer)
  }, [isRunning, secondsLeft])

  const toggleTimer = () => setIsRunning(!isRunning)
  const resetTimer = () => {
    setIsRunning(false)
    setSecondsLeft(initialTime)
  }

  const minutes = Math.floor(secondsLeft / 60)
    .toString()
    .padStart(2, '0')
  const seconds = (secondsLeft % 60).toString().padStart(2, '0')

  return (
    <main className='flex flex-col items-center justify-center min-h-screen gap-6 bg-gray-900 text-white'>
      <h1 className='text-3xl font-bold'>Pomodoro Timer</h1>
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
      <p>Completed Cycles: {cycles}</p>
      <p>create by :kawak</p>
    </main>
  )
}

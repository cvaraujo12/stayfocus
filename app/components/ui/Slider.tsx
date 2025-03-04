'use client'

import React from 'react'

interface SliderProps {
  min: number
  max: number
  step?: number
  value: number
  onChange: (value: number) => void
  disabled?: boolean
}

export function Slider({ min, max, step = 1, value, onChange, disabled = false }: SliderProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value))
  }
  
  // Calcular a porcentagem para o background gradient
  const percentage = ((value - min) / (max - min)) * 100
  
  return (
    <div className="relative w-full">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className={`
          w-full h-2 rounded-lg appearance-none cursor-pointer
          bg-gradient-to-r from-lazer-primary to-lazer-primary via-lazer-primary
          bg-no-repeat
          dark:bg-gray-700
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        style={{
          backgroundSize: `${percentage}% 100%`,
          backgroundImage: 'linear-gradient(to right, var(--lazer-primary), var(--lazer-primary))'
        }}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
      />
    </div>
  )
}

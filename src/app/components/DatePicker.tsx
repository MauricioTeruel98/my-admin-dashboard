'use client'

import React from 'react'
import ReactDatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { es } from 'date-fns/locale'

interface DatePickerProps {
  selected: Date | null
  onChange: (date: Date | null) => void
  className?: string
}

export default function DatePicker({ selected, onChange, className }: DatePickerProps) {
  return (
    <ReactDatePicker
      selected={selected}
      onChange={onChange}
      locale={es}
      dateFormat="dd/MM/yyyy"
      className={`px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    />
  )
}
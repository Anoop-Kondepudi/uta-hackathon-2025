"use client"

import * as React from "react"
import { Calendar, CalendarDayButton } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"

export default function Calendar21() {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(undefined)

  const handleDayClick = (date: Date | undefined) => {
    setSelectedDate(date)
  }

  return (
    <div className="flex gap-6 flex-col lg:flex-row">
      <div>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDayClick}
          numberOfMonths={1}
          captionLayout="dropdown"
          className="rounded-lg border shadow-sm [--cell-size:--spacing(11)] md:[--cell-size:--spacing(13)]"
          formatters={{
            formatMonthDropdown: (date) => {
              return date.toLocaleString("default", { month: "long" })
            },
          }}
          components={{
            DayButton: ({ children, modifiers, day, ...props }) => {
              const isWeekend = day.date.getDay() === 0 || day.date.getDay() === 6

              return (
                <CalendarDayButton day={day} modifiers={modifiers} {...props}>
                  {children}
                  {!modifiers.outside && <span>{isWeekend ? "$220" : "$100"}</span>}
                </CalendarDayButton>
              )
            },
          }}
        />
      </div>
      
      {/* Info Box */}
      {selectedDate && (
        <Card className="w-full lg:w-72 shadow-lg h-fit">
          <CardContent className="p-4">
            <h3 className="font-semibold text-lg mb-2">Info</h3>
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">
                <span className="font-medium">Date:</span>{" "}
                {selectedDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium">Day:</span>{" "}
                {selectedDate.getDay() === 0 || selectedDate.getDay() === 6 ? "Weekend" : "Weekday"}
              </p>
              <p className="text-muted-foreground">
                Click another date to update info
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

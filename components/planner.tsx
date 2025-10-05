"use client"

import * as React from "react"
import { Calendar, CalendarDayButton } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Cloud, Droplets, Wind, Sun, Loader2, CloudRain, CloudDrizzle, CloudSnow, CloudFog, CloudLightning, ChevronDown, ChevronUp } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface WeatherData {
  date: string
  temp_max: number
  temp_min: number
  rain_probability: number
  precipitation: number
  weather_code: number
  weather_description: string
  wind_speed_max: number
  uv_index_max: number
}

interface WeatherResponse {
  location: {
    city: string
    region: string
    country: string
  }
  current: {
    temperature_2m: number
    relative_humidity_2m: number
    weather_code: number
  }
  forecast: WeatherData[]
}

interface ScheduleDay {
  date: string
  tasks: string[]
  reason: string
  weather_consideration: string
}

interface TwoWeekPlan {
  schedule: ScheduleDay[]
}

interface AnnualMonth {
  month: string
  stage: string
  key_activities: string[]
  notes: string
}

interface CriticalPeriod {
  period: string
  months: string[]
  importance: string
}

interface AnnualPlan {
  annual_overview: AnnualMonth[]
  harvest_windows: string[]
  critical_periods: CriticalPeriod[]
}

interface TwoWeekScheduleResponse {
  two_week_plan: TwoWeekPlan
  location: {
    city: string
    region: string
    country: string
  }
}

interface AnnualPlanResponse {
  annual_plan: AnnualPlan
  location: {
    city: string
    region: string
    country: string
  }
}

export default function Planner() {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(undefined)
  const [weatherData, setWeatherData] = React.useState<WeatherResponse | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [twoWeekSchedule, setTwoWeekSchedule] = React.useState<TwoWeekPlan | null>(null)
  const [annualPlan, setAnnualPlan] = React.useState<AnnualPlan | null>(null)
  const [isGeneratingTwoWeek, setIsGeneratingTwoWeek] = React.useState(false)
  const [isGeneratingAnnual, setIsGeneratingAnnual] = React.useState(false)

  const handleDayClick = (date: Date | undefined) => {
    setSelectedDate(date)
  }

  // Auto-fetch weather data on component mount
  React.useEffect(() => {
    fetchWeatherData()
  }, [])

  // Get weather icon based on weather code
  const getWeatherIcon = (weatherCode: number, size: number = 16) => {
    const iconProps = { size, className: "mx-auto" }
    
    // Clear sky
    if (weatherCode === 0 || weatherCode === 1) {
      return <Sun {...iconProps} className="mx-auto text-yellow-500" />
    }
    // Partly cloudy / Overcast
    if (weatherCode === 2 || weatherCode === 3) {
      return <Cloud {...iconProps} className="mx-auto text-gray-500" />
    }
    // Fog
    if (weatherCode === 45 || weatherCode === 48) {
      return <CloudFog {...iconProps} className="mx-auto text-gray-400" />
    }
    // Drizzle
    if (weatherCode >= 51 && weatherCode <= 55) {
      return <CloudDrizzle {...iconProps} className="mx-auto text-blue-400" />
    }
    // Rain
    if (weatherCode >= 61 && weatherCode <= 67) {
      return <CloudRain {...iconProps} className="mx-auto text-blue-600" />
    }
    // Snow
    if (weatherCode >= 71 && weatherCode <= 77) {
      return <CloudSnow {...iconProps} className="mx-auto text-blue-300" />
    }
    // Rain showers
    if (weatherCode >= 80 && weatherCode <= 82) {
      return <CloudRain {...iconProps} className="mx-auto text-blue-600" />
    }
    // Snow showers
    if (weatherCode >= 85 && weatherCode <= 86) {
      return <CloudSnow {...iconProps} className="mx-auto text-blue-300" />
    }
    // Thunderstorm
    if (weatherCode >= 95 && weatherCode <= 99) {
      return <CloudLightning {...iconProps} className="mx-auto text-purple-600" />
    }
    
    // Default
    return <Cloud {...iconProps} className="mx-auto text-gray-500" />
  }

  // Check if weather code indicates rain/drizzle
  const isRainyWeather = (weatherCode: number): boolean => {
    // Drizzle: 51, 53, 55
    // Rain: 61, 63, 65, 66, 67
    // Rain showers: 80, 81, 82
    // Thunderstorm: 95, 96, 99
    return (
      (weatherCode >= 51 && weatherCode <= 55) || // Drizzle
      (weatherCode >= 61 && weatherCode <= 67) || // Rain
      (weatherCode >= 80 && weatherCode <= 82) || // Rain showers
      (weatherCode >= 95 && weatherCode <= 99)    // Thunderstorm
    )
  }

  const fetchWeatherData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("http://localhost:8000/weather")
      if (!response.ok) {
        throw new Error("Failed to fetch weather data")
      }
      const data: WeatherResponse = await response.json()
      setWeatherData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch weather data")
      console.error("Error fetching weather:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const generateTwoWeekSchedule = async () => {
    if (!weatherData) {
      setError("Please fetch weather data first")
      return
    }

    setIsGeneratingTwoWeek(true)
    setError(null)
    try {
      const response = await fetch("http://localhost:8000/generate-two-week-schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(weatherData),
      })
      
      if (!response.ok) {
        throw new Error("Failed to generate 2-week schedule")
      }
      
      const data: TwoWeekScheduleResponse = await response.json()
      setTwoWeekSchedule(data.two_week_plan)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate 2-week schedule")
      console.error("Error generating 2-week schedule:", err)
    } finally {
      setIsGeneratingTwoWeek(false)
    }
  }

  const generateAnnualPlan = async () => {
    if (!weatherData) {
      setError("Please fetch weather data first")
      return
    }

    setIsGeneratingAnnual(true)
    setError(null)
    try {
      const response = await fetch("http://localhost:8000/generate-annual-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(weatherData),
      })
      
      if (!response.ok) {
        throw new Error("Failed to generate annual plan")
      }
      
      const data: AnnualPlanResponse = await response.json()
      setAnnualPlan(data.annual_plan)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate annual plan")
      console.error("Error generating annual plan:", err)
    } finally {
      setIsGeneratingAnnual(false)
    }
  }

  const generateAllSchedules = async () => {
    await Promise.all([
      generateTwoWeekSchedule(),
      generateAnnualPlan()
    ])
  }

  // Get weather data for a specific date (only within 2-week range)
  const getWeatherForDate = (date: Date): WeatherData | undefined => {
    if (!weatherData) return undefined
    
    // Check if date is within 2-week range
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const twoWeeksFromNow = new Date(today)
    twoWeeksFromNow.setDate(today.getDate() + 14)
    
    if (date < today || date >= twoWeeksFromNow) {
      return undefined
    }
    
    const dateString = date.toISOString().split('T')[0]
    return weatherData.forecast.find(day => day.date === dateString)
  }

  // Get selected date weather info
  const selectedWeather = selectedDate ? getWeatherForDate(selectedDate) : undefined

  // Get tasks for a specific date (fix timezone offset)
  const getTasksForDate = (date: Date): ScheduleDay | undefined => {
    if (!twoWeekSchedule) return undefined
    
    // Format date as YYYY-MM-DD in local timezone
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const dateString = `${year}-${month}-${day}`
    
    return twoWeekSchedule.schedule.find(scheduleDay => scheduleDay.date === dateString)
  }

  // Get selected date tasks
  const selectedTasks = selectedDate ? getTasksForDate(selectedDate) : undefined

  // Calculate background color based on rain probability
  const getRainBackgroundColor = (rainProb: number): string => {
    if (rainProb === 0) return ""
    const opacity = Math.min(rainProb / 100, 0.8) // Max 80% opacity
    return `rgba(239, 68, 68, ${opacity})` // red-500 with variable opacity
  }

  return (
    <div className="flex justify-center w-full">
      <div className="flex gap-6 flex-col max-w-7xl w-full px-4">
      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-center items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading weather data...</span>
        </div>
      )}

      {error && (
        <div className="text-center text-red-500 text-sm">
          {error}
        </div>
      )}

      {weatherData && (
        <div className="text-center text-sm text-muted-foreground">
          Weather data for {weatherData.location.city}, {weatherData.location.region}, {weatherData.location.country}
        </div>
      )}

      <div className="flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row gap-6 justify-center">
          {/* Calendar */}
          <div className="flex justify-center lg:justify-start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDayClick}
              numberOfMonths={1}
              captionLayout="dropdown"
              disabled={(date) => {
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                const twoWeeksFromNow = new Date(today)
                twoWeeksFromNow.setDate(today.getDate() + 14)
                return date < today || date >= twoWeeksFromNow
              }}
              defaultMonth={new Date()}
              className="rounded-lg border shadow-sm [--cell-size:--spacing(11)] md:[--cell-size:--spacing(13)]"
              formatters={{
                formatMonthDropdown: (date) => {
                  return date.toLocaleString("default", { month: "long" })
                },
              }}
              components={{
                DayButton: ({ children, modifiers, day, ...props }) => {
                  const weather = weatherData ? getWeatherForDate(day.date) : undefined
                  const rainProb = weather?.rain_probability || 0
                  const bgColor = getRainBackgroundColor(rainProb)
                  const showRainPercent = weather && isRainyWeather(weather.weather_code) && rainProb > 0

                  return (
                    <CalendarDayButton 
                      day={day} 
                      modifiers={modifiers} 
                      {...props}
                      style={bgColor ? { backgroundColor: bgColor } : undefined}
                    >
                      {children}
                      {!modifiers.outside && weather && (
                        <div className="flex flex-col items-center gap-0.5">
                          {getWeatherIcon(weather.weather_code, 14)}
                          {showRainPercent && (
                            <span className="text-[9px] font-semibold text-blue-700 dark:text-blue-300">
                              {rainProb}%
                            </span>
                          )}
                        </div>
                      )}
                    </CalendarDayButton>
                  )
                },
              }}
            />
          </div>
          
          {/* Weather Info Box */}
          {selectedDate && (
            <Card className="lg:col-span-1 shadow-lg h-fit">
              <CardHeader>
                <CardTitle className="text-lg">
                  {selectedDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedWeather ? (
                  <>
                    {/* Temperature */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                        <Sun className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Temperature</div>
                        <div className="text-lg font-semibold">
                          {Math.round(selectedWeather.temp_min)}°F - {Math.round(selectedWeather.temp_max)}°F
                        </div>
                      </div>
                    </div>

                    {/* Rain Probability */}
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        selectedWeather.rain_probability > 0 
                          ? 'bg-blue-100 dark:bg-blue-900/20' 
                          : 'bg-gray-100 dark:bg-gray-800'
                      }`}>
                        <Droplets className={`h-5 w-5 ${
                          selectedWeather.rain_probability > 0 
                            ? 'text-blue-600 dark:text-blue-400' 
                            : 'text-gray-400'
                        }`} />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Rain Chance</div>
                        <div className="text-lg font-semibold">
                          {selectedWeather.rain_probability}%
                        </div>
                      </div>
                    </div>

                    {/* Precipitation */}
                    {selectedWeather.precipitation > 0 && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                          <Droplets className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Expected Rainfall</div>
                          <div className="text-lg font-semibold">
                            {selectedWeather.precipitation.toFixed(1)} mm
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Weather Condition */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-900/20 flex items-center justify-center">
                        {getWeatherIcon(selectedWeather.weather_code, 20)}
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Conditions</div>
                        <div className="text-lg font-semibold">
                          {selectedWeather.weather_description}
                        </div>
                      </div>
                    </div>

                    {/* Wind Speed */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/20 flex items-center justify-center">
                        <Wind className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Max Wind Speed</div>
                        <div className="text-lg font-semibold">
                          {Math.round(selectedWeather.wind_speed_max)} mph
                        </div>
                      </div>
                    </div>

                    {/* UV Index */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                        <Sun className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">UV Index</div>
                        <div className="text-lg font-semibold">
                          {selectedWeather.uv_index_max.toFixed(1)}
                        </div>
                      </div>
                    </div>
                  </>
                ) : weatherData ? (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    No weather data available for this date
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    Click "Fetch Weather Data" to see weather information
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Tasks Box */}
          {selectedDate && selectedTasks && (
            <Card className="lg:col-span-1 shadow-lg h-fit">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  📋 Tasks for This Day
                  {selectedTasks.tasks.length > 0 && (
                    <span className="text-sm bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-1 rounded">
                      {selectedTasks.tasks.length}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedTasks.tasks.length > 0 ? (
                  <>
                    <ul className="list-disc list-inside space-y-2 text-sm">
                      {selectedTasks.tasks.map((task, idx) => (
                        <li key={idx} className="text-foreground">{task}</li>
                      ))}
                    </ul>
                    <div className="pt-3 border-t space-y-2">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-1">Reason:</p>
                        <p className="text-sm">{selectedTasks.reason}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-1">Weather Consideration:</p>
                        <p className="text-sm">{selectedTasks.weather_consideration}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground italic">No tasks scheduled for this day</p>
                    <div className="pt-3 border-t">
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Reason:</p>
                      <p className="text-sm">{selectedTasks.reason}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Schedule Box */}
        <Card className="w-full shadow-lg">
          {!twoWeekSchedule && !annualPlan ? (
            <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
              <Button 
                size="lg" 
                className="gap-2"
                onClick={generateAllSchedules}
                disabled={(isGeneratingTwoWeek || isGeneratingAnnual) || !weatherData}
              >
                {(isGeneratingTwoWeek || isGeneratingAnnual) ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-lg">Generating Schedules...</span>
                  </>
                ) : (
                  <span className="text-lg">Generate Schedule with AI</span>
                )}
              </Button>
              {!weatherData && (
                <p className="text-sm text-muted-foreground">
                  Fetch weather data first to generate schedule
                </p>
              )}
            </CardContent>
          ) : (
            <CardContent className="p-4">
              <Accordion type="multiple" className="w-full space-y-3">
                {/* 2-Week Plan Accordion */}
                {twoWeekSchedule && (
                  <AccordionItem value="two-week" className="border rounded-lg px-3">
                    <AccordionTrigger className="hover:no-underline py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">📅</span>
                        <h3 className="text-lg font-bold">2-Week Task Schedule</h3>
                        {isGeneratingTwoWeek && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pt-2 max-h-[600px] overflow-y-auto pr-2">
                        {twoWeekSchedule.schedule.map((day: ScheduleDay) => (
                      <Card key={day.date} className="border-l-4 border-l-green-500">
                        <CardContent className="p-3">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-base">
                              {new Date(day.date + 'T00:00:00').toLocaleDateString("en-US", {
                                weekday: "long",
                                month: "short",
                                day: "numeric",
                              })}
                            </h4>
                            {day.tasks.length > 0 && (
                              <span className="text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-0.5 rounded">
                                {day.tasks.length} {day.tasks.length === 1 ? "task" : "tasks"}
                              </span>
                            )}
                          </div>
                          
                          {day.tasks.length > 0 ? (
                            <ul className="list-disc list-inside space-y-1 mb-2 text-sm">
                              {day.tasks.map((task: string, idx: number) => (
                                <li key={idx} className="text-foreground">{task}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-muted-foreground italic mb-2">No tasks scheduled</p>
                          )}
                          
                          <div className="space-y-1 text-xs text-muted-foreground">
                            <p><strong>Reason:</strong> {day.reason}</p>
                            <p><strong>Weather:</strong> {day.weather_consideration}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* Annual Plan Accordion */}
                {annualPlan && (
                  <AccordionItem value="annual" className="border rounded-lg px-3">
                    <AccordionTrigger className="hover:no-underline py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">📆</span>
                        <h3 className="text-lg font-bold">Annual Mango Cultivation Overview</h3>
                        {isGeneratingAnnual && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-2 max-h-[600px] overflow-y-auto pr-2">
                        {/* Harvest Windows */}
                        <div className="p-3 bg-orange-50 dark:bg-orange-900/10 rounded-lg">
                          <h4 className="font-semibold text-base mb-1 text-orange-700 dark:text-orange-400">
                            🥭 Harvest Windows
                          </h4>
                          <p className="text-sm">
                            {annualPlan.harvest_windows.join(", ")}
                          </p>
                        </div>

                        {/* Monthly Overview */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                          {annualPlan.annual_overview.map((month: AnnualMonth) => (
                            <Card key={month.month} className="hover:shadow-md transition-shadow">
                              <CardContent className="p-3">
                                <h4 className="font-semibold text-sm mb-1">{month.month}</h4>
                                <p className="text-[10px] text-muted-foreground mb-1 italic">{month.stage}</p>
                                <ul className="list-disc list-inside space-y-0.5 mb-1 text-[11px]">
                                  {month.key_activities.map((activity: string, idx: number) => (
                                    <li key={idx}>{activity}</li>
                                  ))}
                                </ul>
                                <p className="text-[10px] text-muted-foreground">{month.notes}</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>

                        {/* Critical Periods */}
                        <div className="space-y-2">
                          <h4 className="font-semibold text-base">⚠️ Critical Periods</h4>
                          {annualPlan.critical_periods.map((period: CriticalPeriod, idx: number) => (
                            <Card key={idx} className="border-l-4 border-l-red-500">
                              <CardContent className="p-3">
                                <h5 className="font-semibold text-sm mb-1">{period.period}</h5>
                                <p className="text-xs text-muted-foreground mb-1">
                                  <strong>Months:</strong> {period.months.join(", ")}
                                </p>
                                <p className="text-xs">{period.importance}</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>

              {/* Regenerate Buttons */}
              <div className="flex justify-center gap-3 mt-4 pt-4 border-t">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={generateTwoWeekSchedule}
                  disabled={isGeneratingTwoWeek || !weatherData}
                  className="gap-2"
                >
                  {isGeneratingTwoWeek ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Regenerating...
                    </>
                  ) : (
                    <>
                      📅 Regenerate 2-Week
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={generateAnnualPlan}
                  disabled={isGeneratingAnnual || !weatherData}
                  className="gap-2"
                >
                  {isGeneratingAnnual ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Regenerating...
                    </>
                  ) : (
                    <>
                      📆 Regenerate Annual
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
      </div>
    </div>
  )
}

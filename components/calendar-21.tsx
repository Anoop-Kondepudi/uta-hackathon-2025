"use client"

import * as React from "react"
import { Calendar, CalendarDayButton } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Cloud, Droplets, Wind, Sun, Loader2, CloudRain, CloudDrizzle, CloudSnow, CloudFog, CloudLightning } from "lucide-react"

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

interface ScheduleResponse {
  two_week_plan: TwoWeekPlan
  annual_plan: AnnualPlan
  location: {
    city: string
    region: string
    country: string
  }
}

export default function Calendar21() {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(undefined)
  const [weatherData, setWeatherData] = React.useState<WeatherResponse | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [scheduleData, setScheduleData] = React.useState<ScheduleResponse | null>(null)
  const [isGeneratingSchedule, setIsGeneratingSchedule] = React.useState(false)

  const handleDayClick = (date: Date | undefined) => {
    setSelectedDate(date)
  }

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

  const generateSchedule = async () => {
    if (!weatherData) {
      setError("Please fetch weather data first")
      return
    }

    setIsGeneratingSchedule(true)
    setError(null)
    try {
      const response = await fetch("http://localhost:8000/generate-schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(weatherData),
      })
      
      if (!response.ok) {
        throw new Error("Failed to generate schedule")
      }
      
      const data: ScheduleResponse = await response.json()
      setScheduleData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate schedule")
      console.error("Error generating schedule:", err)
    } finally {
      setIsGeneratingSchedule(false)
    }
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

  // Calculate background color based on rain probability
  const getRainBackgroundColor = (rainProb: number): string => {
    if (rainProb === 0) return ""
    const opacity = Math.min(rainProb / 100, 0.8) // Max 80% opacity
    return `rgba(239, 68, 68, ${opacity})` // red-500 with variable opacity
  }

  return (
    <div className="flex gap-6 flex-col">
      {/* Fetch Weather Button */}
      <div className="flex justify-center">
        <Button 
          onClick={fetchWeatherData} 
          disabled={isLoading}
          size="lg"
          className="gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Fetching Weather Data...
            </>
          ) : (
            <>
              <Cloud className="h-4 w-4" />
              Fetch Weather Data
            </>
          )}
        </Button>
      </div>

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
        <div className="flex gap-6 flex-col lg:flex-row">
          <div>
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
          
          {/* Info Box */}
          {selectedDate && (
            <Card className="w-full lg:w-80 shadow-lg h-fit">
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
        </div>

        {/* Schedule Box */}
        <Card className="w-full shadow-lg">
          {!scheduleData ? (
            <CardContent className="flex items-center justify-center py-16">
              <Button 
                size="lg" 
                className="gap-2"
                onClick={generateSchedule}
                disabled={isGeneratingSchedule || !weatherData}
              >
                {isGeneratingSchedule ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-lg">Generating Schedule...</span>
                  </>
                ) : (
                  <span className="text-lg">Generate Schedule with AI</span>
                )}
              </Button>
              {!weatherData && (
                <p className="text-sm text-muted-foreground mt-4 absolute bottom-4">
                  Fetch weather data first to generate schedule
                </p>
              )}
            </CardContent>
          ) : (
            <CardContent className="p-6">
              <div className="space-y-8">
                {/* 2-Week Plan */}
                <div>
                  <h3 className="text-2xl font-bold mb-4">📅 2-Week Task Schedule</h3>
                  <div className="space-y-4">
                    {scheduleData.two_week_plan.schedule.map((day) => (
                      <Card key={day.date} className="border-l-4 border-l-green-500">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-lg">
                              {new Date(day.date).toLocaleDateString("en-US", {
                                weekday: "long",
                                month: "short",
                                day: "numeric",
                              })}
                            </h4>
                            {day.tasks.length > 0 && (
                              <span className="text-sm bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-1 rounded">
                                {day.tasks.length} {day.tasks.length === 1 ? "task" : "tasks"}
                              </span>
                            )}
                          </div>
                          
                          {day.tasks.length > 0 ? (
                            <ul className="list-disc list-inside space-y-1 mb-3 text-sm">
                              {day.tasks.map((task, idx) => (
                                <li key={idx} className="text-foreground">{task}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-muted-foreground italic mb-3">No tasks scheduled</p>
                          )}
                          
                          <div className="space-y-1 text-xs text-muted-foreground">
                            <p><strong>Reason:</strong> {day.reason}</p>
                            <p><strong>Weather:</strong> {day.weather_consideration}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Annual Plan */}
                <div className="border-t pt-8">
                  <h3 className="text-2xl font-bold mb-4">📆 Annual Mango Cultivation Overview</h3>
                  
                  {/* Harvest Windows */}
                  <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/10 rounded-lg">
                    <h4 className="font-semibold text-lg mb-2 text-orange-700 dark:text-orange-400">
                      🥭 Harvest Windows
                    </h4>
                    <p className="text-sm">
                      {scheduleData.annual_plan.harvest_windows.join(", ")}
                    </p>
                  </div>

                  {/* Monthly Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {scheduleData.annual_plan.annual_overview.map((month) => (
                      <Card key={month.month} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <h4 className="font-semibold text-base mb-1">{month.month}</h4>
                          <p className="text-xs text-muted-foreground mb-2 italic">{month.stage}</p>
                          <ul className="list-disc list-inside space-y-0.5 mb-2 text-xs">
                            {month.key_activities.map((activity, idx) => (
                              <li key={idx}>{activity}</li>
                            ))}
                          </ul>
                          <p className="text-xs text-muted-foreground">{month.notes}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Critical Periods */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-lg">⚠️ Critical Periods</h4>
                    {scheduleData.annual_plan.critical_periods.map((period, idx) => (
                      <Card key={idx} className="border-l-4 border-l-red-500">
                        <CardContent className="p-4">
                          <h5 className="font-semibold mb-1">{period.period}</h5>
                          <p className="text-sm text-muted-foreground mb-2">
                            <strong>Months:</strong> {period.months.join(", ")}
                          </p>
                          <p className="text-sm">{period.importance}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Regenerate Button */}
                  <div className="flex justify-center mt-6">
                    <Button 
                      variant="outline" 
                      onClick={generateSchedule}
                      disabled={isGeneratingSchedule}
                    >
                      {isGeneratingSchedule ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Regenerating...
                        </>
                      ) : (
                        "Regenerate Schedule"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}

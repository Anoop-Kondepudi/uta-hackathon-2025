"use client"

import * as React from "react"
import { Calendar, CalendarDayButton } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Cloud, Droplets, Wind, Sun, Loader2 } from "lucide-react"

interface WeatherData {
  date: string
  temp_max: number
  temp_min: number
  rain_probability: number
  precipitation: number
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

export default function Calendar21() {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(undefined)
  const [weatherData, setWeatherData] = React.useState<WeatherResponse | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleDayClick = (date: Date | undefined) => {
    setSelectedDate(date)
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

  // Get weather data for a specific date
  const getWeatherForDate = (date: Date): WeatherData | undefined => {
    if (!weatherData) return undefined
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
                const weather = weatherData ? getWeatherForDate(day.date) : undefined
                const rainProb = weather?.rain_probability || 0
                const bgColor = getRainBackgroundColor(rainProb)

                return (
                  <CalendarDayButton 
                    day={day} 
                    modifiers={modifiers} 
                    {...props}
                    style={bgColor ? { backgroundColor: bgColor } : undefined}
                  >
                    {children}
                    {!modifiers.outside && weather && (
                      <span className="text-[10px] font-medium">
                        {Math.round(weather.temp_min)}-{Math.round(weather.temp_max)}°F
                      </span>
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
                      <Cloud className="h-5 w-5 text-sky-600 dark:text-sky-400" />
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
    </div>
  )
}

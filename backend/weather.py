#!/usr/bin/env python3
"""
Weather fetcher that automatically detects your location and gets current weather data.
Uses free APIs with no API key required.
"""

import requests
from datetime import datetime


def get_location():
    """
    Get current location (latitude, longitude, city) based on IP address.
    Tries multiple free services with fallback options.
    """
    # Try multiple services for redundancy
    services = [
        'https://ipapi.co/json/',
        'http://ip-api.com/json/',
        'https://ipinfo.io/json'
    ]
    
    for service_url in services:
        try:
            response = requests.get(service_url, timeout=5)
            response.raise_for_status()
            data = response.json()
            
            # Handle different API response formats
            if 'latitude' in data and 'longitude' in data:
                # ipapi.co format
                location = {
                    'latitude': data.get('latitude'),
                    'longitude': data.get('longitude'),
                    'city': data.get('city'),
                    'region': data.get('region'),
                    'country': data.get('country_name', data.get('country')),
                    'timezone': data.get('timezone')
                }
            elif 'lat' in data and 'lon' in data:
                # ip-api.com format
                location = {
                    'latitude': data.get('lat'),
                    'longitude': data.get('lon'),
                    'city': data.get('city'),
                    'region': data.get('regionName'),
                    'country': data.get('country'),
                    'timezone': data.get('timezone')
                }
            elif 'loc' in data:
                # ipinfo.io format
                lat, lon = data.get('loc').split(',')
                location = {
                    'latitude': float(lat),
                    'longitude': float(lon),
                    'city': data.get('city'),
                    'region': data.get('region'),
                    'country': data.get('country'),
                    'timezone': data.get('timezone')
                }
            else:
                continue
            
            return location
        except (requests.exceptions.RequestException, ValueError, KeyError) as e:
            print(f"  ⚠️  Service {service_url.split('/')[2]} failed, trying next...")
            continue
    
    # If all services fail, return None
    print(f"  ❌ All location services failed.")
    return None


def get_weather(latitude, longitude):
    """
    Get current weather data and 2-week (14-day) forecast using Open-Meteo API.
    
    Args:
        latitude: Latitude coordinate
        longitude: Longitude coordinate
    
    Returns:
        Dictionary with weather data
    """
    try:
        # Open-Meteo API endpoint
        url = "https://api.open-meteo.com/v1/forecast"
        
        # Parameters for current weather and forecast
        params = {
            'latitude': latitude,
            'longitude': longitude,
            'current': 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m',
            'daily': 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,uv_index_max',
            'temperature_unit': 'fahrenheit',
            'wind_speed_unit': 'mph',
            'timezone': 'auto',
            'forecast_days': 14
        }
        
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        return data
    except requests.exceptions.RequestException as e:
        print(f"Error getting weather data: {e}")
        return None


def get_weather_description(weather_code):
    """
    Convert WMO weather code to human-readable description.
    """
    weather_codes = {
        0: "Clear sky",
        1: "Mainly clear",
        2: "Partly cloudy",
        3: "Overcast",
        45: "Foggy",
        48: "Depositing rime fog",
        51: "Light drizzle",
        53: "Moderate drizzle",
        55: "Dense drizzle",
        61: "Slight rain",
        63: "Moderate rain",
        65: "Heavy rain",
        71: "Slight snow",
        73: "Moderate snow",
        75: "Heavy snow",
        77: "Snow grains",
        80: "Slight rain showers",
        81: "Moderate rain showers",
        82: "Violent rain showers",
        85: "Slight snow showers",
        86: "Heavy snow showers",
        95: "Thunderstorm",
        96: "Thunderstorm with slight hail",
        99: "Thunderstorm with heavy hail"
    }
    return weather_codes.get(weather_code, "Unknown")

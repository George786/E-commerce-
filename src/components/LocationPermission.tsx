'use client'

import { useState, useEffect, useCallback } from 'react'
import { MapPin, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface LocationPermissionProps {
  onLocationGranted?: (location: { latitude: number; longitude: number }) => void
  onLocationDenied?: () => void
  className?: string
}

export default function LocationPermission({ 
  onLocationGranted, 
  onLocationDenied, 
  className = '' 
}: LocationPermissionProps) {
  const [permissionStatus, setPermissionStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied' | 'error'>('idle')
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [error, setError] = useState<string>('')

  const requestLocationPermission = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.')
      setPermissionStatus('error')
      onLocationDenied?.()
      return
    }

    setPermissionStatus('requesting')
    setError('')

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        })
      })

      const { latitude, longitude } = position.coords
      setLocation({ latitude, longitude })
      setPermissionStatus('granted')
      onLocationGranted?.({ latitude, longitude })
    } catch (err) {
      const error = err as GeolocationPositionError
      let errorMessage = 'Failed to get location'
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Location access denied. Please enable location services.'
          setPermissionStatus('denied')
          onLocationDenied?.()
          break
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location information is unavailable.'
          setPermissionStatus('error')
          break
        case error.TIMEOUT:
          errorMessage = 'Location request timed out.'
          setPermissionStatus('error')
          break
        default:
          setPermissionStatus('error')
      }
      
      setError(errorMessage)
    }
  }, [onLocationGranted, onLocationDenied])

  // Auto-request location on component mount
  useEffect(() => {
    if (permissionStatus === 'idle') {
      requestLocationPermission()
    }
  }, [permissionStatus, requestLocationPermission])

  const getStatusIcon = () => {
    switch (permissionStatus) {
      case 'requesting':
        return <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      case 'granted':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'denied':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-orange-500" />
      default:
        return <MapPin className="h-5 w-5 text-blue-500" />
    }
  }

  const getStatusText = () => {
    switch (permissionStatus) {
      case 'requesting':
        return 'Requesting location access...'
      case 'granted':
        return 'Location access granted'
      case 'denied':
        return 'Location access denied'
      case 'error':
        return 'Location error'
      default:
        return 'Enable location for better experience'
    }
  }

  const getStatusColor = () => {
    switch (permissionStatus) {
      case 'requesting':
        return 'text-blue-600'
      case 'granted':
        return 'text-green-600'
      case 'denied':
        return 'text-red-600'
      case 'error':
        return 'text-orange-600'
      default:
        return 'text-blue-600'
    }
  }

  return (
    <div className={`rounded-lg border border-light-300 bg-light-50 p-4 ${className}`}>
      <div className="flex items-center gap-3">
        {getStatusIcon()}
        <div className="flex-1">
          <p className={`text-body-medium font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </p>
          {error && (
            <p className="text-caption text-red-600 mt-1">{error}</p>
          )}
          {location && (
            <p className="text-caption text-dark-600 mt-1">
              Coordinates: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </p>
          )}
        </div>
        {permissionStatus === 'denied' && (
          <button
            onClick={requestLocationPermission}
            className="btn-hover rounded-lg border border-blue-500 bg-blue-500 px-3 py-2 text-body text-white hover:bg-blue-600 focus-ring"
          >
            Retry
          </button>
        )}
      </div>
      
      {permissionStatus === 'idle' && (
        <div className="mt-3">
          <button
            onClick={requestLocationPermission}
            className="btn-hover flex w-full items-center justify-center gap-2 rounded-lg border border-blue-500 bg-blue-500 px-4 py-2 text-body text-white hover:bg-blue-600 focus-ring"
          >
            <MapPin className="h-4 w-4" />
            Enable Location Access
          </button>
        </div>
      )}
    </div>
  )
}

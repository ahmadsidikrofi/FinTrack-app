import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCookie, deleteCookie } from '@/lib/cookies'

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('user_token') || getCookie('user_token')
      setIsAuthenticated(!!token)
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const logout = () => {
    localStorage.removeItem('user_token')
    deleteCookie('user_token')
    setIsAuthenticated(false)
    router.push('/auth')
  }

  return {
    isAuthenticated,
    isLoading,
    logout
  }
} 
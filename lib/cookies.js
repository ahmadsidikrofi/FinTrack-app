// Utility functions untuk mengelola cookies

export const setCookie = (name, value, options = {}) => {
  const {
    expires = 86400, // 24 jam default
    path = '/',
    secure = true,
    sameSite = 'strict'
  } = options

  const cookieValue = `${name}=${value}; path=${path}; max-age=${expires}; secure=${secure}; samesite=${sameSite}`
  document.cookie = cookieValue
}

export const getCookie = (name) => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return null
}

export const deleteCookie = (name, options = {}) => {
  const { path = '/', secure = true, sameSite = 'strict' } = options
  document.cookie = `${name}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure=${secure}; samesite=${sameSite}`
} 
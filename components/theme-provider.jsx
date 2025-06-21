"use client"
 
import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
 
export const ThemeProvider = ({ children, ...props }) => (
  <NextThemesProvider {...props}>{children}</NextThemesProvider>
)
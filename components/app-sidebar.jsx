"use client"

import { Home, List, LogOut, Target, Tag, Sun, Moon, FullscreenIcon, Loader2, SparkleIcon, LoaderCircle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import Link from "next/link"
import { Button } from "./ui/button"
import { usePathname, useRouter } from "next/navigation"
import axios from "axios"
import { useEffect, useState } from "react"
import { deleteCookie } from "@/lib/cookies"
import { useTheme } from "next-themes"
import api from "@/lib/axios"

const mainMenuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Transactions",
    url: "/transactions",
    icon: List,
  },
  {
    title: "IBM AI-Reports",
    url: "/reports",
    icon: SparkleIcon,
  },
  {
    title: "Budgets",
    url: "/budgets",
    icon: Target,
    disabled: true,
  },
  {
    title: "Fullscreen",
    icon: FullscreenIcon,
    action: "fullscreen"
  }
]

const managementItems = [
  {
    title: "Categories",
    url: "/categories",
    icon: Tag,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUserData] = useState([])
  const [isFullscreen, setIsFullscreen] = useState(false)
  const { setTheme } = useTheme()
  const [loading, setLoading] = useState(false)

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true)
      }).catch((err) => {
        console.error('Error attempting to enable fullscreen:', err)
      })
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false)
      }).catch((err) => {
        console.error('Error attempting to exit fullscreen:', err)
      })
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  const ModeToggle = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  const handleLogout = async () => {
    const token = localStorage.getItem('user_token');

    try {
      if (token) {
        setLoading(true)
        await api.post('/logout')
      }
    } catch (error) {
      console.error("API logout gagal, tetap melanjutkan logout di client:", error)
    } finally {
      localStorage.clear()
      localStorage.removeItem('user_token')
      deleteCookie('user_token')
      setLoading(false)
      router.push('/auth')
    }
  }

  const FetchUserData = async () => {
    setLoading(true)
    const res = await api.get('/user')
    if (res) {
      setUserData(res.data)
      setLoading(false)
    }
  }

  useEffect(() => {
    FetchUserData()
  }, [])

  return (
    <Sidebar className="border-r-0" variant="sidebar">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 px-4 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-sm font-bold">FT</span>
            </div>
            <span className="text-lg font-semibold">FinTrack</span>
          </div>
          <ModeToggle />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                    item.disabled ? (
                      <SidebarMenuItem key={item.title}>
                          <div className="flex h-10 cursor-not-allowed items-center justify-start gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground opacity-50">
                              <item.icon className="h-4 w-4" />
                              <span>{item.title}</span>
                          </div>
                      </SidebarMenuItem>
                  ) : item.action === "fullscreen" ? (
                      <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton asChild>
                              <Button 
                                  variant={isFullscreen ? 'default' : 'link'} 
                                  className={`${isFullscreen ? 'shadow-lg' : ''} hover:bg-secondary flex items-center justify-start`}
                                  onClick={handleFullscreen}
                              >
                                  {isFullscreen ? <FullscreenIcon className="h-4 w-4" /> : <item.icon className="h-4 w-4" />}
                                  <span>{isFullscreen ? 'Exit Fullscreen' : item.title}</span>
                              </Button>
                          </SidebarMenuButton>
                      </SidebarMenuItem>
                  ) : (
                      <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton asChild>
                              <Button 
                                  asChild 
                                  variant={pathname === item.url ? 'default' : 'link'} 
                                  className={`${pathname === item.url ? 'shadow-lg' : ''} hover:bg-secondary flex items-center justify-start`}
                              >
                                  <Link href={item.url}>
                                      <item.icon className="h-4 w-4" />
                                      <span>{item.title}</span>
                                  </Link>
                              </Button>
                          </SidebarMenuButton>
                      </SidebarMenuItem>
                  )
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managementItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Button asChild variant={pathname === item.url ? 'default' : 'link'} className={`${pathname === item.url ? 'shadow-lg' : 'null'} hover:bg-secondary flex items-center justify-start`}>
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </Button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 px-2 py-2">
              <Avatar className="h-8 w-8">
                <AvatarImage alt="Rofi. D." />
                <AvatarFallback>{loading ? <LoaderCircle className="h-4 w-4 animate-spin"/> : user?.name?.charAt(0) || '-'}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{loading ? <LoaderCircle className="h-4 w-4 animate-spin"/> : user?.name}</span>
                <span className="text-xs text-muted-foreground">{loading ? "Memuat email user" : user?.email}</span>
              </div>
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Button onClick={handleLogout} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                <span>Logout</span>
              </Button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}



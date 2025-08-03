import * as React from "react"

const MOBILE_BREAKPOINT = 768
const TABLET_BREAKPOINT = 1024

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)
  const [isTablet, setIsTablet] = React.useState<boolean | undefined>(undefined)
  const [isCapacitor, setIsCapacitor] = React.useState(false)
  const [hasTouchCapability, setHasTouchCapability] = React.useState(false)

  React.useEffect(() => {
    const checkCapacitor = () => {
      return typeof window !== 'undefined' && 
             (window as any).Capacitor !== undefined
    }

    const checkTouchCapability = () => {
      return typeof window !== 'undefined' && 
             ('ontouchstart' in window || navigator.maxTouchPoints > 0)
    }

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const tabletMql = window.matchMedia(`(max-width: ${TABLET_BREAKPOINT - 1}px)`)
    
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
      setIsTablet(window.innerWidth < TABLET_BREAKPOINT && window.innerWidth >= MOBILE_BREAKPOINT)
    }
    
    mql.addEventListener("change", onChange)
    tabletMql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    setIsTablet(window.innerWidth < TABLET_BREAKPOINT && window.innerWidth >= MOBILE_BREAKPOINT)
    setIsCapacitor(checkCapacitor())
    setHasTouchCapability(checkTouchCapability())
    
    return () => {
      mql.removeEventListener("change", onChange)
      tabletMql.removeEventListener("change", onChange)
    }
  }, [])

  return {
    isMobile: !!isMobile,
    isTablet: !!isTablet,
    isCapacitor,
    hasTouchCapability,
    isMobileDevice: !!isMobile || hasTouchCapability,
    isMobileOrTablet: !!isMobile || !!isTablet || hasTouchCapability
  }
}

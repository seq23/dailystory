import * as React from "react"

const MOBILE_BREAKPOINT = 480
const TABLET_BREAKPOINT = 768

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
      const width = window.innerWidth;
      setIsMobile(width < MOBILE_BREAKPOINT);
      setIsTablet(width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT);
      
      console.log('📱 Device detection:', {
        width,
        isMobile: width < MOBILE_BREAKPOINT,
        isTablet: width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT,
        isMobileOrTablet: width < TABLET_BREAKPOINT
      });
    }
    
    mql.addEventListener("change", onChange)
    tabletMql.addEventListener("change", onChange)
    
    // Initial check
    const width = window.innerWidth;
    setIsMobile(width < MOBILE_BREAKPOINT)
    setIsTablet(width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT)
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
    isMobileDevice: !!isMobile,
    isMobileOrTablet: !!isMobile || !!isTablet
  }
}

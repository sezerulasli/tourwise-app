import { useCallback, useRef } from "react"
import { flushSync } from "react-dom"
import { useDispatch, useSelector } from "react-redux"

import { cn } from "@/lib/utils"
import { MoonIcon, SunIcon } from "@radix-ui/react-icons"
import {
  toggleThemeToDark,
  toggleThemeToLight,
} from "@/redux/theme/themeSlice"

export const AnimatedThemeToggler = ({
  className,
  duration = 400,
  ...props
}) => {
  const buttonRef = useRef(null)
  const dispatch = useDispatch()
  const theme = useSelector((state) => state.theme.theme)
  const isDark = theme === "dark"

  const applyDocumentTheme = useCallback((nextTheme) => {
    if (typeof document === "undefined") return
    document.documentElement.classList.toggle("dark", nextTheme === "dark")
    localStorage.setItem("theme", nextTheme)
    if (nextTheme === "dark") {
      dispatch(toggleThemeToDark())
    } else {
      dispatch(toggleThemeToLight())
    }
  }, [dispatch])

  const runToggle = useCallback((nextTheme) => {
    flushSync(() => {
      applyDocumentTheme(nextTheme)
    })
  }, [applyDocumentTheme])

  const toggleTheme = useCallback(async () => {
    if (!buttonRef.current) return
    const nextTheme = isDark ? "light" : "dark"

    const supportsViewTransitions = typeof document !== "undefined" && typeof document.startViewTransition === "function"
    let transition

    if (supportsViewTransitions) {
      transition = document.startViewTransition(() => runToggle(nextTheme))
      await transition.ready
    } else {
      runToggle(nextTheme)
    }

    if (!supportsViewTransitions) return

    const { top, left, width, height } =
      buttonRef.current.getBoundingClientRect()
    const x = left + width / 2
    const y = top + height / 2
    const maxRadius = Math.hypot(
      Math.max(left, window.innerWidth - left),
      Math.max(top, window.innerHeight - top)
    )

    document.documentElement.animate({
      clipPath: [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${maxRadius}px at ${x}px ${y}px)`,
      ],
    }, {
      duration,
      easing: "ease-in-out",
      pseudoElement: "::view-transition-new(root)",
    })
  }, [isDark, duration, runToggle])

  return (
    <button
      ref={buttonRef}
      onClick={toggleTheme}
      className={cn(className)}
      {...props}>
      {isDark ? <SunIcon /> : <MoonIcon />}
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}

import { ref, computed, onMounted, onUnmounted } from 'vue'

/**
 * Reactive viewport state — single source of truth for responsive behavior.
 *
 * The app locks its shell to the `md:` (768px) breakpoint, so this exposes
 * `isMobile` (< 768px) and `isDesktop` (>= 768px). Use this instead of
 * touching `window.innerWidth` directly (the old CartPanel anti-pattern).
 *
 * Safe for SSR: defaults to `false` on the server, hydrates on mount.
 */
const MOBILE_BREAKPOINT = 768

const viewportWidth = ref(0)
const isMobile = ref(false)
const isDesktop = ref(true)

let mql: MediaQueryList | null = null
let handler: ((e: MediaQueryListEvent) => void) | null = null

function sync(width: number) {
  viewportWidth.value = width
  isMobile.value = width < MOBILE_BREAKPOINT
  isDesktop.value = width >= MOBILE_BREAKPOINT
}

export function useViewport() {
  // Lazily bind the media query on the client, once.
  onMounted(() => {
    if (typeof window === 'undefined') return
    mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    sync(window.innerWidth)
    handler = (e: MediaQueryListEvent) => {
      sync(e.matches ? MOBILE_BREAKPOINT - 1 : window.innerWidth)
    }
    // Modern + legacy listener attachment for broader browser support.
    if (mql.addEventListener) {
      mql.addEventListener('change', handler)
    } else if (mql.addListener) {
      mql.addListener(handler as any)
    }
  })

  onUnmounted(() => {
    if (!mql || !handler) return
    if (mql.removeEventListener) {
      mql.removeEventListener('change', handler)
    } else if (mql.removeListener) {
      mql.removeListener(handler as any)
    }
    mql = null
    handler = null
  })

  return {
    viewportWidth,
    isMobile,
    isDesktop,
    /** The locked breakpoint value (768) — reference only. */
    breakpoint: MOBILE_BREAKPOINT,
  }
}

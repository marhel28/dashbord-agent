// MapLibre GL plugin — lazy loads maplibre-gl CSS on client only
import 'maplibre-gl/dist/maplibre-gl.css'

export default defineNuxtPlugin(() => {
  // MapLibre GL is used by ClusterMap component
  // CSS is imported here to avoid SSR issues
})

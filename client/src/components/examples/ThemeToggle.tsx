import { ThemeToggle } from '../theme-toggle'
import { ThemeProvider } from '@/lib/theme'

export default function ThemeToggleExample() {
  return (
    <ThemeProvider>
      <div className="p-4">
        <div className="flex items-center gap-4">
          <span>Mode sombre :</span>
          <ThemeToggle />
        </div>
      </div>
    </ThemeProvider>
  )
}
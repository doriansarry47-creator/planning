import { AppSidebar } from '../app-sidebar'
import { SidebarProvider } from "@/components/ui/sidebar"

export default function AppSidebarExample() {
  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  }

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-96 w-full">
        <AppSidebar />
        <div className="flex-1 p-4">
          <div className="text-center text-muted-foreground">
            Zone de contenu principal
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}
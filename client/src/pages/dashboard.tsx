import { PractitionerDashboard } from "@/components/dashboard/practitioner-dashboard"

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble de votre activité
        </p>
      </div>
      <PractitionerDashboard />
    </div>
  )
}
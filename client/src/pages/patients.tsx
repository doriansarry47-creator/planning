import { useState } from "react"
import { Search, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PatientCard } from "@/components/patients/patient-card"

// TODO: remove mock functionality
const mockPatients = [
  {
    id: "1",
    firstName: "Marie",
    lastName: "Dubois",
    email: "marie.dubois@email.fr",
    phone: "06 12 34 56 78",
    lastVisit: "15 mars 2024",
    nextAppointment: "22 avril 2024",
    status: "active" as const,
  },
  {
    id: "2",
    firstName: "Pierre",
    lastName: "Martin",
    email: "pierre.martin@email.fr",
    phone: "06 98 76 54 32",
    lastVisit: "20 février 2024",
    status: "active" as const,
  },
  {
    id: "3",
    firstName: "Sophie",
    lastName: "Bernard",
    email: "sophie.bernard@email.fr",
    phone: "06 11 22 33 44",
    lastVisit: "10 janvier 2024",
    status: "inactive" as const,
  },
  {
    id: "4",
    firstName: "Jean",
    lastName: "Durand",
    email: "jean.durand@email.fr",
    phone: "06 55 66 77 88",
    lastVisit: "28 mars 2024",
    nextAppointment: "25 avril 2024",
    status: "active" as const,
  },
]

export default function Patients() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredPatients = mockPatients.filter(patient =>
    patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Patients</h1>
          <p className="text-muted-foreground">
            Gérez vos patients et leurs informations
          </p>
        </div>
        <Button data-testid="button-add-patient">
          <Plus className="mr-2 h-4 w-4" />
          Nouveau patient
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un patient..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
            data-testid="input-search-patients"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPatients.map((patient) => (
          <PatientCard key={patient.id} patient={patient} />
        ))}
      </div>

      {filteredPatients.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {searchTerm ? "Aucun patient trouvé" : "Aucun patient enregistré"}
          </p>
        </div>
      )}
    </div>
  )
}
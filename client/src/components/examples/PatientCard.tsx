import { PatientCard } from '../patients/patient-card'

export default function PatientCardExample() {
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
      status: "inactive" as const,
    },
  ]

  return (
    <div className="p-6 space-y-4 max-w-md">
      {mockPatients.map((patient) => (
        <PatientCard key={patient.id} patient={patient} />
      ))}
    </div>
  )
}
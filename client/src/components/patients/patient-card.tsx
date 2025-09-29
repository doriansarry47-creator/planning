import { Phone, Mail, Calendar, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import medicalAvatar from "@assets/generated_images/Medical_avatar_placeholder_9ca55d15.png"

interface PatientCardProps {
  patient: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string
    lastVisit?: string
    nextAppointment?: string
    status: "active" | "inactive"
  }
}

export function PatientCard({ patient }: PatientCardProps) {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const handleCall = () => {
    console.log("Calling patient:", patient.phone)
  }

  const handleEmail = () => {
    console.log("Emailing patient:", patient.email)
  }

  const handleSchedule = () => {
    console.log("Scheduling appointment for:", patient.firstName, patient.lastName)
  }

  return (
    <Card className="hover-elevate" data-testid={`patient-card-${patient.id}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={medicalAvatar} alt={`${patient.firstName} ${patient.lastName}`} />
            <AvatarFallback>{getInitials(patient.firstName, patient.lastName)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium text-lg" data-testid={`text-patient-name-${patient.id}`}>
              {patient.firstName} {patient.lastName}
            </h3>
            <Badge variant={patient.status === "active" ? "default" : "secondary"}>
              {patient.status === "active" ? "Actif" : "Inactif"}
            </Badge>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" data-testid={`button-menu-${patient.id}`}>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleSchedule}>
              <Calendar className="mr-2 h-4 w-4" />
              Planifier RDV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCall}>
              <Phone className="mr-2 h-4 w-4" />
              Appeler
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleEmail}>
              <Mail className="mr-2 h-4 w-4" />
              Envoyer email
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Phone className="h-4 w-4" />
          <span data-testid={`text-phone-${patient.id}`}>{patient.phone}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Mail className="h-4 w-4" />
          <span data-testid={`text-email-${patient.id}`}>{patient.email}</span>
        </div>
        {patient.lastVisit && (
          <div className="text-sm text-muted-foreground">
            Dernière visite: {patient.lastVisit}
          </div>
        )}
        {patient.nextAppointment && (
          <div className="text-sm text-primary">
            Prochain RDV: {patient.nextAppointment}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
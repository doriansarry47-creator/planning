# Design Guidelines: Medical Appointment Management System

## Design Approach: Design System with Healthcare Focus
**Selected System**: Material Design 3 with healthcare-specific adaptations
**Justification**: Healthcare applications require trust, clarity, and accessibility. Material Design provides excellent data visualization components, form handling, and professional aesthetics suitable for both patient-facing and practitioner interfaces.
**References**: Doctolib's clean, professional layout and Google Calendar's intuitive scheduling interface

## Core Design Principles
- **Professional Trust**: Clean, medical-grade aesthetic that instills confidence
- **Information Clarity**: Clear hierarchy for appointment data and patient information  
- **Accessibility First**: High contrast ratios and keyboard navigation for diverse users
- **Responsive Efficiency**: Seamless experience across desktop and mobile devices

## Color Palette

**Light Mode:**
- Primary: 217 91% 60% (Medical blue - trustworthy and professional)
- Primary Container: 217 100% 95% 
- Background: 0 0% 98%
- Surface: 0 0% 100%
- On-Surface: 220 9% 20%

**Dark Mode:**
- Primary: 217 84% 80%
- Primary Container: 217 100% 15%
- Background: 220 9% 6%
- Surface: 220 9% 11%
- On-Surface: 0 0% 95%

**Status Colors:**
- Success (Confirmed): 142 76% 36%
- Warning (Pending): 45 100% 51%
- Error (Cancelled): 0 84% 60%

## Typography
**Primary Font**: Inter (Google Fonts)
- Headers: Inter 600 (Semibold)
- Body: Inter 400 (Regular)
- Captions: Inter 500 (Medium)

**Scale:**
- H1: text-4xl (36px)
- H2: text-2xl (24px) 
- H3: text-xl (20px)
- Body: text-base (16px)
- Caption: text-sm (14px)

## Layout System
**Spacing Units**: Tailwind 2, 4, 6, 8, 12, 16
- Component spacing: p-4, m-2
- Section spacing: py-8, px-6
- Container max-width: max-w-6xl
- Grid gaps: gap-4 for cards, gap-6 for sections

## Component Library

**Navigation:**
- Sidebar navigation for practitioner dashboard
- Top navigation bar for patient interface
- Breadcrumbs for deep navigation paths

**Forms:**
- Material Design input fields with floating labels
- Date/time pickers with clear visual feedback
- Multi-step patient registration forms
- Inline validation with helpful error messages

**Data Displays:**
- Calendar grid view with appointment slots
- Patient list with search and filters
- Appointment cards with status indicators
- Time slot availability badges

**Interactive Elements:**
- Primary buttons for booking confirmations
- Outline buttons for secondary actions
- Icon buttons for quick actions (edit, delete)
- Toggle switches for availability settings

**Overlays:**
- Modal dialogs for appointment details
- Confirmation dialogs for cancellations
- Toast notifications for system feedback
- Loading states for API calls

## Page-Specific Design

**Patient Interface:**
- Clean booking flow with step-by-step progression
- Available slots displayed as clickable time cards
- Patient information form with clear required fields
- Confirmation page with appointment summary

**Practitioner Dashboard:**
- Calendar overview with drag-and-drop scheduling
- Patient management table with sorting/filtering
- Schedule management with bulk time slot creation
- Notification center for appointment updates

**Mobile Considerations:**
- Bottom navigation for patient app
- Swipe gestures for calendar navigation
- Touch-friendly time slot selection
- Optimized forms with appropriate input types

## Accessibility Features
- WCAG 2.1 AA compliance
- Keyboard navigation for all interactions
- Screen reader optimized labels
- High contrast mode support
- Focus indicators on all interactive elements

## Images
No large hero images required. Use:
- Small avatar placeholders for patient profiles
- Icon illustrations for empty states
- Medical-themed spot illustrations for onboarding
- Simple graphics for appointment confirmations
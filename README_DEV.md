# MentorConnect Development Guide

## Assignments Hub

The Assignments Hub is a dedicated page for mentors to manage their assignments. It provides a clear overview of all assignments with filtering capabilities.

### Features

- Three filter tabs:
  - Future Assignments (startDate > 30 days from today)
  - Active Assignments (status === 'ACTIVE')
  - Completed Assignments (status === 'COMPLETED')
- Responsive card layout showing:
  - Mentee avatar
  - Mentee name
  - Start date
  - Status badge
- Real-time updates via Socket.IO
- Direct navigation to assignment details

### File Structure

```
frontend/
  ├── src/
  │   ├── components/
  │   │   ├── AssignmentCard.tsx    # Card component for each assignment
  │   │   └── Spinner.tsx          # Loading indicator
  │   ├── pages/
  │   │   ├── MentorAssignmentsPage.tsx  # Main assignments hub
  │   │   └── assignment/
  │   │       └── AssignmentLayout.tsx   # Assignment details layout
  │   └── services/
  │       ├── assignment.service.ts # API calls
  │       └── socket.ts            # Socket.IO client
backend/
  ├── src/
  │   ├── controllers/
  │   │   └── assignmentController.ts
  │   ├── models/
  │   │   └── assignment.ts
  │   └── routes/
  │       └── assignmentRoutes.ts
```

### API Endpoints

- `GET /assignments/mentor?range=future|active|completed`
  - Returns filtered list of assignments for the authenticated mentor
- `GET /assignments/:id`
  - Returns detailed information about a specific assignment

### Socket.IO Events

- `assignment:update`
  - Emitted when an assignment's status changes
  - Triggers a refresh of the assignments list

### Testing

The feature includes:
- Unit tests for API endpoints
- Component tests for React components
- Integration tests for the complete flow

### Styling

- Uses Tailwind CSS for responsive design
- Color-coded status badges
- Hover effects on cards
- Responsive grid layout 
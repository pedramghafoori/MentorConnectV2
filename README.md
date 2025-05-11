# MentorConnect

A platform connecting lifeguard instructors with certification candidates.

## Setup

1. `pnpm install`
2. `cp .env.example .env` → fill vars
3. `pnpm prisma --filter backend migrate dev`
4. `pnpm dev`

Front-end → http://localhost:5173  
Back-end → http://localhost:4000 


The Award Fetch Logic works as following:

Certs displayed on profile:
- Standard First Aid Instructor
- Lifesaving Instructor
- National Lifeguard Instructor
- Examiner - Standard First Aid
- Examiner - Bronze Cross
- Examiner - National Lifeguard
- Instructor Trainer - National Lifeguard
- Instructor Trainer - Standard First Aid
- Instructor Trainer - Lifesaving

This following award doesn't show on the profile but rather if it exists, that profile is automatically converted into a "MENTOR" profile and the mentor badge appears in the profile header (which i believe the logic for this already exists)
- Examiner Mentor
-- Add lssId and certifications columns to User table
ALTER TABLE "User" ADD COLUMN "lssId" TEXT;
ALTER TABLE "User" ADD COLUMN "certifications" TEXT[] DEFAULT ARRAY[]::TEXT[]; 
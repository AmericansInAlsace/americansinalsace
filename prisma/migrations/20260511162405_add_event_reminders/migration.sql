-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "reminder1DaysBefore" INTEGER,
ADD COLUMN     "reminder2DaysBefore" INTEGER;

-- AlterTable
ALTER TABLE "RSVP" ADD COLUMN     "reminder1Sent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reminder2Sent" BOOLEAN NOT NULL DEFAULT false;

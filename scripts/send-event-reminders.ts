import { prisma } from '../lib/db';
import { MailService } from '../services/MailService';

/**
 * Script to send automated event reminders.
 * 
 * Logic:
 * 1. Fetch all published future events.
 * 2. For each event, check if reminder 1 or 2 is due today.
 * 3. Send emails to confirmed attendees who haven't received that specific reminder.
 * 4. Update RSVP status to prevent duplicate sends.
 */
async function sendEventReminders() {
  console.log('--- Starting Event Reminder Job ---');
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const events = await prisma.event.findMany({
      where: {
        published: true,
        date: { gt: new Date() }, // Future events only
      },
      include: {
        rsvps: {
          where: { status: 'CONFIRMED' },
          include: { user: true },
        },
      },
    });

    console.log(`Found ${events.length} upcoming published events.`);

    for (const event of events) {
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);

      const diffInTime = eventDate.getTime() - today.getTime();
      const diffInDays = Math.ceil(diffInTime / (1000 * 3600 * 24));

      console.log(`Processing Event: "${event.title}" (Date: ${event.date.toISOString()}, Days Until: ${diffInDays})`);

      // Check Reminder 1
      if (event.reminder1DaysBefore !== null && diffInDays <= event.reminder1DaysBefore) {
        const rsvpsToRemind = event.rsvps.filter(r => !r.reminder1Sent);
        
        if (rsvpsToRemind.length > 0) {
          console.log(`Sending Reminder 1 (${event.reminder1DaysBefore} days before) to ${rsvpsToRemind.length} attendees.`);
          
          for (const rsvp of rsvpsToRemind) {
            await MailService.sendEventReminder(rsvp.user.email, `${rsvp.user.firstName} ${rsvp.user.lastName}`, {
              title: event.title,
              date: event.date,
              location: event.location,
            });

            await prisma.rSVP.update({
              where: { id: rsvp.id },
              data: { reminder1Sent: true },
            });
          }
        }
      }

      // Check Reminder 2
      if (event.reminder2DaysBefore !== null && diffInDays <= event.reminder2DaysBefore) {
        const rsvpsToRemind = event.rsvps.filter(r => !r.reminder2Sent);
        
        if (rsvpsToRemind.length > 0) {
          console.log(`Sending Reminder 2 (${event.reminder2DaysBefore} days before) to ${rsvpsToRemind.length} attendees.`);
          
          for (const rsvp of rsvpsToRemind) {
            await MailService.sendEventReminder(rsvp.user.email, `${rsvp.user.firstName} ${rsvp.user.lastName}`, {
              title: event.title,
              date: event.date,
              location: event.location,
            });

            await prisma.rSVP.update({
              where: { id: rsvp.id },
              data: { reminder2Sent: true },
            });
          }
        }
      }
    }

    console.log('--- Event Reminder Job Finished Successfully ---');
  } catch (error) {
    console.error('--- Event Reminder Job Failed ---');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
sendEventReminders();

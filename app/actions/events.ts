'use server';

import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { MailService } from '@/services/MailService';
import { revalidatePath } from 'next/cache';

/**
 * Handles a user RSVP to an event.
 * 
 * @param {number} eventId - The ID of the event to RSVP to.
 */
export async function rsvpToEvent(eventId: number) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    throw new Error('You must be logged in to RSVP.');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    throw new Error('User not found.');
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { category: true },
  });

  if (!event) {
    throw new Error('Event not found.');
  }

  // Check capacity if applicable
  if (event.capacity !== null) {
    const currentRSVPs = await prisma.rSVP.count({
      where: { eventId, status: 'CONFIRMED' },
    });

    if (currentRSVPs >= event.capacity) {
      throw new Error('This event is full.');
    }
  }

  try {
    const rsvp = await prisma.rSVP.upsert({
      where: {
        userId_eventId: {
          userId: user.id,
          eventId,
        },
      },
      update: {
        status: 'CONFIRMED',
      },
      create: {
        userId: user.id,
        eventId,
        status: 'CONFIRMED',
      },
    });

    // Trigger confirmation email
    await MailService.sendEventRSVPConfirmation(user.email, `${user.firstName} ${user.lastName}`, {
      title: event.title,
      date: event.date,
      location: event.location,
    });

    revalidatePath('/events');
    revalidatePath(`/events/${eventId}`);

    return { success: true, rsvp };
  } catch (error: any) {
    console.error('RSVP Error:', error);
    throw new Error(error.message || 'Failed to register for the event.');
  }
}

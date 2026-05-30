
'use server';

import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { z } from 'zod';
import { FieldValue } from 'firebase-admin/firestore';

const SubmitSupportTicketSchema = z.object({
    firebaseToken: z.string(),
    email: z.string().email(),
    category: z.string().min(1).max(100),
    topic: z.string().min(1).max(200),
    body: z.string().min(1).max(500),
});

export async function submitSupportTicket(input: z.infer<typeof SubmitSupportTicketSchema>) {
    const validation = SubmitSupportTicketSchema.safeParse(input);

    if (!validation.success) {
        throw new Error(validation.error.errors.map(e => e.message).join(', '));
    }

    const { firebaseToken, email, category, topic, body } = validation.data;

    let uid: string;
    try {
        const decoded = await adminAuth.verifyIdToken(firebaseToken);
        uid = decoded.uid;
    } catch {
        throw new Error("Authentication failed. Please log in again.");
    }

    try {
        const ticketRef = adminDb.collection('supportTickets').doc();

        await ticketRef.set({
            uid,
            email,
            category,
            topic,
            body,
            status: 'open',
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        });

        return { success: true, ticketId: ticketRef.id };
    } catch (error) {
        console.error("Error submitting support ticket:", error);
        throw new Error("Could not submit your support ticket. Please try again.");
    }
}

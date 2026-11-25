export interface ReadableMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  is_read: boolean | null;
}

/** IDs of unread messages received by `userId` from the partner shown on screen only. */
export function unreadIdsFromPartner(
  batch: ReadableMessage[],
  userId: string,
  partnerId: string | null,
): string[] {
  return batch
    .filter((m) => m.receiver_id === userId && !m.is_read)
    .filter((m) => (partnerId ? m.sender_id === partnerId : true))
    .map((m) => m.id);
}

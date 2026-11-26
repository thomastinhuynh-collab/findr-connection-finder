/** Keep the reading position for older pages; otherwise reveal the latest message. */
export function conversationScrollTop(height: number, viewport: number, previous: { height: number; top: number } | null) {
  return previous ? height - previous.height + previous.top : Math.max(0, height - viewport);
}
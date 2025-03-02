export function formatMessageTime(date) {
  const messageDate = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Get just the time
  const time = messageDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  // Same day - just return the time
  if (messageDate.toDateString() === today.toDateString()) {
    return time;
  }

  // Yesterday - return "Yesterday, HH:MM"
  if (messageDate.toDateString() === yesterday.toDateString()) {
    return `Yesterday, ${time}`;
  }

  // Different day this year - return "MMM DD, HH:MM" (e.g., "Jun 15, 14:30")
  if (messageDate.getFullYear() === today.getFullYear()) {
    return `${messageDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })}, ${time}`;
  }

  // Different year - return "MMM DD YYYY, HH:MM" (e.g., "Jun 15 2023, 14:30")
  return `${messageDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}, ${time}`;
}

export function formatLastSeen(date) {
  const lastSeenDate = new Date(date);
  const now = new Date();
  const diffMinutes = Math.floor((now - lastSeenDate) / (1000 * 60));

  // If less than 1 minute ago
  if (diffMinutes < 1) {
    return "just now";
  }

  // If less than 60 minutes ago
  if (diffMinutes < 60) {
    return `${diffMinutes} ${diffMinutes === 1 ? "minute" : "minutes"} ago`;
  }

  // For anything older, use the same logic as formatMessageTime
  return "at" + formatMessageTime(date);
}

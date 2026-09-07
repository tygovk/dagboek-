export function formatDutchDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    };
    const formatted = date.toLocaleDateString('nl-NL', options);
    // Capitalize first letter of weekday
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  } catch {
    return dateString;
  }
}

export function formatRelativeDate(dateString: string): string {
  try {
    const entryDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkDate = new Date(entryDate);
    checkDate.setHours(0, 0, 0, 0);

    const diffDays = Math.round((today.getTime() - checkDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Vandaag';
    if (diffDays === 1) return 'Gisteren';
    if (diffDays === 2) return 'Eergisteren';

    return entryDate.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
  } catch {
    return dateString;
  }
}

export function getGreeting(userName: string): string {
  const hour = new Date().getHours();
  let greet = 'Goededag';
  if (hour >= 6 && hour < 12) {
    greet = 'Goedemorgen';
  } else if (hour >= 12 && hour < 18) {
    greet = 'Goedemiddag';
  } else if (hour >= 18 && hour < 24) {
    greet = 'Goedenavond';
  } else {
    greet = 'Goedenacht';
  }
  return `${greet}, ${userName}.`;
}

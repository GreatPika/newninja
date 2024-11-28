export const formatDate = (date: Date): string => {
  const formattedDate = date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
  });

  const formattedTime = date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return `${formattedDate}, ${formattedTime}`;
};

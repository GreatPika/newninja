export const convertSourceToText = (source: string | object) => {
  try {
    const sourceObj = typeof source === "string" ? JSON.parse(source) : source;
    
    return Object.keys(sourceObj)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map((key) => `${key}: ${sourceObj[key]}`)
      .join("\n\n");
  } catch (e) {
    console.error("Ошибка преобразования source:", e);
    return "";
  }
}; 
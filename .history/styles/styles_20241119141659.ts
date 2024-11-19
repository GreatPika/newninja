export const sharedTextClass = "text-base text-foreground p-0 leading-6";

export const textareaClassNames = {
  base: "w-full h-full bg-transparent hover:bg-transparent focus:bg-transparent",
  input: `bg-transparent placeholder:text-foreground/80 text-base ${sharedTextClass}`,
  inputWrapper:
    "bg-transparent shadow-none hover:bg-transparent focus:bg-transparent data-[hover=true]:bg-transparent group-data-[focus=true]:bg-transparent",
};

export const tableStyles = {
  wrapper: "p-0 rounded-lg",
  th: ["bg-transparent border-b border-divider p-0, m-0"],
};

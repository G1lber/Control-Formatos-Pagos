import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

export default function CardDesplegable({ value, title, children }) {
  return (
    <Accordion.Item
      value={value}
      className="bg-[var(--color-blanco)] shadow-md rounded-2xl overflow-hidden"
    >
      <Accordion.Header>
        <Accordion.Trigger className="group flex justify-between items-center w-full p-6 text-xl font-bold text-[var(--color-principal)]">
          {title}
          <ChevronDown className="w-5 h-5 transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content className="px-6 pb-6 space-y-4">
        {children}
      </Accordion.Content>
    </Accordion.Item>
  );
}

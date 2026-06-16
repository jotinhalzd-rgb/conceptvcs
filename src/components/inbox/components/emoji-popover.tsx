import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Smile } from "lucide-react";

const EMOJIS = [
  "😀","😁","😂","🤣","😊","😍","😘","🤔","😎","🙌","👍","👏","🙏","🔥","💯","✅",
  "❤️","💙","💚","💛","💜","🧡","🤝","🎉","🚀","💡","📞","📲","💬","📌","⏰","✨",
];

interface EmojiPopoverProps {
  onPick: (emoji: string) => void;
  className?: string;
}

export const EmojiPopover = ({ onPick, className }: EmojiPopoverProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={className ?? "h-9 w-9 text-[#94A3B8] hover:text-white transition-colors rounded-xl"}
          title="Inserir emoji"
        >
          <Smile className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-64 p-2 bg-[#0F172A] border-white/10"
      >
        <div className="grid grid-cols-8 gap-1">
          {EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => onPick(e)}
              className="text-lg hover:bg-white/10 rounded-md h-8 w-8 flex items-center justify-center"
            >
              {e}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
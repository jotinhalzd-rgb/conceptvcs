import React from "react";
import { ChannelPickerModal } from "./channel-picker-modal";

interface ConnectModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Compatibility wrapper around the new ChannelPickerModal.
 * Existing imports continue to work; new code should import ChannelPickerModal directly.
 */
export function ConnectModal({ isOpen, onOpenChange }: ConnectModalProps) {
  return <ChannelPickerModal open={isOpen} onOpenChange={onOpenChange} />;
}

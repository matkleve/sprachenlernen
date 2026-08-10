"use client";

import { useFormStatus } from "react-dom";

import { Button, type ButtonProps } from "@/components/ui/Button";

/**
 * Form submit control that reflects server-action pending state.
 * Must render inside a <form> — contract: interaction-feedback.md
 */
export function SubmitButton(props: ButtonProps) {
  const { pending } = useFormStatus();
  return <Button type="submit" pending={pending} {...props} />;
}

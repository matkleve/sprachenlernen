"use client";

type TextDisplayStepProps = {
  config: Record<string, unknown>;
};

export function TextDisplayStep({ config }: TextDisplayStepProps) {
  const title = typeof config.title === "string" ? config.title : "";
  const text = typeof config.text === "string" ? config.text : "";

  if (!text) {
    return null;
  }

  return (
    <article className="space-y-4">
      {title ? <h3 className="text-lg font-medium text-ink">{title}</h3> : null}
      <div className="whitespace-pre-wrap text-base leading-relaxed text-ink">{text}</div>
    </article>
  );
}

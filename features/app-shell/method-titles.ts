import commitments from "@/data/methods/commitments.json";
import form from "@/data/methods/form.json";
import listening from "@/data/methods/listening.json";
import reading from "@/data/methods/reading.json";
import speaking from "@/data/methods/speaking.json";
import vocabulary from "@/data/methods/vocabulary.json";
import world from "@/data/methods/world.json";
import writing from "@/data/methods/writing.json";

type MethodFile = {
  entries: readonly { type?: string; id?: string; name?: string }[];
};

/** id → display name for drill-in method routes. Built from shipped catalogue files. */
export const methodTitlesById: Readonly<Record<string, string>> = Object.fromEntries(
  ([commitments, form, listening, reading, speaking, vocabulary, world, writing] as MethodFile[])
    .flatMap((file) => file.entries)
    .filter((entry) => entry.type === "method" && entry.id && entry.name)
    .map((entry) => [entry.id!, entry.name!]),
);

"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field } from "@/components/ui/Field";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Table, Td, Th } from "@/components/ui/Table";

import { copy, sampleRows } from "./content";

/**
 * Every primitive on one surface, so they are discoverable.
 *
 * Delete this with the rest of the worked example when a real project starts —
 * the contracts live in docs/specs/component/, not here.
 */
export function PrimitivesDemo() {
  const [confirming, setConfirming] = useState(false);
  const [name, setName] = useState("");

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={copy.nameLabel} description={copy.nameHint} required>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Field>

        <Field label={copy.teamLabel} error={name.length > 0 ? undefined : copy.teamError}>
          <Select defaultValue="">
            <option value="">{copy.teamPlaceholder}</option>
            <option value="design">Design</option>
            <option value="engineering">Engineering</option>
          </Select>
        </Field>

        <div className="sm:col-span-2">
          <Field label={copy.notesLabel}>
            <Textarea placeholder={copy.notesPlaceholder} />
          </Field>
        </div>
      </div>

      <Table caption={copy.tableCaption}>
        <thead>
          <tr>
            <Th scope="col">{copy.colItem}</Th>
            <Th scope="col">{copy.colOwner}</Th>
          </tr>
        </thead>
        <tbody>
          {sampleRows.map((row) => (
            <tr key={row.id}>
              <Th scope="row">{row.id}</Th>
              <Td>{row.owner}</Td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div>
        <Button variant="danger" onClick={() => setConfirming(true)}>
          {copy.deleteAction}
        </Button>
      </div>

      <Dialog
        open={confirming}
        onClose={() => setConfirming(false)}
        title={copy.confirmTitle}
        description={copy.confirmBody}
        // Destructive: a stray click outside must not be what resolves this.
        dismissOnBackdrop={false}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirming(false)}>
              {copy.cancel}
            </Button>
            <Button variant="danger" onClick={() => setConfirming(false)}>
              {copy.confirm}
            </Button>
          </>
        }
      />
    </div>
  );
}

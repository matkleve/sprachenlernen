"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import {
  deleteAccountAction,
  exportAccountDataAction,
} from "@/features/account-data/actions";
import type { ExportScope } from "@/features/account-data/content";

/**
 * Export + delete controls. Contract: docs/specs/feature/account-data.md
 */
export function AccountDataPanel() {
  const t = useTranslations("accountData");
  const [scope, setScope] = useState<ExportScope>("complete");
  const [exportError, setExportError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [exportPending, startExport] = useTransition();
  const [deletePending, startDelete] = useTransition();

  const downloadExport = () => {
    setExportError(null);
    startExport(async () => {
      const result = await exportAccountDataAction(scope);
      if (result.status === "error") {
        setExportError(result.error);
        return;
      }

      const blob = new Blob([result.json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = t("exportFileName");
      anchor.click();
      URL.revokeObjectURL(url);
    });
  };

  const confirmDelete = () => {
    setDeleteError(null);
    startDelete(async () => {
      const result = await deleteAccountAction();
      if (result?.status === "error") {
        setDeleteError(result.error);
        setConfirmOpen(false);
      }
    });
  };

  return (
    <div className="mt-page-content flex flex-col gap-page-content">
      <section>
        <h2 className="text-xl font-semibold text-ink">{t("exportHeading")}</h2>
        <p className="mt-2 max-w-2xl text-base text-muted">{t("exportCaption")}</p>
        <div className="mt-6 max-w-md">
          <Field label={t("scopeLabel")}>
            <Select
              value={scope}
              onChange={(event) => setScope(event.target.value as ExportScope)}
            >
              <option value="complete">{t("scopeComplete")}</option>
              <option value="reviews">{t("scopeReviews")}</option>
            </Select>
          </Field>
          {exportError ? (
            <p className="mt-3 text-sm text-danger" role="alert">
              {exportError}
            </p>
          ) : null}
          <Button
            type="button"
            variant="secondary"
            className="mt-4"
            pending={exportPending}
            onClick={downloadExport}
          >
            {t("download")}
          </Button>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-ink">{t("deleteHeading")}</h2>
        <p className="mt-2 max-w-2xl text-base text-muted">{t("deleteCaption")}</p>
        {deleteError ? (
          <p className="mt-3 text-sm text-danger" role="alert">
            {deleteError}
          </p>
        ) : null}
        <Button
          type="button"
          variant="danger"
          className="mt-4"
          onClick={() => setConfirmOpen(true)}
        >
          {t("deleteAction")}
        </Button>
      </section>

      <Dialog
        open={confirmOpen}
        onClose={() => {
          if (!deletePending) setConfirmOpen(false);
        }}
        title={t("confirmTitle")}
        description={t("confirmBody")}
        dismissOnBackdrop={false}
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              disabled={deletePending}
              onClick={() => setConfirmOpen(false)}
            >
              {t("cancel")}
            </Button>
            <Button type="button" variant="danger" pending={deletePending} onClick={confirmDelete}>
              {t("confirmAction")}
            </Button>
          </>
        }
      />
    </div>
  );
}

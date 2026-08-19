import { APP_BUILT_AT } from "@/lib/app-build";
import { formatPrideVersion, APP_PRIDE_VERSION } from "@/lib/pride-version";

/** Contract: docs/specs/feature/app-update.md */
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(
    { version: formatPrideVersion(APP_PRIDE_VERSION), builtAt: APP_BUILT_AT },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

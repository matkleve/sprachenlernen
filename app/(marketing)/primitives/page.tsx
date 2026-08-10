import { redirect } from "next/navigation";

import { routes } from "@/lib/routes";

/** T-B5: /primitives retired — redirect to /languages. */
export default function PrimitivesRedirectPage() {
  redirect(routes.languages);
}

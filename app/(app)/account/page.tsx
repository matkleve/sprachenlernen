import { redirect } from "next/navigation";

import { routes } from "@/lib/routes";

/**
 * `/account` became `/profile` when languages moved in (SPEC-page-profile).
 * Kept as a redirect rather than deleted: the path shipped, and a learner who
 * bookmarked it should land on the page rather than a 404.
 */
export default function AccountPage() {
  redirect(routes.profile);
}

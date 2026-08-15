import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement } from "react";

import { AppUpdateProvider } from "@/features/app-shell/AppUpdateProvider";

export function renderWithAppUpdate(ui: ReactElement, options?: RenderOptions) {
  return render(<AppUpdateProvider>{ui}</AppUpdateProvider>, options);
}

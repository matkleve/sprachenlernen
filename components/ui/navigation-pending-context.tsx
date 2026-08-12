"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

type NavigationPendingContextValue = {
  pendingHref: string | null;
  setPendingHref: (href: string | null) => void;
};

const NavigationPendingContext = createContext<NavigationPendingContextValue | null>(null);

/**
 * Lets sibling nav links show optimistic "current" while a client transition
 * is in flight. Clears when the pathname settles.
 */
export function NavigationPendingProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  return (
    <NavigationPendingContext.Provider value={{ pendingHref, setPendingHref }}>
      {children}
    </NavigationPendingContext.Provider>
  );
}

export function useNavigationPending() {
  return useContext(NavigationPendingContext);
}

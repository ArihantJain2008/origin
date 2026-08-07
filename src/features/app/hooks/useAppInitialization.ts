import { useEffect } from "react";

import { initializeApplication } from "../coordinator/appCoordinator";

export function useAppInitialization() {
  useEffect(() => {
    initializeApplication().catch(console.error);
  }, []);
}
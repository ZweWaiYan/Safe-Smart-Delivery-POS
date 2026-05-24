import { useMemo } from "react";
import { routesList } from "../data/local-data";

export function usePermission(pageName) {
  const storedRoutes = JSON.parse(localStorage.getItem("routes")) || [];

  const permissionsMap = useMemo(() => {
    return storedRoutes.reduce((acc, item) => {
      const match = routesList.find(r => r.value === item.pageRoute);
      if (match) {
        acc[match.label] = item;
      }
      return acc;
    }, {});
  }, [storedRoutes]);

  return permissionsMap[pageName] || {
    canView: false,
    canAdd: false,
    canEdit: false,
    canDelete: false
  };
}

import * as React from "react";
import type { GetIncidentsData } from "@snailycad/types/api";
import { SocketEvents } from "@snailycad/config";
import { useListener } from "@casper124578/use-socket.io";
import { useAsyncTable } from "components/shared/Table";
import { LeoIncident } from "@snailycad/types";

export function useActiveIncidents() {
  const asyncTable = useAsyncTable<LeoIncident>({
    scrollToTopOnDataChange: false,
    fetchOptions: {
      pageSize: 12,
      path: "/incidents?activeType=active",
      onResponse: (json: GetIncidentsData<"leo">) => ({
        data: json.incidents,
        totalCount: json.totalCount,
      }),
    },
  });

  const isInTable = React.useCallback(
    (activeIncident: Pick<LeoIncident, "id">) => {
      return asyncTable.items.some((v) => v.id === activeIncident.id);
    },
    [asyncTable.items],
  );

  useListener(
    { eventName: SocketEvents.CreateActiveIncident, checkHasListeners: true },
    (data: LeoIncident) => {
      if (!isInTable(data)) {
        asyncTable.prepend(data);
      }
    },
    [],
  );

  useListener(
    { eventName: SocketEvents.UpdateActiveIncident, checkHasListeners: true },
    (activeIncident: LeoIncident) => {
      asyncTable.update(activeIncident.id, activeIncident);
    },
    [],
  );

  return asyncTable;
}

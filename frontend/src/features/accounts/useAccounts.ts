import { useQuery } from "@tanstack/react-query";
import { api } from "../../infrastructure/api";
import { queryKeys } from "../../shared/queryKeys";

export function useAccounts() {
  return useQuery({
    queryKey: queryKeys.accounts,
    queryFn: () => api.getAccounts(),
  });
}

import { useQuery } from "@tanstack/react-query";
import { api } from "../../infrastructure/api";
import { queryKeys } from "../../shared/queryKeys";

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: () => api.getCategories(),
    staleTime: 5 * 60_000,
  });
}

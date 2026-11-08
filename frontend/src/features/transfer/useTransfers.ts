import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { NewTransferInput } from "../../domain/entities";
import { shouldPollTransfer } from "../../domain/transfers/transfer";
import { api } from "../../infrastructure/api";
import { queryKeys } from "../../shared/queryKeys";

export function useCreateTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: NewTransferInput) => api.createTransfer(input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["transactions"] }),
        queryClient.invalidateQueries({ queryKey: ["accounts"] }),
      ]);
    },
  });
}

export function useTransferStatus(transferId: string) {
  return useQuery({
    queryKey: queryKeys.transfer(transferId),
    queryFn: () => api.getTransfer(transferId),
    enabled: Boolean(transferId),
    refetchInterval: (query) =>
      shouldPollTransfer(query.state.data?.status) ? 1000 : false,
    refetchIntervalInBackground: false,
  });
}

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { NewTransactionInput } from "../../domain/entities";
import { api } from "../../infrastructure/api";

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: NewTransactionInput) => api.createTransaction(input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["accounts"] }),
        queryClient.invalidateQueries({ queryKey: ["transactions"] }),
      ]);
    },
  });
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";

export function useList<T>(key: string, url: string, params?: Record<string, any>) {
  return useQuery({
    queryKey: [key, params],
    queryFn: async () => {
      const { data } = await api.get(url, { params });
      return (data.results ?? data) as T[];
    },
  });
}

export function useDetail<T>(key: string, url: string, id?: number | string) {
  return useQuery({
    queryKey: [key, id],
    queryFn: async () => {
      const { data } = await api.get(`${url}${id}/`);
      return data as T;
    },
    enabled: !!id,
  });
}

export function useCreate<T>(key: string, url: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<T>) => {
      const { data } = await api.post(url, payload);
      return data as T;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [key] }),
  });
}

export function useUpdate<T>(key: string, url: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number | string; payload: Partial<T> }) => {
      const { data } = await api.patch(`${url}${id}/`, payload);
      return data as T;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [key] }),
  });
}

export function useRemove(key: string, url: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number | string) => {
      await api.delete(`${url}${id}/`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [key] }),
  });
}

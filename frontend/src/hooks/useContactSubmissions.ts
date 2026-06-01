import { useQuery } from "@tanstack/react-query";
import { getContactSubmissions } from "../api/contact";

export function useContactSubmissions() {
  return useQuery({
    queryKey: ["admin", "contactSubmissions"] as const,
    queryFn: getContactSubmissions,
  });
}

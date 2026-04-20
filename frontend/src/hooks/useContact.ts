import { useMutation } from "@tanstack/react-query";
import { sendContactMessage } from "../api/contact";

// React Query mutation hook for submitting the contact form.
// Components get: mutate / mutateAsync, isPending, isSuccess, isError,
// error, reset — enough to drive a full submit → loading → success/error flow.
export function useContact() {
  return useMutation({
    mutationFn: sendContactMessage,
  });
}

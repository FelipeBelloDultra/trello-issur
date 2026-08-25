import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useFormErrors } from "@/shared/lib/hooks";
import { Button } from "@/shared/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { PasswordInput } from "@/shared/ui/password-input";

import { useAuthenticate } from "../model/use-authenticate";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1, "password is required"),
});

type LoginSchema = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const authenticate = useAuthenticate();
  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const { handleApiError } = useFormErrors(form);

  const onSubmit = form.handleSubmit(async (values) => {
    // Field-scoped errors (422) land on the matching input via
    // useFormErrors; anything else (e.g. "invalid credentials") surfaces
    // via the global mutation-error toast (see app/query-client.ts).
    try {
      await authenticate.mutateAsync(values);
      onSuccess?.();
    } catch (err) {
      handleApiError(err);
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={(e) => void onSubmit(e)} className="w-full space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput autoComplete="current-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={authenticate.isPending}>
          {authenticate.isPending ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </Form>
  );
}

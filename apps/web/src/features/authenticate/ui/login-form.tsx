import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

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

  const onSubmit = form.handleSubmit(async (values) => {
    // Errors surface via the global mutation-error toast (see
    // app/query-client.ts) with the API's own message (e.g. "invalid
    // credentials") — no need to duplicate/guess it here.
    try {
      await authenticate.mutateAsync(values);
      onSuccess?.();
    } catch {
      // handled by the toast; just stop the flow from continuing.
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

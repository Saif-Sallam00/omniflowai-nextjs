"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signInAction, type SignInState } from "./actions";
import { Button } from "@/components/admin/button";
import { FormField } from "@/components/admin/form-field";

const initialState: SignInState = { error: null };

const INPUT_CLASSNAME =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} variant="primary" className="w-full">
      {pending ? "Signing in…" : "Sign in"}
    </Button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(signInAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <FormField label="Username" htmlFor="username">
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
          className={INPUT_CLASSNAME}
        />
      </FormField>
      <FormField label="Password" htmlFor="password">
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={INPUT_CLASSNAME}
        />
      </FormField>
      {state.error ? (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      ) : null}
      <SubmitButton />
    </form>
  );
}

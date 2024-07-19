"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation"; // Import the useRouter hook
import React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { signInWithEmail } from "@/lib/firebase/auth";

import { Form } from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Sign in form schema
const SignInFormSchema = z.object({
  email: z.string({
    required_error: "Email is required",
  }),
  password: z.string({
    required_error: "Password is required",
  }),
});
const SignInForm: React.FC = () => {
  const form = useForm<z.infer<typeof SignInFormSchema>>({
    resolver: zodResolver(SignInFormSchema),
  });
  const router = useRouter(); // Assign the useRouter hook to the 'router' variable
  const { toast } = useToast();

  const onSubmit = async (data: any) => {
    console.log(data);
    const isOk = await signInWithEmail(data.email, data.password);
    console.log("isOk", isOk);
    if (isOk) router.push("/dashboard");
    else
      toast({
        title: "Sign in failed",
        description: "Please check your email and password.",
      });
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Card>
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <Input
                type="email"
                placeholder="Email"
                {...form.register("email", { required: true })}
                className="mb-4"
              />
              {form.formState.errors.email && <span>Email is required</span>}
              <Input
                type="password"
                placeholder="Password"
                {...form.register("password", { required: true })}
                className="mb-4"
              />
              {form.formState.errors.password && (
                <span>Password is required</span>
              )}
              <Button className="w-full">Sign In</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignInForm;

"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { registerAction } from "@/lib/actions/auth.action";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth/useSession";
export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setPassword] = useState(false);
const { fetchSession, refreshCart } = useSession();
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setError("");
  const result = await registerAction(data);

  if (result?.data) {
    setData({ name: "", email: "", password: "" });
    await fetchSession();
    await refreshCart();
    router.push("/");
  } else {
    setError(result?.message ?? "Something went wrong");
  }
};


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Register account</CardTitle>
          <CardDescription>
            Enter details below to register your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Name</FieldLabel>
                <Input
                  id="name"
                  type="name"
                  name="name"
                  onChange={handleChange}
                  value={data.name}
                  placeholder="magic johnson"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  value={data.email}
                  onChange={handleChange}
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </Field>
              <Field>
                <div className="flex flex-col gap-1">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <div className="relative flex items-center">
                    <Input
                      id="password"
                      name="password"
                      value={data.password}
                      onChange={handleChange}
                      type={showPassword ? "text" : "password"}
                      required
                      className="pr-10" // padding so text doesn't overlap the icon
                    />
                    <button
                      type="button"
                      onClick={() => setPassword((prev) => !prev)}
                      className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </Field>
              <Field>
                <Button type="submit">Register</Button>
                <Button variant="outline" type="button">
                  SignUp with Google
                </Button>
                <FieldDescription className="text-center">
                  already have an account? <a href="/login">Login In</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
          {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
}

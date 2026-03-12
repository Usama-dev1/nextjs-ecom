"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { ShippingAddress } from "@/types";
import { shippingAddressAction } from "@/lib/actions/user.actions";
export function ShippingForm({
  savedAddress,
  orderId,
  redirectTo,
}: {
  savedAddress: ShippingAddress | null;
  orderId?: string;
  redirectTo: string;
}) {
  const router = useRouter();

  const [data, setData] = useState<ShippingAddress>({
    fullName: savedAddress?.fullName || "",
    streetAddress: savedAddress?.streetAddress || "",
    city: savedAddress?.city || "",
    phoneNo: savedAddress?.phoneNo || 123,
    postalCode: savedAddress?.postalCode || "",
    country: savedAddress?.country || "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await shippingAddressAction(data, orderId);

      if (!result.success) {
        setError(result.message || "Failed to save address");
        return;
      }

      router.push(redirectTo);
    } catch  {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto py-2 px-3 sm:px-0">
      <Card className="w-full shadow-xl border rounded-2xl">
        <CardHeader className="space-y-1 sm:space-y-2 text-center px-4 sm:px-8 pt-5 sm:pt-8 pb-3 sm:pb-4">
          <CardTitle className="text-xl sm:text-3xl font-semibold">
            Shipping Address
          </CardTitle>
          <CardDescription className="text-xs sm:text-base">
            Enter your address details below
          </CardDescription>
        </CardHeader>

        <CardContent className="px-4 sm:px-12 pb-6 sm:pb-10">
          <form
            onSubmit={handleSubmit}
            className="text-xs space-y-4 sm:space-y-6">
            <FieldGroup className="space-y-3 sm:space-y-4">
              <Field className="space-y-1 sm:space-y-2">
                <FieldLabel
                  htmlFor="fullName"
                  className="text-xs sm:text-sm font-medium">
                  Full Name
                </FieldLabel>
                <Input
                  className="h-9 sm:h-12 text-sm sm:text-base"
                  id="fullName"
                  type="text"
                  name="fullName"
                  required
                  onChange={handleChange}
                  value={data.fullName}
                  placeholder="John Doe"
                />
              </Field>

              <Field className="space-y-1 sm:space-y-2">
                <FieldLabel
                  htmlFor="streetAddress"
                  className="text-xs sm:text-sm font-medium">
                  Street Address
                </FieldLabel>
                <Input
                  className="h-9 sm:h-12 text-sm sm:text-base"
                  id="streetAddress"
                  name="streetAddress"
                  required
                  onChange={handleChange}
                  value={data.streetAddress}
                  type="text"
                />
              </Field>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <Field className="space-y-1 sm:space-y-2">
                  <FieldLabel
                    htmlFor="city"
                    className="text-xs sm:text-sm font-medium">
                    City
                  </FieldLabel>
                  <Input
                    className="h-9 sm:h-12 text-sm sm:text-base"
                    id="city"
                    required
                    name="city"
                    onChange={handleChange}
                    value={data.city}
                    type="text"
                  />
                </Field>

                <Field className="space-y-1 sm:space-y-2">
                  <FieldLabel
                    htmlFor="postalCode"
                    className="text-xs sm:text-sm font-medium">
                    Postal Code
                  </FieldLabel>
                  <Input
                    className="h-9 sm:h-12 text-sm sm:text-base"
                    id="postalCode"
                    name="postalCode"
                    onChange={handleChange}
                    value={data.postalCode}
                    type="text"
                  />
                </Field>
              </div>

              <Field className="space-y-1 sm:space-y-2">
                <FieldLabel
                  htmlFor="phone"
                  className="text-xs sm:text-sm font-medium">
                  Phone no.
                </FieldLabel>
                <Input
                  className="h-9 sm:h-12 text-sm sm:text-base"
                  id="phoneNo"
                  name="phoneNo"
                  onChange={handleChange}
                  value={data.phoneNo}
                  type="number"
                  required
                />
              </Field>
              <Field className="space-y-1 sm:space-y-2">
                <FieldLabel
                  htmlFor="country"
                  className="text-xs sm:text-sm font-medium">
                  Country
                </FieldLabel>
                <Input
                  className="h-9 sm:h-12 text-sm sm:text-base"
                  id="country"
                  name="country"
                  onChange={handleChange}
                  value={data.country}
                  type="text"
                  required
                />
              </Field>

              <Field className="pt-2 sm:pt-3">
                <Button
                  className="w-full h-9 sm:h-11 text-sm sm:text-base font-medium flex items-center justify-center gap-2 rounded-lg"
                  type="submit"
                  disabled={loading}>
                  {loading ? (
                    "Saving..."
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4" />
                      <span>Continue</span>
                    </>
                  )}
                </Button>
              </Field>
            </FieldGroup>
          </form>

          {error && (
            <div className="flex justify-center mt-4">
              <p className="text-xs sm:text-sm text-red-500">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
const PAYMENT_METHODS = [
  {
    value: "COD",
    label: "Cash on Delivery",
    desc: "Buy now Pay later",
  },
  { value: "PayPal", label: "PayPal", desc: "Pay online with debit card" },
  {
    value: "Stripe",
    label: "Stripe",
    desc: "Pay with your stripe credit card",
  },
];
export function RadioGroupChoiceCard({ value, onChange }) {
  return (
    <RadioGroup value={value} onValueChange={onChange} className="max-w-sm">
      {PAYMENT_METHODS.map((method) => (
        <FieldLabel key={method.value} htmlFor={method.value}>
          <Field orientation="horizontal">
            <FieldContent>
              <FieldTitle>{method.label}</FieldTitle>
              <FieldDescription>{method.desc}</FieldDescription>
            </FieldContent>
            <RadioGroupItem value={method.value} id={method.value} />
          </Field>
        </FieldLabel>
      ))}
    </RadioGroup>
  );
}

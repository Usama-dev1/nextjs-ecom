//this is in root>lib/validators.ts
import { formatPrice } from "./utils";
import { z } from "zod";

console.log("validators module loaded");
export const currency = z
  .string()
  .refine((val) => /^\d+(\.\d{1,2})?$/.test(formatPrice(Number(val))), {
    message: "Price must be a valid number with up to 2 decimal places",
  });
export const insertProductSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters long"),
  slug: z.string().min(3, "Slug name must be at least 3 characters long"),
  category: z
    .string()
    .min(3, "Category name must be at least 3 characters long"),

  description: z
    .string()
    .min(10, "Product description must be at least 10 characters long"),
  stock: z.coerce
    .number()
    .int()
    .nonnegative("Stock must be a non-negative integer"),
  images: z.array(z.string()).min(1, "At least one image is required"),
  isFeatured: z.boolean().default(false),
  banner: z.string().nullable().optional(),
  price: currency,
});

export const insertUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.string().default("USER"),
});

export const userSchema = insertUserSchema.extend({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const sessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  expiresAt: z.date(),
  createdAt: z.date(),
});

export const shippingAddressSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  streetAddress: z.string().min(5, "Enter a valid street address"),
  city: z.string().min(2, "Enter a valid city"),
  phoneNo: z.number().min(7, "Enter a valid number"),
  postalCode: z.string().min(3, "Enter a valid postal code"),
  country: z.string().min(2, "Enter a valid country"),
  lat: z.number().optional(),
  lng: z.number().optional(),
});
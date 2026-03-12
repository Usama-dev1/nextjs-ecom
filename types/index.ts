//this is in root>type/index.ts
import { z } from "zod";
import { insertProductSchema,insertUserSchema,sessionSchema, shippingAddressSchema } from "../lib/validators";
export type Product = z.infer<typeof insertProductSchema> & {
  id: string;
  rating: number;
  createdAt: Date;
  price: number;
};
//the purpose of this file is to export all the types used in the project,
// so we can import them from a single place.
export type User = z.infer<typeof insertUserSchema> & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Session = z.infer<typeof sessionSchema> & {
  user: User;
};

export type ShippingAddress=z.infer<typeof shippingAddressSchema>


export type SessionResult =
  | { success: true; user: User }
  | { success: false; message: string };
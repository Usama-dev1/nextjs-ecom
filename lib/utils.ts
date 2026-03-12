import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
//this function is used to merge the class names and remove the duplicates,
// it takes an array of class names as input and returns a string of merged class names.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

//this function is used to format the price of the product,
// it takes a number as input and returns a string in the format of $xx.xx
//if the price has no decimal part, it will add .00 to the end of the price.
//if theres a decimal part, it will pad it to 2 decimal places
// if its less than 2 decimal places.
export function formatPrice(price: number): string {
  const [int, dec] = price.toFixed(2).split(".");
  return dec ? `$${int}.${dec.padEnd(2, "0")}` : `$${int}.00`;
}

const CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", {
  currency: "USD",
  style: "currency",
  minimumFractionDigits:2
});

export const formatCurrency=(amount:number|string|null)=>{
  if(typeof amount==="number")
{
  return CURRENCY_FORMATTER.format(amount)
}
else if(typeof amount==="string")
{
  return CURRENCY_FORMATTER.format(Number(amount))
}
else{
  return "Nan"
}
}


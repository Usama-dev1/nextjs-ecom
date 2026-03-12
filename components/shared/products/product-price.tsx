import { cn } from "@/lib/utils";

const ProductPrice = ({
  price,
  className,
}: {
  price: number;
  className?: string;
}) => {
  const stringValue = price.toFixed(2);
  const [intvalue, floatvalue] = stringValue.split(".");
  return (
    <p className={cn("text-2xl", className)}>
      <span className="text-xs align-super">$</span>
      <span className="text-md">{intvalue} </span>
      <span className="text-xs align-super">.{floatvalue}</span>
    </p>
  );
};
export default ProductPrice;
//align super 

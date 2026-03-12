"use client";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";
const ProductImages = ({ images }: { images: string[] }) => {
  const [current, setCurrent] = useState(0);
  console.log(images)
  return (
    <>
      <div className="flex justify-center mb-3 ">
        <Image
          src={images[current]}
          width={400}
          height={400}
          alt="product image"
          className="min-h-[300] mt-2 object-center object-cover"
        />
      </div>
      <div className="flex gap-2 mx-10">
        {images.map((image, index) => (
          <div
            key={image}
            onClick={() => setCurrent(index)}
            className={cn(" border  hover:border-orange-600 mr-2 cursor-pointer",current===index&&"border-orange-500"  )} >
            <Image
        
              alt="product images"
              src={image}
              width={50}
              height={50}
            />
          </div>
        ))}
      </div>
    </>
  );
    
}
export default ProductImages;

import Image from "next/image";
import loadImage from "../assets/loader.gif";
const LoadingPage = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <Image
        src={loadImage}
        alt="Loading..."
        width={100}
        height={100}
        unoptimized
      />
    </div>
  );
};
export default LoadingPage;

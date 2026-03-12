"use client";

const CheckOutSteps = ({ current = 0 }) => {
  return (
    <div className="flex items-center justify-center flex-col md:flex-row mt-2 mb-6">
      {["Shipping Address", "Payment Method", "Place Order"].map(
        (step, index) => (
          <span className="flex flex-col md:flex-row items-center" key={step}>
            <div
              className={`px-4 py-2 md:w-40 rounded-full text-center text-xs ${
                index === current
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-400"
              }`}>
              {step}
            </div>
            {index !== 2 && (
              <>
                {/* horizontal line on desktop */}
                <hr className="hidden md:block w-5 border-t border-gray-300" />
                {/* vertical line on mobile */}
                <div className="block md:hidden h-6 border-l border-gray-300" />
              </>
            )}
          </span>
        ),
      )}
    </div>
  );
};

export default CheckOutSteps;

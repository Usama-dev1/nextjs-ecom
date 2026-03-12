import { toast } from "sonner";

const toastbar = ({
  success,
  message,
  link = true,
}: {
  success: boolean;
  message: string;
  link?: boolean;
}) => {
  if (success) {
    toast.success(message, {
      action: link
        ? {
            label: "Go to cart",
            onClick: () => (window.location.href = "/cart"),
          }
        : undefined,
    });
  } else {
    toast.error(message);
  }
};

export default toastbar;

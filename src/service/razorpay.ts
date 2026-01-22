import { ENV } from "@/app/env";

function loadScript(src: string) {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
})
}

function getOptions(amount: number, currency: string, orderId: string, name: string, email: string) {
  return {
    key: process.env.NEXT_PUBLIC_RAZORPAY_API_KEY,
    amount: amount,
    currency: currency,
    name: "Gourav Malviya",
    description: "Gourav Malviya test transaction",
    image: { 
        logo: "https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    order_id: orderId,
    callback_url: `${ENV.API_URL}/api/payments/verify`,
    prefill: {
        name: name,
        email: email,
    },
    theme: {
        color: "#61dafb",
    },
  };
}

export {
  loadScript,
  getOptions
}
import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./CheckoutForm";
import { X } from "lucide-react";
import { handleError } from "../utils";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: number;
  goal?: number;
  raised?: number;
}

export function DonationModal({
  isOpen,
  onClose,
  campaignId,
  goal,
  raised,
}: DonationModalProps) {
  const [stage, setStage] = useState(1);
  const [amount, setAmount] = useState("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const remainingAmount =
    goal !== undefined && raised !== undefined && goal !== null && raised !== null
      ? Math.max(0, Number(goal) - Number(raised))
      : null;

  if (!isOpen) return null;

  const handleContinue = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      handleError("Please enter a valid amount greater than 0.");
      return;
    }

    if (remainingAmount !== null && numAmount > remainingAmount) {
      handleError(
        `You cannot fund more than the required amount. Maximum allowed: $${remainingAmount.toFixed(2)}`
      );
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}/payments/create-intent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount: numAmount,
            campaignId: campaignId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to initialize payment");
      }

      setClientSecret(data.clientSecret);
      setStage(2);
    } catch (error: any) {
      handleError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = () => {
    setTimeout(() => {
      onClose();
      setStage(1);
      setAmount("");
      window.location.reload();
    }, 2000);
  };

  const appearance = {
    theme: "stripe" as const,
  };
  const options = {
    clientSecret: clientSecret || undefined,
    appearance,
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[95vh] overflow-y-auto flex flex-col relative">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-800">
            {stage === 1 ? "Back this Project" : "Payment Details"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {stage === 1 && (
            <div className="flex flex-col gap-4">
              <p className="text-gray-600 text-sm">
                Enter the amount you would like to contribute. Your support
                makes a difference!
              </p>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-lg">
                  $
                </span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  max={remainingAmount !== null ? remainingAmount : undefined}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={
                    remainingAmount !== null
                      ? String(Math.min(50, remainingAmount))
                      : "50"
                  }
                  className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                />
              </div>

              {remainingAmount !== null && (
                <p className="text-sm text-gray-500">
                  Remaining amount needed:{" "}
                  <span className="font-semibold text-gray-700">
                    $
                    {remainingAmount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </p>
              )}

              {amount &&
                remainingAmount !== null &&
                parseFloat(amount) > remainingAmount && (
                  <p className="text-sm text-red-500 font-medium">
                    Amount exceeds the remaining required funding.
                  </p>
                )}

              <button
                onClick={handleContinue}
                disabled={
                  isLoading ||
                  !amount ||
                  parseFloat(amount) <= 0 ||
                  (remainingAmount !== null &&
                    parseFloat(amount) > remainingAmount)
                }
                className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors flex justify-center items-center disabled:bg-blue-300 disabled:cursor-not-allowed"
              >
                {isLoading ? "Preparing..." : "Continue to Payment"}
              </button>
            </div>
          )}

          {stage === 2 && clientSecret && (
            <div className="min-h-100">
              <Elements options={options} stripe={stripePromise}>
                <CheckoutForm amount={amount} onSuccess={handleSuccess} />
              </Elements>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DonationModal;

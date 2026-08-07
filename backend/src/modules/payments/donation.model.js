import prisma from "../../config/prisma.js";

export const initTable = async () => {
  console.log("Donations table verified via Prisma");
};

export const createDonation = async (campaignId, donorId, amount, stripePaymentIntentId) => {
  return await prisma.donation.create({
    data: {
      campaign_id: parseInt(campaignId, 10),
      donor_id: parseInt(donorId, 10),
      amount,
      stripe_payment_intent_id: stripePaymentIntentId,
      status: "pending",
    },
  });
};

export const findByStripePaymentIntent = async (paymentIntentId) => {
  return await prisma.donation.findUnique({
    where: { stripe_payment_intent_id: paymentIntentId },
  });
};

export const updateDonationStatus = async (paymentIntentId, status) => {
  return await prisma.donation.update({
    where: { stripe_payment_intent_id: paymentIntentId },
    data: { status },
  });
};

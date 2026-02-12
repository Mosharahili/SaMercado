import { env } from '../config/env';

type ExternalMethod = 'MADA' | 'APPLE_PAY';

type InitiateArgs = {
  method: ExternalMethod;
  orderId: string;
  orderNumber: string;
  amount: number;
  customer: {
    id: string;
    email?: string | null;
    phone?: string | null;
  };
};

export type PaymentInitiationResult = {
  status: 'PENDING' | 'SUCCEEDED' | 'FAILED';
  transactionId?: string;
  redirectUrl?: string;
  failureReason?: string;
  providerPayload?: unknown;
  message?: string;
};

const parseProviderResponse = (text: string) => {
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
};

const methodConfig = (method: ExternalMethod) => {
  if (method === 'MADA') {
    return {
      url: env.madaPaymentInitUrl,
      apiKey: env.madaPaymentApiKey,
      provider: 'mada',
    };
  }

  return {
    url: env.applePayInitUrl,
    apiKey: env.applePayApiKey,
    provider: 'apple_pay',
  };
};

export const initiatePayment = async (args: InitiateArgs): Promise<PaymentInitiationResult> => {
  const config = methodConfig(args.method);

  if (!config.url) {
    return {
      status: 'PENDING',
      message: `Provider endpoint not configured for ${args.method}.`,
    };
  }

  try {
    const response = await fetch(config.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
      },
      body: JSON.stringify({
        provider: config.provider,
        orderId: args.orderId,
        orderNumber: args.orderNumber,
        amount: args.amount,
        currency: 'SAR',
        customerId: args.customer.id,
        customerEmail: args.customer.email,
        customerPhone: args.customer.phone,
      }),
    });

    const text = await response.text();
    const payload = parseProviderResponse(text) as any;

    if (!response.ok) {
      return {
        status: 'FAILED',
        failureReason: payload?.error || payload?.message || `Payment provider failed with ${response.status}`,
        providerPayload: payload,
      };
    }

    const normalizedStatus = String(payload?.status || '').toUpperCase();
    const status =
      normalizedStatus === 'SUCCEEDED' || normalizedStatus === 'SUCCESS'
        ? 'SUCCEEDED'
        : normalizedStatus === 'FAILED'
          ? 'FAILED'
          : 'PENDING';

    return {
      status,
      transactionId: payload?.transactionId || payload?.id || payload?.reference || undefined,
      redirectUrl: payload?.redirectUrl || payload?.checkoutUrl || payload?.paymentUrl || undefined,
      failureReason: payload?.failureReason || payload?.error || undefined,
      providerPayload: payload,
    };
  } catch (error: any) {
    return {
      status: 'FAILED',
      failureReason: error?.message || 'Payment request failed',
    };
  }
};

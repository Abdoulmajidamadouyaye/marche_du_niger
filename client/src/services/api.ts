import {
  CartItemType,
  ChatMessageType,
  ConversationSummaryType,
  CustomerType,
  OrdersAnalyticsType,
  OrderStatus,
  OrderType,
  PaymentMethod,
  ProductType,
} from "@/types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("nm_admin_token");
}

function getCustomerToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("nm_customer_token");
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function customerAuthHeaders(): Record<string, string> {
  const token = getCustomerToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    const payload = err as { message?: string | string[] };
    const message = Array.isArray(payload.message)
      ? payload.message.join(" | ")
      : payload.message ?? "API error";
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

// ─── Products ─────────────────────────────────────────────────────────────────

export async function apiGetProducts(): Promise<ProductType[]> {
  const res = await fetch(`${BASE}/products`);
  return handleResponse<ProductType[]>(res);
}

export async function apiUploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${BASE}/upload/image`, {
    method: "POST",
    headers: { ...authHeaders() },
    body: formData,
  });
  const data = await handleResponse<{ url: string }>(res);
  return data.url;
}

export async function apiUploadImages(files: File[]): Promise<string[]> {
  if (files.length === 0) return [];

  const formData = new FormData();
  for (const file of files) {
    formData.append("files", file);
  }

  const res = await fetch(`${BASE}/upload/images`, {
    method: "POST",
    headers: { ...authHeaders() },
    body: formData,
  });
  const data = await handleResponse<{ urls: string[] }>(res);
  return data.urls ?? [];
}

export async function apiCreateProduct(
  data: Omit<ProductType, "id">
): Promise<ProductType> {
  const res = await fetch(`${BASE}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });
  return handleResponse<ProductType>(res);
}

export async function apiUpdateProduct(
  id: string,
  data: Partial<ProductType>
): Promise<ProductType> {
  const res = await fetch(`${BASE}/products/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });
  return handleResponse<ProductType>(res);
}

export async function apiDeleteProduct(id: string): Promise<void> {
  const res = await fetch(`${BASE}/products/${id}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error((err as { message?: string }).message ?? "API error");
  }
}

export async function apiSetPromotion(
  id: string,
  discountPercent: number
): Promise<ProductType> {
  const res = await fetch(`${BASE}/products/${id}/promotion`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ discountPercent }),
  });
  return handleResponse<ProductType>(res);
}

export async function apiClearPromotion(id: string): Promise<ProductType> {
  const res = await fetch(`${BASE}/products/${id}/promotion`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
  return handleResponse<ProductType>(res);
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export async function apiGetOrders(): Promise<OrderType[]> {
  const res = await fetch(`${BASE}/orders`, {
    headers: { ...authHeaders() },
  });
  return handleResponse<OrderType[]>(res);
}

export async function apiCreateOrder(
  items: CartItemType[],
  subtotal: number,
  paymentMethod: PaymentMethod,
  customer: {
    firstName: string;
    lastName: string;
    phone: string;
    city?: string;
  }
): Promise<OrderType> {
  const body = {
    items: items.map((item) => ({
      productId: String(item.product.id),
      productName: item.product.name,
      productImage: Object.values(item.product.images ?? {})[0] ?? "",
      unitPrice: item.product.price,
      quantity: item.quantity,
    })),
    subtotal,
    paymentMethod,
    customerFirstName: customer.firstName,
    customerLastName: customer.lastName,
    customerPhone: customer.phone,
    customerCity: customer.city,
  };
  const res = await fetch(`${BASE}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handleResponse<OrderType>(res);
}

export async function apiUpdateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<OrderType> {
  const res = await fetch(`${BASE}/orders/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ status }),
  });
  return handleResponse<OrderType>(res);
}

export async function apiDeleteOrder(id: string): Promise<{ deleted: true; id: string }> {
  const res = await fetch(`${BASE}/orders/${id}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
  return handleResponse<{ deleted: true; id: string }>(res);
}

export async function apiGetOrdersAnalytics(): Promise<OrdersAnalyticsType> {
  const res = await fetch(`${BASE}/orders/analytics`, {
    headers: { ...authHeaders() },
  });
  return handleResponse<OrdersAnalyticsType>(res);
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function apiAdminLogin(
  email: string,
  password: string
): Promise<{ accessToken: string; admin: { email: string; role: string } }> {
  const res = await fetch(`${BASE}/auth/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse<{
    accessToken: string;
    admin: { email: string; role: string };
  }>(res);
}

export async function apiAdminForgotPassword(
  email: string
): Promise<{ message: string }> {
  const res = await fetch(`${BASE}/auth/admin/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return handleResponse<{ message: string }>(res);
}

export async function apiAdminResetPassword(
  email: string,
  token: string,
  newPassword: string
): Promise<{ message: string }> {
  const res = await fetch(`${BASE}/auth/admin/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, token, newPassword }),
  });
  return handleResponse<{ message: string }>(res);
}

export async function apiAdminMe(): Promise<{
  email: string;
  role: string;
}> {
  const res = await fetch(`${BASE}/auth/admin/me`, {
    headers: { ...authHeaders() },
  });
  return handleResponse<{ email: string; role: string }>(res);
}

export async function apiGetCustomersCount(): Promise<{ count: number }> {
  const res = await fetch(`${BASE}/auth/admin/customers/count`, {
    headers: { ...authHeaders() },
  });
  return handleResponse<{ count: number }>(res);
}

export async function apiCustomerRegister(
  firstName: string,
  lastName: string,
  phone: string,
  email: string,
  password: string
): Promise<{ accessToken: string; customer: CustomerType }> {
  const res = await fetch(`${BASE}/auth/customer/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ firstName, lastName, phone, email, password }),
  });
  return handleResponse<{ accessToken: string; customer: CustomerType }>(res);
}

export async function apiCustomerLogin(
  email: string,
  password: string
): Promise<{ accessToken: string; customer: CustomerType }> {
  const res = await fetch(`${BASE}/auth/customer/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse<{ accessToken: string; customer: CustomerType }>(res);
}

export async function apiCustomerForgotPassword(
  email: string
): Promise<{ message: string }> {
  const res = await fetch(`${BASE}/auth/customer/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return handleResponse<{ message: string }>(res);
}

export async function apiCustomerResetPassword(
  email: string,
  token: string,
  newPassword: string
): Promise<{ message: string }> {
  const res = await fetch(`${BASE}/auth/customer/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, token, newPassword }),
  });
  return handleResponse<{ message: string }>(res);
}

export async function apiCustomerMe(): Promise<CustomerType> {
  const res = await fetch(`${BASE}/auth/customer/me`, {
    headers: { ...customerAuthHeaders() },
  });
  return handleResponse<CustomerType>(res);
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

/** Customer: load their own conversation */
export async function apiGetMyChatMessages(): Promise<ChatMessageType[]> {
  const res = await fetch(`${BASE}/chat/messages`, {
    headers: { ...customerAuthHeaders() },
  });
  return handleResponse<ChatMessageType[]>(res);
}

/** Customer: send a message */
export async function apiSendCustomerChatMessage(message: string): Promise<ChatMessageType> {
  const res = await fetch(`${BASE}/chat/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...customerAuthHeaders() },
    body: JSON.stringify({ message }),
  });
  return handleResponse<ChatMessageType>(res);
}

/** Admin: conversation summaries */
export async function apiGetConversationSummaries(): Promise<ConversationSummaryType[]> {
  const res = await fetch(`${BASE}/chat/admin/conversations`, {
    headers: { ...authHeaders() },
  });
  return handleResponse<ConversationSummaryType[]>(res);
}

/** Admin: all messages for one customer */
export async function apiGetConversation(customerId: string): Promise<ChatMessageType[]> {
  const res = await fetch(`${BASE}/chat/admin/conversations/${customerId}`, {
    headers: { ...authHeaders() },
  });
  return handleResponse<ChatMessageType[]>(res);
}

/** Admin: reply to a customer */
export async function apiSendAdminChatMessage(customerId: string, message: string): Promise<ChatMessageType> {
  const res = await fetch(`${BASE}/chat/admin/conversations/${customerId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ message }),
  });
  return handleResponse<ChatMessageType>(res);
}

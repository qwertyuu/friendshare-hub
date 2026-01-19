import { User, Item, PaginatedResponse } from "@/types";
import { getAPIUrl } from "@/lib/utils";

const API_URL = getAPIUrl();

export interface AuthResponse {
  message: string;
  user: User;
  token?: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include", // Include cookies for JWT
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // SSO Auth endpoints
  async getLoginUrl(): Promise<{ authorizationUrl: string }> {
    return this.request<{ authorizationUrl: string }>("/api/auth/login", {
      method: "GET",
    });
  }

  async logout(): Promise<{ message: string; ssoLogoutUrl?: string }> {
    return this.request<{ message: string; ssoLogoutUrl?: string }>("/api/auth/logout", {
      method: "POST",
    });
  }

  async getCurrentUser(): Promise<{ user: User }> {
    return this.request<{ user: User }>("/api/auth/me", {
      method: "GET",
    });
  }

  // Items endpoints
  async getItems(
    category?: string,
    status?: string,
    page: number = 1,
    limit: number = 20,
    search?: string
  ): Promise<PaginatedResponse<Item>> {
    const params = new URLSearchParams();
    if (category && category !== "all") params.append("category", category);
    if (status && status !== "all") params.append("status", status);
    if (search) params.append("search", search);
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    return this.request<PaginatedResponse<Item>>(`/api/items?${params.toString()}`, {
      method: "GET",
    });
  }

  async getItemById(id: string) {
    return this.request(`/api/items/${id}`, {
      method: "GET",
    });
  }

  async createItem(title: string, description: string, category: string) {
    return this.request("/api/items", {
      method: "POST",
      body: JSON.stringify({ title, description, category }),
    });
  }

  async updateItem(id: string, data: Record<string, unknown>) {
    return this.request(`/api/items/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteItem(id: string) {
    return this.request(`/api/items/${id}`, {
      method: "DELETE",
    });
  }

  // Image endpoints
  async uploadImages(itemId: string, files: File[]) {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("images", file);
    });

    const response = await fetch(`${this.baseURL}/api/items/${itemId}/images`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  }

  async deleteImage(itemId: string, imageId: string) {
    return this.request(`/api/items/${itemId}/images/${imageId}`, {
      method: "DELETE",
    });
  }

  async reorderImages(itemId: string, imageIds: string[]) {
    return this.request(`/api/items/${itemId}/images/reorder`, {
      method: "PATCH",
      body: JSON.stringify({ imageIds }),
    });
  }

  // Borrow request endpoints
  async getMyRequests() {
    return this.request("/api/requests", {
      method: "GET",
    });
  }

  async getMyDemands() {
    return this.request("/api/requests/demands", {
      method: "GET",
    });
  }

  async createBorrowRequest(
    itemId: string,
    startDate?: string,
    endDate?: string,
    message?: string
  ) {
    return this.request("/api/requests", {
      method: "POST",
      body: JSON.stringify({ itemId, startDate, endDate, message }),
    });
  }

  async approveRequest(id: string, responseMessage?: string) {
    return this.request(`/api/requests/${id}/approve`, {
      method: "PATCH",
      body: JSON.stringify({ responseMessage }),
    });
  }

  async rejectRequest(id: string, responseMessage?: string) {
    return this.request(`/api/requests/${id}/reject`, {
      method: "PATCH",
      body: JSON.stringify({ responseMessage }),
    });
  }

  async completeRequest(id: string) {
    return this.request(`/api/requests/${id}/complete`, {
      method: "PATCH",
    });
  }

  async cancelRequest(id: string) {
    return this.request(`/api/requests/${id}/cancel`, {
      method: "PATCH",
    });
  }

  // General request endpoints
  async getGeneralRequests(status?: string, page: number = 1, limit: number = 20) {
    const params = new URLSearchParams();
    if (status && status !== "all") params.append("status", status);
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    return this.request(`/api/general-requests?${params.toString()}`, {
      method: "GET",
    });
  }

  async getMyGeneralRequests() {
    return this.request("/api/general-requests/mine", {
      method: "GET",
    });
  }

  async createGeneralRequest(
    title: string,
    description?: string,
    startDate?: string,
    endDate?: string
  ) {
    return this.request("/api/general-requests", {
      method: "POST",
      body: JSON.stringify({ title, description, startDate, endDate }),
    });
  }

  async updateGeneralRequest(
    id: string,
    data: { title?: string; description?: string; startDate?: string; endDate?: string }
  ) {
    return this.request(`/api/general-requests/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async fulfillGeneralRequest(id: string) {
    return this.request(`/api/general-requests/${id}/fulfill`, {
      method: "PATCH",
    });
  }

  async cancelGeneralRequest(id: string) {
    return this.request(`/api/general-requests/${id}/cancel`, {
      method: "PATCH",
    });
  }

  async deleteGeneralRequest(id: string) {
    return this.request(`/api/general-requests/${id}`, {
      method: "DELETE",
    });
  }

  async respondToGeneralRequest(requestId: string, itemId: string, message?: string) {
    return this.request(`/api/general-requests/${requestId}/responses`, {
      method: "POST",
      body: JSON.stringify({ itemId, message }),
    });
  }

  async deleteGeneralRequestResponse(responseId: string) {
    return this.request(`/api/general-requests/responses/${responseId}`, {
      method: "DELETE",
    });
  }

  // Admin endpoints
  async getAdminStatistics() {
    return this.request("/api/admin/statistics", {
      method: "GET",
    });
  }

  async getUsers(status?: string) {
    const params = new URLSearchParams();
    if (status && status !== "all") params.append("status", status);
    return this.request(`/api/admin/users?${params.toString()}`, {
      method: "GET",
    });
  }

  async deleteUser(userId: string) {
    return this.request(`/api/admin/users/${userId}`, {
      method: "DELETE",
    });
  }

  async adminDeleteItem(itemId: string) {
    return this.request(`/api/admin/items/${itemId}`, {
      method: "DELETE",
    });
  }
}

export const api = new ApiClient(API_URL);

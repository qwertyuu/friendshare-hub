import { User } from "@/types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

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

  // Auth endpoints
  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    return this.request<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async logout(): Promise<void> {
    await this.request("/api/auth/logout", {
      method: "POST",
    });
  }

  async getCurrentUser(): Promise<{ user: User }> {
    return this.request<{ user: User }>("/api/auth/me", {
      method: "GET",
    });
  }

  // Items endpoints
  async getItems(category?: string, status?: string, page: number = 1, limit: number = 20) {
    const params = new URLSearchParams();
    if (category && category !== "all") params.append("category", category);
    if (status && status !== "all") params.append("status", status);
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    return this.request(`/api/items?${params.toString()}`, {
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
  async getUsers(status?: string) {
    const params = new URLSearchParams();
    if (status && status !== "all") params.append("status", status);
    return this.request(`/api/admin/users?${params.toString()}`, {
      method: "GET",
    });
  }

  async approveUser(id: string) {
    return this.request(`/api/admin/users/${id}/approve`, {
      method: "PATCH",
    });
  }

  async rejectUser(id: string) {
    return this.request(`/api/admin/users/${id}/reject`, {
      method: "PATCH",
    });
  }
}

export const api = new ApiClient(API_URL);

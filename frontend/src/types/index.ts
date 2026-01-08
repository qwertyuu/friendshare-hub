export type ItemCategory =
  | "TOOLS"
  | "KITCHEN"
  | "SPORTS"
  | "ELECTRONICS"
  | "BOOKS"
  | "GAMES"
  | "CAMPING"
  | "OTHER";

export type ItemStatus = "AVAILABLE" | "BORROWED" | "UNAVAILABLE";
export type RequestStatus = "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED";
export type GeneralRequestStatus = "OPEN" | "FULFILLED" | "CANCELLED";
export type UserRole = "USER" | "ADMIN";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface Item {
  id: string;
  ownerId: string;
  title: string;
  description: string | null;
  category: ItemCategory;
  status: ItemStatus;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  images: ItemImage[];
}

export interface ItemImage {
  id: string;
  itemId: string;
  filePath: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  displayOrder: number;
  createdAt: string;
}

export interface BorrowRequest {
  id: string;
  itemId: string;
  requesterId: string;
  ownerId: string;
  status: RequestStatus;
  startDate: string | null;
  endDate: string | null;
  message: string | null;
  responseMessage: string | null;
  createdAt: string;
  updatedAt: string;
  item: Item;
  requester: {
    id: string;
    name: string;
    email: string;
  };
  owner: {
    id: string;
    name: string;
    email: string;
  };
}

export interface GeneralRequest {
  id: string;
  requesterId: string;
  title: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  status: GeneralRequestStatus;
  createdAt: string;
  updatedAt: string;
  requester: {
    id: string;
    name: string;
    email: string;
  };
  responses: GeneralRequestResponse[];
}

export interface GeneralRequestResponse {
  id: string;
  generalRequestId: string;
  responderId: string;
  itemId: string | null;
  message: string | null;
  createdAt: string;
  responder: {
    id: string;
    name: string;
    email: string;
  };
  item?: Item;
}

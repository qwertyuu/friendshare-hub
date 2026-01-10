/**
 * Type definitions for email notifications
 */

export interface BorrowRequestWithRelations {
  id: string;
  item: {
    id: string;
    title: string;
    owner: {
      id: string;
      name: string;
      email: string;
    };
  };
  requester: {
    id: string;
    name: string;
    email: string;
  };
  startDate: Date | null;
  endDate: Date | null;
  message: string | null;
  responseMessage: string | null;
  status: string;
}

export interface GeneralRequestResponseWithRelations {
  id: string;
  responderId: string;
  generalRequestId: string;
  itemId: string | null;
  message: string | null;
  responder: {
    id: string;
    name: string;
    email: string;
  };
  item: {
    id: string;
    title: string;
    owner: {
      id: string;
      name: string;
      email: string;
    };
    images: Array<{
      id: string;
      displayOrder: number;
    }>;
  } | null;
}

export interface GeneralRequestWithRequester {
  id: string;
  title: string;
  requester: {
    id: string;
    name: string;
    email: string;
  };
}

export type StatementQueryType = {
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
  search?: string;
};

export type StatementTransactionType = {
  id?: string;
  reference?: string;
  type?: string;
  amount?: number;
  currency?: string;
  status?: string;
  senderName?: string;
  senderBank?: string;
  recipientName?: string;
  recipientBank?: string;
  narration?: string;
  createdAt?: string;
  completedAt?: string;
  [key: string]: unknown;
};

export type StatementResponseType = {
  success: boolean;
  message: string;
  data: StatementTransactionType[] | {
    data?: StatementTransactionType[];
    transactions?: StatementTransactionType[];
    totalItems?: number;
    totalPages?: number;
    pageNumber?: number;
    pageSize?: number;
    [key: string]: unknown;
  } | null;
  timestamp: string | null;
};

export interface CursorPaginationPayload {
  cursor?: string | null;
  limit?: number;
}

export interface ListCommentsPayload extends CursorPaginationPayload {
  parentId?: string | null;
}

export const withCursorQuery = (payload?: CursorPaginationPayload): string => {
  if (!payload) {
    return "";
  }

  const params = new URLSearchParams();

  if (payload.cursor) {
    params.set("cursor", payload.cursor);
  }

  if (typeof payload.limit === "number") {
    params.set("limit", String(payload.limit));
  }

  const query = params.toString();
  return query ? `?${query}` : "";
};

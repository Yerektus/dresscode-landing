import { request } from "@/common/api/request";

export const deleteComment = async (commentId: string): Promise<void> => {
  await request.delete(`/api/v1/social/comments/${commentId}`);
};

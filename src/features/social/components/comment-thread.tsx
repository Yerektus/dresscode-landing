"use client";

import { type ReactNode, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, Reply, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/common/components/ui/card";
import { Button } from "@/common/components/ui/button";
import { AlertDialog } from "@/common/components/ui/alert-dialog";
import { createLookComment, deleteComment } from "@/common/api/requests/social";
import type { SocialComment } from "@/common/entities/social/social-comment";
import { socialQueryKeys } from "@/features/social/query-keys";
import {
  flattenCursorPages,
  useSocialCommentsInfiniteQuery
} from "@/features/social/hooks/use-social-queries";
import { formatSocialDateTime } from "@/features/social/utils";
import { CommentComposer } from "@/features/social/components/comment-composer";

interface CommentThreadProps {
  lookId: string;
  isAuthenticated: boolean;
  mode?: "card" | "embedded";
  bottomSlot?: ReactNode;
}

interface CommentItemProps {
  lookId: string;
  comment: SocialComment;
  isAuthenticated: boolean;
  deletingId: string | null;
  onDelete: (commentId: string) => void;
  onReply: (parentId: string, body: string) => Promise<void>;
}

const CommentItem = ({
  lookId,
  comment,
  isAuthenticated,
  deletingId,
  onDelete,
  onReply
}: CommentItemProps) => {
  const [showReplyComposer, setShowReplyComposer] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  const repliesQuery = useSocialCommentsInfiniteQuery(lookId, comment.id, showReplies);

  const replies = useMemo(
    () => flattenCursorPages(repliesQuery.data?.pages ?? []),
    [repliesQuery.data?.pages]
  );

  const onReplySubmit = async (body: string) => {
    await onReply(comment.id, body);
    setShowReplies(true);
    setShowReplyComposer(false);
  };

  return (
    <article className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{comment.author.displayName}</p>
          <p className="truncate text-xs text-higgs-text-muted">@{comment.author.username}</p>
        </div>
        <span className="text-[11px] text-higgs-text-muted">{formatSocialDateTime(comment.createdAt)}</span>
      </div>

      <p className="mt-2 whitespace-pre-wrap text-sm text-white">{comment.body}</p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={!isAuthenticated}
          onClick={() => setShowReplyComposer((prev) => !prev)}
          className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-higgs-text-muted transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Reply className="h-3.5 w-3.5" />
          Ответить
        </button>

        {comment.repliesCount > 0 && (
          <button
            type="button"
            onClick={() => setShowReplies((prev) => !prev)}
            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-higgs-text-muted transition-colors hover:text-white"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            {showReplies ? "Скрыть ответы" : `Показать ответы (${comment.repliesCount})`}
          </button>
        )}

        {comment.canDelete && (
          <button
            type="button"
            disabled={deletingId === comment.id}
            onClick={() => onDelete(comment.id)}
            className="inline-flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 px-2 py-1 text-xs text-red-300 transition-colors hover:bg-red-500/20 disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Удалить
          </button>
        )}
      </div>

      {showReplyComposer && isAuthenticated && (
        <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3">
          <CommentComposer
            placeholder="Ответить на комментарий..."
            submitLabel="Ответить"
            onSubmit={onReplySubmit}
          />
        </div>
      )}

      {showReplies && (
        <div className="mt-3 space-y-2 border-l border-white/10 pl-3">
          {replies.map((reply) => (
            <div key={reply.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-semibold text-white">{reply.author.displayName}</p>
                <span className="text-[10px] text-higgs-text-muted">{formatSocialDateTime(reply.createdAt)}</span>
              </div>
              <p className="mt-1 text-xs text-higgs-text-muted">@{reply.author.username}</p>
              <p className="mt-1 text-sm text-white">{reply.body}</p>
            </div>
          ))}

          {repliesQuery.hasNextPage && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-8 text-xs"
              onClick={() => void repliesQuery.fetchNextPage()}
              disabled={repliesQuery.isFetchingNextPage}
            >
              {repliesQuery.isFetchingNextPage ? "Загрузка..." : "Загрузить еще ответы"}
            </Button>
          )}
        </div>
      )}
    </article>
  );
};

export const CommentThread = ({
  lookId,
  isAuthenticated,
  mode = "card",
  bottomSlot
}: CommentThreadProps) => {
  const queryClient = useQueryClient();
  const [commentIdToDelete, setCommentIdToDelete] = useState<string | null>(null);
  const embedded = mode === "embedded";

  const commentsQuery = useSocialCommentsInfiniteQuery(lookId, null, true);
  const comments = useMemo(
    () => flattenCursorPages(commentsQuery.data?.pages ?? []),
    [commentsQuery.data?.pages]
  );

  const createMutation = useMutation({
    mutationFn: createLookComment,
    onSuccess: (_created, payload) => {
      void queryClient.invalidateQueries({ queryKey: socialQueryKeys.comments(lookId, payload.parentId ?? null) });
      void queryClient.invalidateQueries({ queryKey: socialQueryKeys.look(lookId) });
      toast.success("Комментарий добавлен.");
    },
    onError: () => {
      toast.error("Не удалось отправить комментарий.");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteComment,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: socialQueryKeys.comments(lookId, null) });
      void queryClient.invalidateQueries({ queryKey: socialQueryKeys.look(lookId) });
      toast.success("Комментарий удален.");
    },
    onError: () => {
      toast.error("Не удалось удалить комментарий.");
    }
  });

  const onCreateTopLevelComment = async (body: string) => {
    if (!isAuthenticated) {
      toast.error("Войдите в аккаунт, чтобы комментировать.");
      return;
    }

    await createMutation.mutateAsync({
      lookId,
      body,
      parentId: null
    });
  };

  const onReplyComment = async (parentId: string, body: string) => {
    if (!isAuthenticated) {
      toast.error("Войдите в аккаунт, чтобы отвечать.");
      return;
    }

    await createMutation.mutateAsync({
      lookId,
      body,
      parentId
    });
  };

  const onDeleteComment = (commentId: string) => {
    setCommentIdToDelete(commentId);
  };

  const onConfirmDeleteComment = async () => {
    if (!commentIdToDelete) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(commentIdToDelete);
      setCommentIdToDelete(null);
    } catch {
      // keep dialog open so user can retry or cancel
    }
  };

  const commentsList = (
    <div className="space-y-3">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          lookId={lookId}
          comment={comment}
          isAuthenticated={isAuthenticated}
          deletingId={deleteMutation.variables ?? null}
          onDelete={onDeleteComment}
          onReply={onReplyComment}
        />
      ))}

      {comments.length === 0 && !commentsQuery.isLoading && (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center">
          <p className="text-sm text-higgs-text-muted">Пока нет комментариев. Будьте первым.</p>
        </div>
      )}

      {commentsQuery.hasNextPage && (
        <div className="pt-1">
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            disabled={commentsQuery.isFetchingNextPage}
            onClick={() => void commentsQuery.fetchNextPage()}
          >
            {commentsQuery.isFetchingNextPage ? "Загрузка..." : "Загрузить еще комментарии"}
          </Button>
        </div>
      )}
    </div>
  );

  const composer = isAuthenticated ? (
    <CommentComposer
      submitLabel="Комментировать"
      pending={createMutation.isPending}
      onSubmit={onCreateTopLevelComment}
    />
  ) : (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-higgs-text-muted">
      Войдите в аккаунт, чтобы оставлять комментарии.
    </div>
  );

  return (
    <>
      {embedded ? (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <h2 className="font-display text-xl font-bold text-white">Комментарии</h2>
            <span className="text-sm text-higgs-text-muted">{comments.length}</span>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
            {commentsList}
          </div>

          {bottomSlot && <div className="border-t border-white/10 px-4 py-3">{bottomSlot}</div>}

          <div className={bottomSlot ? "px-4 py-3" : "border-t border-white/10 px-4 py-3"}>
            {composer}
          </div>
        </div>
      ) : (
        <Card className="border-white/10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold text-white">Комментарии</h2>
            <span className="text-sm text-higgs-text-muted">{comments.length}</span>
          </div>

          <div className="mb-4">{composer}</div>

          {commentsList}
        </Card>
      )}

      <AlertDialog
        open={commentIdToDelete !== null}
        title="Удалить комментарий?"
        description="Комментарий и его ответы будут удалены без возможности восстановления."
        confirmLabel="Удалить"
        cancelLabel="Отмена"
        confirmVariant="destructive"
        pending={deleteMutation.isPending}
        onCancel={() => setCommentIdToDelete(null)}
        onConfirm={onConfirmDeleteComment}
      />
    </>
  );
};

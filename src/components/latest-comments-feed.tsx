"use client";

import { CommentCard } from "@/components/comment-card";
import type { CommentWithParent } from "@/lib/queries/comments";

interface LatestCommentsFeedProps {
  comments: CommentWithParent[];
}

export function LatestCommentsFeed({ comments }: LatestCommentsFeedProps) {
  if (comments.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-500 dark:text-zinc-400">
          No comments yet. Be the first to leave one!
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {comments.map((comment) => (
        <CommentCard
          key={comment.id}
          comment={comment}
          showPageInfo={true}
          suppressReplies={true}
          showThreadNavigation={true}
        />
      ))}
    </div>
  );
}

"use server";

import { and, asc, count, desc, eq, isNull, notInArray } from "drizzle-orm";
import { getAddress } from "thirdweb";
import { db } from "@/db/client";
import { type Comment, comments } from "@/db/schema";

export interface CommentWithReplies extends Comment {
  replies?: CommentWithReplies[];
}

export async function getComments(
  ownerAddress?: string,
  limit = 30,
  offset = 0,
) {
  // checkSummed address
  const address = ownerAddress ? getAddress(ownerAddress) : undefined;
  try {
    // Build where conditions
    const whereConditions = address
      ? and(
          isNull(comments.parentCommentId),
          eq(comments.ownerAddress, address),
        )
      : isNull(comments.parentCommentId);

    const topLevelComments: Comment[] = await db
      .select()
      .from(comments)
      .where(whereConditions)
      .orderBy(desc(comments.createdAt))
      .limit(limit)
      .offset(offset);

    // Fetch replies for each comment
    return await Promise.all(
      topLevelComments.map(async (comment) => {
        const replies = await getCommentReplies(comment.id);
        return {
          ...comment,
          replies: replies,
        };
      }),
    );
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw new Error("Failed to fetch comments");
  }
}

async function getCommentReplies(parentId: string): Promise<Comment[]> {
  try {
    const replies = await db
      .select()
      .from(comments)
      .where(eq(comments.parentCommentId, parentId))
      .orderBy(asc(comments.createdAt));

    return replies;
  } catch (error) {
    console.error("Error fetching replies:", error);
    return [];
  }
}

async function getCommentById(id: string): Promise<Comment | null> {
  try {
    const result = await db
      .select()
      .from(comments)
      .where(eq(comments.id, id))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("Error fetching comment:", error);
    return null;
  }
}

export interface CommentWithParent extends Comment {
  parentComment?: Comment | null;
}

export async function getLatestComments(
  limit = 10,
  offset = 0,
): Promise<CommentWithParent[]> {
  try {
    // Fetch all comments (including replies)
    const allComments = await db
      .select()
      .from(comments)
      .orderBy(desc(comments.createdAt))
      .limit(limit)
      .offset(offset);

    // Fetch parent comments for replies
    const commentsWithParents = await Promise.all(
      allComments.map(async (comment) => {
        if (comment.parentCommentId) {
          const parentComment = await getCommentById(comment.parentCommentId);
          return {
            ...comment,
            parentComment,
          };
        }
        return {
          ...comment,
          parentComment: null,
        };
      }),
    );

    return commentsWithParents;
  } catch (error) {
    console.error("Error fetching latest comments:", error);
    throw new Error("Failed to fetch latest comments");
  }
}

export async function getCommentThread(
  threadId: string,
): Promise<CommentWithReplies | null> {
  try {
    // Fetch the comment
    const comment = await getCommentById(threadId);
    if (!comment) {
      return null;
    }

    // If this is a reply, fetch the parent thread instead
    if (comment.parentCommentId) {
      return getCommentThread(comment.parentCommentId);
    }

    // Fetch all replies for the top-level comment
    const replies = await getCommentReplies(comment.id);

    return {
      ...comment,
      replies,
    };
  } catch (error) {
    console.error("Error fetching comment thread:", error);
    return null;
  }
}

export async function getCommentCount(ownerAddress: string): Promise<number> {
  try {
    const address = getAddress(ownerAddress);
    const [{ count: commentCount }] = await db
      .select({ count: count() })
      .from(comments)
      .where(eq(comments.ownerAddress, address));

    return commentCount;
  } catch (error) {
    console.error("Error fetching comment count:", error);
    return 0;
  }
}

interface TopPage {
  ownerAddress: string;
  commentCount: number;
}

const excludedAddresses = ["0xf140BDf47279D0543D9BaEd3B05984395A0A4f57"];

export async function getTopPages(limit = 3, offset = 0): Promise<TopPage[]> {
  try {
    const topPages = await db
      .select({
        ownerAddress: comments.ownerAddress,
        commentCount: count(),
      })
      .from(comments)
      .where(
        and(
          isNull(comments.parentCommentId),
          notInArray(comments.ownerAddress, excludedAddresses),
        ),
      )
      .groupBy(comments.ownerAddress)
      .orderBy(desc(count()))
      .limit(limit)
      .offset(offset);

    return topPages.map((page) => ({
      ownerAddress: page.ownerAddress,
      commentCount: Number(page.commentCount),
    }));
  } catch (error) {
    console.error("Error fetching top pages:", error);
    return [];
  }
}

interface TopCommenter {
  fromAddress: string;
  commentCount: number;
}

export async function getTopCommenters(
  limit = 3,
  offset = 0,
): Promise<TopCommenter[]> {
  try {
    const topCommenters = await db
      .select({
        fromAddress: comments.fromAddress,
        commentCount: count(),
      })
      .from(comments)
      .groupBy(comments.fromAddress)
      .where(and(notInArray(comments.fromAddress, excludedAddresses)))
      .orderBy(desc(count()))
      .limit(limit)
      .offset(offset);

    return topCommenters.map((commenter) => ({
      fromAddress: commenter.fromAddress,
      commentCount: Number(commenter.commentCount),
    }));
  } catch (error) {
    console.error("Error fetching top commenters:", error);
    return [];
  }
}

export async function getMostLikedPosts(
  limit = 3,
  offset = 0,
): Promise<CommentWithReplies[]> {
  try {
    const mostLikedComments = await db
      .select()
      .from(comments)
      .where(isNull(comments.parentCommentId))
      .orderBy(desc(comments.likesCount))
      .limit(limit)
      .offset(offset);

    // Fetch replies for each comment
    return await Promise.all(
      mostLikedComments.map(async (comment) => {
        const replies = await getCommentReplies(comment.id);
        return {
          ...comment,
          replies: replies,
        };
      }),
    );
  } catch (error) {
    console.error("Error fetching most liked posts:", error);
    return [];
  }
}

export async function getMostActivePosts(
  limit = 3,
  offset = 0,
): Promise<CommentWithReplies[]> {
  try {
    // First get all top-level comments
    const topLevelComments = await db
      .select()
      .from(comments)
      .where(isNull(comments.parentCommentId));

    // Get reply counts for each comment
    const commentsWithReplyCounts = await Promise.all(
      topLevelComments.map(async (comment) => {
        const replies = await getCommentReplies(comment.id);
        return {
          ...comment,
          replies: replies,
          replyCount: replies.length,
        };
      }),
    );

    // Sort by reply count and take top N with offset
    const sortedByReplies = commentsWithReplyCounts
      .sort((a, b) => b.replyCount - a.replyCount)
      .slice(offset, offset + limit);

    return sortedByReplies;
  } catch (error) {
    console.error("Error fetching most active posts:", error);
    return [];
  }
}

// Count functions for pagination
export async function getTopPagesCount(): Promise<number> {
  try {
    const result = await db
      .selectDistinct({ ownerAddress: comments.ownerAddress })
      .from(comments)
      .where(
        and(
          isNull(comments.parentCommentId),
          notInArray(comments.ownerAddress, excludedAddresses),
        ),
      );

    return result.length;
  } catch (error) {
    console.error("Error fetching top pages count:", error);
    return 0;
  }
}

export async function getTopCommentersCount(): Promise<number> {
  try {
    const result = await db
      .selectDistinct({ fromAddress: comments.fromAddress })
      .from(comments)
      .where(notInArray(comments.fromAddress, excludedAddresses));

    return result.length;
  } catch (error) {
    console.error("Error fetching top commenters count:", error);
    return 0;
  }
}

export async function getPostsCount(): Promise<number> {
  try {
    const [{ count: postsCount }] = await db
      .select({ count: count() })
      .from(comments)
      .where(isNull(comments.parentCommentId));

    return postsCount;
  } catch (error) {
    console.error("Error fetching posts count:", error);
    return 0;
  }
}

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { CommentCard } from "@/components/comment-card";
import { FeedSortSelect } from "@/components/feed-sort-select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  type CommentWithReplies,
  getLatestComments,
  getMostActivePosts,
  getMostLikedPosts,
  getPostsCount,
} from "@/lib/queries/comments";

interface PageProps {
  searchParams: Promise<{ page?: string; sort?: string }>;
}

export default async function FeedPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const currentSort = params.sort || "recent";
  const itemsPerPage = 20;
  const offset = (currentPage - 1) * itemsPerPage;

  // Fetch data based on sort parameter
  let posts: CommentWithReplies[];
  if (currentSort === "liked") {
    posts = await getMostLikedPosts(itemsPerPage, offset);
  } else if (currentSort === "active") {
    posts = await getMostActivePosts(itemsPerPage, offset);
  } else {
    posts = await getLatestComments(itemsPerPage, offset);
  }

  const totalCount = await getPostsCount();
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const sortLabels = {
    recent: "Recent Posts",
    liked: "Most Liked Posts",
    active: "Most Active Posts",
  };

  const sortDescriptions = {
    recent: "Recent activity from across x402.chat",
    liked: "Posts with the most likes",
    active: "Posts with the most replies",
  };

  const currentSortLabel =
    sortLabels[currentSort as keyof typeof sortLabels] || sortLabels.recent;
  const currentSortDescription =
    sortDescriptions[currentSort as keyof typeof sortDescriptions] ||
    sortDescriptions.recent;

  return (
    <main className="container mx-auto max-w-4xl px-4 py-12">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                {currentSortLabel}
              </h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {currentSortDescription}
              </p>
            </div>

            {/* Sort Dropdown */}
            <FeedSortSelect currentSort={currentSort} />
          </div>
        </div>

        {/* Feed */}
        <div className="space-y-3">
          {posts.length > 0 ? (
            posts.map((post) => (
              <CommentCard
                key={post.id}
                comment={post}
                suppressReplies={true}
                showThreadNavigation={true}
                showPageInfo={currentSort === "recent"}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-zinc-500 dark:text-zinc-400">No posts found</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href={
                    currentPage > 1
                      ? `/feed?${new URLSearchParams({
                          ...(currentSort !== "recent" && {
                            sort: currentSort,
                          }),
                          page: String(currentPage - 1),
                        }).toString()}`
                      : undefined
                  }
                  aria-disabled={currentPage === 1}
                  className={
                    currentPage === 1
                      ? "pointer-events-none opacity-50"
                      : undefined
                  }
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => {
                  // Show first page, last page, current page, and 2 pages around current
                  const shouldShow =
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1);

                  if (!shouldShow) return null;

                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href={`/feed?${new URLSearchParams({
                          ...(currentSort !== "recent" && {
                            sort: currentSort,
                          }),
                          page: String(page),
                        }).toString()}`}
                        isActive={page === currentPage}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                },
              )}

              <PaginationItem>
                <PaginationNext
                  href={
                    currentPage < totalPages
                      ? `/feed?${new URLSearchParams({
                          ...(currentSort !== "recent" && {
                            sort: currentSort,
                          }),
                          page: String(currentPage + 1),
                        }).toString()}`
                      : undefined
                  }
                  aria-disabled={currentPage === totalPages}
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : undefined
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </main>
  );
}

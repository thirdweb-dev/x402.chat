import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { TopPagesCard } from "@/components/top-pages-card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { getTopPages, getTopPagesCount } from "@/lib/queries/comments";

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function TopPagesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const itemsPerPage = 20;
  const offset = (currentPage - 1) * itemsPerPage;

  const [topPages, totalCount] = await Promise.all([
    getTopPages(itemsPerPage, offset),
    getTopPagesCount(),
  ]);

  const totalPages = Math.ceil(totalCount / itemsPerPage);

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

          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              Top Pages
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Most popular pages by post count
            </p>
          </div>
        </div>

        {/* List */}
        <div className="space-y-3">
          {topPages.length > 0 ? (
            topPages.map((page) => (
              <TopPagesCard
                key={page.ownerAddress}
                ownerAddress={page.ownerAddress}
                commentCount={page.commentCount}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-zinc-500 dark:text-zinc-400">No pages found</p>
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
                      ? `/top-pages?page=${currentPage - 1}`
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
                        href={`/top-pages?page=${page}`}
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
                      ? `/top-pages?page=${currentPage + 1}`
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

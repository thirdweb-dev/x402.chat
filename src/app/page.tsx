import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { CommentCard } from "@/components/comment-card";
import { LatestCommentsFeed } from "@/components/latest-comments-feed";
import { PageNavigator } from "@/components/page-navigator";
import { TopCommentersCard } from "@/components/top-commenters-card";
import { TopPagesCard } from "@/components/top-pages-card";
import { Button } from "@/components/ui/button";
import {
  getLatestComments,
  getMostActivePosts,
  getMostLikedPosts,
  getTopCommenters,
  getTopPages,
} from "@/lib/queries/comments";

export default async function Home() {
  const [
    latestComments,
    topPages,
    topCommenters,
    mostLikedPosts,
    mostActivePosts,
  ] = await Promise.all([
    getLatestComments(10),
    getTopPages(3),
    getTopCommenters(3),
    getMostLikedPosts(3),
    getMostActivePosts(3),
  ]);

  return (
    <main className="container mx-auto max-w-6xl px-4 py-12">
      <div className="space-y-12">
        {/* Navigation Section */}
        <div className="mx-auto max-w-2xl text-center space-y-6">
          <div className="space-y-3">
            <div className="text-3xl font-bold flex items-center gap-1 justify-center">
              Post on Anyone&apos;s Page
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Posting costs{" "}
              <span className="font-bold text-pink-500">$CHAT</span> tokens -
              the more popular the page, the more expensive to post!
            </p>
          </div>
          <PageNavigator />
        </div>

        {/* Top Stats Grid - 2 columns on desktop, 1 on mobile */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Top Pages Section */}
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                Top Pages
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Most popular pages by cost to post
              </p>
            </div>
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
                <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 py-8">
                  No pages yet
                </p>
              )}
            </div>
            <div className="flex justify-end">
              <Link href="/top-pages">
                <Button variant="ghost" className="gap-1">
                  View All
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Top Commenters Section */}
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                Top Commenters
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Most active community members
              </p>
            </div>
            <div className="space-y-3">
              {topCommenters.length > 0 ? (
                topCommenters.map((commenter) => (
                  <TopCommentersCard
                    key={commenter.fromAddress}
                    fromAddress={commenter.fromAddress}
                    commentCount={commenter.commentCount}
                  />
                ))
              ) : (
                <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 py-8">
                  No commenters yet
                </p>
              )}
            </div>
            <div className="flex justify-end">
              <Link href="/top-commenters">
                <Button variant="ghost" className="gap-1">
                  View All
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Most Liked Posts Section */}
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                Most Liked Posts
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Posts with the most likes
              </p>
            </div>
            <div className="space-y-3">
              {mostLikedPosts.length > 0 ? (
                mostLikedPosts.map((post) => (
                  <CommentCard
                    key={post.id}
                    comment={post}
                    suppressReplies={true}
                    showThreadNavigation={true}
                  />
                ))
              ) : (
                <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 py-8">
                  No posts yet
                </p>
              )}
            </div>
            <div className="flex justify-end">
              <Link href="/feed?sort=liked">
                <Button variant="ghost" className="gap-1">
                  View All
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Most Active Posts Section */}
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                Most Active Posts
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Posts with the most replies
              </p>
            </div>
            <div className="space-y-3">
              {mostActivePosts.length > 0 ? (
                mostActivePosts.map((post) => (
                  <CommentCard
                    key={post.id}
                    comment={post}
                    suppressReplies={true}
                    showThreadNavigation={true}
                  />
                ))
              ) : (
                <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 py-8">
                  No posts yet
                </p>
              )}
            </div>
            <div className="flex justify-end">
              <Link href="/feed?sort=active">
                <Button variant="ghost" className="gap-1">
                  View All
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Latest Comments Section */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Latest Posts
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Recent activity from across x402.chat
            </p>
          </div>
          <LatestCommentsFeed comments={latestComments} />
          <div className="flex justify-center">
            <Link href="/feed">
              <Button variant="ghost" className="gap-1">
                View All
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

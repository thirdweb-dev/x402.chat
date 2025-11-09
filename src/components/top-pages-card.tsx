"use client";

import Link from "next/link";
import {
  AccountAddress,
  AccountAvatar,
  AccountName,
  AccountProvider,
  Blobbie,
} from "thirdweb/react";
import { shortenAddress } from "thirdweb/utils";
import { Logo } from "@/components/logo";
import { Card, CardContent } from "@/components/ui/card";
import { client } from "@/lib/thirdweb.client";
import { Skeleton } from "./ui/skeleton";

interface TopPagesCardProps {
  ownerAddress: string;
  commentCount: number;
}

export function TopPagesCard({
  ownerAddress,
  commentCount,
}: TopPagesCardProps) {
  const postCost = commentCount + 1;

  return (
    <Link href={`/${ownerAddress}`} className="block">
      <Card className="shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 cursor-pointer">
        <CardContent>
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <AccountProvider address={ownerAddress} client={client}>
              <AccountAvatar
                className="h-12 w-12 rounded-full"
                fallbackComponent={
                  <Blobbie
                    className="h-12 w-12 rounded-full"
                    address={ownerAddress}
                  />
                }
                loadingComponent={
                  <Skeleton className="h-12 w-12 rounded-full" />
                }
              />
            </AccountProvider>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <AccountProvider address={ownerAddress} client={client}>
                <AccountName
                  className="font-semibold text-base text-zinc-900 dark:text-zinc-100 truncate block"
                  fallbackComponent={
                    <AccountAddress
                      className="font-semibold text-base text-zinc-900 dark:text-zinc-100 truncate block"
                      formatFn={shortenAddress}
                    />
                  }
                  loadingComponent={
                    <Skeleton className="h-6 w-32 rounded-sm" />
                  }
                />
              </AccountProvider>

              {/* Post Cost Badge */}
              <div className="mt-2 inline-flex items-center gap-1.5 bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 px-3 py-1 rounded-full">
                <span className="text-sm font-bold">{postCost}</span>
                <Logo size="xs" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

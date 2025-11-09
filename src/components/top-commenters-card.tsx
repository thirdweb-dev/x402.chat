"use client";

import { MessageCircle } from "lucide-react";
import Link from "next/link";
import {
  AccountAddress,
  AccountAvatar,
  AccountName,
  AccountProvider,
  Blobbie,
} from "thirdweb/react";
import { shortenAddress } from "thirdweb/utils";
import { Card, CardContent } from "@/components/ui/card";
import { client } from "@/lib/thirdweb.client";
import { Skeleton } from "./ui/skeleton";

interface TopCommentersCardProps {
  fromAddress: string;
  commentCount: number;
}

export function TopCommentersCard({
  fromAddress,
  commentCount,
}: TopCommentersCardProps) {
  return (
    <Link href={`/${fromAddress}`} className="block">
      <Card className="shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 cursor-pointer">
        <CardContent>
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <AccountProvider address={fromAddress} client={client}>
              <AccountAvatar
                className="h-12 w-12 rounded-full"
                fallbackComponent={
                  <Blobbie
                    className="h-12 w-12 rounded-full"
                    address={fromAddress}
                  />
                }
                loadingComponent={
                  <Skeleton className="h-12 w-12 rounded-full" />
                }
              />
            </AccountProvider>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <AccountProvider address={fromAddress} client={client}>
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

              {/* Comment Count Badge */}
              <div className="mt-2 inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full">
                <span className="text-sm font-bold">{commentCount}</span>
                <MessageCircle className="h-4 w-4" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

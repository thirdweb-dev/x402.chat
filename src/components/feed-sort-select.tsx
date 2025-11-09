"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const sortOptions = [
  { value: "recent", label: "Recent" },
  { value: "liked", label: "Most Liked" },
  { value: "active", label: "Most Active" },
];

interface FeedSortSelectProps {
  currentSort: string;
}

export function FeedSortSelect({ currentSort }: FeedSortSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams);
    if (newSort === "recent") {
      params.delete("sort");
    } else {
      params.set("sort", newSort);
    }
    params.delete("page"); // Reset to page 1 when changing sort
    const queryString = params.toString();
    router.push(`/feed${queryString ? `?${queryString}` : ""}`);
  };

  return (
    <Select value={currentSort} onValueChange={handleSortChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        {sortOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

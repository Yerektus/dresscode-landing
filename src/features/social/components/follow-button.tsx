"use client";

import React from "react";
import { UserPlus, UserMinus } from "lucide-react";
import { Button } from "@/common/components/ui/button";

interface FollowButtonProps {
  isFollowing: boolean;
  onToggle: () => void;
  pending?: boolean;
  className?: string;
}

export const FollowButton = ({
  isFollowing,
  onToggle,
  pending = false,
  className
}: FollowButtonProps) => {
  return (
    <Button
      type="button"
      variant={isFollowing ? "secondary" : "primary"}
      className={className}
      disabled={pending}
      onClick={onToggle}
    >
      {isFollowing ? (
        <>
          <UserMinus className="mr-2 h-4 w-4" />
          Отписаться
        </>
      ) : (
        <>
          <UserPlus className="mr-2 h-4 w-4" />
          Подписаться
        </>
      )}
    </Button>
  );
};

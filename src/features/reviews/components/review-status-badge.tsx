import { Badge } from "@/components/ui/badge";
import type { ReviewStatus } from "@/features/reviews/types";

interface ReviewStatusBadgeProps {
  status: ReviewStatus;
  className?: string;
}

const STATUS_CONFIG: Record<ReviewStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: "Draft", variant: "outline" },
  published: { label: "Published", variant: "secondary" },
  archived: { label: "Archived", variant: "destructive" },
};

export function ReviewStatusBadge({ status, className }: ReviewStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}

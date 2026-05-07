import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export default function Card({
  children,
  className,
  hover,
  onClick,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "card-base",
        hover && "card-hoverable",
        onClick && "card-clickable",
        className,
      )}
    >
      {children}
    </div>
  );
}

import { ComingSoon } from "@/components/landing/coming-soon";
import { BookOpen } from "lucide-react";

export default function BlogPage() {
    return (
        <ComingSoon
            title="Blog"
            description="Email marketing insights, tips, and best practices from our team. Coming soon to help you master your campaigns."
            icon={<BookOpen className="w-10 h-10 text-primary-foreground" />}
        />
    );
}

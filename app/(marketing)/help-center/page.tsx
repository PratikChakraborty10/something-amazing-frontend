import { ComingSoon } from "@/components/landing/coming-soon";
import { HelpCircle } from "lucide-react";

export default function HelpCenterPage() {
    return (
        <ComingSoon
            title="Help Center"
            description="Find answers to common questions and get the support you need. Our knowledge base is coming soon!"
            icon={<HelpCircle className="w-10 h-10 text-primary-foreground" />}
        />
    );
}

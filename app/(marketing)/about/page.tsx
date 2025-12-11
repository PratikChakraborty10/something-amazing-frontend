import { ComingSoon } from "@/components/landing/coming-soon";
import { Users } from "lucide-react";

export default function AboutPage() {
    return (
        <ComingSoon
            title="About Us"
            description="Discover our story, mission, and the passionate team behind Email Config. We're building the future of email marketing."
            icon={<Users className="w-10 h-10 text-primary-foreground" />}
        />
    );
}

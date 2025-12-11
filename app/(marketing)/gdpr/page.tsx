import { ComingSoon } from "@/components/landing/coming-soon";
import { Lock } from "lucide-react";

export default function GdprPage() {
    return (
        <ComingSoon
            title="GDPR Compliance"
            description="Learn about our commitment to GDPR compliance and your data protection rights."
            icon={<Lock className="w-10 h-10 text-primary-foreground" />}
        />
    );
}

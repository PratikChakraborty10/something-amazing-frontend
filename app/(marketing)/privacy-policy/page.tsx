import { ComingSoon } from "@/components/landing/coming-soon";
import { Shield } from "lucide-react";

export default function PrivacyPolicyPage() {
    return (
        <ComingSoon
            title="Privacy Policy"
            description="Learn how we collect, use, and protect your personal information. Your privacy matters to us."
            icon={<Shield className="w-10 h-10 text-primary-foreground" />}
        />
    );
}

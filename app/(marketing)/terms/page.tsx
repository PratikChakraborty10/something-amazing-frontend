import { ComingSoon } from "@/components/landing/coming-soon";
import { Scale } from "lucide-react";

export default function TermsPage() {
    return (
        <ComingSoon
            title="Terms of Service"
            description="Our terms and conditions for using Email Config. Please review before using our services."
            icon={<Scale className="w-10 h-10 text-primary-foreground" />}
        />
    );
}

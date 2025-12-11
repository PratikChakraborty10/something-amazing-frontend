import { ComingSoon } from "@/components/landing/coming-soon";
import { Cookie } from "lucide-react";

export default function CookiePolicyPage() {
    return (
        <ComingSoon
            title="Cookie Policy"
            description="Understand how we use cookies to improve your experience on Email Config."
            icon={<Cookie className="w-10 h-10 text-primary-foreground" />}
        />
    );
}

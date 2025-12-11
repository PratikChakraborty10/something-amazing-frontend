import { ComingSoon } from "@/components/landing/coming-soon";
import { FileText } from "lucide-react";

export default function DocumentationPage() {
    return (
        <ComingSoon
            title="Documentation"
            description="Comprehensive guides and tutorials to help you get the most out of Email Config. Coming soon!"
            icon={<FileText className="w-10 h-10 text-primary-foreground" />}
        />
    );
}

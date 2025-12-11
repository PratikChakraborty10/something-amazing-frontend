import { ComingSoon } from "@/components/landing/coming-soon";
import { Briefcase } from "lucide-react";

export default function CareersPage() {
    return (
        <ComingSoon
            title="Careers"
            description="Join our growing team and help shape the future of email marketing. Exciting opportunities coming soon!"
            icon={<Briefcase className="w-10 h-10 text-primary-foreground" />}
        />
    );
}

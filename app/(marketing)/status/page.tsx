import { ComingSoon } from "@/components/landing/coming-soon";
import { Activity } from "lucide-react";

export default function StatusPage() {
    return (
        <ComingSoon
            title="System Status"
            description="Real-time system status and uptime monitoring. Stay informed about our service availability."
            icon={<Activity className="w-10 h-10 text-primary-foreground" />}
        />
    );
}

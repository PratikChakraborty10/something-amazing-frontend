import { ComingSoon } from "@/components/landing/coming-soon";
import { Code2 } from "lucide-react";

export default function ApiReferencePage() {
    return (
        <ComingSoon
            title="API Reference"
            description="Complete API documentation for developers. Integrate Email Config into your applications with ease."
            icon={<Code2 className="w-10 h-10 text-primary-foreground" />}
        />
    );
}

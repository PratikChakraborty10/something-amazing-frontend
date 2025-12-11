import { ComingSoon } from "@/components/landing/coming-soon";
import { MessageCircle } from "lucide-react";

export default function ContactPage() {
    return (
        <ComingSoon
            title="Contact Us"
            description="Have questions or feedback? We'd love to hear from you. Our contact form is on its way!"
            icon={<MessageCircle className="w-10 h-10 text-primary-foreground" />}
        />
    );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Mail,
  Users,
  Calendar,
  Clock,
  ArrowLeft,
  Send,
  CheckCircle2,
  AlertCircle,
  Eye,
  Edit3,
  Smartphone,
  Monitor,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Mock campaign data (would come from state/API in real app)
const campaignData = {
  name: "December Newsletter",
  description: "Monthly newsletter for December 2024",
  subject: "Your December update is here!",
  preheader: "Check out what's new this month",
  senderName: "John from Acme",
  senderEmail: "hello@acme.com",
  replyTo: "support@acme.com",
  sendType: "now" as const,
  scheduledDate: null,
  scheduledTime: null,
};

// Mock recipient lists
const selectedLists = [
  { id: "list_1", name: "Q4 Product Launch Leads", contactCount: 2756 },
  { id: "list_2", name: "Newsletter Subscribers", contactCount: 12089 },
];

// Mock email content
const emailContent = `
  <h1>Hello John! 👋</h1>
  <p>Welcome to our December newsletter. We're excited to share what's new with you this month.</p>
  <h2>What's New</h2>
  <p>Here are the highlights from the past month:</p>
  <ul>
    <li>New feature launches</li>
    <li>Product improvements</li>
    <li>Upcoming events</li>
  </ul>
  <p>We hope you enjoy the updates!</p>
  <p>Best regards,<br/>The Team</p>
`;

function ChecklistItem({
  label,
  checked,
  warning,
}: {
  label: string;
  checked: boolean;
  warning?: string;
}) {
  return (
    <div className="flex items-center gap-3 py-2">
      {checked ? (
        <CheckCircle2 className="size-5 text-green-600 shrink-0" />
      ) : (
        <AlertCircle className="size-5 text-amber-500 shrink-0" />
      )}
      <span className={checked ? "text-foreground" : "text-muted-foreground"}>
        {label}
      </span>
      {warning && (
        <Badge variant="outline" className="text-amber-600 border-amber-300">
          {warning}
        </Badge>
      )}
    </div>
  );
}

export default function ReviewPage() {
  const router = useRouter();
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [showPreview, setShowPreview] = useState(false);
  const [confirmSendOpen, setConfirmSendOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendComplete, setSendComplete] = useState(false);

  const totalRecipients = selectedLists.reduce(
    (sum, list) => sum + list.contactCount,
    0
  );

  const handleSend = async () => {
    setIsSending(true);

    // Mock sending delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSending(false);
    setConfirmSendOpen(false);
    setSendComplete(true);
    toast.success("Campaign sent successfully!");
  };

  if (sendComplete) {
    return (
      <div className="min-h-full bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center rounded-2xl">
          <CardContent className="pt-8 pb-8">
            <div className="size-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="size-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-semibold mb-2">
              Campaign Sent Successfully!
            </h1>
            <p className="text-muted-foreground mb-6">
              Your email is on its way to {totalRecipients.toLocaleString()}{" "}
              recipients.
            </p>
            <div className="space-y-3">
              <Button className="w-full" asChild>
                <Link href="/campaigns">View All Campaigns</Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/create-campaign">Create Another Campaign</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Stepper */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link
            href="/campaigns"
            className="hover:text-foreground transition-colors"
          >
            Campaigns
          </Link>
          <ChevronRight className="size-4" />
          <Link
            href="/create-campaign"
            className="hover:text-foreground transition-colors"
          >
            Create Campaign
          </Link>
          <ChevronRight className="size-4" />
          <span className="font-medium text-foreground">Review & Send</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">
            Review & Send
          </h1>
          <p className="text-muted-foreground mt-1">
            Double-check everything before sending your campaign
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
              ✓
            </div>
            <span className="text-sm text-muted-foreground">
              Campaign Details
            </span>
          </div>
          <div className="flex-1 h-px bg-primary" />
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
              ✓
            </div>
            <span className="text-sm text-muted-foreground">Design Email</span>
          </div>
          <div className="flex-1 h-px bg-primary" />
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
              3
            </div>
            <span className="text-sm font-medium">Review & Send</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Campaign Details */}
            <Card className="rounded-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="size-5" />
                    Campaign Details
                  </CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/create-campaign">
                      <Edit3 className="size-4" />
                      Edit
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Campaign Name
                    </p>
                    <p className="font-medium">{campaignData.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Subject Line</p>
                    <p className="font-medium">{campaignData.subject}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Sender</p>
                    <p className="font-medium">
                      {campaignData.senderName} &lt;{campaignData.senderEmail}
                      &gt;
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Reply-To</p>
                    <p className="font-medium">{campaignData.replyTo}</p>
                  </div>
                </div>
                {campaignData.preheader && (
                  <div>
                    <p className="text-sm text-muted-foreground">Preheader</p>
                    <p className="font-medium">{campaignData.preheader}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recipients */}
            <Card className="rounded-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="size-5" />
                    Recipients
                  </CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/create-campaign">
                      <Edit3 className="size-4" />
                      Edit
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedLists.map((list) => (
                    <div
                      key={list.id}
                      className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-lg"
                    >
                      <span className="font-medium">{list.name}</span>
                      <Badge variant="secondary">
                        {list.contactCount.toLocaleString()} contacts
                      </Badge>
                    </div>
                  ))}
                </div>
                <Separator className="my-4" />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Recipients</span>
                  <span className="text-xl font-semibold">
                    {totalRecipients.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Email Preview */}
            <Card className="rounded-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="size-5" />
                    Email Preview
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                      <Button
                        variant={previewMode === "desktop" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setPreviewMode("desktop")}
                        className="h-7 px-2"
                      >
                        <Monitor className="size-4" />
                      </Button>
                      <Button
                        variant={previewMode === "mobile" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setPreviewMode("mobile")}
                        className="h-7 px-2"
                      >
                        <Smartphone className="size-4" />
                      </Button>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/campaigns/email-editor">
                        <Edit3 className="size-4" />
                        Edit
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div
                  className={`border rounded-xl bg-white overflow-hidden mx-auto transition-all ${
                    previewMode === "mobile" ? "max-w-[375px]" : "w-full"
                  }`}
                >
                  {/* Email header */}
                  <div className="border-b px-4 py-3 bg-muted/30">
                    <p className="text-xs text-muted-foreground">From</p>
                    <p className="text-sm font-medium">
                      {campaignData.senderName} &lt;{campaignData.senderEmail}
                      &gt;
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">Subject</p>
                    <p className="text-sm font-medium">{campaignData.subject}</p>
                  </div>
                  {/* Email body */}
                  <div
                    className="p-4 ProseMirror max-w-none"
                    dangerouslySetInnerHTML={{ __html: emailContent }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Schedule */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="size-5" />
                  Send Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                {campaignData.sendType === "now" ? (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <Send className="size-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">Send Now</p>
                      <p className="text-sm text-green-600">
                        Immediately after confirmation
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <Calendar className="size-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-800">Scheduled</p>
                      <p className="text-sm text-blue-600">
                        {campaignData.scheduledDate} at{" "}
                        {campaignData.scheduledTime}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Checklist */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-base">Pre-Send Checklist</CardTitle>
                <CardDescription>
                  Make sure everything is ready
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-1">
                <ChecklistItem label="Subject line added" checked={true} />
                <ChecklistItem label="Sender info complete" checked={true} />
                <ChecklistItem label="Recipients selected" checked={true} />
                <ChecklistItem label="Email content ready" checked={true} />
                <ChecklistItem
                  label="Unsubscribe link"
                  checked={false}
                  warning="Recommended"
                />
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                className="w-full"
                size="lg"
                onClick={() => setConfirmSendOpen(true)}
              >
                <Send className="size-4" />
                {campaignData.sendType === "now"
                  ? "Send Campaign"
                  : "Schedule Campaign"}
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/campaigns/email-editor">
                  <ArrowLeft className="size-4" />
                  Back to Editor
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Send Dialog */}
      <AlertDialog open={confirmSendOpen} onOpenChange={setConfirmSendOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {campaignData.sendType === "now"
                ? "Send campaign now?"
                : "Schedule campaign?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {campaignData.sendType === "now" ? (
                <>
                  You're about to send "{campaignData.name}" to{" "}
                  <strong>{totalRecipients.toLocaleString()}</strong> recipients.
                  This action cannot be undone.
                </>
              ) : (
                <>
                  Your campaign will be sent on {campaignData.scheduledDate} at{" "}
                  {campaignData.scheduledTime} to{" "}
                  <strong>{totalRecipients.toLocaleString()}</strong> recipients.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSend} disabled={isSending}>
              {isSending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Sending...
                </>
              ) : campaignData.sendType === "now" ? (
                <>
                  <Send className="size-4" />
                  Send Now
                </>
              ) : (
                <>
                  <Calendar className="size-4" />
                  Schedule
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Mail,
  Users,
  Clock,
  ArrowRight,
  Check,
  Plus,
  Search,
  FileText,
  Sparkles,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { useAuthStore } from "@/lib/auth-store";
import { getContactLists, ContactList } from "@/lib/contacts-api";
import { createCampaign, SendType } from "@/lib/campaigns-api";

function formatNumber(num: number): string {
  return num.toLocaleString();
}

export default function CreateCampaignPage() {
  const router = useRouter();
  const { accessToken } = useAuthStore();

  // Contact lists
  const [contactLists, setContactLists] = useState<ContactList[]>([]);
  const [isLoadingLists, setIsLoadingLists] = useState(true);

  // Campaign details
  const [campaignName, setCampaignName] = useState("");
  const [campaignDescription, setCampaignDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [preheader, setPreheader] = useState("");
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [replyTo, setReplyTo] = useState("");

  // Scheduling
  const [sendType, setSendType] = useState<SendType>("now");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  // Contact lists selection
  const [selectedLists, setSelectedLists] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  // Form state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch contact lists
  const fetchContactLists = useCallback(async () => {
    if (!accessToken) return;

    try {
      setIsLoadingLists(true);
      const response = await getContactLists(accessToken);
      setContactLists(response.lists);
    } catch (error) {
      console.error("Failed to fetch contact lists:", error);
      toast.error("Failed to load contact lists");
    } finally {
      setIsLoadingLists(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchContactLists();
  }, [fetchContactLists]);

  const filteredLists = contactLists.filter((list) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      list.name.toLowerCase().includes(query) ||
      (list.description?.toLowerCase().includes(query) ?? false) ||
      list.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  const selectedCount = selectedLists.size;
  const totalRecipients = contactLists
    .filter((list) => selectedLists.has(list.id))
    .reduce((sum, list) => sum + list.validCount, 0);

  const toggleList = (listId: string) => {
    setSelectedLists((prev) => {
      const next = new Set(prev);
      if (next.has(listId)) {
        next.delete(listId);
      } else {
        next.add(listId);
      }
      return next;
    });
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!campaignName.trim()) {
      newErrors.campaignName = "Campaign name is required";
    }
    if (!subject.trim()) {
      newErrors.subject = "Email subject is required";
    }
    if (!senderName.trim()) {
      newErrors.senderName = "Sender name is required";
    }
    if (!senderEmail.trim()) {
      newErrors.senderEmail = "Sender email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(senderEmail)) {
      newErrors.senderEmail = "Invalid email format";
    }
    if (selectedLists.size === 0) {
      newErrors.lists = "Select at least one contact list";
    }
    if (sendType === "scheduled") {
      if (!scheduleDate) {
        newErrors.scheduleDate = "Schedule date is required";
      }
      if (!scheduleTime) {
        newErrors.scheduleTime = "Schedule time is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async () => {
    if (!validate()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!accessToken) {
      toast.error("Please log in to continue");
      return;
    }

    try {
      setIsSubmitting(true);

      // Build scheduled date if applicable
      let scheduledAt: string | undefined;
      if (sendType === "scheduled" && scheduleDate && scheduleTime) {
        scheduledAt = new Date(`${scheduleDate}T${scheduleTime}`).toISOString();
      }

      // Create the campaign via API
      const campaign = await createCampaign(accessToken, {
        name: campaignName,
        description: campaignDescription || undefined,
        subject,
        preheader: preheader || undefined,
        senderName,
        senderEmail,
        replyTo: replyTo || undefined,
        sendType,
        scheduledAt,
        selectedListIds: Array.from(selectedLists),
      });

      toast.success("Campaign created");

      // Navigate to email editor with campaign ID
      router.push(`/campaigns/email-editor?id=${campaign.id}`);
    } catch (error) {
      console.error("Failed to create campaign:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create campaign");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!campaignName.trim()) {
      toast.error("Campaign name is required to save as draft");
      return;
    }

    if (!accessToken) {
      toast.error("Please log in to continue");
      return;
    }

    try {
      setIsSubmitting(true);

      await createCampaign(accessToken, {
        name: campaignName,
        description: campaignDescription || undefined,
        subject: subject || "Draft",
        senderName: senderName || "Draft",
        senderEmail: senderEmail || "draft@example.com",
        selectedListIds: Array.from(selectedLists),
      });

      toast.success("Draft saved");
      router.push("/campaigns");
    } catch (error) {
      console.error("Failed to save draft:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save draft");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <span className="font-medium text-foreground">Create Campaign</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">
            Create New Campaign
          </h1>
          <p className="text-muted-foreground mt-1">
            Set up your email campaign details and select recipients.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
              1
            </div>
            <span className="text-sm font-medium">Campaign Details</span>
          </div>
          <div className="flex-1 h-px bg-border" />
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-medium">
              2
            </div>
            <span className="text-sm text-muted-foreground">Design Email</span>
          </div>
          <div className="flex-1 h-px bg-border" />
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-medium">
              3
            </div>
            <span className="text-sm text-muted-foreground">
              Review & Send
            </span>
          </div>
        </div>

        <div className="space-y-6">
          {/* Campaign Details Card */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="size-5" />
                Campaign Details
              </CardTitle>
              <CardDescription>
                Basic information about your email campaign
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="campaignName">
                    Campaign Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="campaignName"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    placeholder="e.g., December Newsletter"
                    className={errors.campaignName ? "border-destructive" : ""}
                  />
                  {errors.campaignName && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.campaignName}
                    </p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="campaignDescription">
                    Description{" "}
                    <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Textarea
                    id="campaignDescription"
                    value={campaignDescription}
                    onChange={(e) => setCampaignDescription(e.target.value)}
                    placeholder="Brief description to help you remember this campaign"
                    className="min-h-[80px]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email Settings Card */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="size-5" />
                Email Settings
              </CardTitle>
              <CardDescription>
                Configure how your email will appear to recipients
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="subject">
                    Subject Line <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g., Your December update is here!"
                      className={errors.subject ? "border-destructive" : ""}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 text-xs"
                      onClick={() =>
                        toast.info("AI subject line suggestions coming soon!")
                      }
                    >
                      <Sparkles className="size-3 mr-1" />
                      AI Suggest
                    </Button>
                  </div>
                  {errors.subject && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.subject}
                    </p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="preheader">
                    Preheader Text{" "}
                    <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id="preheader"
                    value={preheader}
                    onChange={(e) => setPreheader(e.target.value)}
                    placeholder="Preview text that appears after the subject line"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Shown in inbox previews. Keep under 100 characters for best
                    results.
                  </p>
                </div>

                <Separator className="md:col-span-2 my-2" />

                <div>
                  <Label htmlFor="senderName">
                    Sender Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="senderName"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="e.g., John from Acme"
                    className={errors.senderName ? "border-destructive" : ""}
                  />
                  {errors.senderName && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.senderName}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="senderEmail">
                    Sender Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="senderEmail"
                    type="email"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    placeholder="e.g., hello@acme.com"
                    className={errors.senderEmail ? "border-destructive" : ""}
                  />
                  {errors.senderEmail && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.senderEmail}
                    </p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="replyTo">
                    Reply-To Email{" "}
                    <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id="replyTo"
                    type="email"
                    value={replyTo}
                    onChange={(e) => setReplyTo(e.target.value)}
                    placeholder="Leave empty to use sender email"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Send Schedule Card */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="size-5" />
                Send Schedule
              </CardTitle>
              <CardDescription>
                Choose when to send your campaign
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setSendType("now")}
                  className={`p-4 rounded-xl border-2 text-left transition-colors ${
                    sendType === "now"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`size-4 rounded-full border-2 flex items-center justify-center ${
                        sendType === "now"
                          ? "border-primary"
                          : "border-muted-foreground"
                      }`}
                    >
                      {sendType === "now" && (
                        <div className="size-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">Send Now</p>
                      <p className="text-sm text-muted-foreground">
                        Send immediately after review
                      </p>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => setSendType("scheduled")}
                  className={`p-4 rounded-xl border-2 text-left transition-colors ${
                    sendType === "scheduled"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`size-4 rounded-full border-2 flex items-center justify-center ${
                        sendType === "scheduled"
                          ? "border-primary"
                          : "border-muted-foreground"
                      }`}
                    >
                      {sendType === "scheduled" && (
                        <div className="size-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">Schedule for Later</p>
                      <p className="text-sm text-muted-foreground">
                        Pick a future date and time
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              {sendType === "scheduled" && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="scheduleDate">Date</Label>
                    <Input
                      id="scheduleDate"
                      type="date"
                      className={`mt-1.5 ${errors.scheduleDate ? "border-destructive" : ""}`}
                      min={new Date().toISOString().split("T")[0]}
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                    />
                    {errors.scheduleDate && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.scheduleDate}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="scheduleTime">Time</Label>
                    <Input
                      id="scheduleTime"
                      type="time"
                      className={`mt-1.5 ${errors.scheduleTime ? "border-destructive" : ""}`}
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                    />
                    {errors.scheduleTime && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.scheduleTime}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recipients Card */}
          <Card className="rounded-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="size-5" />
                    Select Recipients
                  </CardTitle>
                  <CardDescription>
                    Choose contact lists to send this campaign to
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/global-contacts">
                    <Plus className="size-4" />
                    New List
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {errors.lists && (
                <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive">{errors.lists}</p>
                </div>
              )}

              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search contact lists..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Lists */}
              <div className="space-y-2 max-h-[320px] overflow-y-auto">
                {isLoadingLists ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="size-6 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredLists.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No contact lists found
                    </p>
                    <Button variant="link" asChild className="mt-2">
                      <Link href="/global-contacts">
                        Create your first contact list
                      </Link>
                    </Button>
                  </div>
                ) : (
                  filteredLists.map((list) => (
                    <button
                      key={list.id}
                      onClick={() => toggleList(list.id)}
                      className={`w-full p-4 rounded-xl border text-left transition-colors ${
                        selectedLists.has(list.id)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`size-5 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                            selectedLists.has(list.id)
                              ? "bg-primary border-primary"
                              : "border-input"
                          }`}
                        >
                          {selectedLists.has(list.id) && (
                            <Check className="size-3 text-primary-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium">{list.name}</p>
                            {list.tags.slice(0, 2).map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5 truncate">
                            {list.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Users className="size-3.5" />
                              {formatNumber(list.contactCount)} contacts
                            </span>
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Mail className="size-3.5" />
                              {formatNumber(list.validCount)} sendable
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>

              {/* Selection Summary */}
              {selectedCount > 0 && (
                <div className="mt-4 p-4 bg-muted rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {selectedCount} list{selectedCount !== 1 ? "s" : ""}{" "}
                        selected
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatNumber(totalRecipients)} total recipients
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedLists(new Set())}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4">
            <Button variant="ghost" asChild>
              <Link href="/campaigns">Cancel</Link>
            </Button>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="size-4 mr-2 animate-spin" />
                ) : null}
                Save as Draft
              </Button>
              <Button onClick={handleContinue} disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="size-4 mr-2 animate-spin" />
                ) : null}
                Continue to Email Editor
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

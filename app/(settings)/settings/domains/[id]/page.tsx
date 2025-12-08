"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Globe,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Shield,
  Info,
  Trash2,
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Types
type RecordStatus = "verified" | "pending" | "failed";

interface DnsRecord {
  type: string;
  name: string;
  value: string;
  ttl: string;
  status: RecordStatus;
  priority?: number;
}

interface Domain {
  id: string;
  domain: string;
  status: RecordStatus;
  createdAt: string;
  region: string;
  records: DnsRecord[];
}

// Record type descriptions
const recordDescriptions: Record<string, string> = {
  SPF: "Authorizes Resend to send emails on behalf of your domain",
  DKIM: "Adds a digital signature to verify email authenticity",
  DMARC: "Specifies how to handle emails that fail authentication",
  MX: "Mail exchange record for receiving emails",
  CNAME: "Canonical name record for domain aliasing",
  TXT: "Text record for domain verification",
};

function getRecordDescription(record: DnsRecord): string {
  // Check if it's an SPF record
  if (record.value.includes("spf")) {
    return recordDescriptions.SPF;
  }
  // Check if it's a DKIM record
  if (record.name.includes("._domainkey")) {
    return recordDescriptions.DKIM;
  }
  // Check if it's a DMARC record
  if (record.name.includes("_dmarc")) {
    return recordDescriptions.DMARC;
  }
  return recordDescriptions[record.type] || "DNS record for domain configuration";
}

function RecordStatusBadge({ status }: { status: RecordStatus }) {
  switch (status) {
    case "verified":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle2 className="size-3 mr-1" />
          Verified
        </Badge>
      );
    case "pending":
      return (
        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
          <Clock className="size-3 mr-1" />
          Pending
        </Badge>
      );
    case "failed":
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
          <AlertCircle className="size-3 mr-1" />
          Failed
        </Badge>
      );
  }
}

function CopyButton({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success(label ? `${label} copied` : "Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleCopy}>
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      Copy
    </Button>
  );
}

export default function DomainDetailPage() {
  const params = useParams();
  const router = useRouter();
  const domainId = params.id as string;

  const [domain, setDomain] = useState<Domain | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch domain details
  const fetchDomain = useCallback(async () => {
    try {
      const response = await fetch(`/api/domains/${domainId}`);
      const data = await response.json();

      if (response.ok) {
        setDomain(data.domain);
      } else {
        toast.error(data.error || "Failed to load domain");
        router.push("/settings/domains");
      }
    } catch (err) {
      toast.error("Failed to load domain");
      router.push("/settings/domains");
    } finally {
      setIsLoading(false);
    }
  }, [domainId, router]);

  useEffect(() => {
    fetchDomain();
  }, [fetchDomain]);

  // Verify domain
  const handleVerify = async () => {
    if (!domain) return;

    setIsVerifying(true);

    try {
      const response = await fetch(`/api/domains/${domainId}/verify`, {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        setDomain(data.domain);

        if (data.domain.status === "verified") {
          toast.success("All DNS records verified successfully!");
        } else {
          toast.info(
            "Verification in progress. DNS changes can take up to 48 hours to propagate."
          );
        }
      } else {
        toast.error(data.error || "Verification failed");
      }
    } catch (err) {
      toast.error("Failed to verify domain");
    } finally {
      setIsVerifying(false);
    }
  };

  // Delete domain
  const handleDelete = async () => {
    if (!domain) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/domains/${domainId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success(`${domain.domain} removed`);
        router.push("/settings/domains");
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to delete domain");
      }
    } catch (err) {
      toast.error("Failed to delete domain");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!domain) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Back Link */}
        <Link
          href="/settings/domains"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to Domains
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Globe className="size-6" />
              <h1 className="text-2xl font-semibold tracking-tight">
                {domain.domain}
              </h1>
              <RecordStatusBadge status={domain.status} />
            </div>
            <p className="text-muted-foreground">
              Configure DNS records to verify domain ownership
            </p>
          </div>
          <div className="flex gap-2">
            {domain.status !== "verified" && (
              <Button onClick={handleVerify} disabled={isVerifying}>
                {isVerifying ? (
                  <>
                    <RefreshCw className="size-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="size-4" />
                    Verify DNS Records
                  </>
                )}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="size-4" />
              Remove
            </Button>
          </div>
        </div>

        {/* Status Alert */}
        {domain.status === "pending" && (
          <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900">
            <Clock className="size-4 text-amber-600" />
            <AlertTitle className="text-amber-800 dark:text-amber-200">
              Verification pending
            </AlertTitle>
            <AlertDescription className="text-amber-700 dark:text-amber-300">
              Add the DNS records below to your domain provider, then click
              "Verify DNS Records". DNS changes can take up to 48 hours to
              propagate.
            </AlertDescription>
          </Alert>
        )}

        {domain.status === "verified" && (
          <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900">
            <CheckCircle2 className="size-4 text-green-600" />
            <AlertTitle className="text-green-800 dark:text-green-200">
              Domain verified
            </AlertTitle>
            <AlertDescription className="text-green-700 dark:text-green-300">
              Your domain is verified and ready to send emails. You can use any
              email address @{domain.domain} as your sender.
            </AlertDescription>
          </Alert>
        )}

        {domain.status === "failed" && (
          <Alert className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900">
            <AlertCircle className="size-4 text-red-600" />
            <AlertTitle className="text-red-800 dark:text-red-200">
              Verification failed
            </AlertTitle>
            <AlertDescription className="text-red-700 dark:text-red-300">
              We couldn't verify your DNS records. Please check that all records
              are correctly configured and try again.
            </AlertDescription>
          </Alert>
        )}

        {/* DNS Records */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="size-5" />
              DNS Records
            </CardTitle>
            <CardDescription>
              Add these records to your DNS provider (Cloudflare, GoDaddy,
              Namecheap, etc.)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {domain.records.map((record, index) => (
                <div key={index} className="border rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-mono">
                        {record.type}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {getRecordDescription(record)}
                      </span>
                    </div>
                    <RecordStatusBadge status={record.status} />
                  </div>

                  <div className="grid gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-muted-foreground uppercase">
                          Name / Host
                        </span>
                        <CopyButton value={record.name} label="Name" />
                      </div>
                      <code className="block p-2 bg-muted rounded text-sm font-mono break-all">
                        {record.name}
                      </code>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-muted-foreground uppercase">
                          Value / Content
                        </span>
                        <CopyButton value={record.value} label="Value" />
                      </div>
                      <code className="block p-2 bg-muted rounded text-sm font-mono break-all">
                        {record.value}
                      </code>
                    </div>
                    {record.ttl && (
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>
                          <strong>TTL:</strong> {record.ttl}
                        </span>
                        {record.priority && (
                          <span>
                            <strong>Priority:</strong> {record.priority}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Info className="size-5" />
              Need help adding DNS records?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="cloudflare">
                <AccordionTrigger>Cloudflare</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Log in to your Cloudflare dashboard</li>
                    <li>Select your domain</li>
                    <li>Go to DNS → Records</li>
                    <li>
                      Click "Add record" and enter the Type, Name, and Content
                      from above
                    </li>
                    <li>
                      For TXT records, make sure to set Proxy status to "DNS
                      only"
                    </li>
                    <li>Save and wait for propagation</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="godaddy">
                <AccordionTrigger>GoDaddy</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Log in to your GoDaddy account</li>
                    <li>Go to My Products → Domains</li>
                    <li>Click DNS next to your domain</li>
                    <li>Click "Add" under DNS Records</li>
                    <li>Select record type and enter the values</li>
                    <li>Save changes</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="namecheap">
                <AccordionTrigger>Namecheap</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Log in to Namecheap</li>
                    <li>Go to Domain List → Manage</li>
                    <li>Select "Advanced DNS" tab</li>
                    <li>Click "Add New Record"</li>
                    <li>Enter record type, host, and value</li>
                    <li>Click the checkmark to save</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="route53">
                <AccordionTrigger>AWS Route 53</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Open Route 53 in AWS Console</li>
                    <li>Go to Hosted zones</li>
                    <li>Select your domain</li>
                    <li>Click "Create record"</li>
                    <li>
                      Choose record type and enter name/value (remove domain
                      suffix from name)
                    </li>
                    <li>Create record</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                DNS changes typically propagate within 1-24 hours, but can take
                up to 48 hours in some cases.{" "}
                <a
                  href="https://resend.com/docs/dashboard/domains/introduction"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  View documentation
                  <ExternalLink className="size-3" />
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove domain?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove {domain.domain} from your account. You won't be
              able to send emails from this domain until you add and verify it
              again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove Domain"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}

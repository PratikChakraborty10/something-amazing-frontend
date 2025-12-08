"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Globe,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  MoreHorizontal,
  Trash2,
  RefreshCw,
  Shield,
  Mail,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Domain types
type DomainStatus = "verified" | "pending" | "failed";

interface DnsRecord {
  type: string;
  name: string;
  value: string;
  ttl: string;
  status: DomainStatus;
  priority?: number;
}

interface Domain {
  id: string;
  domain: string;
  status: DomainStatus;
  createdAt: string;
  region: string;
  records: DnsRecord[];
}

function StatusBadge({ status }: { status: DomainStatus }) {
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

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function DomainsPage() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [newDomain, setNewDomain] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isVerifying, setIsVerifying] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const verifiedCount = domains.filter((d) => d.status === "verified").length;
  const pendingCount = domains.filter((d) => d.status === "pending").length;

  // Fetch domains from API
  const fetchDomains = useCallback(async () => {
    try {
      const response = await fetch("/api/domains");
      const data = await response.json();

      if (response.ok) {
        setDomains(data.domains || []);
      } else {
        toast.error(data.error || "Failed to load domains");
      }
    } catch (err) {
      toast.error("Failed to load domains");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDomains();
  }, [fetchDomains]);

  // Add domain
  const handleAddDomain = async () => {
    if (!newDomain.trim()) {
      toast.error("Please enter a domain");
      return;
    }

    // Validate domain format
    const domainRegex =
      /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    if (!domainRegex.test(newDomain)) {
      toast.error("Please enter a valid domain name");
      return;
    }

    setIsAdding(true);

    try {
      const response = await fetch("/api/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newDomain }),
      });

      const data = await response.json();

      if (response.ok) {
        setDomains((prev) => [...prev, data.domain]);
        setNewDomain("");
        setAddDialogOpen(false);
        toast.success(
          `Domain ${newDomain} added. Please configure DNS records.`
        );
      } else {
        toast.error(data.error || "Failed to add domain");
      }
    } catch (err) {
      toast.error("Failed to add domain");
    } finally {
      setIsAdding(false);
    }
  };

  // Verify domain
  const handleVerify = async (domain: Domain) => {
    setIsVerifying(domain.id);

    try {
      const response = await fetch(`/api/domains/${domain.id}/verify`, {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        // Update domain in state
        setDomains((prev) =>
          prev.map((d) => (d.id === domain.id ? data.domain : d))
        );

        if (data.domain.status === "verified") {
          toast.success(`${domain.domain} verified successfully!`);
        } else {
          toast.info(
            "Verification in progress. DNS records may take time to propagate."
          );
        }
      } else {
        toast.error(data.error || "Verification failed");
      }
    } catch (err) {
      toast.error("Failed to verify domain");
    } finally {
      setIsVerifying(null);
    }
  };

  // Delete domain
  const handleDelete = async () => {
    if (!selectedDomain) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/domains/${selectedDomain.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setDomains((prev) => prev.filter((d) => d.id !== selectedDomain.id));
        toast.success(`${selectedDomain.domain} removed`);
        setDeleteDialogOpen(false);
        setSelectedDomain(null);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
            <Globe className="size-5" />
            Sending Domains
          </h2>
          <p className="text-muted-foreground mt-1">
            Verify your domains to send emails from your own addresses
          </p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="size-4" />
          Add Domain
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="rounded-xl">
          <CardContent className="pt-6">
            <p className="text-2xl font-semibold">{domains.length}</p>
            <p className="text-sm text-muted-foreground">Total Domains</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl">
          <CardContent className="pt-6">
            <p className="text-2xl font-semibold text-green-600">
              {verifiedCount}
            </p>
            <p className="text-sm text-muted-foreground">Verified</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl">
          <CardContent className="pt-6">
            <p className="text-2xl font-semibold text-amber-600">
              {pendingCount}
            </p>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Shield className="size-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Protected by SPF, DKIM & DMARC
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Domains Table */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Your Domains</CardTitle>
          <CardDescription>
            Manage domains you can send emails from
          </CardDescription>
        </CardHeader>
        <CardContent>
          {domains.length === 0 ? (
            <div className="text-center py-12">
              <Globe className="size-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No domains yet</h3>
              <p className="text-muted-foreground mb-4">
                Add your first domain to start sending emails
              </p>
              <Button onClick={() => setAddDialogOpen(true)}>
                <Plus className="size-4" />
                Add Domain
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Domain</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {domains.map((domain) => (
                  <TableRow key={domain.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="size-4 text-muted-foreground" />
                        <span className="font-medium">{domain.domain}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={domain.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(domain.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {domain.status !== "verified" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleVerify(domain)}
                            disabled={isVerifying === domain.id}
                          >
                            {isVerifying === domain.id ? (
                              <>
                                <RefreshCw className="size-4 animate-spin" />
                                Verifying...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="size-4" />
                                Verify
                              </>
                            )}
                          </Button>
                        )}
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/settings/domains/${domain.id}`}>
                            View DNS
                            <ChevronRight className="size-4" />
                          </Link>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/settings/domains/${domain.id}`}>
                                View DNS Records
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => {
                                setSelectedDomain(domain);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="size-4 mr-2" />
                              Remove Domain
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="rounded-2xl bg-muted/30">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Shield className="size-8 text-primary shrink-0" />
            <div>
              <h3 className="font-semibold mb-1">Why verify your domain?</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Domain verification proves you own the domain and authorizes
                our servers to send emails on your behalf. This improves
                deliverability and prevents your emails from going to spam.
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-green-600" />
                  <span>Better deliverability</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-green-600" />
                  <span>Custom sender addresses</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-green-600" />
                  <span>Brand trust</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Domain Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Sending Domain</DialogTitle>
            <DialogDescription>
              Enter your domain to get DNS records for verification
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="domain">Domain</Label>
            <Input
              id="domain"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              placeholder="e.g., mail.yourdomain.com"
              className="mt-1.5"
              disabled={isAdding}
            />
            <p className="text-xs text-muted-foreground mt-2">
              We recommend using a subdomain like mail.yourdomain.com or
              newsletter.yourdomain.com
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddDialogOpen(false)}
              disabled={isAdding}
            >
              Cancel
            </Button>
            <Button onClick={handleAddDomain} disabled={isAdding}>
              {isAdding ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Domain"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove domain?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove {selectedDomain?.domain} from your account. You
              won't be able to send emails from this domain until you add and
              verify it again.
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
    </div>
  );
}

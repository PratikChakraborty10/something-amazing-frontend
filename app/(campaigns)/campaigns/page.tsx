"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Mail,
  Plus,
  Search,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreHorizontal,
  Trash2,
  Copy,
  Edit,
  Eye,
  Send,
  ArrowUpDown,
  Users,
  BarChart3,
  FileEdit,
  Pause,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useAuthStore } from "@/lib/auth-store";
import {
  getCampaigns,
  deleteCampaign,
  duplicateCampaign,
  Campaign,
  CampaignStatus,
  CampaignStats,
} from "@/lib/campaigns-api";

// Sort options
type SortField = "createdAt" | "name" | "recipients" | "status";
type SortDirection = "asc" | "desc";

function StatusBadge({ status }: { status: CampaignStatus }) {
  switch (status) {
    case "sent":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle2 className="size-3 mr-1" />
          Sent
        </Badge>
      );
    case "scheduled":
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          <Calendar className="size-3 mr-1" />
          Scheduled
        </Badge>
      );
    case "sending":
      return (
        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
          <Send className="size-3 mr-1 animate-pulse" />
          Sending
        </Badge>
      );
    case "draft":
      return (
        <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
          <FileEdit className="size-3 mr-1" />
          Draft
        </Badge>
      );
    case "paused":
      return (
        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
          <Pause className="size-3 mr-1" />
          Paused
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
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatNumber(num: number): string {
  return num.toLocaleString();
}

function calculateOpenRate(opened?: number, delivered?: number): string {
  if (!opened || !delivered) return "-";
  return ((opened / delivered) * 100).toFixed(1) + "%";
}

function calculateClickRate(clicked?: number, delivered?: number): string {
  if (!clicked || !delivered) return "-";
  return ((clicked / delivered) * 100).toFixed(1) + "%";
}

export default function CampaignsPage() {
  const { accessToken } = useAuthStore();
  
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState<CampaignStats>({
    totalCampaigns: 0,
    drafts: 0,
    scheduled: 0,
    sent: 0,
    avgOpenRate: 0,
    avgClickRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  // Fetch campaigns
  const fetchCampaigns = useCallback(async () => {
    if (!accessToken) return;
    
    try {
      setIsLoading(true);
      const response = await getCampaigns(accessToken, {
        sortBy: sortField,
        sortOrder: sortDirection,
        search: searchQuery || undefined,
        status: activeTab === "all" ? undefined : activeTab === "active" ? undefined : "draft",
      });
      setCampaigns(response.data);
      setStats(response.stats);
    } catch (error) {
      console.error("Failed to fetch campaigns:", error);
      toast.error("Failed to load campaigns");
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, sortField, sortDirection, searchQuery, activeTab]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  // Separate drafts and other campaigns for tabs
  const drafts = useMemo(
    () => campaigns.filter((c) => c.status === "draft"),
    [campaigns]
  );

  const activeCampaigns = useMemo(
    () => campaigns.filter((c) => c.status !== "draft"),
    [campaigns]
  );

  // Filter campaigns by tab (additional client-side filtering)
  const filteredCampaigns = useMemo(() => {
    if (activeTab === "drafts") return drafts;
    if (activeTab === "active") return activeCampaigns;
    return campaigns;
  }, [campaigns, drafts, activeCampaigns, activeTab]);

  const handleDelete = async () => {
    if (!selectedCampaign || !accessToken) return;
    
    try {
      setIsDeleting(true);
      await deleteCampaign(accessToken, selectedCampaign.id);
      toast.success(`"${selectedCampaign.name}" deleted`);
      setDeleteDialogOpen(false);
      setSelectedCampaign(null);
      // Refresh the list
      fetchCampaigns();
    } catch (error) {
      console.error("Failed to delete campaign:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete campaign");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDuplicate = async (campaign: Campaign) => {
    if (!accessToken) return;
    
    try {
      setIsDuplicating(true);
      await duplicateCampaign(accessToken, campaign.id);
      toast.success(`"${campaign.name}" duplicated`);
      // Refresh the list
      fetchCampaigns();
    } catch (error) {
      console.error("Failed to duplicate campaign:", error);
      toast.error(error instanceof Error ? error.message : "Failed to duplicate campaign");
    } finally {
      setIsDuplicating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-full bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-16">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              <Mail className="size-6" />
              Campaigns
            </h1>
            <p className="text-muted-foreground mt-1">
              Create, manage, and track your email campaigns
            </p>
          </div>
          <Button asChild>
            <Link href="/campaigns/create-campaign">
              <Plus className="size-4" />
              Create Campaign
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <Card className="rounded-xl">
            <CardContent className="pt-6">
              <p className="text-2xl font-semibold">{stats.totalCampaigns}</p>
              <p className="text-sm text-muted-foreground">Total Campaigns</p>
            </CardContent>
          </Card>
          <Card className="rounded-xl">
            <CardContent className="pt-6">
              <p className="text-2xl font-semibold text-gray-600">
                {stats.drafts}
              </p>
              <p className="text-sm text-muted-foreground">Drafts</p>
            </CardContent>
          </Card>
          <Card className="rounded-xl">
            <CardContent className="pt-6">
              <p className="text-2xl font-semibold text-blue-600">
                {stats.scheduled}
              </p>
              <p className="text-sm text-muted-foreground">Scheduled</p>
            </CardContent>
          </Card>
          <Card className="rounded-xl">
            <CardContent className="pt-6">
              <p className="text-2xl font-semibold text-green-600">
                {stats.sent}
              </p>
              <p className="text-sm text-muted-foreground">Sent</p>
            </CardContent>
          </Card>
          <Card className="rounded-xl">
            <CardContent className="pt-6">
              <p className="text-2xl font-semibold">{stats.avgOpenRate}%</p>
              <p className="text-sm text-muted-foreground">Avg Open Rate</p>
            </CardContent>
          </Card>
          <Card className="rounded-xl">
            <CardContent className="pt-6">
              <p className="text-2xl font-semibold">{stats.avgClickRate}%</p>
              <p className="text-sm text-muted-foreground">Avg Click Rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs & Filters */}
        <div className="mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <TabsList>
                <TabsTrigger value="all">
                  All ({campaigns.length})
                </TabsTrigger>
                <TabsTrigger value="active">
                  Active ({activeCampaigns.length})
                </TabsTrigger>
                <TabsTrigger value="drafts">
                  Drafts ({drafts.length})
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Search campaigns..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-[250px]"
                  />
                </div>
                <Select
                  value={`${sortField}-${sortDirection}`}
                  onValueChange={(value) => {
                    const [field, direction] = value.split("-") as [
                      SortField,
                      SortDirection
                    ];
                    setSortField(field);
                    setSortDirection(direction);
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <ArrowUpDown className="size-4 mr-2" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt-desc">Newest first</SelectItem>
                    <SelectItem value="createdAt-asc">Oldest first</SelectItem>
                    <SelectItem value="name-asc">Name A-Z</SelectItem>
                    <SelectItem value="name-desc">Name Z-A</SelectItem>
                    <SelectItem value="recipients-desc">
                      Most recipients
                    </SelectItem>
                    <SelectItem value="recipients-asc">
                      Fewest recipients
                    </SelectItem>
                    <SelectItem value="status-asc">Status</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TabsContent value="all" className="mt-0">
              <CampaignsTable
                campaigns={filteredCampaigns}
                onDelete={(campaign) => {
                  setSelectedCampaign(campaign);
                  setDeleteDialogOpen(true);
                }}
                onDuplicate={handleDuplicate}
                isDuplicating={isDuplicating}
              />
            </TabsContent>
            <TabsContent value="active" className="mt-0">
              <CampaignsTable
                campaigns={filteredCampaigns}
                onDelete={(campaign) => {
                  setSelectedCampaign(campaign);
                  setDeleteDialogOpen(true);
                }}
                onDuplicate={handleDuplicate}
                isDuplicating={isDuplicating}
              />
            </TabsContent>
            <TabsContent value="drafts" className="mt-0">
              <CampaignsTable
                campaigns={filteredCampaigns}
                onDelete={(campaign) => {
                  setSelectedCampaign(campaign);
                  setDeleteDialogOpen(true);
                }}
                onDuplicate={handleDuplicate}
                showDraftActions
                isDuplicating={isDuplicating}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{selectedCampaign?.name}&quot;. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Campaign"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Campaigns Table Component
function CampaignsTable({
  campaigns,
  onDelete,
  onDuplicate,
  showDraftActions = false,
  isDuplicating = false,
}: {
  campaigns: Campaign[];
  onDelete: (campaign: Campaign) => void;
  onDuplicate: (campaign: Campaign) => void;
  showDraftActions?: boolean;
  isDuplicating?: boolean;
}) {
  if (campaigns.length === 0) {
    return (
      <Card className="rounded-2xl">
        <CardContent className="py-16 text-center">
          <Mail className="size-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No campaigns found</h3>
          <p className="text-muted-foreground mb-4">
            {showDraftActions
              ? "You don't have any draft campaigns"
              : "Create your first campaign to get started"}
          </p>
          <Button asChild>
            <Link href="/campaigns/create-campaign">
              <Plus className="size-4" />
              Create Campaign
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Campaign</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Recipients</TableHead>
            <TableHead>Performance</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign) => (
            <TableRow key={campaign.id}>
              <TableCell>
                <div>
                  <p className="font-medium">{campaign.name}</p>
                  <p className="text-sm text-muted-foreground truncate max-w-[280px]">
                    {campaign.subject}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {campaign.listName}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <StatusBadge status={campaign.status} />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Users className="size-4 text-muted-foreground" />
                  <span>{formatNumber(campaign.recipients)}</span>
                </div>
              </TableCell>
              <TableCell>
                {campaign.status === "sent" ||
                campaign.status === "sending" ? (
                  <div className="text-sm space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Opens:</span>
                      <span className="font-medium">
                        {calculateOpenRate(campaign.opened, campaign.delivered)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Clicks:</span>
                      <span className="font-medium">
                        {calculateClickRate(
                          campaign.clicked,
                          campaign.delivered
                        )}
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {campaign.sentAt ? (
                    <div>
                      <p className="text-muted-foreground">Sent</p>
                      <p>{formatDateTime(campaign.sentAt)}</p>
                    </div>
                  ) : campaign.scheduledAt ? (
                    <div>
                      <p className="text-muted-foreground">Scheduled</p>
                      <p>{formatDateTime(campaign.scheduledAt)}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-muted-foreground">Created</p>
                      <p>{formatDate(campaign.createdAt)}</p>
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  {campaign.status === "draft" && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/campaigns/email-editor?id=${campaign.id}`}>
                        Continue
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  )}
                  {campaign.status === "sent" && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/campaigns/${campaign.id}/report`}>
                        <BarChart3 className="size-4" />
                        Report
                      </Link>
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {campaign.status === "draft" && (
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/campaigns/email-editor?id=${campaign.id}`}
                          >
                            <Edit className="size-4 mr-2" />
                            Edit Campaign
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem asChild>
                        <Link href={`/campaigns/${campaign.id}`}>
                          <Eye className="size-4 mr-2" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDuplicate(campaign)}
                        disabled={isDuplicating}
                      >
                        <Copy className="size-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => onDelete(campaign)}
                      >
                        <Trash2 className="size-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

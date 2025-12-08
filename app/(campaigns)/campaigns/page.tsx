"use client";

import { useState, useMemo } from "react";
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
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

// Campaign status type
type CampaignStatus = "draft" | "scheduled" | "sending" | "sent" | "paused" | "failed";

// Campaign interface
interface Campaign {
  id: string;
  name: string;
  subject: string;
  status: CampaignStatus;
  createdAt: Date;
  scheduledAt?: Date;
  sentAt?: Date;
  recipients: number;
  delivered?: number;
  opened?: number;
  clicked?: number;
  listName: string;
}

// Mock campaigns data
const mockCampaigns: Campaign[] = [
  {
    id: "camp_1",
    name: "December Newsletter",
    subject: "Your December update is here!",
    status: "sent",
    createdAt: new Date("2024-12-01"),
    sentAt: new Date("2024-12-05T10:00:00"),
    recipients: 5420,
    delivered: 5380,
    opened: 2156,
    clicked: 432,
    listName: "Newsletter Subscribers",
  },
  {
    id: "camp_2",
    name: "Black Friday Sale",
    subject: "🎉 50% OFF Everything - Today Only!",
    status: "sent",
    createdAt: new Date("2024-11-28"),
    sentAt: new Date("2024-11-29T08:00:00"),
    recipients: 12500,
    delivered: 12350,
    opened: 6175,
    clicked: 1853,
    listName: "All Customers",
  },
  {
    id: "camp_3",
    name: "Product Launch Announcement",
    subject: "Introducing our newest feature",
    status: "scheduled",
    createdAt: new Date("2024-12-04"),
    scheduledAt: new Date("2024-12-10T09:00:00"),
    recipients: 8900,
    listName: "Product Updates",
  },
  {
    id: "camp_4",
    name: "Weekly Tips #42",
    subject: "5 ways to boost your productivity",
    status: "draft",
    createdAt: new Date("2024-12-05"),
    recipients: 0,
    listName: "Tips & Tricks",
  },
  {
    id: "camp_5",
    name: "Holiday Greetings",
    subject: "Happy Holidays from our team!",
    status: "draft",
    createdAt: new Date("2024-12-06"),
    recipients: 15000,
    listName: "All Subscribers",
  },
  {
    id: "camp_6",
    name: "Re-engagement Campaign",
    subject: "We miss you! Here's 20% off",
    status: "draft",
    createdAt: new Date("2024-12-03"),
    recipients: 2340,
    listName: "Inactive Users",
  },
  {
    id: "camp_7",
    name: "Q4 Report",
    subject: "Your quarterly insights are ready",
    status: "sending",
    createdAt: new Date("2024-12-06"),
    recipients: 4200,
    delivered: 1680,
    listName: "Enterprise Customers",
  },
  {
    id: "camp_8",
    name: "Welcome Series - Day 1",
    subject: "Welcome to the family!",
    status: "paused",
    createdAt: new Date("2024-11-15"),
    recipients: 890,
    delivered: 445,
    opened: 356,
    listName: "New Signups",
  },
];

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

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(date: Date): string {
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
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  // Separate drafts and other campaigns
  const drafts = useMemo(
    () => campaigns.filter((c) => c.status === "draft"),
    [campaigns]
  );

  const activeCampaigns = useMemo(
    () => campaigns.filter((c) => c.status !== "draft"),
    [campaigns]
  );

  // Filter and sort campaigns
  const filteredCampaigns = useMemo(() => {
    let filtered =
      activeTab === "drafts"
        ? drafts
        : activeTab === "all"
        ? campaigns
        : activeCampaigns;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.subject.toLowerCase().includes(query) ||
          c.listName.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "createdAt":
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "recipients":
          comparison = a.recipients - b.recipients;
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [campaigns, drafts, activeCampaigns, searchQuery, sortField, sortDirection, activeTab]);

  // Stats
  const stats = useMemo(() => {
    const sent = campaigns.filter((c) => c.status === "sent");
    const totalDelivered = sent.reduce((sum, c) => sum + (c.delivered || 0), 0);
    const totalOpened = sent.reduce((sum, c) => sum + (c.opened || 0), 0);
    const totalClicked = sent.reduce((sum, c) => sum + (c.clicked || 0), 0);

    return {
      totalCampaigns: campaigns.length,
      drafts: drafts.length,
      scheduled: campaigns.filter((c) => c.status === "scheduled").length,
      sent: sent.length,
      avgOpenRate: totalDelivered > 0 ? ((totalOpened / totalDelivered) * 100).toFixed(1) : "0",
      avgClickRate: totalDelivered > 0 ? ((totalClicked / totalDelivered) * 100).toFixed(1) : "0",
    };
  }, [campaigns, drafts]);

  const handleDelete = () => {
    if (selectedCampaign) {
      setCampaigns((prev) => prev.filter((c) => c.id !== selectedCampaign.id));
      toast.success(`"${selectedCampaign.name}" deleted`);
      setDeleteDialogOpen(false);
      setSelectedCampaign(null);
    }
  };

  const handleDuplicate = (campaign: Campaign) => {
    const newCampaign: Campaign = {
      ...campaign,
      id: `camp_${Date.now()}`,
      name: `${campaign.name} (Copy)`,
      status: "draft",
      createdAt: new Date(),
      scheduledAt: undefined,
      sentAt: undefined,
      delivered: undefined,
      opened: undefined,
      clicked: undefined,
    };
    setCampaigns((prev) => [newCampaign, ...prev]);
    toast.success(`"${campaign.name}" duplicated`);
  };

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
              This will permanently delete "{selectedCampaign?.name}". This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Delete Campaign
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
}: {
  campaigns: Campaign[];
  onDelete: (campaign: Campaign) => void;
  onDuplicate: (campaign: Campaign) => void;
  showDraftActions?: boolean;
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
                      <DropdownMenuItem onClick={() => onDuplicate(campaign)}>
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

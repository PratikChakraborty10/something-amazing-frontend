"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  ChevronRight,
  Search,
  MoreHorizontal,
  Download,
  Trash2,
  Edit3,
  Plus,
  Calendar,
  Mail,
  FolderOpen,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Label } from "@/components/ui/label";

// Mock contact list type
interface ContactList {
  id: string;
  name: string;
  description: string;
  contactCount: number;
  validCount: number;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
}

// Mock data - represents lists saved from Global Contacts page
const mockLists: ContactList[] = [
  {
    id: "list_1",
    name: "Q4 Product Launch Leads",
    description: "Enterprise prospects for Q4 product launch campaign",
    contactCount: 2847,
    validCount: 2756,
    createdAt: new Date("2024-11-15"),
    updatedAt: new Date("2024-12-02"),
    tags: ["enterprise", "product-launch"],
  },
  {
    id: "list_2",
    name: "Newsletter Subscribers",
    description: "Active newsletter subscribers from website signups",
    contactCount: 12534,
    validCount: 12089,
    createdAt: new Date("2024-08-20"),
    updatedAt: new Date("2024-12-01"),
    tags: ["newsletter", "organic"],
  },
  {
    id: "list_3",
    name: "Webinar Attendees - Nov 2024",
    description: "Attendees from the November product demo webinar",
    contactCount: 456,
    validCount: 442,
    createdAt: new Date("2024-11-28"),
    updatedAt: new Date("2024-11-28"),
    tags: ["webinar", "warm-leads"],
  },
  {
    id: "list_4",
    name: "Partner Referrals",
    description: "Leads from partner referral program",
    contactCount: 1203,
    validCount: 1156,
    createdAt: new Date("2024-09-10"),
    updatedAt: new Date("2024-11-25"),
    tags: ["partners", "referral"],
  },
  {
    id: "list_5",
    name: "Free Trial Signups",
    description: "Users who signed up for free trial in last 30 days",
    contactCount: 3421,
    validCount: 3298,
    createdAt: new Date("2024-11-01"),
    updatedAt: new Date("2024-12-05"),
    tags: ["trial", "conversion"],
  },
];

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full bg-muted p-6 mb-6">
        <FolderOpen className="size-12 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No contact lists yet</h3>
      <p className="text-muted-foreground max-w-md mb-6">
        Create your first contact list by importing and saving contacts from the Global Contacts page.
      </p>
      <Button asChild>
        <Link href="/global-contacts">
          <Plus className="size-4" />
          Create Contact List
        </Link>
      </Button>
    </div>
  );
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatNumber(num: number): string {
  return num.toLocaleString();
}

export default function ContactListsPage() {
  const [lists, setLists] = useState<ContactList[]>(mockLists);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteListId, setDeleteListId] = useState<string | null>(null);
  const [editList, setEditList] = useState<ContactList | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const filteredLists = lists.filter((list) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      list.name.toLowerCase().includes(query) ||
      list.description.toLowerCase().includes(query) ||
      list.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  const totalContacts = lists.reduce((sum, list) => sum + list.contactCount, 0);
  const totalValid = lists.reduce((sum, list) => sum + list.validCount, 0);

  const handleDelete = () => {
    if (deleteListId) {
      setLists((prev) => prev.filter((l) => l.id !== deleteListId));
      toast.success("Contact list deleted");
      setDeleteListId(null);
    }
  };

  const handleEdit = () => {
    if (editList && editName.trim()) {
      setLists((prev) =>
        prev.map((l) =>
          l.id === editList.id
            ? { ...l, name: editName, description: editDescription, updatedAt: new Date() }
            : l
        )
      );
      toast.success("Contact list updated");
      setEditList(null);
    }
  };

  const handleExport = (list: ContactList) => {
    // Mock export
    toast.success(`Exporting ${list.name}...`);
    setTimeout(() => {
      toast.success(`${list.name} exported successfully`);
    }, 1000);
  };

  const openEditDialog = (list: ContactList) => {
    setEditList(list);
    setEditName(list.name);
    setEditDescription(list.description);
  };

  return (
    <div className="min-h-full bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stepper */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/global-contacts" className="hover:text-foreground transition-colors">
            Global Contacts
          </Link>
          <ChevronRight className="size-4" />
          <span className="font-medium text-foreground">Manage Lists</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Contact Lists</h1>
            <p className="text-muted-foreground mt-1">
              Manage your saved contact lists. Use these lists when creating email campaigns.
            </p>
          </div>
          <Button asChild>
            <Link href="/global-contacts">
              <Plus className="size-4" />
              New List
            </Link>
          </Button>
        </div>

        {/* Stats */}
        {lists.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="rounded-xl">
              <CardContent className="pt-6">
                <p className="text-2xl font-semibold">{lists.length}</p>
                <p className="text-sm text-muted-foreground">Total Lists</p>
              </CardContent>
            </Card>
            <Card className="rounded-xl">
              <CardContent className="pt-6">
                <p className="text-2xl font-semibold">{formatNumber(totalContacts)}</p>
                <p className="text-sm text-muted-foreground">Total Contacts</p>
              </CardContent>
            </Card>
            <Card className="rounded-xl">
              <CardContent className="pt-6">
                <p className="text-2xl font-semibold">{formatNumber(totalValid)}</p>
                <p className="text-sm text-muted-foreground">Valid Contacts</p>
              </CardContent>
            </Card>
            <Card className="rounded-xl">
              <CardContent className="pt-6">
                <p className="text-2xl font-semibold">
                  {totalContacts > 0 ? Math.round((totalValid / totalContacts) * 100) : 0}%
                </p>
                <p className="text-sm text-muted-foreground">Validity Rate</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Lists Table */}
        <Card className="rounded-2xl">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>All Lists</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search lists..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-64"
                  aria-label="Search contact lists"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {lists.length === 0 ? (
              <EmptyState />
            ) : filteredLists.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No lists match your search
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contacts</TableHead>
                    <TableHead>Valid</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLists.map((list) => (
                    <TableRow key={list.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{list.name}</p>
                          <p className="text-sm text-muted-foreground truncate max-w-xs">
                            {list.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Users className="size-4 text-muted-foreground" />
                          {formatNumber(list.contactCount)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Mail className="size-4 text-muted-foreground" />
                          {formatNumber(list.validCount)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {list.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {list.tags.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{list.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Calendar className="size-4" />
                          {formatDate(list.updatedAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(list)}>
                              <Edit3 className="size-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExport(list)}>
                              <Download className="size-4 mr-2" />
                              Export CSV
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeleteListId(list.id)}
                            >
                              <Trash2 className="size-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editList} onOpenChange={(open) => !open && setEditList(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Contact List</DialogTitle>
            <DialogDescription>Update the name and description for this list.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditList(null)}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteListId} onOpenChange={(open) => !open && setDeleteListId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete contact list?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this contact list. Contacts will remain in the global contacts database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

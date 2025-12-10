"use client";

import { useState, useEffect, useCallback } from "react";
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
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useAccessToken } from "@/lib/auth-store";
import {
  ContactList,
  getContactLists,
  updateContactList,
  deleteContactList,
  exportContactList,
} from "@/lib/contacts-api";

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

function formatDate(dateString: string): string {
  const date = new Date(dateString);
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
  const accessToken = useAccessToken();

  // State
  const [lists, setLists] = useState<ContactList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteListId, setDeleteListId] = useState<string | null>(null);
  const [editList, setEditList] = useState<ContactList | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Fetch lists from API
  const fetchLists = useCallback(async () => {
    if (!accessToken) return;

    try {
      setIsLoading(true);
      const response = await getContactLists(accessToken, searchQuery || undefined);
      setLists(response.lists);
    } catch (error) {
      console.error("Failed to fetch contact lists:", error);
      toast.error(error instanceof Error ? error.message : "Failed to load contact lists");
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, searchQuery]);

  // Load lists on mount and when search changes
  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  // Computed values
  const filteredLists = lists.filter((list) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      list.name.toLowerCase().includes(query) ||
      (list.description?.toLowerCase().includes(query) ?? false) ||
      list.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  const totalContacts = lists.reduce((sum, list) => sum + list.contactCount, 0);
  const totalValid = lists.reduce((sum, list) => sum + list.validCount, 0);

  // Handlers
  const handleDelete = async () => {
    if (!accessToken || !deleteListId) return;

    try {
      setIsSubmitting(true);
      await deleteContactList(accessToken, deleteListId);
      setDeleteListId(null);
      await fetchLists();
      toast.success("Contact list deleted");
    } catch (error) {
      console.error("Failed to delete list:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete list");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!accessToken || !editList || !editName.trim()) return;

    try {
      setIsSubmitting(true);
      await updateContactList(accessToken, editList.id, {
        name: editName,
        description: editDescription || undefined,
      });
      setEditList(null);
      await fetchLists();
      toast.success("Contact list updated");
    } catch (error) {
      console.error("Failed to update list:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update list");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExport = async (list: ContactList) => {
    if (!accessToken) {
      toast.error("Please log in to export lists");
      return;
    }

    try {
      toast.info(`Exporting ${list.name}...`);
      await exportContactList(accessToken, list.id, list.name);
      toast.success(`${list.name} exported successfully`);
    } catch (error) {
      console.error("Failed to export list:", error);
      toast.error(error instanceof Error ? error.message : "Failed to export list");
    }
  };

  const openEditDialog = (list: ContactList) => {
    setEditList(list);
    setEditName(list.name);
    setEditDescription(list.description || "");
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
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
              </div>
            ) : lists.length === 0 ? (
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
            <Button onClick={handleEdit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
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
            <AlertDialogAction onClick={handleDelete} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

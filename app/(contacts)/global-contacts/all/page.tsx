"use client";

import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import Link from "next/link";
import {
    Upload,
    Search,
    Check,
    X,
    ChevronRight,
    AlertCircle,
    CheckCircle2,
    Copy,
    MoreHorizontal,
    Filter,
    Download,
    Trash2,
    Edit3,
    Loader2,
    Plus,
    FileText,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
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
    Contact as LocalContact,
    contactsToCSV,
    downloadFile,
    extractDomain,
} from "@/lib/contact-utils";
import { useAccessToken } from "@/lib/auth-store";
import {
    Contact,
    ContactStats,
    getContacts,
    getContactStats as fetchContactStats,
    updateContact,
    deleteContact,
    deleteContacts,
} from "@/lib/contacts-api";

// Empty state component
function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="rounded-full bg-muted p-6 mb-6">
                <FileText className="size-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No contacts saved yet</h3>
            <p className="text-muted-foreground max-w-md mb-6">
                Import contacts from files or add them manually on the Global Contacts page, then save them to your contact database.
            </p>
            <Button asChild>
                <Link href="/global-contacts">
                    <Plus className="size-4" />
                    Import Contacts
                </Link>
            </Button>
        </div>
    );
}

// Status badge component
function StatusBadge({ status, errors }: { status: Contact["status"]; errors?: string[] }) {
    if (status === "valid") {
        return (
            <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                <CheckCircle2 className="size-3 mr-1" />
                Valid
            </Badge>
        );
    }

    if (status === "duplicate") {
        return (
            <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                <Copy className="size-3 mr-1" />
                Duplicate
            </Badge>
        );
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger>
                    <Badge variant="destructive">
                        <AlertCircle className="size-3 mr-1" />
                        Invalid
                    </Badge>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{errors?.join(", ") || "Validation failed"}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

// Editable cell component
function EditableCell({
    value,
    onSave,
    type = "text",
}: {
    value: string;
    onSave: (value: string) => void;
    type?: "text" | "email";
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSave = () => {
        onSave(editValue);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditValue(value);
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="flex items-center gap-1">
                <Input
                    ref={inputRef}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="h-7 text-sm"
                    onKeyDown={(e) => {
                        if (e.key === "Enter") handleSave();
                        if (e.key === "Escape") handleCancel();
                    }}
                    autoFocus
                />
                <Button size="icon-sm" variant="ghost" onClick={handleSave}>
                    <Check className="size-3" />
                </Button>
                <Button size="icon-sm" variant="ghost" onClick={handleCancel}>
                    <X className="size-3" />
                </Button>
            </div>
        );
    }

    return (
        <button
            onClick={() => setIsEditing(true)}
            className="text-left hover:bg-muted px-2 py-1 rounded -mx-2 -my-1 transition-colors w-full"
        >
            {value || <span className="text-muted-foreground italic">—</span>}
        </button>
    );
}

export default function AllContactsPage() {
    // Auth
    const accessToken = useAccessToken();

    // State
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "valid" | "invalid" | "duplicate">("all");
    const [domainFilter, setDomainFilter] = useState<string>("all");

    // Loading states
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Stats from API
    const [apiStats, setApiStats] = useState<ContactStats | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalContacts, setTotalContacts] = useState(0);

    // Delete confirmation
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    // Fetch contacts from API
    const fetchContacts = useCallback(async () => {
        if (!accessToken) return;

        try {
            setIsLoading(true);
            const response = await getContacts(accessToken, {
                page: currentPage,
                limit: 50,
                search: searchQuery || undefined,
                status: statusFilter !== "all" ? statusFilter : undefined,
                domain: domainFilter !== "all" ? domainFilter : undefined,
            });
            setContacts(response.contacts);
            setTotalPages(response.pagination.totalPages);
            setTotalContacts(response.pagination.total);
        } catch (error) {
            console.error("Failed to fetch contacts:", error);
            toast.error(error instanceof Error ? error.message : "Failed to load contacts");
        } finally {
            setIsLoading(false);
        }
    }, [accessToken, currentPage, searchQuery, statusFilter, domainFilter]);

    // Fetch stats from API
    const fetchStats = useCallback(async () => {
        if (!accessToken) return;

        try {
            const stats = await fetchContactStats(accessToken);
            setApiStats(stats);
        } catch (error) {
            console.error("Failed to fetch stats:", error);
        }
    }, [accessToken]);

    // Load contacts and stats on mount and when filters change
    useEffect(() => {
        fetchContacts();
    }, [fetchContacts]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    // Computed values
    const stats = useMemo(() => {
        if (apiStats) {
            return {
                total: apiStats.total,
                valid: apiStats.valid,
                invalid: apiStats.invalid,
                duplicate: apiStats.duplicate,
                topDomains: apiStats.topDomains,
            };
        }
        return { total: 0, valid: 0, invalid: 0, duplicate: 0, topDomains: [] };
    }, [apiStats]);

    const uniqueDomains = useMemo(() => {
        const domains = new Set<string>();
        contacts.forEach((c) => {
            const domain = extractDomain(c.email);
            if (domain) domains.add(domain);
        });
        return Array.from(domains).sort();
    }, [contacts]);

    // Handlers
    const handleUpdateContact = useCallback(
        async (id: string, field: keyof Contact, value: string) => {
            if (!accessToken) return;

            // Optimistically update local state
            setContacts((prev) =>
                prev.map((contact) => {
                    if (contact.id !== id) return contact;
                    return { ...contact, [field]: value };
                })
            );

            try {
                await updateContact(accessToken, id, { [field]: value });
            } catch (error) {
                console.error("Failed to update contact:", error);
                toast.error(error instanceof Error ? error.message : "Failed to update contact");
                // Refresh to revert on error
                fetchContacts();
            }
        },
        [accessToken, fetchContacts]
    );

    const handleDeleteSelected = useCallback(async () => {
        if (!accessToken) {
            toast.error("Please log in to delete contacts");
            return;
        }

        const idsToDelete = Array.from(selectedIds);
        if (idsToDelete.length === 0) return;

        try {
            setIsSubmitting(true);
            await deleteContacts(accessToken, idsToDelete);
            setSelectedIds(new Set());
            setShowDeleteDialog(false);
            await fetchContacts();
            await fetchStats();
            toast.success(`Deleted ${idsToDelete.length} contacts`);
        } catch (error) {
            console.error("Failed to delete contacts:", error);
            toast.error(error instanceof Error ? error.message : "Failed to delete contacts");
        } finally {
            setIsSubmitting(false);
        }
    }, [accessToken, selectedIds, fetchContacts, fetchStats]);

    const handleDeleteSingle = useCallback(
        async (id: string) => {
            if (!accessToken) return;

            try {
                await deleteContact(accessToken, id);
                await fetchContacts();
                await fetchStats();
                toast.success("Contact deleted");
            } catch (error) {
                console.error("Failed to delete contact:", error);
                toast.error(error instanceof Error ? error.message : "Failed to delete contact");
            }
        },
        [accessToken, fetchContacts, fetchStats]
    );

    const handleExport = useCallback(() => {
        // Convert API contacts to local format for CSV export
        const localContacts = contacts.map((c) => ({
            ...c,
            firstName: c.firstName ?? "",
            lastName: c.lastName ?? "",
            company: c.company ?? "",
            role: c.role ?? "",
        }));
        const csv = contactsToCSV(localContacts as unknown as LocalContact[]);
        downloadFile(csv, "all-contacts.csv", "text/csv");
        toast.success("Contacts exported successfully");
    }, [contacts]);

    const handleExportSelected = useCallback(() => {
        const selected = contacts.filter((c) => selectedIds.has(c.id));
        // Convert API contacts to local format for CSV export
        const localContacts = selected.map((c) => ({
            ...c,
            firstName: c.firstName ?? "",
            lastName: c.lastName ?? "",
            company: c.company ?? "",
            role: c.role ?? "",
        }));
        const csv = contactsToCSV(localContacts as unknown as LocalContact[]);
        downloadFile(csv, "selected-contacts.csv", "text/csv");
        toast.success(`Exported ${selected.length} contacts`);
    }, [contacts, selectedIds]);

    const toggleSelectAll = useCallback(() => {
        if (selectedIds.size === contacts.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(contacts.map((c) => c.id)));
        }
    }, [contacts, selectedIds]);

    const toggleSelect = useCallback((id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    return (
        <TooltipProvider>
            <div className="min-h-full bg-background">
                <div className="max-w-6xl mx-auto px-4 py-8">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                        <Link href="/global-contacts" className="hover:text-foreground transition-colors">
                            Global Contacts
                        </Link>
                        <ChevronRight className="size-4" />
                        <span className="font-medium text-foreground">All Contacts</span>
                    </nav>

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight">All Contacts</h1>
                            <p className="text-muted-foreground mt-1">
                                View and manage all contacts saved in your database.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <Button variant="outline" onClick={handleExport} disabled={contacts.length === 0}>
                                <Download className="size-4" />
                                Export All
                            </Button>
                            <Button asChild>
                                <Link href="/global-contacts">
                                    <Plus className="size-4" />
                                    Import Contacts
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Stats */}
                    {stats.total > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <Card className="rounded-xl">
                                <CardContent className="pt-6">
                                    <p className="text-2xl font-semibold">{stats.total}</p>
                                    <p className="text-sm text-muted-foreground">Total</p>
                                </CardContent>
                            </Card>
                            <Card className="rounded-xl">
                                <CardContent className="pt-6">
                                    <p className="text-2xl font-semibold">{stats.valid}</p>
                                    <p className="text-sm text-muted-foreground">Valid</p>
                                </CardContent>
                            </Card>
                            <Card className="rounded-xl">
                                <CardContent className="pt-6">
                                    <p className="text-2xl font-semibold">{stats.invalid}</p>
                                    <p className="text-sm text-muted-foreground">Invalid</p>
                                </CardContent>
                            </Card>
                            <Card className="rounded-xl">
                                <CardContent className="pt-6">
                                    <p className="text-2xl font-semibold">{stats.duplicate}</p>
                                    <p className="text-sm text-muted-foreground">Duplicates</p>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Main Content */}
                    <Card className="rounded-2xl">
                        <CardHeader className="pb-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <CardTitle>Saved Contacts</CardTitle>
                                <div className="flex items-center gap-2">
                                    <div className="relative flex-1 sm:flex-none">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search contacts..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-9 w-full sm:w-64"
                                            aria-label="Search contacts"
                                        />
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="icon">
                                                <Filter className="size-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48">
                                            <div className="px-2 py-1.5 text-sm font-medium">Filter by Status</div>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                                                <Check className={`size-4 mr-2 ${statusFilter === "all" ? "opacity-100" : "opacity-0"}`} />
                                                All
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setStatusFilter("valid")}>
                                                <Check className={`size-4 mr-2 ${statusFilter === "valid" ? "opacity-100" : "opacity-0"}`} />
                                                Valid only
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setStatusFilter("invalid")}>
                                                <Check className={`size-4 mr-2 ${statusFilter === "invalid" ? "opacity-100" : "opacity-0"}`} />
                                                Invalid only
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setStatusFilter("duplicate")}>
                                                <Check className={`size-4 mr-2 ${statusFilter === "duplicate" ? "opacity-100" : "opacity-0"}`} />
                                                Duplicates only
                                            </DropdownMenuItem>
                                            {uniqueDomains.length > 0 && (
                                                <>
                                                    <DropdownMenuSeparator />
                                                    <div className="px-2 py-1.5 text-sm font-medium">Filter by Domain</div>
                                                    <DropdownMenuItem onClick={() => setDomainFilter("all")}>
                                                        <Check className={`size-4 mr-2 ${domainFilter === "all" ? "opacity-100" : "opacity-0"}`} />
                                                        All domains
                                                    </DropdownMenuItem>
                                                    {uniqueDomains.slice(0, 5).map((domain) => (
                                                        <DropdownMenuItem key={domain} onClick={() => setDomainFilter(domain)}>
                                                            <Check className={`size-4 mr-2 ${domainFilter === domain ? "opacity-100" : "opacity-0"}`} />
                                                            {domain}
                                                        </DropdownMenuItem>
                                                    ))}
                                                </>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="flex items-center justify-center py-16">
                                    <Loader2 className="size-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : contacts.length === 0 && !searchQuery && statusFilter === "all" && domainFilter === "all" ? (
                                <EmptyState />
                            ) : contacts.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No contacts match your search criteria
                                </div>
                            ) : (
                                <>
                                    {/* Bulk actions */}
                                    {selectedIds.size > 0 && (
                                        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg mb-4">
                                            <span className="text-sm font-medium">
                                                {selectedIds.size} selected
                                            </span>
                                            <div className="flex-1" />
                                            <Button variant="ghost" size="sm" onClick={handleExportSelected}>
                                                <Download className="size-4" />
                                                Export
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => setShowDeleteDialog(true)}
                                            >
                                                <Trash2 className="size-4" />
                                                Delete
                                            </Button>
                                        </div>
                                    )}

                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-10">
                                                    <Checkbox
                                                        checked={selectedIds.size === contacts.length && contacts.length > 0}
                                                        onCheckedChange={toggleSelectAll}
                                                        aria-label="Select all"
                                                    />
                                                </TableHead>
                                                <TableHead>Email</TableHead>
                                                <TableHead>First Name</TableHead>
                                                <TableHead>Last Name</TableHead>
                                                <TableHead>Company</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="w-10"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {contacts.map((contact) => (
                                                <TableRow key={contact.id} data-state={selectedIds.has(contact.id) ? "selected" : undefined}>
                                                    <TableCell>
                                                        <Checkbox
                                                            checked={selectedIds.has(contact.id)}
                                                            onCheckedChange={() => toggleSelect(contact.id)}
                                                            aria-label={`Select ${contact.email}`}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <EditableCell
                                                            value={contact.email}
                                                            type="email"
                                                            onSave={(v) => handleUpdateContact(contact.id, "email", v)}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <EditableCell
                                                            value={contact.firstName ?? ""}
                                                            onSave={(v) => handleUpdateContact(contact.id, "firstName", v)}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <EditableCell
                                                            value={contact.lastName ?? ""}
                                                            onSave={(v) => handleUpdateContact(contact.id, "lastName", v)}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <EditableCell
                                                            value={contact.company ?? ""}
                                                            onSave={(v) => handleUpdateContact(contact.id, "company", v)}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <StatusBadge status={contact.status} errors={contact.validationErrors} />
                                                    </TableCell>
                                                    <TableCell>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon-sm">
                                                                    <MoreHorizontal className="size-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={() => toggleSelect(contact.id)}>
                                                                    <Edit3 className="size-4 mr-2" />
                                                                    {selectedIds.has(contact.id) ? "Deselect" : "Select"}
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    className="text-destructive focus:text-destructive"
                                                                    onClick={() => handleDeleteSingle(contact.id)}
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

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                            <p className="text-sm text-muted-foreground">
                                                Showing {(currentPage - 1) * 50 + 1} to {Math.min(currentPage * 50, totalContacts)} of {totalContacts} contacts
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                                    disabled={currentPage === 1}
                                                >
                                                    Previous
                                                </Button>
                                                <span className="text-sm text-muted-foreground">
                                                    Page {currentPage} of {totalPages}
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                                    disabled={currentPage === totalPages}
                                                >
                                                    Next
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Delete Confirmation */}
                <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete selected contacts?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete {selectedIds.size} contacts from your database. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteSelected} disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="size-4 mr-2 animate-spin" />}
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </TooltipProvider>
    );
}

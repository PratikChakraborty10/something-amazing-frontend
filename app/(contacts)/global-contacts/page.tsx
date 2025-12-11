"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import Link from "next/link";
import {
  Upload,
  ClipboardPaste,
  UserPlus,
  FileText,
  Download,
  Trash2,
  Search,
  Check,
  X,
  ChevronRight,
  History,
  Save,
  AlertCircle,
  CheckCircle2,
  Copy,
  MoreHorizontal,
  Filter,
  Settings2,
  HelpCircle,
  Users,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  Contact as LocalContact,
  ParsedColumn,
  CanonicalField,
  parseCSV,
  extractEmailsFromText,
  suggestColumnMapping,
  createContact as createLocalContact,
  deduplicateContacts,
  contactsToCSV,
  downloadFile,
  getContactStats,
  isValidEmail,
  extractDomain,
  generateId,
} from "@/lib/contact-utils";
import { useAccessToken } from "@/lib/auth-store";
import {
  DedupeStrategy,
  bulkImportContacts,
  createContactList,
} from "@/lib/contacts-api";

// Empty state component
function EmptyState({
  onUpload,
  onAddManual,
}: {
  onUpload: () => void;
  onAddManual: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full bg-muted p-6 mb-6">
        <FileText className="size-12 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No contacts imported yet</h3>
      <p className="text-muted-foreground max-w-md mb-6">
        Import contacts from a CSV file, paste email addresses, or add them
        manually. Your imported contacts will appear here before saving.
      </p>
      <div className="flex gap-3">
        <Button onClick={onUpload}>
          <Upload className="size-4" />
          Upload CSV
        </Button>
        <Button variant="outline" onClick={onAddManual}>
          <UserPlus className="size-4" />
          Add Contact
        </Button>
      </div>
      <div className="mt-8 p-4 bg-muted/50 rounded-lg max-w-md">
        <p className="text-sm text-muted-foreground">
          <strong>Tip:</strong> Required columns: Email. Optional: First Name,
          Last Name, Company, Role. Use headers in your CSV for automatic column
          detection.
        </p>
      </div>
    </div>
  );
}

// Status badge component
function StatusBadge({
  status,
  errors,
}: {
  status: LocalContact["status"];
  errors?: string[];
}) {
  if (status === "valid") {
    return (
      <Badge
        variant="secondary"
        className="bg-primary/10 text-primary hover:bg-primary/20"
      >
        <CheckCircle2 className="size-3 mr-1" />
        Valid
      </Badge>
    );
  }

  if (status === "duplicate") {
    return (
      <Badge
        variant="secondary"
        className="bg-secondary text-secondary-foreground"
      >
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

// Column mapping row
function ColumnMappingRow({
  column,
  onMappingChange,
}: {
  column: ParsedColumn;
  onMappingChange: (mappedTo: CanonicalField | null) => void;
}) {
  return (
    <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{column.originalName}</p>
        <p className="text-xs text-muted-foreground truncate">
          {column.sampleValues.slice(0, 2).join(", ")}
        </p>
      </div>
      <ChevronRight className="size-4 text-muted-foreground shrink-0" />
      <Select
        value={column.mappedTo || "ignore"}
        onValueChange={(v) =>
          onMappingChange(v === "ignore" ? null : (v as CanonicalField))
        }
      >
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="email">Email</SelectItem>
          <SelectItem value="firstName">First Name</SelectItem>
          <SelectItem value="lastName">Last Name</SelectItem>
          <SelectItem value="company">Company</SelectItem>
          <SelectItem value="role">Role</SelectItem>
          <SelectItem value="tags">Tags</SelectItem>
          <SelectItem value="ignore">Ignore</SelectItem>
        </SelectContent>
      </Select>
    </div>
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

export default function GlobalContactsPage() {
  // Auth
  const accessToken = useAccessToken();

  // Session-local contacts (not fetched from API)
  const [sessionContacts, setSessionContacts] = useState<LocalContact[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "valid" | "invalid" | "duplicate"
  >("all");
  const [domainFilter, setDomainFilter] = useState<string>("all");
  const [autoDedupe, setAutoDedupe] = useState(true);
  const [dedupeStrategy, setDedupeStrategy] =
    useState<DedupeStrategy>("keepLast");

  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Import state
  const [parsedColumns, setParsedColumns] = useState<ParsedColumn[]>([]);
  const [parsedRows, setParsedRows] = useState<string[][]>([]);
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [dragOver, setDragOver] = useState(false);

  // Manual input state
  const [manualEmail, setManualEmail] = useState("");
  const [manualFirstName, setManualFirstName] = useState("");
  const [manualLastName, setManualLastName] = useState("");
  const [manualCompany, setManualCompany] = useState("");
  const [manualRole, setManualRole] = useState("");
  const [manualEmailError, setManualEmailError] = useState("");

  // Modal state
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [listName, setListName] = useState("");
  const [listDescription, setListDescription] = useState("");
  const [activeTab, setActiveTab] = useState("upload");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Computed values - use local contact stats
  const stats = useMemo(() => {
    return getContactStats(sessionContacts);
  }, [sessionContacts]);

  const filteredContacts = useMemo(() => {
    return sessionContacts.filter((contact) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          contact.email.toLowerCase().includes(query) ||
          (contact.firstName?.toLowerCase().includes(query) ?? false) ||
          (contact.lastName?.toLowerCase().includes(query) ?? false) ||
          (contact.company?.toLowerCase().includes(query) ?? false);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter !== "all" && contact.status !== statusFilter) {
        return false;
      }

      // Domain filter
      if (domainFilter !== "all") {
        const domain = extractDomain(contact.email);
        if (domain !== domainFilter) return false;
      }

      return true;
    });
  }, [sessionContacts, searchQuery, statusFilter, domainFilter]);

  const uniqueDomains = useMemo(() => {
    const domains = new Set<string>();
    sessionContacts.forEach((c) => {
      const domain = extractDomain(c.email);
      if (domain) domains.add(domain);
    });
    return Array.from(domains).sort();
  }, [sessionContacts]);

  // Handlers
  const handleFileSelect = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = parseCSV(text);

      if (rows.length < 2) {
        toast.error("File must contain at least a header row and one data row");
        return;
      }

      const headers = rows[0];
      const dataRows = rows.slice(1);

      const columns: ParsedColumn[] = headers.map((header, index) => ({
        originalName: header,
        mappedTo: suggestColumnMapping(header),
        sampleValues: dataRows.slice(0, 3).map((row) => row[index] || ""),
      }));

      setParsedColumns(columns);
      setParsedRows(dataRows);
      setShowMappingModal(true);
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);

      const file = e.dataTransfer.files[0];
      if (
        file &&
        (file.name.endsWith(".csv") ||
          file.name.endsWith(".xlsx") ||
          file.name.endsWith(".xls"))
      ) {
        handleFileSelect(file);
      } else {
        toast.error("Please upload a CSV or Excel file");
      }
    },
    [handleFileSelect]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  // Confirm CSV mapping - adds contacts to session state
  const confirmMapping = useCallback(() => {
    // Find email column
    const emailColIndex = parsedColumns.findIndex(
      (c) => c.mappedTo === "email"
    );
    if (emailColIndex === -1) {
      toast.error("Please map at least one column to Email");
      return;
    }

    // Create contacts from rows
    const newContacts: LocalContact[] = parsedRows
      .map((row) => {
        const data: Partial<LocalContact> = {};

        parsedColumns.forEach((col, index) => {
          if (!col.mappedTo || col.mappedTo === "ignore") return;

          const value = row[index] || "";

          switch (col.mappedTo) {
            case "email":
              data.email = value;
              break;
            case "firstName":
              data.firstName = value;
              break;
            case "lastName":
              data.lastName = value;
              break;
            case "company":
              data.company = value;
              break;
            case "role":
              data.role = value;
              break;
            case "tags":
              data.tags = value
                .split(/[,;]/)
                .map((t) => t.trim())
                .filter(Boolean);
              break;
          }
        });

        if (!data.email) return null;

        // Create contact locally (validation is handled internally)
        return createLocalContact(data);
      })
      .filter((c): c is LocalContact => c !== null);

    // Add to session contacts with optional deduplication
    setSessionContacts((prev) => {
      const combined = [...prev, ...newContacts];
      if (autoDedupe) {
        return deduplicateContacts(
          combined,
          dedupeStrategy as "keepFirst" | "keepLast" | "merge"
        );
      }
      return combined;
    });

    setShowMappingModal(false);
    setParsedColumns([]);
    setParsedRows([]);

    toast.success(`Added ${newContacts.length} contacts to import queue`);
  }, [parsedColumns, parsedRows, autoDedupe, dedupeStrategy]);

  // Parse pasted text - adds contacts to session state
  const handleParsePaste = useCallback(() => {
    if (!pasteText.trim()) {
      toast.error("Please paste some text containing email addresses");
      return;
    }

    const extracted = extractEmailsFromText(pasteText);

    if (extracted.length === 0) {
      toast.error("No valid email addresses found in the pasted text");
      return;
    }

    // Create contacts from extracted data
    const newContacts: LocalContact[] = extracted
      .filter((data) => data.email)
      .map((data) => {
        // Create contact locally (validation is handled internally)
        return createLocalContact({
          email: data.email || "",
          firstName: data.firstName,
          lastName: data.lastName,
        });
      });

    // Add to session contacts with optional deduplication
    setSessionContacts((prev) => {
      const combined = [...prev, ...newContacts];
      if (autoDedupe) {
        return deduplicateContacts(
          combined,
          dedupeStrategy as "keepFirst" | "keepLast" | "merge"
        );
      }
      return combined;
    });

    setPasteText("");
    toast.success(`Added ${newContacts.length} contacts to import queue`);
  }, [pasteText, autoDedupe, dedupeStrategy]);

  // Add manual contact - adds to session state
  const handleAddManual = useCallback(() => {
    if (!manualEmail.trim()) {
      setManualEmailError("Email is required");
      return;
    }

    if (!isValidEmail(manualEmail)) {
      setManualEmailError("Invalid email format");
      return;
    }

    // Create contact locally (validation is handled internally)
    const contact = createLocalContact({
      email: manualEmail,
      firstName: manualFirstName || undefined,
      lastName: manualLastName || undefined,
      company: manualCompany || undefined,
      role: manualRole || undefined,
    });

    // Add to session contacts with optional deduplication
    setSessionContacts((prev) => {
      const combined = [...prev, contact];
      if (autoDedupe) {
        return deduplicateContacts(
          combined,
          dedupeStrategy as "keepFirst" | "keepLast" | "merge"
        );
      }
      return combined;
    });

    // Clear form
    setManualEmail("");
    setManualFirstName("");
    setManualLastName("");
    setManualCompany("");
    setManualRole("");
    setManualEmailError("");

    toast.success("Contact added to import queue");
  }, [
    manualEmail,
    manualFirstName,
    manualLastName,
    manualCompany,
    manualRole,
    autoDedupe,
    dedupeStrategy,
  ]);

  // Update contact in session state
  const handleUpdateContact = useCallback(
    (id: string, field: keyof LocalContact, value: string) => {
      setSessionContacts((prev) =>
        prev.map((contact) => {
          if (contact.id !== id) return contact;
          // Re-create contact to re-validate
          return createLocalContact({ ...contact, [field]: value });
        })
      );
    },
    []
  );

  // Delete selected contacts from session
  const handleDeleteSelected = useCallback(() => {
    const idsToDelete = Array.from(selectedIds);
    if (idsToDelete.length === 0) return;

    setSessionContacts((prev) => prev.filter((c) => !selectedIds.has(c.id)));
    setSelectedIds(new Set());
    toast.success(`Removed ${idsToDelete.length} contacts`);
  }, [selectedIds]);

  // Export session contacts
  const handleExport = useCallback(() => {
    const csv = contactsToCSV(sessionContacts);
    downloadFile(csv, "contacts.csv", "text/csv");
    toast.success("Contacts exported successfully");
  }, [sessionContacts]);

  // Export selected contacts
  const handleExportSelected = useCallback(() => {
    const selected = sessionContacts.filter((c) => selectedIds.has(c.id));
    const csv = contactsToCSV(selected);
    downloadFile(csv, "selected-contacts.csv", "text/csv");
    toast.success(`Exported ${selected.length} contacts`);
  }, [sessionContacts, selectedIds]);

  // Save to global list - calls API then clears session
  const handleSaveToGlobal = useCallback(async () => {
    if (!accessToken) {
      toast.error("Please log in to save contacts");
      return;
    }

    if (sessionContacts.length === 0) {
      toast.error("No contacts to save");
      return;
    }

    const contactsData = sessionContacts.map((c) => ({
      email: c.email,
      firstName: c.firstName || undefined,
      lastName: c.lastName || undefined,
      company: c.company || undefined,
      role: c.role || undefined,
      tags: c.tags,
    }));

    try {
      setIsSubmitting(true);
      const result = await bulkImportContacts(accessToken, {
        contacts: contactsData,
        dedupeStrategy: dedupeStrategy,
      });

      // Clear session contacts after successful save
      setSessionContacts([]);
      setSelectedIds(new Set());

      toast.success(
        `Saved ${result.imported} contacts to global list (${result.duplicates} duplicates, ${result.skipped} skipped)`
      );
    } catch (error) {
      console.error("Failed to save contacts:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save contacts"
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [accessToken, sessionContacts, dedupeStrategy]);

  // Save as named list - calls API then clears session
  const handleSaveList = useCallback(async () => {
    if (!accessToken) {
      toast.error("Please log in to save lists");
      return;
    }

    if (!listName.trim()) {
      toast.error("Please enter a list name");
      return;
    }

    if (sessionContacts.length === 0) {
      toast.error("No contacts to save");
      return;
    }

    // First save contacts to global list
    const contactsData = sessionContacts.map((c) => ({
      email: c.email,
      firstName: c.firstName || undefined,
      lastName: c.lastName || undefined,
      company: c.company || undefined,
      role: c.role || undefined,
      tags: c.tags,
    }));

    try {
      setIsSubmitting(true);

      // Import contacts first
      const importResult = await bulkImportContacts(accessToken, {
        contacts: contactsData,
        dedupeStrategy: dedupeStrategy,
      });

      // Then create the named list (the API should link them)
      await createContactList(accessToken, {
        name: listName,
        description: listDescription || undefined,
        contactIds: [], // API will handle linking
      });

      toast.success(
        `Saved "${listName}" with ${importResult.imported} contacts`
      );

      // Clear session and modal
      setSessionContacts([]);
      setSelectedIds(new Set());
      setShowSaveModal(false);
      setListName("");
      setListDescription("");
    } catch (error) {
      console.error("Failed to save list:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save list"
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [accessToken, listName, listDescription, sessionContacts, dedupeStrategy]);

  const handleClearAll = useCallback(() => {
    setSessionContacts([]);
    setSelectedIds(new Set());
    setShowClearDialog(false);
    toast.success("All contacts cleared");
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === filteredContacts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredContacts.map((c) => c.id)));
    }
  }, [filteredContacts, selectedIds]);

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
          {/* Stepper */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <span className="font-medium text-foreground">Global Contacts</span>
            <ChevronRight className="size-4" />
            <Link
              href="/global-contacts/lists"
              className="hover:text-foreground transition-colors"
            >
              Manage Lists
            </Link>
          </nav>

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Global Contacts
              </h1>
              <p className="text-muted-foreground mt-1">
                Centralized repository of recipients. Import, clean, and map
                contacts here before using them in campaigns.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="ghost" size="sm">
                <HelpCircle className="size-4" />
                Help
              </Button>
              <Button variant="ghost" size="sm">
                <History className="size-4" />
                Import History
              </Button>
              <Button variant="secondary" size="sm" asChild>
                <Link href="/global-contacts/all">
                  <Users className="size-4" />
                  View All Contacts
                </Link>
              </Button>
              <Button size="sm" onClick={() => setActiveTab("manual")}>
                <UserPlus className="size-4" />
                New Contact
              </Button>
            </div>
          </div>

          {/* Main content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column - Import and Preview */}
            <div className="lg:col-span-2 space-y-6">
              {/* Import Card */}
              <Card className="rounded-2xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Import Contacts</CardTitle>
                      <CardDescription>
                        Add contacts via file upload, paste, or manual entry
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm">
                            <Settings2 className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <div className="px-2 py-1.5 text-sm font-medium">
                            Duplicate Strategy
                          </div>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDedupeStrategy("keepFirst")}
                          >
                            <Check
                              className={`size-4 mr-2 ${
                                dedupeStrategy === "keepFirst"
                                  ? "opacity-100"
                                  : "opacity-0"
                              }`}
                            />
                            Keep first occurrence
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDedupeStrategy("keepLast")}
                          >
                            <Check
                              className={`size-4 mr-2 ${
                                dedupeStrategy === "keepLast"
                                  ? "opacity-100"
                                  : "opacity-0"
                              }`}
                            />
                            Keep last occurrence
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDedupeStrategy("merge")}
                          >
                            <Check
                              className={`size-4 mr-2 ${
                                dedupeStrategy === "merge"
                                  ? "opacity-100"
                                  : "opacity-0"
                              }`}
                            />
                            Merge fields
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="mb-4">
                      <TabsTrigger value="upload">
                        <Upload className="size-4 mr-2" />
                        Upload
                      </TabsTrigger>
                      <TabsTrigger value="paste">
                        <ClipboardPaste className="size-4 mr-2" />
                        Paste
                      </TabsTrigger>
                      <TabsTrigger value="manual">
                        <UserPlus className="size-4 mr-2" />
                        Manual
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="upload" className="mt-0">
                      <div
                        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                          dragOver
                            ? "border-primary bg-primary/5"
                            : "border-muted"
                        }`}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragOver(true);
                        }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                      >
                        <Upload className="size-10 mx-auto mb-4 text-muted-foreground" />
                        <p className="font-medium mb-1">
                          Drag and drop your file here
                        </p>
                        <p className="text-sm text-muted-foreground mb-4">
                          Accepts .csv, .xlsx, .xls
                        </p>
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept=".csv,.xlsx,.xls"
                          onChange={handleFileInputChange}
                          className="hidden"
                          aria-label="Upload file"
                        />
                        <Button
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Browse Files
                        </Button>
                        <p className="text-xs text-muted-foreground mt-4">
                          <a href="#" className="underline">
                            Download sample CSV
                          </a>{" "}
                          to see the expected format
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="paste" className="mt-0">
                      <div className="space-y-4">
                        <Textarea
                          value={pasteText}
                          onChange={(e) => setPasteText(e.target.value)}
                          placeholder="Paste emails, CSV data, or any text containing email addresses...&#10;&#10;Examples:&#10;john@example.com, Jane Doe <jane@example.com>&#10;Or paste CSV rows directly"
                          className="min-h-[160px] font-mono text-sm"
                          aria-label="Paste email content"
                        />
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-muted-foreground">
                            We&apos;ll automatically extract email addresses and
                            names
                          </p>
                          <Button
                            onClick={handleParsePaste}
                            disabled={!pasteText.trim()}
                          >
                            <ClipboardPaste className="size-4" />
                            Parse & Add
                          </Button>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="manual" className="mt-0">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                          <Label htmlFor="email">
                            Email <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={manualEmail}
                            onChange={(e) => {
                              setManualEmail(e.target.value);
                              setManualEmailError("");
                            }}
                            onBlur={() => {
                              if (manualEmail && !isValidEmail(manualEmail)) {
                                setManualEmailError("Invalid email format");
                              }
                            }}
                            placeholder="contact@example.com"
                            className={
                              manualEmailError ? "border-destructive" : ""
                            }
                            aria-invalid={!!manualEmailError}
                            aria-describedby={
                              manualEmailError ? "email-error" : undefined
                            }
                          />
                          {manualEmailError && (
                            <p
                              id="email-error"
                              className="text-sm text-destructive mt-1"
                            >
                              {manualEmailError}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            value={manualFirstName}
                            onChange={(e) => setManualFirstName(e.target.value)}
                            placeholder="John"
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            value={manualLastName}
                            onChange={(e) => setManualLastName(e.target.value)}
                            placeholder="Doe"
                          />
                        </div>
                        <div>
                          <Label htmlFor="company">Company</Label>
                          <Input
                            id="company"
                            value={manualCompany}
                            onChange={(e) => setManualCompany(e.target.value)}
                            placeholder="Acme Inc"
                          />
                        </div>
                        <div>
                          <Label htmlFor="role">Role</Label>
                          <Input
                            id="role"
                            value={manualRole}
                            onChange={(e) => setManualRole(e.target.value)}
                            placeholder="Product Manager"
                          />
                        </div>
                        <div className="sm:col-span-2 flex justify-end">
                          <Button onClick={handleAddManual}>
                            <UserPlus className="size-4" />
                            Add Contact
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Preview Table */}
              <Card className="rounded-2xl">
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle>Contact Preview</CardTitle>
                      <CardDescription className="mt-1">
                        Contacts imported in this session. Save to add them to
                        your global contact database.
                      </CardDescription>
                    </div>
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
                          <div className="px-2 py-1.5 text-sm font-medium">
                            Filter by Status
                          </div>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setStatusFilter("all")}
                          >
                            <Check
                              className={`size-4 mr-2 ${
                                statusFilter === "all"
                                  ? "opacity-100"
                                  : "opacity-0"
                              }`}
                            />
                            All
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setStatusFilter("valid")}
                          >
                            <Check
                              className={`size-4 mr-2 ${
                                statusFilter === "valid"
                                  ? "opacity-100"
                                  : "opacity-0"
                              }`}
                            />
                            Valid only
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setStatusFilter("invalid")}
                          >
                            <Check
                              className={`size-4 mr-2 ${
                                statusFilter === "invalid"
                                  ? "opacity-100"
                                  : "opacity-0"
                              }`}
                            />
                            Invalid only
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setStatusFilter("duplicate")}
                          >
                            <Check
                              className={`size-4 mr-2 ${
                                statusFilter === "duplicate"
                                  ? "opacity-100"
                                  : "opacity-0"
                              }`}
                            />
                            Duplicates only
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {sessionContacts.length === 0 ? (
                    <EmptyState
                      onUpload={() => {
                        setActiveTab("upload");
                        fileInputRef.current?.click();
                      }}
                      onAddManual={() => setActiveTab("manual")}
                    />
                  ) : (
                    <>
                      {/* Bulk actions */}
                      {selectedIds.size > 0 && (
                        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg mb-4">
                          <span className="text-sm font-medium">
                            {selectedIds.size} selected
                          </span>
                          <div className="flex-1" />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleExportSelected}
                          >
                            <Download className="size-4" />
                            Export
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={handleDeleteSelected}
                          >
                            <Trash2 className="size-4" />
                            Remove
                          </Button>
                        </div>
                      )}

                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-10">
                              <Checkbox
                                checked={
                                  selectedIds.size ===
                                    filteredContacts.length &&
                                  filteredContacts.length > 0
                                }
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
                          {filteredContacts.map((contact) => (
                            <TableRow
                              key={contact.id}
                              data-state={
                                selectedIds.has(contact.id)
                                  ? "selected"
                                  : undefined
                              }
                            >
                              <TableCell>
                                <Checkbox
                                  checked={selectedIds.has(contact.id)}
                                  onCheckedChange={() =>
                                    toggleSelect(contact.id)
                                  }
                                  aria-label={`Select ${contact.email}`}
                                />
                              </TableCell>
                              <TableCell>
                                <EditableCell
                                  value={contact.email}
                                  type="email"
                                  onSave={(v) =>
                                    handleUpdateContact(contact.id, "email", v)
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <EditableCell
                                  value={contact.firstName ?? ""}
                                  onSave={(v) =>
                                    handleUpdateContact(
                                      contact.id,
                                      "firstName",
                                      v
                                    )
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <EditableCell
                                  value={contact.lastName ?? ""}
                                  onSave={(v) =>
                                    handleUpdateContact(
                                      contact.id,
                                      "lastName",
                                      v
                                    )
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <EditableCell
                                  value={contact.company ?? ""}
                                  onSave={(v) =>
                                    handleUpdateContact(
                                      contact.id,
                                      "company",
                                      v
                                    )
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <StatusBadge
                                  status={contact.status}
                                  errors={contact.validationErrors}
                                />
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon-sm">
                                      <MoreHorizontal className="size-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => toggleSelect(contact.id)}
                                    >
                                      <Check className="size-4 mr-2" />
                                      {selectedIds.has(contact.id)
                                        ? "Deselect"
                                        : "Select"}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-destructive focus:text-destructive"
                                      onClick={() => {
                                        setSessionContacts((prev) =>
                                          prev.filter(
                                            (c) => c.id !== contact.id
                                          )
                                        );
                                        toast.success("Contact removed");
                                      }}
                                    >
                                      <Trash2 className="size-4 mr-2" />
                                      Remove
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>

                      {filteredContacts.length === 0 &&
                        sessionContacts.length > 0 && (
                          <div className="text-center py-8 text-muted-foreground">
                            No contacts match your search criteria
                          </div>
                        )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right column - Summary */}
            <div className="space-y-6">
              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle>Session Summary</CardTitle>
                  <CardDescription>
                    Contacts imported in this session
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted rounded-xl">
                      <p className="text-2xl font-semibold">{stats.total}</p>
                      <p className="text-sm text-muted-foreground">Total</p>
                    </div>
                    <div className="p-4 bg-muted rounded-xl">
                      <p className="text-2xl font-semibold">{stats.valid}</p>
                      <p className="text-sm text-muted-foreground">Valid</p>
                    </div>
                    <div className="p-4 bg-muted rounded-xl">
                      <p className="text-2xl font-semibold">{stats.invalid}</p>
                      <p className="text-sm text-muted-foreground">Invalid</p>
                    </div>
                    <div className="p-4 bg-muted rounded-xl">
                      <p className="text-2xl font-semibold">
                        {stats.duplicate}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Duplicates
                      </p>
                    </div>
                  </div>

                  {stats.topDomains.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Top Domains</p>
                      <div className="space-y-2">
                        {stats.topDomains.map((d) => (
                          <div
                            key={d.domain}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-muted-foreground truncate">
                              {d.domain}
                            </span>
                            <span className="font-medium">{d.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle>Quick Filters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant={
                      statusFilter === "invalid" ? "secondary" : "outline"
                    }
                    className="w-full justify-start"
                    onClick={() =>
                      setStatusFilter(
                        statusFilter === "invalid" ? "all" : "invalid"
                      )
                    }
                  >
                    <AlertCircle className="size-4" />
                    Show Invalid Only
                  </Button>
                  <Button
                    variant={
                      statusFilter === "duplicate" ? "secondary" : "outline"
                    }
                    className="w-full justify-start"
                    onClick={() =>
                      setStatusFilter(
                        statusFilter === "duplicate" ? "all" : "duplicate"
                      )
                    }
                  >
                    <Copy className="size-4" />
                    Show Duplicates
                  </Button>
                  <Select value={domainFilter} onValueChange={setDomainFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by domain" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All domains</SelectItem>
                      {uniqueDomains.map((domain) => (
                        <SelectItem key={domain} value={domain}>
                          {domain}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    className="w-full"
                    onClick={() => setShowSaveModal(true)}
                    disabled={sessionContacts.length === 0}
                  >
                    <Save className="size-4" />
                    Create Named List
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleSaveToGlobal}
                    disabled={sessionContacts.length === 0 || isSubmitting}
                  >
                    <Save className="size-4" />
                    Save Contacts
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleExport}
                    disabled={sessionContacts.length === 0}
                  >
                    <Download className="size-4" />
                    Export to CSV
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full text-destructive hover:text-destructive"
                    onClick={() => setShowClearDialog(true)}
                    disabled={sessionContacts.length === 0}
                  >
                    <Trash2 className="size-4" />
                    Discard All
                  </Button>
                </CardContent>
              </Card>

              <div className="p-4 bg-muted rounded-xl">
                <p className="text-sm text-muted-foreground">
                  <strong>Reminder:</strong> Always include an unsubscribe
                  footer when sending marketing emails.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Column Mapping Modal */}
        <Dialog open={showMappingModal} onOpenChange={setShowMappingModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Map Columns</DialogTitle>
              <DialogDescription>
                Assign each column from your file to a contact field. Columns
                mapped to &quot;Ignore&quot; will be skipped.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 max-h-[400px] overflow-y-auto py-4">
              {parsedColumns.map((column, index) => (
                <ColumnMappingRow
                  key={index}
                  column={column}
                  onMappingChange={(mappedTo) => {
                    setParsedColumns((prev) =>
                      prev.map((c, i) => (i === index ? { ...c, mappedTo } : c))
                    );
                  }}
                />
              ))}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowMappingModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={confirmMapping}>Confirm & Add</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Save List Modal */}
        <Dialog open={showSaveModal} onOpenChange={setShowSaveModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save as Named List</DialogTitle>
              <DialogDescription>
                Save {sessionContacts.length} contacts to a named list for use
                across campaigns.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="listName">List Name</Label>
              <Input
                id="listName"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                placeholder="e.g., Q4 Product Launch Leads"
                className="mt-2"
              />
              <div className="mt-4">
                <Label htmlFor="listDescription">Description (optional)</Label>
                <Input
                  id="listDescription"
                  value={listDescription}
                  onChange={(e) => setListDescription(e.target.value)}
                  placeholder="e.g., Leads from recent webinar"
                  className="mt-2"
                />
              </div>
              {sessionContacts.length > 0 && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">
                    Preview (first 5 contacts):
                  </p>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {sessionContacts.slice(0, 5).map((c) => (
                      <p key={c.id}>
                        Hi {c.firstName || "{{firstName}}"} — {c.email}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSaveModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveList} disabled={isSubmitting}>
                Confirm Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Clear All Confirmation */}
        <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear all contacts?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove all {sessionContacts.length} contacts from this
                import session. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleClearAll}>
                Clear All
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}

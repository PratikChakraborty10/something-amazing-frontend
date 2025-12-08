"use client";

import { useState } from "react";
import {
  Key,
  Plus,
  Copy,
  Check,
  Eye,
  EyeOff,
  Trash2,
  MoreHorizontal,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: Date;
  lastUsed?: Date;
}

const mockApiKeys: ApiKey[] = [
  {
    id: "key_1",
    name: "Production API Key",
    key: "sk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    createdAt: new Date("2024-10-15"),
    lastUsed: new Date("2024-12-05"),
  },
  {
    id: "key_2",
    name: "Development Key",
    key: "sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    createdAt: new Date("2024-11-20"),
    lastUsed: new Date("2024-12-01"),
  },
];

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(mockApiKeys);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null);
  const [newKeyName, setNewKeyName] = useState("");
  const [showKey, setShowKey] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const handleCreate = () => {
    if (!newKeyName.trim()) {
      toast.error("Please enter a name for the API key");
      return;
    }

    const newKey: ApiKey = {
      id: `key_${Date.now()}`,
      name: newKeyName,
      key: `sk_live_${Math.random().toString(36).substring(2, 30)}`,
      createdAt: new Date(),
    };

    setApiKeys((prev) => [...prev, newKey]);
    setNewKeyName("");
    setCreateDialogOpen(false);
    toast.success("API key created successfully");
  };

  const handleDelete = () => {
    if (selectedKey) {
      setApiKeys((prev) => prev.filter((k) => k.id !== selectedKey.id));
      toast.success("API key deleted");
      setDeleteDialogOpen(false);
      setSelectedKey(null);
    }
  };

  const handleCopy = async (key: string, id: string) => {
    await navigator.clipboard.writeText(key);
    setCopied(id);
    toast.success("API key copied to clipboard");
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
            <Key className="size-5" />
            API Keys
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage API keys for programmatic access
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="size-4" />
          Create API Key
        </Button>
      </div>

      {/* API Keys Table */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Your API Keys</CardTitle>
          <CardDescription>
            Use these keys to authenticate API requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {apiKeys.length === 0 ? (
            <div className="text-center py-12">
              <Key className="size-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No API keys yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first API key to get started
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="size-4" />
                Create API Key
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((apiKey) => (
                  <TableRow key={apiKey.id}>
                    <TableCell className="font-medium">{apiKey.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {showKey === apiKey.id
                            ? apiKey.key
                            : `${apiKey.key.substring(0, 12)}...`}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() =>
                            setShowKey(showKey === apiKey.id ? null : apiKey.id)
                          }
                        >
                          {showKey === apiKey.id ? (
                            <EyeOff className="size-4" />
                          ) : (
                            <Eye className="size-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleCopy(apiKey.key, apiKey.id)}
                        >
                          {copied === apiKey.id ? (
                            <Check className="size-4" />
                          ) : (
                            <Copy className="size-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(apiKey.createdAt)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {apiKey.lastUsed ? formatDate(apiKey.lastUsed) : "Never"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => {
                              setSelectedKey(apiKey);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="size-4 mr-2" />
                            Delete Key
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

      {/* Security Notice */}
      <Card className="rounded-2xl bg-muted/30">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Key className="size-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-medium mb-1">Keep your API keys secure</p>
              <p className="text-sm text-muted-foreground">
                Never share your API keys in public repositories or client-side
                code. If you believe a key has been compromised, delete it
                immediately and create a new one.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create API Key</DialogTitle>
            <DialogDescription>
              Give your API key a name to help you identify it later
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="keyName">Key Name</Label>
            <Input
              id="keyName"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="e.g., Production Server"
              className="mt-1.5"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create Key</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete API Key?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{selectedKey?.name}". Any
              applications using this key will no longer be able to authenticate.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Delete Key
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

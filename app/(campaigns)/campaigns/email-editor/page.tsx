"use client";

import { useCallback, useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import LinkExtension from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import {
  ChevronRight,
  Bold,
  Italic,
  UnderlineIcon,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Link2,
  ImageIcon,
  Undo,
  Redo,
  Code,
  Quote,
  Minus,
  Eye,
  ArrowRight,
  ArrowLeft,
  Smartphone,
  Monitor,
  User,
  Building,
  Mail,
  LayoutTemplate,
  Sparkles,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useAuthStore } from "@/lib/auth-store";
import {
  getCampaign,
  updateCampaign,
  getEmailTemplates,
  getEmailTemplate,
  Campaign,
  EmailTemplate,
} from "@/lib/campaigns-api";

// Personalization tokens
const personalizationTokens = [
  { label: "First Name", value: "{{firstName}}", icon: User },
  { label: "Last Name", value: "{{lastName}}", icon: User },
  { label: "Email", value: "{{email}}", icon: Mail },
  { label: "Company", value: "{{company}}", icon: Building },
];

// Toolbar button component
interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  tooltip: string;
  children: React.ReactNode;
}

function ToolbarButton({
  onClick,
  isActive,
  disabled,
  tooltip,
  children,
}: ToolbarButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Toggle
          size="sm"
          pressed={isActive}
          onPressedChange={onClick}
          disabled={disabled}
          className="size-8 p-0"
        >
          {children}
        </Toggle>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}

// Editor toolbar component
interface EditorToolbarProps {
  editor: ReturnType<typeof useEditor> | null;
  onInsertLink: () => void;
  onInsertImage: () => void;
}

function EditorToolbar({ editor, onInsertLink, onInsertImage }: EditorToolbarProps) {
  if (!editor) return null;

  const insertToken = (token: string) => {
    editor.chain().focus().insertContent(token).run();
  };

  return (
    <div className="border-b bg-muted/30 p-2 flex flex-wrap items-center gap-1">
      {/* History */}
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        tooltip="Undo"
      >
        <Undo className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        tooltip="Redo"
      >
        <Redo className="size-4" />
      </ToolbarButton>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Text formatting */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive("bold")}
        tooltip="Bold (Ctrl+B)"
      >
        <Bold className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive("italic")}
        tooltip="Italic (Ctrl+I)"
      >
        <Italic className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive("underline")}
        tooltip="Underline (Ctrl+U)"
      >
        <UnderlineIcon className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive("strike")}
        tooltip="Strikethrough"
      >
        <Strikethrough className="size-4" />
      </ToolbarButton>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Headings */}
      <Select
        value={
          editor.isActive("heading", { level: 1 })
            ? "h1"
            : editor.isActive("heading", { level: 2 })
            ? "h2"
            : editor.isActive("heading", { level: 3 })
            ? "h3"
            : "paragraph"
        }
        onValueChange={(value) => {
          if (value === "paragraph") {
            editor.chain().focus().setParagraph().run();
          } else {
            const level = parseInt(value.replace("h", "")) as 1 | 2 | 3;
            editor.chain().focus().toggleHeading({ level }).run();
          }
        }}
      >
        <SelectTrigger className="w-28 h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="paragraph">Paragraph</SelectItem>
          <SelectItem value="h1">Heading 1</SelectItem>
          <SelectItem value="h2">Heading 2</SelectItem>
          <SelectItem value="h3">Heading 3</SelectItem>
        </SelectContent>
      </Select>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Alignment */}
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        isActive={editor.isActive({ textAlign: "left" })}
        tooltip="Align left"
      >
        <AlignLeft className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        isActive={editor.isActive({ textAlign: "center" })}
        tooltip="Align center"
      >
        <AlignCenter className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        isActive={editor.isActive({ textAlign: "right" })}
        tooltip="Align right"
      >
        <AlignRight className="size-4" />
      </ToolbarButton>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Lists */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive("bulletList")}
        tooltip="Bullet list"
      >
        <List className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive("orderedList")}
        tooltip="Numbered list"
      >
        <ListOrdered className="size-4" />
      </ToolbarButton>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Block elements */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive("blockquote")}
        tooltip="Quote"
      >
        <Quote className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        isActive={editor.isActive("codeBlock")}
        tooltip="Code block"
      >
        <Code className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        tooltip="Horizontal rule"
      >
        <Minus className="size-4" />
      </ToolbarButton>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Link & Image */}
      <ToolbarButton
        onClick={onInsertLink}
        isActive={editor.isActive("link")}
        tooltip="Insert link"
      >
        <Link2 className="size-4" />
      </ToolbarButton>
      <ToolbarButton onClick={onInsertImage} tooltip="Insert image">
        <ImageIcon className="size-4" />
      </ToolbarButton>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Personalization */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1">
            <User className="size-4" />
            Personalize
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {personalizationTokens.map((token) => (
            <DropdownMenuItem
              key={token.value}
              onClick={() => insertToken(token.value)}
            >
              <token.icon className="size-4 mr-2" />
              {token.label}
              <span className="ml-auto text-xs text-muted-foreground">
                {token.value}
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function EmailEditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignId = searchParams.get("id");
  const { accessToken } = useAuthStore();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [showPreview, setShowPreview] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [templatesOpen, setTemplatesOpen] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg",
        },
      }),
      Placeholder.configure({
        placeholder: "Start writing your email content here...",
      }),
      TextStyle,
      Color,
    ],
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none min-h-[400px] px-8 py-6",
      },
    },
  });

  // Fetch campaign and templates
  useEffect(() => {
    async function fetchData() {
      if (!accessToken || !campaignId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const [campaignData, templatesData] = await Promise.all([
          getCampaign(accessToken, campaignId),
          getEmailTemplates(accessToken),
        ]);

        setCampaign(campaignData);
        setTemplates(templatesData.data);

        // Set editor content if campaign has content
        if (campaignData.htmlContent && editor) {
          editor.commands.setContent(campaignData.htmlContent);
        } else if (editor) {
          // Default content
          editor.commands.setContent(`
            <h1>Hello {{firstName}}! 👋</h1>
            <p>Welcome to our newsletter. We're excited to share what's new with you.</p>
            <h2>What's New</h2>
            <p>Here are the highlights:</p>
            <ul>
              <li>New feature launches</li>
              <li>Product improvements</li>
              <li>Upcoming events</li>
            </ul>
            <p>We hope you enjoy the updates!</p>
            <p>Best regards,<br/>The Team</p>
          `);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("Failed to load campaign data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [accessToken, campaignId, editor]);

  const handleInsertLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes("link").href || "";
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to);

    setLinkUrl(previousUrl);
    setLinkText(selectedText);
    setLinkDialogOpen(true);
  }, [editor]);

  const confirmLink = useCallback(() => {
    if (!editor || !linkUrl) return;

    if (linkText && editor.state.selection.empty) {
      editor
        .chain()
        .focus()
        .insertContent(`<a href="${linkUrl}">${linkText}</a>`)
        .run();
    } else {
      editor.chain().focus().setLink({ href: linkUrl }).run();
    }

    setLinkDialogOpen(false);
    setLinkUrl("");
    setLinkText("");
  }, [editor, linkUrl, linkText]);

  const handleInsertImage = useCallback(() => {
    setImageDialogOpen(true);
  }, []);

  const confirmImage = useCallback(() => {
    if (!editor || !imageUrl) return;

    editor
      .chain()
      .focus()
      .setImage({ src: imageUrl, alt: imageAlt || "Image" })
      .run();

    setImageDialogOpen(false);
    setImageUrl("");
    setImageAlt("");
  }, [editor, imageUrl, imageAlt]);

  const handleBack = () => {
    if (campaignId) {
      router.push(`/campaigns/create-campaign?edit=${campaignId}`);
    } else {
      router.push("/campaigns/create-campaign");
    }
  };

  const handleSaveDraft = async () => {
    if (!editor || !accessToken || !campaignId) return;

    try {
      setIsSaving(true);
      await updateCampaign(accessToken, campaignId, {
        htmlContent: editor.getHTML(),
      });
      toast.success("Draft saved");
    } catch (error) {
      console.error("Failed to save draft:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save draft");
    } finally {
      setIsSaving(false);
    }
  };

  const handleContinue = async () => {
    if (!editor || !accessToken || !campaignId) return;

    try {
      setIsSaving(true);
      await updateCampaign(accessToken, campaignId, {
        htmlContent: editor.getHTML(),
      });
      toast.success("Email saved");
      router.push(`/campaigns/review?id=${campaignId}`);
    } catch (error) {
      console.error("Failed to save:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const getPreviewHtml = () => {
    if (!editor) return "";

    return editor
      .getHTML()
      .replace(/\{\{firstName\}\}/g, "John")
      .replace(/\{\{lastName\}\}/g, "Doe")
      .replace(/\{\{email\}\}/g, "john@example.com")
      .replace(/\{\{company\}\}/g, "Acme Inc");
  };

  const handleUseTemplate = useCallback(
    async (template: EmailTemplate) => {
      if (!editor || !accessToken) return;

      try {
        // Fetch full template with content
        const fullTemplate = await getEmailTemplate(accessToken, template.id);
        if (fullTemplate.content) {
          editor.commands.setContent(fullTemplate.content);
          setTemplatesOpen(false);
          toast.success(`Template "${template.name}" applied`);
        }
      } catch (error) {
        console.error("Failed to load template:", error);
        toast.error("Failed to load template");
      }
    },
    [editor, accessToken]
  );

  if (!campaignId) {
    return (
      <div className="min-h-full bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Card className="rounded-2xl">
            <CardContent className="py-16 text-center">
              <Mail className="size-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No campaign selected</h3>
              <p className="text-muted-foreground mb-4">
                Please create a campaign first
              </p>
              <Button asChild>
                <Link href="/campaigns/create-campaign">Create Campaign</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-full bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-16">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-full bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Stepper */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link
              href="/campaigns"
              className="hover:text-foreground transition-colors"
            >
              Campaigns
            </Link>
            <ChevronRight className="size-4" />
            <Link
              href="/campaigns/create-campaign"
              className="hover:text-foreground transition-colors"
            >
              Create Campaign
            </Link>
            <ChevronRight className="size-4" />
            <span className="font-medium text-foreground">Design Email</span>
          </nav>

          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Design Your Email
              </h1>
              <p className="text-muted-foreground mt-1">
                Create and customize your email content
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Sheet open={templatesOpen} onOpenChange={setTemplatesOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline">
                    <LayoutTemplate className="size-4" />
                    Templates
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-[400px] sm:w-[540px]">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                      <LayoutTemplate className="size-5" />
                      Email Templates
                    </SheetTitle>
                    <SheetDescription>
                      Choose a pre-built template to get started quickly.
                    </SheetDescription>
                  </SheetHeader>
                  <ScrollArea className="h-[calc(100vh-140px)] mt-6 pr-4">
                    <div className="space-y-4">
                      {templates.map((template) => (
                        <Card
                          key={template.id}
                          className="group cursor-pointer hover:border-primary/50 transition-colors"
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-base">
                                  {template.name}
                                </CardTitle>
                                <Badge variant="secondary" className="mt-1">
                                  {template.category}
                                </Badge>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => handleUseTemplate(template)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                Use Template
                              </Button>
                            </div>
                            <CardDescription className="mt-2">
                              {template.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="flex gap-1">
                              {template.tags.map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                      {templates.length === 0 && (
                        <div className="border-2 border-dashed rounded-xl p-6 text-center">
                          <Sparkles className="size-8 mx-auto mb-3 text-muted-foreground" />
                          <p className="font-medium">No templates available</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Templates will appear here when available
                          </p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </SheetContent>
              </Sheet>
              <Button
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
              >
                <Eye className="size-4" />
                {showPreview ? "Hide Preview" : "Preview"}
              </Button>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                ✓
              </div>
              <span className="text-sm text-muted-foreground">
                Campaign Details
              </span>
            </div>
            <div className="flex-1 h-px bg-primary" />
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                2
              </div>
              <span className="text-sm font-medium">Design Email</span>
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

          {/* Campaign Info Banner */}
          {campaign && (
            <Card className="rounded-xl mb-6">
              <CardContent className="py-4">
                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <div>
                    <span className="text-muted-foreground">Campaign:</span>{" "}
                    <span className="font-medium">{campaign.name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Subject:</span>{" "}
                    <span className="font-medium">{campaign.subject}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Recipients:</span>{" "}
                    <span className="font-medium">
                      {campaign.recipients.toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div
            className={`grid gap-6 ${
              showPreview ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
            }`}
          >
            {/* Editor */}
            <Card className="rounded-2xl overflow-hidden">
              <CardHeader className="pb-0">
                <CardTitle>Email Content</CardTitle>
                <CardDescription>
                  Use the toolbar to format your email. Insert personalization
                  tokens to customize for each recipient.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 mt-4">
                <div className="border rounded-xl overflow-hidden mx-6 mb-6">
                  <EditorToolbar
                    editor={editor}
                    onInsertLink={handleInsertLink}
                    onInsertImage={handleInsertImage}
                  />
                  <EditorContent editor={editor} />
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            {showPreview && (
              <Card className="rounded-2xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Preview</CardTitle>
                    <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                      <Button
                        variant={previewMode === "desktop" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setPreviewMode("desktop")}
                        className="h-7 px-2"
                      >
                        <Monitor className="size-4" />
                      </Button>
                      <Button
                        variant={previewMode === "mobile" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setPreviewMode("mobile")}
                        className="h-7 px-2"
                      >
                        <Smartphone className="size-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription>
                    See how your email looks with sample data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className={`border rounded-xl bg-white overflow-hidden mx-auto transition-all ${
                      previewMode === "mobile" ? "max-w-[375px]" : "w-full"
                    }`}
                  >
                    {/* Email header preview */}
                    <div className="border-b px-4 py-3 bg-muted/30">
                      <p className="text-xs text-muted-foreground">From</p>
                      <p className="text-sm font-medium">
                        {campaign?.senderName} &lt;{campaign?.senderEmail}&gt;
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Subject
                      </p>
                      <p className="text-sm font-medium">
                        {campaign?.subject}
                      </p>
                    </div>
                    {/* Email body preview */}
                    <div
                      className="p-4 ProseMirror max-w-none"
                      dangerouslySetInnerHTML={{ __html: getPreviewHtml() }}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6">
            <Button variant="ghost" onClick={handleBack}>
              <ArrowLeft className="size-4" />
              Back to Details
            </Button>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving}>
                {isSaving && <Loader2 className="size-4 mr-2 animate-spin" />}
                Save as Draft
              </Button>
              <Button onClick={handleContinue} disabled={isSaving}>
                {isSaving && <Loader2 className="size-4 mr-2 animate-spin" />}
                Continue to Review
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Link Dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
            <DialogDescription>
              Add a link to your email content
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="linkText">Link Text</Label>
              <Input
                id="linkText"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="Click here"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="linkUrl">URL</Label>
              <Input
                id="linkUrl"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                className="mt-1.5"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmLink}>Insert Link</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Image</DialogTitle>
            <DialogDescription>Add an image to your email</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="imageAlt">Alt Text</Label>
              <Input
                id="imageAlt"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                placeholder="Describe the image"
                className="mt-1.5"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImageDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmImage}>Insert Image</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}

export default function EmailEditorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-full bg-background">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex items-center justify-center py-16">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          </div>
        </div>
      }
    >
      <EmailEditorContent />
    </Suspense>
  );
}

"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Type,
  Eye,
  ArrowRight,
  ArrowLeft,
  Smartphone,
  Monitor,
  Send,
  User,
  Building,
  Mail,
  Palette,
  LayoutTemplate,
  Sparkles,
  FileText,
  Gift,
  X,
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

// Personalization tokens
const personalizationTokens = [
  { label: "First Name", value: "{{firstName}}", icon: User },
  { label: "Last Name", value: "{{lastName}}", icon: User },
  { label: "Email", value: "{{email}}", icon: Mail },
  { label: "Company", value: "{{company}}", icon: Building },
];

// Email Template Type - easily extendable for backend integration
interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail?: string;
  content: string;
  tags: string[];
}

// Pre-built email templates
// In the future, these will come from the backend API
const emailTemplates: EmailTemplate[] = [
  {
    id: "welcome-email",
    name: "Welcome Email",
    description: "A warm welcome email for new subscribers or customers",
    category: "Onboarding",
    tags: ["welcome", "onboarding", "new-user"],
    content: `
      <h1>Welcome aboard, {{firstName}}! 🎉</h1>
      <p>We're thrilled to have you join our community. You've made a great decision, and we can't wait to show you what's possible.</p>
      
      <h2>Here's what you can do next:</h2>
      <ol>
        <li><strong>Complete your profile</strong> — Add your details to personalize your experience</li>
        <li><strong>Explore our features</strong> — Take a tour of everything we offer</li>
        <li><strong>Connect with the community</strong> — Join discussions and meet other members</li>
      </ol>
      
      <p>Need help getting started? Our support team is here for you 24/7. Just reply to this email or visit our help center.</p>
      
      <p>Welcome to the family!</p>
      <p>Best regards,<br/><strong>The Team</strong></p>
    `,
  },
  {
    id: "product-announcement",
    name: "Product Announcement",
    description: "Announce new features, products, or updates to your audience",
    category: "Marketing",
    tags: ["product", "announcement", "launch"],
    content: `
      <h1>Exciting News: Introducing Our Latest Feature! ✨</h1>
      <p>Hi {{firstName}},</p>
      <p>We've been working hard on something special, and today we're excited to share it with you.</p>
      
      <h2>What's New</h2>
      <p>Our new feature is designed to help you work smarter, not harder. Here's what you can expect:</p>
      <ul>
        <li><strong>Save time</strong> — Automate repetitive tasks with one click</li>
        <li><strong>Stay organized</strong> — Keep everything in one place</li>
        <li><strong>Collaborate better</strong> — Share with your team instantly</li>
      </ul>
      
      <p><a href="#">Try it now →</a></p>
      
      <p>As always, we'd love to hear your feedback. Let us know what you think!</p>
      
      <p>Thanks for being part of our journey.</p>
      <p>Best,<br/><strong>The Product Team</strong></p>
    `,
  },
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

export default function EmailEditorPage() {
  const router = useRouter();
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [showPreview, setShowPreview] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [templatesOpen, setTemplatesOpen] = useState(false);

  // Mock campaign data (would come from previous step in real app)
  const campaignData = {
    name: "December Newsletter",
    subject: "Your December update is here!",
    preheader: "Check out what's new this month",
    recipientCount: 5420,
  };

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
    content: `
      <h1>Hello {{firstName}}! 👋</h1>
      <p>Welcome to our December newsletter. We're excited to share what's new with you this month.</p>
      <h2>What's New</h2>
      <p>Here are the highlights from the past month:</p>
      <ul>
        <li>New feature launches</li>
        <li>Product improvements</li>
        <li>Upcoming events</li>
      </ul>
      <p>We hope you enjoy the updates!</p>
      <p>Best regards,<br/>The Team</p>
    `,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none min-h-[400px] px-8 py-6",
      },
    },
  });

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
    router.push("/create-campaign");
  };

  const handleContinue = () => {
    if (!editor) return;

    const htmlContent = editor.getHTML();
    console.log("Email HTML:", htmlContent);

    toast.success("Email saved successfully");
    router.push("/campaigns/review");
  };

  const getPreviewHtml = () => {
    if (!editor) return "";

    // Replace personalization tokens with sample data
    return editor
      .getHTML()
      .replace(/\{\{firstName\}\}/g, "John")
      .replace(/\{\{lastName\}\}/g, "Doe")
      .replace(/\{\{email\}\}/g, "john@example.com")
      .replace(/\{\{company\}\}/g, "Acme Inc");
  };

  const handleUseTemplate = useCallback(
    (template: EmailTemplate) => {
      if (!editor) return;

      editor.commands.setContent(template.content);
      setTemplatesOpen(false);
      toast.success(`Template "${template.name}" applied`);
    },
    [editor]
  );

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
              href="/create-campaign"
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
                      Choose a pre-built template to get started quickly. You can customize it after importing.
                    </SheetDescription>
                  </SheetHeader>
                  <ScrollArea className="h-[calc(100vh-140px)] mt-6 pr-4">
                    <div className="space-y-4">
                      {emailTemplates.map((template) => (
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
                            <div className="border rounded-lg p-4 bg-muted/30 max-h-[200px] overflow-hidden relative">
                              <div
                                className="prose prose-sm max-w-none text-xs"
                                dangerouslySetInnerHTML={{
                                  __html: template.content
                                    .replace(/\{\{firstName\}\}/g, "John")
                                    .replace(/\{\{lastName\}\}/g, "Doe"),
                                }}
                              />
                              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-muted/80 to-transparent" />
                            </div>
                            <div className="flex gap-1 mt-3">
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

                      {/* Placeholder for more templates */}
                      <div className="border-2 border-dashed rounded-xl p-6 text-center">
                        <Sparkles className="size-8 mx-auto mb-3 text-muted-foreground" />
                        <p className="font-medium">More templates coming soon</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          We're adding new templates regularly
                        </p>
                      </div>
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
          <Card className="rounded-xl mb-6">
            <CardContent className="py-4">
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div>
                  <span className="text-muted-foreground">Campaign:</span>{" "}
                  <span className="font-medium">{campaignData.name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Subject:</span>{" "}
                  <span className="font-medium">{campaignData.subject}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Recipients:</span>{" "}
                  <span className="font-medium">
                    {campaignData.recipientCount.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

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
                        Your Company &lt;hello@company.com&gt;
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Subject
                      </p>
                      <p className="text-sm font-medium">
                        {campaignData.subject}
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
              <Button variant="outline" onClick={() => toast.info("Draft saved")}>
                Save as Draft
              </Button>
              <Button onClick={handleContinue}>
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

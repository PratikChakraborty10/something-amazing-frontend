"use client";

import { motion, AnimatePresence } from "motion/react";
import { useInView } from "motion/react";
import { useRef, useState } from "react";
import { Mail, Users, Tag, Upload, ListFilter, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

type DemoTab = "editor" | "contacts";

export function ProductDemo() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeTab, setActiveTab] = useState<DemoTab>("editor");

  return (
    <section id="demo" className="py-24 px-4 bg-muted/30" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] as const }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            See it in action
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From managing contacts to crafting beautiful emails — everything you need in one place.
          </p>
        </motion.div>

        {/* Tab toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.4, 0, 0.2, 1] as const }}
          className="flex justify-center gap-2 mb-8"
        >
          <Button
            variant={activeTab === "contacts" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("contacts")}
            className="gap-2"
          >
            <Users className="size-4" />
            Contact Management
          </Button>
          <Button
            variant={activeTab === "editor" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("editor")}
            className="gap-2"
          >
            <Mail className="size-4" />
            Email Editor
          </Button>
        </motion.div>

        {/* Product mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.4, 0, 0.2, 1] as const }}
          className="relative"
        >
          <div className="max-w-4xl mx-auto">
            {/* Browser chrome */}
            <div className="bg-card border rounded-t-xl p-3 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="size-3 rounded-full bg-red-400" />
                <div className="size-3 rounded-full bg-yellow-400" />
                <div className="size-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 bg-muted rounded-md px-3 py-1.5 text-xs text-muted-foreground text-center">
                {activeTab === "editor"
                  ? `${process.env.NEXT_PUBLIC_WEBSITE_BASE_URL}/campaigns/email-editor`
                  : `${process.env.NEXT_PUBLIC_WEBSITE_BASE_URL}/global-contacts`}
              </div>
            </div>

            {/* Content area */}
            <div className="bg-card border-x border-b rounded-b-xl overflow-hidden">
              <AnimatePresence mode="wait">
                {activeTab === "editor" ? (
                  <motion.div
                    key="editor"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="aspect-[16/10] bg-gradient-to-br from-muted/50 to-muted/30 p-6 md:p-8"
                  >
                    {/* Email Editor UI */}
                    <div className="h-full flex flex-col gap-4">
                      {/* Toolbar */}
                      <div className="flex items-center gap-2 p-3 bg-background rounded-lg border">
                        {["B", "I", "U", "🔗", "📷", "≡"].map((btn, i) => (
                          <div
                            key={i}
                            className="size-8 rounded bg-muted flex items-center justify-center text-xs font-medium"
                          >
                            {btn}
                          </div>
                        ))}
                        <div className="ml-auto px-3 py-1.5 bg-primary/10 text-primary text-xs rounded-md font-medium">
                          + Add Token
                        </div>
                      </div>

                      {/* Email preview */}
                      <div className="flex-1 bg-background rounded-xl border p-6 space-y-4">
                        <div className="h-3 bg-muted rounded-full w-1/4" />
                        <div className="h-8 bg-primary/20 rounded-lg w-3/4" />
                        <div className="space-y-2">
                          <div className="h-2 bg-muted rounded-full w-full" />
                          <div className="h-2 bg-muted rounded-full w-5/6" />
                          <div className="h-2 bg-muted rounded-full w-4/6" />
                        </div>
                        <div className="h-10 bg-primary rounded-lg w-1/3" />
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="contacts"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="aspect-[16/10] bg-gradient-to-br from-muted/50 to-muted/30 p-6 md:p-8"
                  >
                    {/* Contacts UI */}
                    <div className="h-full flex gap-6">
                      {/* Sidebar - Lists */}
                      <div className="w-56 bg-background rounded-xl border p-4 space-y-3 hidden md:block">
                        <div className="text-sm font-semibold mb-4">Contact Lists</div>
                        {[
                          { name: "All Contacts", count: "12,847", active: false },
                          { name: "Newsletter", count: "8,234", active: true },
                          { name: "Product Updates", count: "3,102", active: false },
                          { name: "Enterprise Leads", count: "892", active: false },
                        ].map((list) => (
                          <div
                            key={list.name}
                            className={`flex items-center justify-between p-2 rounded-lg text-sm ${list.active ? "bg-primary/10 text-primary" : "hover:bg-muted"
                              }`}
                          >
                            <span className="truncate">{list.name}</span>
                            <span className="text-xs text-muted-foreground">{list.count}</span>
                          </div>
                        ))}
                        <div className="pt-2 border-t">
                          <div className="flex items-center gap-2 p-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer">
                            <ListFilter className="size-4" />
                            <span>Create List</span>
                          </div>
                        </div>
                      </div>

                      {/* Main content */}
                      <div className="flex-1 bg-background rounded-xl border p-4 space-y-4">
                        {/* Actions bar */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg text-sm">
                            <Upload className="size-4" />
                            Import CSV
                          </div>
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg text-sm">
                            <UserPlus className="size-4" />
                            Add Contact
                          </div>
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg text-sm">
                            <Tag className="size-4" />
                            Manage Tags
                          </div>
                        </div>

                        {/* Contact rows */}
                        <div className="space-y-2">
                          {[
                            { name: "Sarah Johnson", email: "sarah@company.com", tags: ["VIP", "Active"] },
                            { name: "Michael Chen", email: "m.chen@startup.io", tags: ["Newsletter"] },
                            { name: "Emma Wilson", email: "emma.w@design.co", tags: ["Active"] },
                            { name: "James Brown", email: "james@enterprise.com", tags: ["Enterprise", "VIP"] },
                          ].map((contact) => (
                            <div
                              key={contact.email}
                              className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50"
                            >
                              <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                                {contact.name.charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm truncate">{contact.name}</div>
                                <div className="text-xs text-muted-foreground truncate">{contact.email}</div>
                              </div>
                              <div className="flex gap-1 flex-wrap justify-end">
                                {contact.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Decorative glow */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-3xl bg-primary/5 rounded-full blur-3xl" />
          </div>
        </motion.div>

        {/* Feature highlights for contacts */}
        {activeTab === "contacts" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-12 grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto"
          >
            {[
              {
                icon: ListFilter,
                title: "Smart Lists",
                description: "Organize contacts into lists for targeted campaigns",
              },
              {
                icon: Tag,
                title: "Custom Tags",
                description: "Tag contacts with any labels you need for segmentation",
              },
              {
                icon: Upload,
                title: "Easy Import",
                description: "Import thousands of contacts from CSV in seconds",
              },
            ].map((feature) => (
              <div key={feature.title} className="text-center">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <feature.icon className="size-5 text-primary" />
                </div>
                <h4 className="font-semibold mb-1">{feature.title}</h4>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}

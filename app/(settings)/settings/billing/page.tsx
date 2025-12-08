"use client";

import {
  CreditCard,
  Check,
  Download,
  ExternalLink,
  Zap,
  Mail,
  Users,
  BarChart3,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

const currentPlan = {
  name: "Pro",
  price: 49,
  billingCycle: "monthly",
  nextBillingDate: "January 5, 2025",
};

const usage = {
  emailsSent: 8420,
  emailsLimit: 50000,
  contacts: 15230,
  contactsLimit: 100000,
  campaigns: 12,
  campaignsLimit: -1, // -1 = unlimited
};

const invoices = [
  { id: "inv_001", date: "Dec 5, 2024", amount: 49, status: "paid" },
  { id: "inv_002", date: "Nov 5, 2024", amount: 49, status: "paid" },
  { id: "inv_003", date: "Oct 5, 2024", amount: 49, status: "paid" },
];

const plans = [
  {
    name: "Starter",
    price: 0,
    features: ["1,000 emails/month", "500 contacts", "Basic analytics"],
    current: false,
  },
  {
    name: "Pro",
    price: 49,
    features: [
      "50,000 emails/month",
      "100,000 contacts",
      "Advanced analytics",
      "Priority support",
    ],
    current: true,
  },
  {
    name: "Enterprise",
    price: 199,
    features: [
      "Unlimited emails",
      "Unlimited contacts",
      "Custom integrations",
      "Dedicated support",
    ],
    current: false,
  },
];

export default function BillingPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
          <CreditCard className="size-5" />
          Billing & Subscription
        </h2>
        <p className="text-muted-foreground mt-1">
          Manage your subscription and billing information
        </p>
      </div>

      {/* Current Plan */}
      <Card className="rounded-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Current Plan</CardTitle>
              <CardDescription>
                Your subscription and billing details
              </CardDescription>
            </div>
            <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
              {currentPlan.name}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-1 mb-4">
            <span className="text-4xl font-bold">${currentPlan.price}</span>
            <span className="text-muted-foreground">
              /{currentPlan.billingCycle}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Your next billing date is{" "}
            <strong>{currentPlan.nextBillingDate}</strong>
          </p>
          <div className="flex gap-2">
            <Button variant="outline">Change Plan</Button>
            <Button variant="outline">Update Payment Method</Button>
          </div>
        </CardContent>
      </Card>

      {/* Usage */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Usage This Month</CardTitle>
          <CardDescription>
            Track your resource consumption
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Mail className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">Emails Sent</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {usage.emailsSent.toLocaleString()} /{" "}
                {usage.emailsLimit.toLocaleString()}
              </span>
            </div>
            <Progress
              value={(usage.emailsSent / usage.emailsLimit) * 100}
              className="h-2"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Users className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">Contacts</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {usage.contacts.toLocaleString()} /{" "}
                {usage.contactsLimit.toLocaleString()}
              </span>
            </div>
            <Progress
              value={(usage.contacts / usage.contactsLimit) * 100}
              className="h-2"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">Campaigns</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {usage.campaigns} / Unlimited
              </span>
            </div>
            <Progress value={0} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Plans */}
      <div>
        <h3 className="font-semibold mb-4">Available Plans</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`rounded-2xl ${
                plan.current ? "border-primary ring-1 ring-primary" : ""
              }`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{plan.name}</CardTitle>
                  {plan.current && (
                    <Badge variant="secondary">Current</Badge>
                  )}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">${plan.price}</span>
                  <span className="text-sm text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="size-4 text-green-600" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full mt-4"
                  variant={plan.current ? "outline" : "default"}
                  disabled={plan.current}
                >
                  {plan.current ? "Current Plan" : "Upgrade"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Invoices */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Billing History</CardTitle>
          <CardDescription>
            Download your past invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between py-2"
              >
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-lg bg-muted flex items-center justify-center">
                    <CreditCard className="size-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">${invoice.amount}.00</p>
                    <p className="text-sm text-muted-foreground">
                      {invoice.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800"
                  >
                    {invoice.status}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Download className="size-4" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

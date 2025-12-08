"use client";

import { useEffect, useState } from "react";
import { User, Bell, Loader2, AlertTriangle } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuthStore, useProfile, useAccessToken } from "@/lib/auth-store";
import { getProfile, updateProfile } from "@/lib/api";

export default function ProfilePage() {
  const profile = useProfile();
  const accessToken = useAccessToken();
  const setProfile = useAuthStore((state) => state.setProfile);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  // Fetch profile on mount if not loaded
  useEffect(() => {
    async function fetchProfileData() {
      if (!profile && accessToken) {
        setIsFetching(true);
        try {
          const data = await getProfile(accessToken);
          setProfile(data);
        } catch (error) {
          console.error("Failed to fetch profile:", error);
        } finally {
          setIsFetching(false);
        }
      }
    }
    fetchProfileData();
  }, [profile, accessToken, setProfile]);

  const handleSave = async (formData: FormData) => {
    if (!accessToken) return;

    setIsLoading(true);
    try {
      const updated = await updateProfile(accessToken, {
        firstName: (formData.get("firstName") as string) || undefined,
        lastName: (formData.get("lastName") as string) || undefined,
        phoneNumber: (formData.get("phoneNumber") as string) || undefined,
        company: (formData.get("company") as string) || undefined,
      });
      setProfile(updated);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update profile"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationChange = async (field: string, value: boolean) => {
    if (!accessToken) return;

    try {
      const updated = await updateProfile(accessToken, { [field]: value });
      setProfile(updated);
      toast.success("Notification preference updated");
    } catch (error) {
      toast.error("Failed to update notification preference");
    }
  };

  if (isFetching || !profile) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
          <User className="size-5" />
          Profile Settings
        </h2>
        <p className="text-muted-foreground mt-1">
          Manage your account information and preferences
        </p>
      </div>

      {/* Personal Information */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Personal Information</CardTitle>
          <CardDescription>
            Update your personal details and contact information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSave} className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt="Avatar"
                    className="size-16 rounded-full object-cover"
                  />
                ) : (
                  <User className="size-8 text-primary" />
                )}
              </div>
              <div>
                <Button type="button" variant="outline" size="sm">
                  Change Avatar
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG or GIF. Max 2MB.
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  defaultValue={profile.firstName || ""}
                  className="mt-1.5"
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  defaultValue={profile.lastName || ""}
                  className="mt-1.5"
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  className="mt-1.5"
                  disabled
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Email cannot be changed
                </p>
              </div>
              <div>
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  defaultValue={profile.phoneNumber || ""}
                  placeholder="+1 (555) 000-0000"
                  className="mt-1.5"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                name="company"
                defaultValue={profile.company || ""}
                className="mt-1.5"
                disabled={isLoading}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="size-4" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Choose what updates you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Campaign Reports</p>
                <p className="text-sm text-muted-foreground">
                  Get notified when campaigns complete
                </p>
              </div>
              <Switch
                checked={profile.notifyCampaignReports}
                onCheckedChange={(checked) =>
                  handleNotificationChange("notifyCampaignReports", checked)
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Weekly Digest</p>
                <p className="text-sm text-muted-foreground">
                  Summary of your email performance
                </p>
              </div>
              <Switch
                checked={profile.notifyWeeklyDigest}
                onCheckedChange={(checked) =>
                  handleNotificationChange("notifyWeeklyDigest", checked)
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Product Updates</p>
                <p className="text-sm text-muted-foreground">
                  New features and improvements
                </p>
              </div>
              <Switch
                checked={profile.notifyProductUpdates}
                onCheckedChange={(checked) =>
                  handleNotificationChange("notifyProductUpdates", checked)
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="rounded-2xl border-destructive/50">
        <CardHeader>
          <CardTitle className="text-base text-destructive flex items-center gap-2">
            <AlertTriangle className="size-4" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions for your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Delete Account</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all data
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your account and remove all of your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() =>
                      toast.info("Account deletion is not yet implemented")
                    }
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client"

import { useState } from "react";
import { Shield } from "lucide-react";
import { usePlatform } from "@/context/platform-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useActionState } from "@/hooks/use-action-state";

const SettingsPage = () => {
  const { currentClient, updateClient } = usePlatform();
  const { executeAction, isLoading } = useActionState();

  // API config
  const [ipWhitelist, setIpWhitelist] = useState(currentClient?.ipWhitelist?.join(", ") || "");
  const [retryCount, setRetryCount] = useState(currentClient?.webhookRetryCount?.toString() || "3");
  const [rateLimit, setRateLimit] = useState(currentClient?.rateLimitPerMinute?.toString() || "100");

  const handleSaveNotifications = (field: "webhookAlertsEnabled" | "transactionAlertsEnabled", value: boolean) => {
    if (!currentClient) return;
    updateClient(currentClient.id, { [field]: value });
  };

  const handleSaveApiConfig = () => {
    if (!currentClient) return;
    executeAction("save-api-config", () => {
      updateClient(currentClient.id, {
        ipWhitelist: ipWhitelist.split(",").map(s => s.trim()).filter(Boolean),
        webhookRetryCount: parseInt(retryCount) || 3,
        rateLimitPerMinute: parseInt(rateLimit) || 100,
      });
    }, "API configuration saved");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your account and configuration</p>
      </div>

      <Tabs defaultValue="security" className="flex gap-6" orientation="vertical">
        <TabsList className="flex flex-col h-[calc(100vh-30rem)] items-stretch justify-start min-w-[180px] bg-muted/50 p-1 rounded-lg">
          <TabsTrigger value="security" className="justify-start text-sm">Security</TabsTrigger>
          <TabsTrigger value="notifications" className="justify-start text-sm">Notifications</TabsTrigger>
          <TabsTrigger value="api" className="justify-start text-sm">API Config</TabsTrigger>
        </TabsList>
        <div className="flex-1">

        {/* TAB 4: Security */}
        <TabsContent className="p-0!" value="security">
          <Card>
            <CardHeader><CardTitle className="font-display">Security</CardTitle><CardDescription>Account security settings</CardDescription></CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2"><Label>Current Password</Label><Input type="password" placeholder="••••••••" /></div>
                <div className="space-y-2"><Label>New Password</Label><Input type="password" placeholder="••••••••" /></div>
                <div className="space-y-2"><Label>Confirm Password</Label><Input type="password" placeholder="••••••••" /></div>
                <Button variant="outline" onClick={() => executeAction("update-password", () => {}, "Password updated successfully")}>
                  {isLoading("update-password") ? "Updating..." : "Update Password"}
                </Button>
              </div>
              <div className="border-t pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div><p className="text-sm font-medium">Two-Factor Authentication</p><p className="text-xs text-muted-foreground">Add extra security to your account</p></div>
                  <Button variant="outline" size="sm" onClick={() => executeAction("enable-2fa", () => {}, "2FA enabled successfully")}>
                    <Shield className="h-3 w-3 mr-1" /> {isLoading("enable-2fa") ? "Enabling..." : "Enable 2FA"}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div><p className="text-sm font-medium">Session Timeout</p><p className="text-xs text-muted-foreground">Auto-logout after inactivity</p></div>
                  <Select defaultValue="30">
                    <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 6: Onboarding / Go-Live */}
        <TabsContent value="onboarding-config">
          {/* Removed: onboarding is now self-serve via settings profile + compliance */}
        </TabsContent>

        {/* TAB 7: Notifications */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader><CardTitle className="font-display">Notifications</CardTitle><CardDescription>Configure alert preferences</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div><p className="text-sm font-medium">Webhook Alerts</p><p className="text-xs text-muted-foreground">Get notified when webhook deliveries fail</p></div>
                <Switch checked={currentClient?.webhookAlertsEnabled} onCheckedChange={v => handleSaveNotifications("webhookAlertsEnabled", v)} />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div><p className="text-sm font-medium">Transaction Alerts</p><p className="text-xs text-muted-foreground">Get notified on transaction status changes</p></div>
                <Switch checked={currentClient?.transactionAlertsEnabled} onCheckedChange={v => handleSaveNotifications("transactionAlertsEnabled", v)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 8: API Configuration */}
        <TabsContent value="api">
          <Card>
            <CardHeader><CardTitle className="font-display">API Configuration</CardTitle><CardDescription>Manage API settings and restrictions</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>IP Whitelist</Label>
                <Input value={ipWhitelist} onChange={e => setIpWhitelist(e.target.value)} placeholder="e.g., 192.168.1.1, 10.0.0.1" />
                <p className="text-xs text-muted-foreground">Comma-separated list of allowed IPs. Leave empty to allow all.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Webhook Retry Count</Label>
                  <Input type="number" value={retryCount} onChange={e => setRetryCount(e.target.value)} min={0} max={10} />
                </div>
                <div className="space-y-2">
                  <Label>Rate Limit (requests/min)</Label>
                  <Input type="number" value={rateLimit} onChange={e => setRateLimit(e.target.value)} min={10} max={1000} />
                </div>
              </div>
              <Button className="gradient-primary text-primary-foreground" onClick={handleSaveApiConfig} disabled={isLoading("save-api-config")}>
                {isLoading("save-api-config") ? "Saving..." : "Save API Configuration"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

export default SettingsPage;

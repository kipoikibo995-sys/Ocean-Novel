import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Settings() {
  return (
    <div className="flex-1 overflow-auto bg-zinc-50 p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Settings</h1>
          <p className="text-zinc-500 mt-1">Manage your account settings and writing preferences.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Update your personal information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input defaultValue="Jane Smith" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" defaultValue="jane.smith@example.com" />
            </div>
            <Button className="mt-2">Save Profile</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Writing Preferences</CardTitle>
            <CardDescription>Customize your default project settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Default Font</Label>
                <select className="flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm focus:ring-1 focus:ring-zinc-900 focus:outline-none">
                  <option>Merriweather (Serif)</option>
                  <option>Lora (Serif)</option>
                  <option>Inter (Sans-serif)</option>
                  <option>System Default</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Editor Font Size</Label>
                <select className="flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm focus:ring-1 focus:ring-zinc-900 focus:outline-none">
                  <option>Medium (18px)</option>
                  <option>Small (16px)</option>
                  <option>Large (20px)</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Default POV</Label>
                <Input defaultValue="Third Person Limited" />
              </div>
              <div className="space-y-2">
                <Label>Default Tone</Label>
                <Input defaultValue="Suspenseful" />
              </div>
            </div>
            <Button variant="outline" className="mt-2">Save Preferences</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize the application theme.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
               <label className="flex items-center gap-2 cursor-pointer">
                 <input type="radio" name="theme" defaultChecked className="text-zinc-900 focus:ring-zinc-900" />
                 <span className="text-sm font-bold tracking-widest uppercase text-zinc-900">Light Mode</span>
               </label>
               <label className="flex items-center gap-2 cursor-pointer">
                 <input type="radio" name="theme" className="text-zinc-900 focus:ring-zinc-900" />
                 <span className="text-sm font-bold tracking-widest uppercase text-zinc-500">Dark Mode</span>
               </label>
               <label className="flex items-center gap-2 cursor-pointer">
                 <input type="radio" name="theme" className="text-zinc-900 focus:ring-zinc-900" />
                 <span className="text-sm font-bold tracking-widest uppercase text-zinc-500">System</span>
               </label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account & Billing</CardTitle>
            <CardDescription>Manage your subscription plan.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-4 border border-zinc-200 rounded-xl bg-zinc-100">
              <div>
                <p className="font-bold text-zinc-900">Current Plan: Free</p>
                <p className="text-sm text-zinc-500 mt-1">Basic features and 5 projects.</p>
              </div>
              <Button className="bg-zinc-900 hover:bg-zinc-900/90 text-white rounded-xl">Upgrade to Pro</Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

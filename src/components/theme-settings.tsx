"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { toast } from "@/lib/toast";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function ThemeSettings() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Theme Mode Selection */}
      <div>
        <Label className="text-sm font-medium">Theme Mode</Label>
        <p className="text-sm text-muted-foreground mb-3">Choose your preferred theme mode</p>
        <RadioGroup
          value={theme}
          onValueChange={(value) => {
            setTheme(value);
            toast.success(`Theme set to ${value}`);
          }}
          className="grid grid-cols-3 gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="light" id="light" />
            <Label htmlFor="light" className="text-sm">
              Light
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="dark" id="dark" />
            <Label htmlFor="dark" className="text-sm">
              Dark
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="system" id="system" />
            <Label htmlFor="system" className="text-sm">
              System
            </Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
}

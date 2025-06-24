import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Check, Eye, EyeOff, Package } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import PinVerificationModal from './PinVerificationModal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: {
    showStock: boolean;
    showPrice: boolean;
    showDimensions: boolean;
    showMaterial: boolean;
    showTags: boolean;
    showVendor: boolean;
  };
  visibilitySettings: {
    mode: 'all' | 'visible' | 'hidden';
  };
  onSettingsChange: (settings: any) => void;
  onVisibilitySettingsChange: (settings: any) => void;
  onBulkEditOpen: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  visibilitySettings,
  onSettingsChange,
  onVisibilitySettingsChange,
  onBulkEditOpen
}) => {
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pendingSettings, setPendingSettings] = useState<any>(null);
  const [pendingVisibilitySettings, setPendingVisibilitySettings] = useState<any>(null);
  // Handle individual setting change
  const handleSettingChange = (key: string, value: boolean) => {
    const newSettings = {
      ...settings,
      [key]: value
    };
    setPendingSettings(newSettings);
    setIsPinModalOpen(true);
  };

  // Handle visibility mode change
  const handleVisibilityModeChange = (mode: 'all' | 'visible' | 'hidden') => {
    const newSettings = {
      ...visibilitySettings,
      mode
    };
    setPendingVisibilitySettings(newSettings);
    setIsPinModalOpen(true);
  };

  const handlePinVerified = () => {
    if (pendingSettings) {
      onSettingsChange(pendingSettings);
      setPendingSettings(null);
    }
    if (pendingVisibilitySettings) {
      onVisibilitySettingsChange(pendingVisibilitySettings);
      setPendingVisibilitySettings(null);
    }
    onClose();
  };

  const handlePinModalClose = () => {
    setIsPinModalOpen(false);
    setPendingSettings(null);
    setPendingVisibilitySettings(null);
  };

  // Preset configurations
  const presets = [
    {
      name: "Essential",
      settings: {
        showStock: true,
        showPrice: true,
        showDimensions: true,
        showMaterial: true, 
        showTags: false,
        showVendor: false
      }
    },
    {
      name: "Complete",
      settings: {
        showStock: true,
        showPrice: true,
        showDimensions: true,
        showMaterial: true,
        showTags: true,
        showVendor: true
      }
    },
    {
      name: "Minimal",
      settings: {
        showStock: false,
        showPrice: true,
        showDimensions: false,
        showMaterial: true,
        showTags: false,
        showVendor: false
      }
    }
  ];

  // Apply preset
  const applyPreset = (presetSettings: typeof settings) => {
    onSettingsChange(presetSettings);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md border-earthy-beige/50">
        <DialogHeader>
          <DialogTitle className="text-xl text-earthy-brown">Display Settings</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          {/* Product Visibility Controls */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-earthy-brown flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Product Visibility
            </h4>
            <RadioGroup 
              value={visibilitySettings.mode} 
              onValueChange={handleVisibilityModeChange}
              className="grid grid-cols-1 gap-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" className="text-earthy-brown" />
                <Label htmlFor="all" className="text-sm">Show All Products</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="visible" id="visible" className="text-earthy-brown" />
                <Label htmlFor="visible" className="text-sm">Show Visible Products Only</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="hidden" id="hidden" className="text-earthy-brown" />
                <Label htmlFor="hidden" className="text-sm">Show Hidden Products Only</Label>
              </div>
            </RadioGroup>
          </div>

          <Separator className="bg-earthy-beige/50" />

          {/* Display Settings */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-earthy-brown">Field Display</h4>
            <div className="grid grid-cols-2 gap-y-4 gap-x-6">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="show-price" className="text-earthy-brown">Show Price</Label>
                <Switch
                  id="show-price"
                  checked={settings.showPrice}
                  onCheckedChange={(checked) => handleSettingChange('showPrice', checked)}
                  className="data-[state=checked]:bg-earthy-brown"
                />
              </div>
              
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="show-stock" className="text-earthy-brown">Show Stock</Label>
                <Switch
                  id="show-stock"
                  checked={settings.showStock}
                  onCheckedChange={(checked) => handleSettingChange('showStock', checked)}
                  className="data-[state=checked]:bg-earthy-brown"
                />
              </div>
              
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="show-dimensions" className="text-earthy-brown">Show Dimensions</Label>
                <Switch
                  id="show-dimensions"
                  checked={settings.showDimensions}
                  onCheckedChange={(checked) => handleSettingChange('showDimensions', checked)}
                  className="data-[state=checked]:bg-earthy-brown"
                />
              </div>
              
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="show-material" className="text-earthy-brown">Show Material</Label>
                <Switch
                  id="show-material"
                  checked={settings.showMaterial}
                  onCheckedChange={(checked) => handleSettingChange('showMaterial', checked)}
                  className="data-[state=checked]:bg-earthy-brown"
                />
              </div>
              
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="show-tags" className="text-earthy-brown">Show Tags</Label>
                <Switch
                  id="show-tags"
                  checked={settings.showTags}
                  onCheckedChange={(checked) => handleSettingChange('showTags', checked)}
                  className="data-[state=checked]:bg-earthy-brown"
                />
              </div>
              
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="show-vendor" className="text-earthy-brown">Show Vendor/Origin</Label>
                <Switch
                  id="show-vendor"
                  checked={settings.showVendor}
                  onCheckedChange={(checked) => handleSettingChange('showVendor', checked)}
                  className="data-[state=checked]:bg-earthy-brown"
                />
              </div>
            </div>
          </div>
          
          <Separator className="bg-earthy-beige/50" />
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-earthy-brown">Presets</h4>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset) => (
                <Button 
                  key={preset.name}
                  variant="outline"
                  size="sm"
                  className="border-earthy-beige hover:border-earthy-brown hover:text-earthy-brown"
                  onClick={() => applyPreset(preset.settings)}
                >
                  {preset.name}
                </Button>
              ))}
            </div>
          </div>

          <Separator className="bg-earthy-beige/50" />

          {/* Bulk Edit Section */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-earthy-brown">Bulk Operations</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={onBulkEditOpen}
              className="w-full border-earthy-beige hover:border-earthy-brown hover:text-earthy-brown"
            >
              <Package className="h-4 w-4 mr-2" />
              Bulk Edit Products
            </Button>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            type="button" 
            variant="default" 
            onClick={onClose}
            className="bg-earthy-brown hover:bg-earthy-brown/90 text-white"
          >
            <Check className="mr-2 h-4 w-4" /> Close
          </Button>
        </DialogFooter>

        {/* PIN Verification Modal */}
        <PinVerificationModal
          isOpen={isPinModalOpen}
          onClose={handlePinModalClose}
          onVerify={handlePinVerified}
          title="Confirm Settings Change"
          description="Please enter your PIN to apply the settings changes."
        />
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;

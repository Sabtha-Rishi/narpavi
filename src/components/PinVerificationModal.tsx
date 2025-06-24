import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PinVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: () => void;
  title?: string;
  description?: string;
}

const PinVerificationModal: React.FC<PinVerificationModalProps> = ({
  isOpen,
  onClose,
  onVerify,
  title = "Authentication Required",
  description = "Please enter your PIN to continue with this action."
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const CORRECT_PIN = '1919';

  const handleVerify = async () => {
    if (!pin.trim()) {
      setError('Please enter a PIN');
      return;
    }

    setIsVerifying(true);
    
    // Simulate verification delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (pin === CORRECT_PIN) {
      setError('');
      setPin('');
      setIsVerifying(false);
      onVerify();
      onClose();
    } else {
      setError('Invalid PIN. Please try again.');
      setPin('');
      setIsVerifying(false);
    }
  };

  const handleClose = () => {
    setPin('');
    setError('');
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md border-earthy-beige/50">
        <DialogHeader>
          <DialogTitle className="text-xl text-earthy-brown flex items-center gap-2">
            <Lock className="h-5 w-5" />
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
          
          {error && (
            <Alert variant="destructive" className="border-red-200">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="pin">PIN</Label>
            <Input
              id="pin"
              type="password"
              placeholder="Enter 4-digit PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              onKeyPress={handleKeyPress}
              className="border-earthy-beige/70 focus:ring-earthy-brown/20 text-center tracking-widest"
              maxLength={4}
              autoFocus
            />
          </div>
        </div>
        
        <DialogFooter className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="border-earthy-beige hover:border-earthy-brown"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleVerify}
            disabled={isVerifying || !pin.trim()}
            className="bg-earthy-brown hover:bg-earthy-brown/90 text-white"
          >
            {isVerifying ? 'Verifying...' : 'Verify'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PinVerificationModal; 
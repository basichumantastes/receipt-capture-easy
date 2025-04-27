
import React from "react";
import { Button } from "@/components/ui/button";
import { PenLine } from "lucide-react";
import ReceiptCapture from "@/components/ReceiptCapture";

interface CameraViewProps {
  onImageCapture: (imageData: string) => void;
  onManualInputClick: () => void;
}

const CameraView = ({ onImageCapture, onManualInputClick }: CameraViewProps) => {
  return (
    <div className="h-[calc(100vh-4rem)]">
      <ReceiptCapture onImageCapture={onImageCapture} />
      <Button
        variant="ghost"
        onClick={onManualInputClick}
        className="absolute top-4 right-4 gap-2"
      >
        <PenLine className="h-4 w-4" />
        Saisie manuelle
      </Button>
    </div>
  );
};

export default CameraView;

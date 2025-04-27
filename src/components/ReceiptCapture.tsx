
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera } from "lucide-react";
import { toast } from "sonner";

const ReceiptCapture = ({ onImageCapture }: { onImageCapture: (imageData: string) => void }) => {
  const [isCapturing, setIsCapturing] = useState(false);

  const startCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      // Wait for video to be ready
      await new Promise((resolve) => {
        video.onloadedmetadata = () => {
          resolve(true);
        };
      });

      // Create canvas and capture image
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      
      if (!context) {
        throw new Error("Could not get canvas context");
      }

      context.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg');
      
      // Stop all video tracks
      stream.getTracks().forEach(track => track.stop());
      
      onImageCapture(imageData);
      toast.success("Image capturée avec succès");
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("Erreur lors de l'accès à la caméra");
    }
  };

  return (
    <Card className="w-full mb-6">
      <CardContent className="pt-6">
        <Button 
          onClick={startCapture}
          className="w-full h-32 border-2 border-dashed hover:border-solid transition-all"
          variant="outline"
        >
          <div className="flex flex-col items-center gap-2">
            <Camera className="h-8 w-8" />
            <span>Prendre une photo du reçu</span>
          </div>
        </Button>
      </CardContent>
    </Card>
  );
};

export default ReceiptCapture;


import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera } from "lucide-react";
import { toast } from "sonner";

const ReceiptCapture = ({ onImageCapture }: { onImageCapture: (imageData: string) => void }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);

  useEffect(() => {
    // Start camera immediately when component mounts
    startCamera();
    
    // Cleanup when component unmounts
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" } // Use back camera
      });
      setStream(mediaStream);
      
      if (videoRef) {
        videoRef.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("Erreur lors de l'accès à la caméra");
    }
  };

  const captureImage = () => {
    if (!videoRef) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.videoWidth;
    canvas.height = videoRef.videoHeight;
    const context = canvas.getContext('2d');
    
    if (!context) {
      toast.error("Erreur lors de la capture");
      return;
    }

    context.drawImage(videoRef, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg');
    
    // Stop the camera stream
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    
    onImageCapture(imageData);
    toast.success("Image capturée avec succès");
  };

  return (
    <div className="relative w-full h-[calc(100vh-8rem)]">
      <video
        ref={ref => setVideoRef(ref)}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-4 left-0 right-0 flex justify-center">
        <Button 
          onClick={captureImage}
          size="lg"
          className="rounded-full w-16 h-16 p-0"
          variant="outline"
        >
          <Camera className="h-8 w-8" />
        </Button>
      </div>
    </div>
  );
};

export default ReceiptCapture;

"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, VideoOff, Camera, Bug, Image as ImageIcon } from "lucide-react";

export default function LiveMangoPage() {
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [error, setError] = useState<string>("");
  const [showDebug, setShowDebug] = useState(false);
  const [isDescribing, setIsDescribing] = useState(false);
  const [description, setDescription] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startLiveMode = async () => {
    try {
      setError("");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Use back camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsLiveMode(true);
        
        // Ensure video starts playing
        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.error("Error playing video:", playErr);
        }
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Unable to access camera. Please ensure camera permissions are granted.");
    }
  };

  const stopLiveMode = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsLiveMode(false);
  };

  const captureAndDescribeImage = async () => {
    if (!videoRef.current || !isLiveMode) {
      setError("Camera must be active to capture image");
      return;
    }

    setIsDescribing(true);
    setError("");
    setDescription("");

    try {
      // Create a canvas to capture the current frame
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error("Failed to get canvas context");
      }

      // Draw the current video frame onto the canvas
      ctx.drawImage(videoRef.current, 0, 0);

      // Convert canvas to base64 image
      const base64Image = canvas.toDataURL('image/png');

      // Call the API to describe the image
      const response = await fetch('/api/describe-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: base64Image }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to describe image');
      }

      const data = await response.json();
      setDescription(data.description);
    } catch (err) {
      console.error('Error describing image:', err);
      setError(err instanceof Error ? err.message : 'Failed to describe image');
    } finally {
      setIsDescribing(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="min-h-screen p-8 bg-background relative">
      {/* Debug Button */}
      <div className="fixed top-20 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => setShowDebug(!showDebug)}
        >
          <Bug className="w-4 h-4" />
          Debug
        </Button>

        {/* Debug Dropdown */}
        {showDebug && (
          <Card className="mt-2 w-64 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Debug Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                onClick={captureAndDescribeImage}
                disabled={!isLiveMode || isDescribing}
                variant="outline"
                className="w-full justify-start"
                size="sm"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                {isDescribing ? "Analyzing..." : "Describe Image"}
              </Button>

              {description && (
                <div className="mt-3 p-3 bg-muted rounded-md text-xs">
                  <p className="font-semibold mb-1">AI Description:</p>
                  <p className="text-muted-foreground">{description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold">Live Mango Monitor</h1>
          <p className="text-muted-foreground mt-2">
            Real-time monitoring of mango plant health
          </p>
        </div>

        <div className="grid gap-8 max-w-4xl mx-auto">
          {/* Camera Feed Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Camera Feed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Video Display */}
                <div className="relative bg-muted rounded-lg overflow-hidden aspect-video">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${isLiveMode ? 'block' : 'hidden'}`}
                  />
                  {!isLiveMode && (
                    <div className="absolute inset-0 flex items-center justify-center text-center p-8">
                      <div>
                        <Camera className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          Camera is not active. Click "Start Live Mode" to begin.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {/* Control Buttons */}
                <div className="flex gap-4">
                  {!isLiveMode ? (
                    <Button
                      onClick={startLiveMode}
                      className="flex-1"
                      size="lg"
                    >
                      <Video className="w-5 h-5 mr-2" />
                      Start Live Mode
                    </Button>
                  ) : (
                    <Button
                      onClick={stopLiveMode}
                      variant="destructive"
                      className="flex-1"
                      size="lg"
                    >
                      <VideoOff className="w-5 h-5 mr-2" />
                      Stop Live Mode
                    </Button>
                  )}
                </div>

                {/* Status Indicator */}
                <div className="flex items-center justify-center gap-2 text-sm">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      isLiveMode ? "bg-green-500 animate-pulse" : "bg-gray-400"
                    }`}
                  />
                  <span className="text-muted-foreground">
                    {isLiveMode ? "Live" : "Inactive"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>How to Use</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">1.</span>
                  <span>Click "Start Live Mode" to activate your camera</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">2.</span>
                  <span>Point your camera at mango leaves or plants</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">3.</span>
                  <span>The system will monitor and analyze in real-time</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">4.</span>
                  <span>Click "Stop Live Mode" when finished</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

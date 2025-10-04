"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, VideoOff, Camera } from "lucide-react";

export default function LiveMangoPage() {
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [error, setError] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="min-h-screen p-8 bg-background">
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

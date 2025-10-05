"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, VideoOff, Camera, Bug, Image as ImageIcon } from "lucide-react";
import { useUser } from "@auth0/nextjs-auth0";
import { useRouter } from "next/navigation";

export default function LiveMangoPage() {

  const { user, isLoading } = useUser();
  const router = useRouter();
  
    useEffect(() => {
      if (!isLoading && !user) {
        router.push("auth/login");
      }
    }, [isLoading, user, router]);

  const [isLiveMode, setIsLiveMode] = useState(false);
  const [error, setError] = useState<string>("");
  const [showDebug, setShowDebug] = useState(false);
  const [isDescribing, setIsDescribing] = useState(false);
  const [description, setDescription] = useState<string>("");
  const [isPlantDetected, setIsPlantDetected] = useState<boolean | null>(null);
  const [requestCount, setRequestCount] = useState(0);
  const [lastResponseTime, setLastResponseTime] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [apiLogs, setApiLogs] = useState<Array<{
    timestamp: string;
    isPlant: boolean;
    responseTime: number;
    requestNumber: number;
  }>>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const captureFrame = (): string | null => {
    if (!videoRef.current) {
      return null;
    }

    try {
      // Create a canvas to capture the current frame
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        return null;
      }

      // Draw the current video frame onto the canvas
      ctx.drawImage(videoRef.current, 0, 0);

      // Convert canvas to base64 image
      return canvas.toDataURL('image/jpeg', 0.8); // Use JPEG with 80% quality for faster processing
    } catch (err) {
      console.error('Error capturing frame:', err);
      return null;
    }
  };

  const detectPlant = async () => {
    if (isProcessing) {
      console.log('⏭️ Skipping request - previous one still processing');
      return;
    }

    setIsProcessing(true);
    const startTime = performance.now();
    const currentRequestNumber = requestCount + 1;

    try {
      const base64Image = captureFrame();
      
      if (!base64Image) {
        console.log('❌ Failed to capture frame');
        setIsProcessing(false);
        return;
      }

      console.log(`📤 Sending request #${currentRequestNumber}...`);

      // Call the check-plant-live API
      const response = await fetch('/api/check-plant-live', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: base64Image }),
      });

      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error:', errorData);
        setError(errorData.error || 'Failed to check plant');
      } else {
        const data = await response.json();
        setIsPlantDetected(data.isPlant);
        setError(""); // Clear any previous errors
        
        // Update stats
        setRequestCount(currentRequestNumber);
        setLastResponseTime(responseTime);
        
        // Add to logs (keep only last 3)
        const newLog = {
          timestamp: new Date().toLocaleTimeString(),
          isPlant: data.isPlant,
          responseTime: responseTime,
          requestNumber: currentRequestNumber
        };
        
        setApiLogs(prevLogs => {
          const updatedLogs = [newLog, ...prevLogs];
          return updatedLogs.slice(0, 3); // Keep only last 3
        });
        
        console.log(`✅ Request #${currentRequestNumber} completed in ${responseTime}ms - Plant: ${data.isPlant}`);
      }
    } catch (err) {
      console.error('Error in detection:', err);
      setError(err instanceof Error ? err.message : 'Detection failed');
    } finally {
      setIsProcessing(false);
    }
  };

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
          
          // Reset states
          setRequestCount(0);
          setIsPlantDetected(null);
          setApiLogs([]);
          
          // Wait a moment for video to be ready, then start detection interval
          setTimeout(() => {
            console.log('🚀 Starting detection interval (1 request per second)');
            
            // Run first detection immediately
            detectPlant();
            
            // Then run every 1 second
            const interval = setInterval(() => {
              detectPlant();
            }, 1000);
            
            detectionIntervalRef.current = interval;
          }, 500);
          
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
    // Stop the detection interval
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsLiveMode(false);
    setIsPlantDetected(null);
    setIsProcessing(false);
    console.log(`🛑 Live mode stopped. Total requests: ${requestCount}`);
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
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
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

              <Button
                onClick={() => setShowLogs(!showLogs)}
                disabled={!isLiveMode}
                variant="outline"
                className="w-full justify-start"
                size="sm"
              >
                <Bug className="w-4 h-4 mr-2" />
                {showLogs ? "Hide Logs" : "Show Logs"}
              </Button>

              {description && (
                <div className="mt-3 p-3 bg-muted rounded-md text-xs">
                  <p className="font-semibold mb-1">AI Description:</p>
                  <p className="text-muted-foreground">{description}</p>
                </div>
              )}

              {/* API Logs */}
              {showLogs && (
                <div className="mt-3 p-3 bg-muted rounded-md text-xs space-y-3">
                  <p className="font-semibold mb-2">Last 3 API Responses:</p>
                  {apiLogs.length === 0 ? (
                    <p className="text-muted-foreground">No logs yet...</p>
                  ) : (
                    <div className="space-y-2">
                      {apiLogs.map((log, index) => (
                        <div key={index} className="p-2 bg-background rounded border">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold">Request #{log.requestNumber}</span>
                            <span className="text-muted-foreground">{log.timestamp}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span>Plant Detected:</span>
                            <span className={`font-semibold ${log.isPlant ? 'text-green-600' : 'text-orange-600'}`}>
                              {log.isPlant ? '✓ Yes' : '✗ No'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span>Response Time:</span>
                            <span className="font-semibold">{log.responseTime}ms</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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

                {/* Live Detection Stats */}
                {isLiveMode && (
                  <div className="mt-4 p-4 bg-muted rounded-lg space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Detection Status:</span>
                      <span className={`font-semibold ${
                        isPlantDetected === null ? 'text-muted-foreground' :
                        isPlantDetected ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        {isPlantDetected === null ? 'Initializing...' :
                         isPlantDetected ? '✓ Plant Detected' : '✗ No Plant'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Requests Sent:</span>
                      <span className="font-semibold">{requestCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Last Response Time:</span>
                      <span className="font-semibold">{lastResponseTime}ms</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Processing:</span>
                      <span className={`font-semibold ${isProcessing ? 'text-blue-600' : 'text-muted-foreground'}`}>
                        {isProcessing ? '⚡ Active' : 'Idle'}
                      </span>
                    </div>
                  </div>
                )}
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
'use client';
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, VideoOff, Camera, Bug, Image as ImageIcon } from "lucide-react";

interface LiveMangoPageProps {
  onSwitchToDetector?: () => void;
}

export default function LiveMangoPage({ onSwitchToDetector }: LiveMangoPageProps) {

  const [isLiveMode, setIsLiveMode] = useState(false);
  const [error, setError] = useState<string>("");
  const [showDebug, setShowDebug] = useState(false);
  const [isDescribing, setIsDescribing] = useState(false);
  const [description, setDescription] = useState<string>("");
  const [, setIsPlantDetected] = useState<boolean | null>(null);
  const [, setHasMultipleLeaves] = useState<boolean>(false);
  const [requestCount, setRequestCount] = useState(0);
  const [lastResponseTime, setLastResponseTime] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [consecutiveSingleLeafCount, setConsecutiveSingleLeafCount] = useState(0);
  const [detectionStatus, setDetectionStatus] = useState<'no-leaf' | 'single-leaf' | 'multiple-leaves' | 'initializing'>('initializing');
  const [, setCapturedImageForAnalysis] = useState<string | null>(null);
  const [shouldNavigateToDetector, setShouldNavigateToDetector] = useState(false);
  const [apiLogs, setApiLogs] = useState<Array<{
    timestamp: string;
    isPlant: boolean;
    hasMultipleLeaves: boolean;
    responseTime: number;
    requestNumber: number;
  }>>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
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
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      
      if (!ctx) {
        return null;
      }

      // Fill with white background first to ensure no transparency issues
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw the current video frame onto the canvas
      ctx.drawImage(videoRef.current, 0, 0);

      // Convert canvas to base64 image with higher quality
      // Use PNG for live detection (smaller size, lossless)
      // Use maximum quality JPEG for final capture that goes to detector
      return canvas.toDataURL('image/png');
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
      // Capture the frame BEFORE sending to API - this is the image we'll use
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
        setHasMultipleLeaves(data.hasMultipleLeaves);
        setError(""); // Clear any previous errors
        
        // Update stats
        setRequestCount(currentRequestNumber);
        setLastResponseTime(responseTime);
        
        // Determine detection status and handle consecutive single-leaf detection
        let newStatus: 'no-leaf' | 'single-leaf' | 'multiple-leaves' | 'initializing';
        
        if (!data.isPlant) {
          newStatus = 'no-leaf';
          setConsecutiveSingleLeafCount(0); // Reset counter
        } else if (data.hasMultipleLeaves) {
          newStatus = 'multiple-leaves';
          setConsecutiveSingleLeafCount(0); // Reset counter
        } else {
          // Single leaf detected!
          newStatus = 'single-leaf';
          
          // Store the current API call's image for potential use
          setCapturedImageForAnalysis(base64Image);
          
          setConsecutiveSingleLeafCount(prev => {
            const newCount = prev + 1;
            console.log(`🍃 Single leaf detected! Consecutive count: ${newCount}/3`);
            
            // If we hit 3 consecutive single-leaf detections, redirect to detector
            if (newCount >= 3) {
              console.log('✅ 3 consecutive single-leaf detections! Redirecting to detector...');
              console.log('📸 Using PNG image from the THIRD valid API call (not capturing new)');
              
              // Stop live mode
              if (detectionIntervalRef.current) {
                clearInterval(detectionIntervalRef.current);
                detectionIntervalRef.current = null;
              }
              
              // Use the PNG image directly from this (the third) API call
              // No conversion needed - keep it as PNG for disease detection API
              sessionStorage.setItem('capturedImage', base64Image);
              console.log('✅ Stored PNG image from third detection, switching to detector...');
              
              // Trigger navigation via state (will be handled in useEffect)
              setShouldNavigateToDetector(true);
              
              return 0; // Reset counter
            }
            
            return newCount;
          });
        }
        
        setDetectionStatus(newStatus);
        
        // Add to logs (keep only last 3)
        const newLog = {
          timestamp: new Date().toLocaleTimeString(),
          isPlant: data.isPlant,
          hasMultipleLeaves: data.hasMultipleLeaves,
          responseTime: responseTime,
          requestNumber: currentRequestNumber
        };
        
        setApiLogs(prevLogs => {
          const updatedLogs = [newLog, ...prevLogs];
          return updatedLogs.slice(0, 3); // Keep only last 3
        });
        
        console.log(`✅ Request #${currentRequestNumber} completed in ${responseTime}ms - Status: ${newStatus}`);
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
          setHasMultipleLeaves(false);
          setConsecutiveSingleLeafCount(0);
          setDetectionStatus('initializing');
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
    setHasMultipleLeaves(false);
    setConsecutiveSingleLeafCount(0);
    setDetectionStatus('initializing');
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

  // Handle navigation to detector when triggered
  useEffect(() => {
    if (shouldNavigateToDetector) {
      if (onSwitchToDetector) {
        onSwitchToDetector();
      } else {
        window.location.href = '/detector';
      }
      setShouldNavigateToDetector(false);
    }
  }, [shouldNavigateToDetector, onSwitchToDetector]);

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
                          Camera is not active. Click &quot;Start Live Mode&quot; to begin.
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

                {/* User-Friendly Status Banner */}
                {isLiveMode && (
                  <div className={`p-4 rounded-lg border-2 text-center ${
                    detectionStatus === 'initializing' ? 'bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700' :
                    detectionStatus === 'no-leaf' ? 'bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-900' :
                    detectionStatus === 'multiple-leaves' ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-400 dark:border-yellow-900' :
                    'bg-green-50 dark:bg-green-950/20 border-green-400 dark:border-green-900'
                  }`}>
                    <div className={`text-lg font-bold mb-1 ${
                      detectionStatus === 'initializing' ? 'text-gray-600 dark:text-gray-400' :
                      detectionStatus === 'no-leaf' ? 'text-red-600 dark:text-red-400' :
                      detectionStatus === 'multiple-leaves' ? 'text-yellow-700 dark:text-yellow-400' :
                      'text-green-600 dark:text-green-400'
                    }`}>
                      {detectionStatus === 'initializing' && '⏳ Initializing...'}
                      {detectionStatus === 'no-leaf' && '❌ No Leaf Detected'}
                      {detectionStatus === 'multiple-leaves' && '⚠️ Multiple Leaves Detected'}
                      {detectionStatus === 'single-leaf' && '✅ Leaf Detected'}
                    </div>
                    {detectionStatus === 'single-leaf' && consecutiveSingleLeafCount > 0 && (
                      <div className="text-sm text-green-700 dark:text-green-300 font-semibold">
                        {consecutiveSingleLeafCount}/3 - {3 - consecutiveSingleLeafCount} more to analyze
                      </div>
                    )}
                    {detectionStatus === 'multiple-leaves' && (
                      <div className="text-xs text-yellow-700 dark:text-yellow-300">
                        Please focus on a single leaf
                      </div>
                    )}
                    {detectionStatus === 'no-leaf' && (
                      <div className="text-xs text-red-700 dark:text-red-300">
                        Point camera at a mango leaf
                      </div>
                    )}
                  </div>
                )}

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
                  <span>Click &quot;Start Live Mode&quot; to activate your camera</span>
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
                  <span>Click &quot;Stop Live Mode&quot; when finished</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, Bug, ChevronDown, ChevronUp, AlertCircle, CheckCircle2 } from "lucide-react";

const LOADING_STEPS = [
  "Initializing image processor...",
  "Verifying image file integrity...",
  "Reading image data stream...",
  "Checking image dimensions and metadata...",
  "Resizing image for optimal analysis...",
  "Converting image to standard RGB color space...",
  "Reading image data...",
  "Converting image to Base64...",
  "Compressing data for efficient transfer...",
  "Optimizing data format...",
  "Base64 conversion complete!",
  "Resolving AI API endpoint...",
  "Connecting to AI API...",
  "Initiating TLS handshake...",
  "Establishing secure connection...",
  "Authenticating client credentials...",
  "Negotiating transfer protocol...",
  "Creating data upload stream...",
  "Uploading image data...",
  "Chunking image data for transmission...",
  "Transmitting Base64 string...",
  "Monitoring upload progress...",
  "Data received by AI server...",
  "Reassembling data chunks...",
  "Validating Base64 string integrity...",
  "Decoding Base64 to binary image...",
  "Verifying data with checksum...",
  "Allocating GPU resources...",
  "Assigning task to processing queue...",
  "Staging data in memory buffer...",
  "Initializing neural network...",
  "Verifying model file integrity...",
  "Loading mango disease detection model...",
  "Loading model architecture from disk...",
  "Hydrating neural network with trained weights...",
  "Initializing model biases...",
  "Checking for model version updates...",
  "Warming up the model...",
  "Preprocessing image data...",
  "Applying noise reduction filters...",
  "Normalizing pixel values to a 0-1 range...",
  "Segmenting leaf from background...",
  "Isolating regions of interest...",
  "Enhancing contrast for clarity...",
  "Applying image sharpening algorithms...",
  "Correcting for lighting variations...",
  "Tensor transformation complete...",
  "Extracting leaf features...",
  "Feeding tensor into input layer...",
  "Running deep learning analysis...",
  "Processing convolutional layer 1 (Edge Detection)...",
  "Applying ReLU activation function...",
  "Executing max-pooling operation 1...",
  "Processing convolutional layer 2 (Simple Shapes)...",
  "Applying ReLU activation function...",
  "Executing max-pooling operation 2...",
  "Processing convolutional layer 3 (Complex Patterns)...",
  "Applying batch normalization...",
  "Executing max-pooling operation 3...",
  "Processing convolutional layer 4 (Texture Analysis)...",
  "Applying dropout to prevent overfitting...",
  "Executing max-pooling operation 4...",
  "Processing convolutional layer 5 (Feature Aggregation)...",
  "Analyzing color patterns...",
  "Detecting texture anomalies...",
  "Scanning for disease markers...",
  "Identifying pathogen signatures...",
  "Activating attention mechanism...",
  "Focusing on key symptom areas...",
  "Flattening feature maps into a vector...",
  "Processing convolutional layers...",
  "Propagating data to fully connected layers...",
  "Analyzing high-level feature combinations...",
  "Refining feature interpretation...",
  "Generating final feature vector...",
  "Feeding vector into output layer...",
  "Comparing with disease database...",
  "Cross-referencing symptoms...",
  "Calculating confidence scores...",
  "Mapping features to disease probabilities...",
  "Calculating Anthracnose confidence...",
  "Calculating Powdery Mildew confidence...",
  "Calculating Sooty Mould confidence...",
  "Calculating Bacterial Canker confidence...",
  "Interpreting raw output logits...",
  "Validating detection results...",
  "Identifying primary disease candidate...",
  "Checking for signs of co-infection...",
  "Performing confidence score thresholding...",
  "Flagging ambiguities for review...",
  "Finalizing disease diagnosis...",
  "Compiling diagnostic summary...",
  "Generating recommendations...",
  "Fetching treatment protocols...",
  "Retrieving preventative care information...",
  "Localizing recommendations for region...",
  "Formatting report for display...",
  "Encrypting result payload...",
  "Logging transaction results...",
  "Deallocating server resources...",
  "Analysis complete!"
];



export default function DetectorPage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [base64String, setBase64String] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [showDebug, setShowDebug] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [allSteps, setAllSteps] = useState<string[]>([]);
  const [expandedLogs, setExpandedLogs] = useState(false);
  const [apiResults, setApiResults] = useState<any>(null);
  const logsContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of logs when new steps are added
  useEffect(() => {
    if (expandedLogs && logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [allSteps, expandedLogs]);

  const convertToBase64 = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setBase64String(result);
      setPreviewUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      convertToBase64(file);
      setShowResults(false);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      convertToBase64(file);
      setShowResults(false);
    }
  }, []);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setShowResults(false);
    setCurrentStep(0);
    setProgress(0);
    setAllSteps([]);
    setExpandedLogs(false);

    // Start API calls immediately in parallel with animation
    const apiCallsPromise = (async () => {
      try {
        // Step 1: Check if the image is a plant leaf
        console.log('🔍 Checking if image is a plant...');
        const checkResponse = await fetch('/api/check-plant', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image: base64String }),
        });

        const checkData = await checkResponse.json();
        console.log('Plant check result:', checkData);

        if (!checkResponse.ok) {
          throw new Error(checkData.error || 'Failed to check if image is a plant');
        }

        // If not a plant, show confirmation dialog
        if (!checkData.isPlant) {
          const userConfirmed = window.confirm(
            '⚠️ This image doesn\'t appear to be a plant leaf.\n\n' +
            'Are you sure the image you uploaded is a leaf from a mango tree?\n\n' +
            'Click "OK" to proceed anyway, or "Cancel" to upload a different image.'
          );

          if (!userConfirmed) {
            // User cancelled
            return { cancelled: true };
          }
          console.log('⚠️ User confirmed to proceed despite not being a plant');
        } else {
          console.log('✅ Image confirmed as plant leaf');
        }

        // Step 2: Call the disease prediction API
        console.log('🤖 Running disease prediction...');
        const response = await fetch('/api/predict-disease', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image: base64String }),
        });

        const data = await response.json();
        
        if (response.ok) {
          return { success: true, data };
        } else {
          return { 
            success: false, 
            data: { 
              error: data.error || 'Failed to get prediction from API',
              details: data.details,
              instructions: data.instructions
            }
          };
        }
      } catch (error) {
        console.error('Error calling API:', error);
        return { 
          success: false, 
          data: { 
            error: 'Network error',
            details: error instanceof Error ? error.message : 'Unknown error'
          }
        };
      }
    })();

    // Simulate the analysis process with variable timing for realism
    let stepIndex = 0;
    const totalDuration = 7000; // 7 seconds total
    const baseDelay = totalDuration / LOADING_STEPS.length; // Average delay per step
    
    const processNextStep = () => {
      if (stepIndex < LOADING_STEPS.length) {
        setAllSteps(prev => [...prev, LOADING_STEPS[stepIndex]]);
        setCurrentStep(stepIndex);
        setProgress(((stepIndex + 1) / LOADING_STEPS.length) * 100);
        
        stepIndex++;
        
        // Variable delay based on step type for realistic feel
        let delay = baseDelay;
        
        // Quick steps - fast processing (50% of base delay)
        if (stepIndex % 7 === 0 || stepIndex % 11 === 0) {
          delay = baseDelay * 0.5;
        }
        // Normal steps - standard speed
        else if (stepIndex % 3 === 0) {
          delay = baseDelay;
        }
        // Heavy processing steps - longer delays (150-200% of base delay)
        else if (stepIndex % 5 === 0) {
          delay = baseDelay * 1.5;
        }
        else if (stepIndex % 13 === 0) {
          delay = baseDelay * 2;
        }
        // Most steps - slight variation (80-120% of base delay)
        else {
          delay = baseDelay * (0.8 + Math.random() * 0.4);
        }
        
        setTimeout(processNextStep, delay);
      } else {
        // Animation complete - wait for API calls to finish
        setTimeout(async () => {
          const result = await apiCallsPromise;
          
          if (result.cancelled) {
            // User cancelled, reset the analysis
            setIsAnalyzing(false);
            setShowResults(false);
            setAllSteps([]);
            setCurrentStep(0);
            setProgress(0);
            return;
          }
          
          // Set results and show them
          setApiResults(result.data);
          if (result.success) {
            console.log('API Results:', result.data);
          }
          setIsAnalyzing(false);
          setShowResults(true);
        }, 300);
      }
    };
    
    // Start the process
    processNextStep();
  };

  return (
    <div className="min-h-screen p-8 bg-background relative">
      {/* Debug Button */}
      <Button
        variant="outline"
        size="sm"
        className="fixed top-20 right-4 z-50 gap-2"
        onClick={() => setShowDebug(!showDebug)}
      >
        <Bug className="w-4 h-4" />
        Debug
      </Button>

      {/* Debug Panel */}
      {showDebug && (
        <Card className="fixed top-32 right-4 w-96 max-h-[600px] z-50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Debug: Base64 Output</CardTitle>
          </CardHeader>
          <CardContent>
            {base64String ? (
              <div className="space-y-3">
                <div className="relative">
                  <textarea
                    readOnly
                    value={base64String}
                    className="w-full h-64 p-3 font-mono text-xs bg-muted rounded-lg resize-none"
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(base64String);
                    }}
                    className="absolute top-2 right-2"
                  >
                    Copy
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Length: {base64String.length.toLocaleString()} characters
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No image uploaded yet
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold">Mango Disease Detector</h1>
          <p className="text-muted-foreground mt-2">
            Upload a mango leaf image for AI-powered disease detection
          </p>
        </div>
        
        <div className={`grid gap-8 transition-all duration-500 ${showResults ? 'lg:grid-cols-2' : 'place-items-center'}`}>
          {/* Upload Section */}
          <div className={`w-full transition-all duration-500 ${!showResults ? 'max-w-2xl' : ''}`}>
            <Card>
              <CardHeader>
                <CardTitle>Upload Mango Leaf Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                    isDragging
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center gap-4"
                  >
                    <Upload className="w-12 h-12 text-muted-foreground" />
                    <div>
                      <p className="text-lg font-medium">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        PNG, JPG, JPEG (Mango leaf images)
                      </p>
                    </div>
                  </label>
                </div>

                {previewUrl && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Preview</h3>
                    <div className="relative rounded-lg overflow-hidden border">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-auto"
                      />
                    </div>
                    {imageFile && (
                      <p className="text-sm text-muted-foreground">
                        {imageFile.name} ({(imageFile.size / 1024).toFixed(2)} KB)
                      </p>
                    )}
                  </div>
                )}

                <Button
                  onClick={handleAnalyze}
                  disabled={!imageFile || isAnalyzing}
                  className="w-full"
                  size="lg"
                >
                  {isAnalyzing ? "Analyzing..." : "Analyze for Diseases"}
                </Button>
              </CardContent>
            </Card>

            {/* Loading Section */}
            {isAnalyzing && (
              <Card className="mt-4 animate-in slide-in-from-top duration-300">
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{allSteps[currentStep]}</span>
                      <span className="text-muted-foreground">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  <div className="border rounded-lg">
                    <button
                      onClick={() => setExpandedLogs(!expandedLogs)}
                      className="w-full p-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-sm font-medium">View All Logs</span>
                      {expandedLogs ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    {expandedLogs && (
                      <div ref={logsContainerRef} className="p-3 border-t max-h-48 overflow-y-auto bg-muted/20">
                        <div className="space-y-1 font-mono text-xs">
                          {allSteps.map((step, idx) => (
                            <div key={idx} className="text-muted-foreground">
                              [{idx + 1}/{LOADING_STEPS.length}] {step}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Results Section */}
          {showResults && (
            <Card className="animate-in slide-in-from-right duration-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  Analysis Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* API Results - Raw Data Display */}
                {apiResults && (
                  <div className="bg-muted/50 p-4 rounded-lg border-2 border-primary/20">
                    <h3 className="text-sm font-bold text-primary mb-3">🤖 AI Model Results (Live)</h3>
                    
                    {apiResults.error ? (
                      <div className="bg-destructive/10 border border-destructive rounded-md p-3 space-y-2">
                        <p className="font-semibold text-destructive flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          {apiResults.error}
                        </p>
                        {apiResults.details && (
                          <p className="text-xs text-muted-foreground">{apiResults.details}</p>
                        )}
                        {apiResults.instructions && (
                          <div className="mt-2 p-2 bg-background rounded text-xs">
                            <p className="font-semibold mb-1">To fix this:</p>
                            <code className="text-primary">{apiResults.instructions}</code>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Main Prediction */}
                        {apiResults.prediction && (
                          <div className="bg-background p-3 rounded-md">
                            <p className="text-xs text-muted-foreground mb-1">Detected Disease:</p>
                            <p className="text-lg font-bold">{apiResults.prediction.disease}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Confidence: {apiResults.prediction.confidence_percentage?.toFixed(2)}%
                            </p>
                          </div>
                        )}
                        
                        {/* All Probabilities */}
                        {apiResults.all_probabilities && (
                          <div className="bg-background p-3 rounded-md">
                            <p className="text-xs font-semibold mb-2">All Disease Probabilities:</p>
                            <div className="space-y-1 text-xs">
                              {apiResults.all_probabilities.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center">
                                  <span className={idx === 0 ? "font-semibold" : ""}>{item.disease}</span>
                                  <span className={idx === 0 ? "font-semibold text-primary" : "text-muted-foreground"}>
                                    {item.percentage.toFixed(2)}%
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Raw JSON Display */}
                        <details className="text-xs">
                          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                            View Raw JSON Response
                          </summary>
                          <pre className="mt-2 p-2 bg-muted rounded text-[10px] overflow-auto max-h-40">
                            {JSON.stringify(apiResults, null, 2)}
                          </pre>
                        </details>
                      </div>
                    )}
                  </div>
                )}

                {/* Plant Type */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Plant Type</h3>
                  <p className="text-lg font-semibold">Mango</p>
                </div>

                {/* Disease Detected */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Disease Detected</h3>
                  {apiResults?.prediction && (
                    <>
                      <p className="text-lg font-semibold text-red-600 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        {apiResults.prediction.disease}
                      </p>
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>Confidence</span>
                          <span className="font-semibold">{apiResults.prediction.confidence_percentage?.toFixed(2)}%</span>
                        </div>
                        <Progress value={apiResults.prediction.confidence_percentage} className="h-2" />
                      </div>
                    </>
                  )}
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
                  <div className="bg-muted/30 p-4 rounded-lg border space-y-3">
                    <div>
                      <h4 className="text-sm font-semibold mb-1">What is {apiResults?.prediction?.disease || 'this disease'}?</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {/* Empty - to be filled with actual information */}
                        Information about this disease will be displayed here.
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold mb-1">Typical causes for {apiResults?.prediction?.disease || 'this disease'} are:</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {/* Empty - to be filled with actual information */}
                        Causes and conditions that lead to this disease will be displayed here.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Key Symptoms to Check */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Key Symptoms to Check</h3>
                  <div className="bg-muted/30 p-4 rounded-lg border">
                    <p className="text-sm text-muted-foreground">
                      {/* Empty - to be filled with actual symptoms */}
                      Key symptoms and visual indicators will be displayed here.
                    </p>
                  </div>
                </div>

                {/* Recommended Treatment Plan */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Recommended Treatment Plan</h3>
                  <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-900">
                    <p className="text-sm leading-relaxed">
                      {/* Empty - to be filled with treatment information */}
                      Treatment recommendations and protocols will be displayed here.
                    </p>
                  </div>
                </div>

                {/* Preventive Measures */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Preventive Measures</h3>
                  <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-900">
                    <p className="text-sm leading-relaxed">
                      {/* Empty - to be filled with preventive measures */}
                      Preventive measures and best practices will be displayed here.
                    </p>
                  </div>
                </div>

                {/* Alternative Possibilities (only if confidence < 80%) */}
                {apiResults?.prediction && apiResults.prediction.confidence_percentage < 80 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Alternative Possibilities</h3>
                    <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-900 space-y-3">
                      <div>
                        <h4 className="text-sm font-semibold mb-1">
                          {apiResults.prediction.disease} ({apiResults.prediction.confidence_percentage.toFixed(2)}% confidence)
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          The AI model has detected this disease with moderate confidence. Consider the following alternatives:
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold mb-1">Other Potential Issues</h4>
                        {apiResults.all_probabilities && apiResults.all_probabilities.length > 1 && (
                          <ul className="space-y-1">
                            {apiResults.all_probabilities.slice(1, 4).map((item: any, idx: number) => (
                              <li key={idx} className="text-sm flex items-center justify-between">
                                <span>{item.disease}</span>
                                <span className="text-muted-foreground">{item.percentage.toFixed(2)}%</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Important Disclaimer */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Important Disclaimer</h3>
                  <div className="bg-muted/50 p-4 rounded-lg border border-muted-foreground/20">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      This AI-powered diagnosis is provided for informational purposes only and should not replace professional agricultural advice. 
                      For accurate diagnosis and treatment recommendations, please consult with a certified plant pathologist or agricultural extension service. 
                      The accuracy of results depends on image quality and may vary based on disease stage and environmental conditions.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

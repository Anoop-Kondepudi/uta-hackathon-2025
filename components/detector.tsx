'use client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  Bug,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Camera,
  Video,
  VideoOff,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import AnalysisResults from "@/components/analysis-results";

interface ExtractedTerm {
  term: string;
  definition: string;
  usage?: string;
  category: 'pesticide' | 'fungicide' | 'treatment' | 'nutrient' | 'practice' | 'condition';
}

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
  "Analysis complete!",
];

export default function DetectorPage() {
  // Tab state for Upload vs Camera
  const [detectorMode, setDetectorMode] = useState<"upload" | "camera">("upload");

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
  const [apiResults, setApiResults] = useState<{
    predicted_disease?: string;
    confidence?: number;
    all_probabilities?: Array<{ disease: string; percentage: number }>;
    prediction?: {
      disease: string;
      confidence_percentage: number;
    };
    error?: string;
    details?: string;
    instructions?: string;
  } | null>(null);
  const logsContainerRef = useRef<HTMLDivElement>(null);

  // Camera states
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [cameraError, setCameraError] = useState<string>("");
  const [, setIsPlantDetected] = useState<boolean | null>(null);
  const [, setHasMultipleLeaves] = useState<boolean>(false);
  const [requestCount, setRequestCount] = useState(0);
  const [lastResponseTime, setLastResponseTime] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [consecutiveSingleLeafCount, setConsecutiveSingleLeafCount] = useState(0);
  const [detectionStatus, setDetectionStatus] = useState<'no-leaf' | 'single-leaf' | 'multiple-leaves' | 'initializing'>('initializing');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // AI-generated content states
  const [diseaseInfo, setDiseaseInfo] = useState<string>("");
  const [diseaseCauses, setDiseaseCauses] = useState<string>("");
  const [diseaseSymptoms, setDiseaseSymptoms] = useState<string>("");
  const [diseaseTreatment, setDiseaseTreatment] = useState<string>("");
  const [diseasePrevention, setDiseasePrevention] = useState<string>("");
  const [diseaseAlternatives, setDiseaseAlternatives] = useState<string>("");

  // Loading states for each section
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [loadingCauses, setLoadingCauses] = useState(false);
  const [loadingSymptoms, setLoadingSymptoms] = useState(false);
  const [loadingTreatment, setLoadingTreatment] = useState(false);
  const [loadingPrevention, setLoadingPrevention] = useState(false);
  const [loadingAlternatives, setLoadingAlternatives] = useState(false);

  // Extracted terms for highlighting
  const [extractedTerms, setExtractedTerms] = useState<ExtractedTerm[]>([]);
  const [isExtractingTerms, setIsExtractingTerms] = useState(false);
  const [showTermsNotification, setShowTermsNotification] = useState(false);

  // Notification state
  const [showCompleteNotification, setShowCompleteNotification] =
    useState(false);

  // Track completion of all sections
  const [completedSections, setCompletedSections] = useState({
    info: false,
    causes: false,
    symptoms: false,
    treatment: false,
    prevention: false,
    alternatives: false,
  });

  // Add a flag to track if we should auto-analyze
  const [shouldAutoAnalyze, setShouldAutoAnalyze] = useState(false);

  // Check for captured image from live mode on mount
  useEffect(() => {
    const capturedImage = sessionStorage.getItem("capturedImage");
    if (capturedImage) {
      console.log("📸 Found captured image from live mode, auto-analyzing...");
      setBase64String(capturedImage);
      setPreviewUrl(capturedImage);

      // Clear from sessionStorage
      sessionStorage.removeItem("capturedImage");

      // Set flag to trigger auto-analysis
      setShouldAutoAnalyze(true);
    }
  }, []);

  // Auto-scroll to bottom of logs when new steps are added
  useEffect(() => {
    if (expandedLogs && logsContainerRef.current) {
      logsContainerRef.current.scrollTop =
        logsContainerRef.current.scrollHeight;
    }
  }, [allSteps, expandedLogs]);

  // Check if all sections are complete and show notification + extract terms
  useEffect(() => {
    const allComplete =
      completedSections.info &&
      completedSections.causes &&
      completedSections.symptoms &&
      completedSections.treatment &&
      completedSections.prevention &&
      ((apiResults?.prediction?.confidence_percentage ?? 0) >= 80 ||
        completedSections.alternatives);

    if (allComplete && showResults && !showCompleteNotification) {
      setShowCompleteNotification(true);
      
      // Extract terms from all generated content
      extractTermsFromContent();
      
      // Auto-hide after 4 seconds
      const timer = setTimeout(() => {
        setShowCompleteNotification(false);
        // Reset completed sections to prevent re-triggering
        setCompletedSections({
          info: false,
          causes: false,
          symptoms: false,
          treatment: false,
          prevention: false,
          alternatives: false,
        });
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [completedSections, showResults, apiResults]);

  // Extract technical terms from all generated content
  const extractTermsFromContent = async () => {
    if (isExtractingTerms) return; // Prevent duplicate calls
    
    setIsExtractingTerms(true);
    console.log('🔍 Extracting technical terms from content...');
    
    try {
      // Combine all content sections
      const combinedContent = [
        diseaseInfo,
        diseaseCauses,
        diseaseSymptoms,
        diseaseTreatment,
        diseasePrevention,
        diseaseAlternatives
      ].filter(Boolean).join('\n\n');

      if (!combinedContent.trim()) {
        console.log('⚠️ No content to extract terms from');
        setIsExtractingTerms(false);
        return;
      }

      const response = await fetch('/api/extract-terms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: combinedContent }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log(`✅ Extracted ${data.terms.length} terms for highlighting`);
        setExtractedTerms(data.terms);
        
        // Show success notification
        if (data.terms.length > 0) {
          setShowTermsNotification(true);
          // Auto-hide after 5 seconds
          setTimeout(() => {
            setShowTermsNotification(false);
          }, 5000);
        }
      } else {
        console.error('Failed to extract terms:', data.error);
      }
    } catch (error) {
      console.error('Error extracting terms:', error);
    } finally {
      setIsExtractingTerms(false);
    }
  };

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

  // Format text with markdown-style formatting
  const formatText = (text: string): string => {
    // Convert **bold** to <strong>
    let formatted = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // Remove standalone asterisks (bullets without proper formatting)
    formatted = formatted.replace(/^\* /gm, "• ");
    formatted = formatted.replace(/\n\* /g, "\n• ");

    // Add spacing after numbered list items (1. 2. 3. etc.)
    // This adds a blank line after each numbered point for better readability
    formatted = formatted.replace(/(\d+\.\s.*?)(\n)(\d+\.)/g, "$1\n\n$3");

    // Convert line breaks
    formatted = formatted.replace(/\n/g, "<br/>");

    return formatted;
  };

  // Typing animation with reliable timing using requestAnimationFrame
  const typeText = (
    text: string,
    setter: (val: string) => void,
    sectionName?: string
  ) => {
    setter(""); // Clear previous content

    const maxDuration = 2500; // 2.5 seconds max
    const totalChars = text.length;
    const startTime = performance.now();

    console.log(
      `🎬 Starting to type ${totalChars} chars (max ${maxDuration}ms)`
    );

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;

      // Calculate how many characters should be shown based on elapsed time
      const progress = Math.min(elapsed / maxDuration, 1); // 0 to 1
      const charsToShow = Math.floor(progress * totalChars);

      if (charsToShow <= totalChars) {
        const substring = text.substring(0, charsToShow);
        const formatted = formatText(substring);
        setter(formatted);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // Final update with complete text
          setter(formatText(text));
          console.log(`✅ Completed in ${(elapsed / 1000).toFixed(2)}s`);

          // Mark section as complete
          if (sectionName) {
            setCompletedSections((prev) => ({ ...prev, [sectionName]: true }));
          }
        }
      }
    };

    requestAnimationFrame(animate);
  };

  // Generate AI content for each section
  const generateDiseaseInfo = async (diseaseName: string) => {
    setLoadingInfo(true);
    try {
      // Special handling for "Healthy" status
      if (diseaseName.toLowerCase() === "healthy") {
        const response = await fetch("/api/generate-info", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: `Rewrite the following text about healthy mango plants in a natural, conversational way:

"Your mango plant appears to be in excellent health! A healthy mango plant exhibits vibrant green leaves, strong stems, and shows no signs of disease or pest damage. This indicates that the plant is receiving adequate sunlight, proper nutrition, and appropriate water, while being well-protected from common mango diseases."

CRITICAL INSTRUCTIONS:
- Output ONLY the rewritten text, nothing else
- Do NOT include phrases like "Here's the paraphrased text:" or "Here is:" or any meta-commentary
- Keep it 2-4 sentences
- Use **bold** for the term "healthy" or "excellent health"
- Maintain the positive, encouraging tone
- Start directly with the rewritten content`,
          }),
        });
        const data = await response.json();
        if (data.success) {
          setLoadingInfo(false);
          typeText(data.text, setDiseaseInfo, "info");
        }
        return;
      }

      // Normal disease information
      const response = await fetch("/api/generate-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `What is ${diseaseName} in mango plants? 

Provide a concise, in-depth explanation in 2-5 sentences. Focus on:
- What it is (pathogen type, scientific name if relevant)
- How it affects mango plants
- Key characteristics

Use **bold** for important terms. Be clear and direct. No fluff.`,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setLoadingInfo(false); // Stop loading before typing starts
        typeText(data.text, setDiseaseInfo, "info"); // Start typing animation
      }
    } catch (error) {
      console.error("Error generating disease info:", error);
      setDiseaseInfo("Failed to generate information.");
      setLoadingInfo(false);
    }
  };

  const generateDiseaseCauses = async (diseaseName: string) => {
    setLoadingCauses(true);
    try {
      // Special handling for "Healthy" status
      if (diseaseName.toLowerCase() === "healthy") {
        const response = await fetch("/api/generate-info", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: `Rewrite the following text about factors contributing to healthy mango plants in your own words:

"1. **Optimal Environmental Conditions**: Mango plants require abundant sunlight (at least 6-8 hours daily), warm temperatures (ideally 24-30°C), and suitable humidity levels to perform photosynthesis efficiently and develop strong, healthy tissues.

2. **Balanced Nutrition and Watering**: Consistent and appropriate water supply, combined with a well-balanced fertilization program that provides essential macro and micronutrients, ensures the plant has the resources needed for robust growth, fruiting, and overall vigor.

3. **Effective Pest and Disease Management**: Regular monitoring and timely intervention to control common mango pests (e.g., fruit flies, mealybugs) and diseases (e.g., anthracnose, powdery mildew) prevent stress, damage, and resource drain, allowing the plant to maintain its healthy state.

4. **Appropriate Soil Health**: Well-draining, fertile soil with the correct pH range (typically 5.5-7.5) provides adequate aeration, water retention, and nutrient availability, which are crucial for a strong root system and the overall health and productivity of the mango plant."

CRITICAL INSTRUCTIONS:
- Output ONLY the rewritten numbered list, nothing else
- Do NOT include any introductory phrases like "Here's the paraphrased text:" or "Here is the rewritten version:" or similar
- Start directly with "1. **Factor Name**:"
- Keep the numbered list format (1. 2. 3. 4.)
- Use **bold** for factor names
- Rephrase each point naturally while keeping specific numbers and key details
- Keep it concise`,
          }),
        });
        const data = await response.json();
        if (data.success) {
          setLoadingCauses(false);
          typeText(data.text, setDiseaseCauses, "causes");
        }
        return;
      }

      // Normal disease causes
      const response = await fetch("/api/generate-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `What are the typical causes for ${diseaseName} in mango plants?

Provide 2-4 main causes as a numbered list. Format:
1. **Cause name**: Brief explanation
2. **Cause name**: Brief explanation

IMPORTANT: Only use numbers (1. 2. 3.). Do NOT use asterisks (*) or bullets. Use **bold** only for cause names.`,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setLoadingCauses(false);
        typeText(data.text, setDiseaseCauses, "causes");
      }
    } catch (error) {
      console.error("Error generating causes:", error);
      setDiseaseCauses("Failed to generate information.");
      setLoadingCauses(false);
    }
  };

  const generateDiseaseSymptoms = async (diseaseName: string) => {
    setLoadingSymptoms(true);
    try {
      // Special handling for "Healthy" status
      if (diseaseName.toLowerCase() === "healthy") {
        const response = await fetch("/api/generate-info", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: `Rewrite the following text about signs of a healthy mango plant in your own words:

"1. **Vibrant Green Foliage**: Leaves display a rich, uniform green color without yellowing, browning, or discoloration, indicating proper chlorophyll production and nutrient absorption.

2. **Strong Growth and Structure**: Stems and branches are firm and sturdy, with new growth emerging regularly, showing the plant's vigor and ability to support fruit development.

3. **Clean Leaf Surfaces**: Leaves are free from spots, lesions, mold, powdery substances, or visible pests, demonstrating effective natural or managed disease and pest resistance.

4. **No Wilting or Drooping**: The plant maintains an upright, turgid appearance throughout the day, signaling adequate water uptake and efficient vascular function."

CRITICAL INSTRUCTIONS:
- Output ONLY the rewritten numbered list, nothing else
- Do NOT include any introductory text like "Here's the paraphrased text:" or "Here are the signs:" or similar
- Start directly with "1. **Indicator Name**:"
- Keep the numbered list format (1. 2. 3. 4.)
- Use **bold** for indicator names
- Rephrase naturally while keeping key information
- Keep it concise and positive`,
          }),
        });
        const data = await response.json();
        if (data.success) {
          setLoadingSymptoms(false);
          typeText(data.text, setDiseaseSymptoms, "symptoms");
        }
        return;
      }

      // Normal disease symptoms
      const response = await fetch("/api/generate-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `What are the key symptoms to check for ${diseaseName} in mango plants?

List 3-5 specific visual indicators as a numbered list:
1. **Symptom name**: Clear, concise description
2. **Symptom name**: Clear, concise description

IMPORTANT: Only use numbers (1. 2. 3.). Do NOT use asterisks (*) or bullets. Use **bold** only for symptom names.`,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setLoadingSymptoms(false);
        typeText(data.text, setDiseaseSymptoms, "symptoms");
      }
    } catch (error) {
      console.error("Error generating symptoms:", error);
      setDiseaseSymptoms("Failed to generate information.");
      setLoadingSymptoms(false);
    }
  };

  const generateDiseaseTreatment = async (diseaseName: string) => {
    setLoadingTreatment(true);
    try {
      // Special handling for "Healthy" status
      if (diseaseName.toLowerCase() === "healthy") {
        const response = await fetch("/api/generate-info", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: `Rewrite the following maintenance plan for healthy mango plants in your own words:

"1. **Continue Regular Watering Schedule**: Maintain consistent deep watering every 7-10 days during growing season, adjusting based on rainfall and soil moisture, to support sustained growth and fruit development.

2. **Apply Seasonal Fertilization**: Feed with a balanced NPK fertilizer (10-10-10 or 15-15-15) every 2-3 months during the growing season, supplemented with organic compost to maintain soil fertility and plant vigor.

3. **Conduct Routine Monitoring**: Inspect leaves, stems, and fruits weekly for early signs of pests or diseases, enabling prompt intervention before issues become severe.

4. **Practice Preventive Care**: Apply periodic dormant oil sprays or neem oil treatments to ward off common pests, and ensure good air circulation through proper pruning to prevent fungal diseases."

CRITICAL INSTRUCTIONS:
- Output ONLY the rewritten numbered list, nothing else
- Do NOT include any introductory phrases like "Here's the paraphrased text:" or "Here is the maintenance plan:" or similar
- Start directly with "1. **Practice Name**:"
- Keep the numbered list format (1. 2. 3. 4.)
- Use **bold** for maintenance practice names
- Rephrase naturally while keeping specific details (numbers, timeframes, products)
- Maintain the instructional tone`,
          }),
        });
        const data = await response.json();
        if (data.success) {
          setLoadingTreatment(false);
          typeText(data.text, setDiseaseTreatment, "treatment");
        }
        return;
      }

      // Normal disease treatment
      const response = await fetch("/api/generate-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `What is the recommended treatment plan for ${diseaseName} in mango plants?

Provide 3-5 actionable steps as a numbered list. Use this exact format:
1. **Step Name**: Detailed description here.
2. **Step Name**: Detailed description here.

IMPORTANT: 
- Only use numbers (1. 2. 3.) for the main list
- Do NOT use asterisks (*) or bullets within descriptions
- Use **bold** ONLY for step names at the start
- Be specific about products, application methods, and timing
- Write in clear sentences without bullet points`,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setLoadingTreatment(false);
        typeText(data.text, setDiseaseTreatment, "treatment");
      }
    } catch (error) {
      console.error("Error generating treatment:", error);
      setDiseaseTreatment("Failed to generate information.");
      setLoadingTreatment(false);
    }
  };

  const generateDiseasePrevention = async (diseaseName: string) => {
    setLoadingPrevention(true);
    try {
      // Special handling for "Healthy" status
      if (diseaseName.toLowerCase() === "healthy") {
        const response = await fetch("/api/generate-info", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: `Rewrite the following best practices for keeping mango plants healthy in your own words:

"1. **Proper Site Selection**: Choose a location with full sun exposure, well-draining soil, and protection from strong winds to create optimal growing conditions from the start.

2. **Sanitation and Hygiene**: Remove fallen leaves, fruits, and debris regularly to eliminate breeding grounds for pests and disease pathogens, and sterilize pruning tools between cuts.

3. **Integrated Pest Management**: Implement a combination of biological controls, resistant varieties when available, and judicious use of organic or chemical treatments only when necessary.

4. **Adequate Spacing and Pruning**: Maintain proper distance between trees and prune to ensure good air circulation, which reduces humidity around foliage and prevents fungal disease development."

CRITICAL INSTRUCTIONS:
- Output ONLY the rewritten numbered list, nothing else
- Do NOT include any introductory text like "Here's the paraphrased text:" or "Here are the best practices:" or similar
- Start directly with "1. **Practice Name**:"
- Keep the numbered list format (1. 2. 3. 4.)
- Use **bold** for practice names
- Rephrase naturally while keeping specific details
- Keep it concise and actionable`,
          }),
        });
        const data = await response.json();
        if (data.success) {
          setLoadingPrevention(false);
          typeText(data.text, setDiseasePrevention, "prevention");
        }
        return;
      }

      // Normal disease prevention
      const response = await fetch("/api/generate-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `What are the best preventive measures for ${diseaseName} in mango plants?

List 3-5 practical prevention strategies as a numbered list:
1. **Prevention measure**: Specific actionable advice
2. **Prevention measure**: Specific actionable advice

IMPORTANT: Only use numbers (1. 2. 3.). Do NOT use asterisks (*) or bullets. Use **bold** only for measure names.`,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setLoadingPrevention(false);
        typeText(data.text, setDiseasePrevention, "prevention");
      }
    } catch (error) {
      console.error("Error generating prevention:", error);
      setDiseasePrevention("Failed to generate information.");
      setLoadingPrevention(false);
    }
  };

  const generateDiseaseAlternatives = async (allProbabilities: Array<{ disease: string; percentage: number }>) => {
    setLoadingAlternatives(true);
    try {
      const probabilitiesText = allProbabilities
        .map((p) => `${p.disease}: ${p.percentage.toFixed(2)}%`)
        .join(", ");

      const response = await fetch("/api/generate-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Given these disease detection probabilities for a mango plant: ${probabilitiesText}

The top prediction has moderate confidence. Provide analysis in this format:

1. Acknowledge the model's uncertainty (1 sentence)
2. **Alternative 1 (XX%)**: What distinguishes it and key signs to look for
3. **Alternative 2 (XX%)**: What distinguishes it and key signs to look for

Be concise but informative. Use **bold** for disease names and percentages.`,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setLoadingAlternatives(false);
        typeText(data.text, setDiseaseAlternatives, "alternatives");
      }
    } catch (error) {
      console.error("Error generating alternatives:", error);
      setDiseaseAlternatives("Failed to generate information.");
      setLoadingAlternatives(false);
    }
  };

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
    setShowCompleteNotification(false);
    setCompletedSections({
      info: false,
      causes: false,
      symptoms: false,
      treatment: false,
      prevention: false,
      alternatives: false,
    });

    // Start API calls immediately in parallel with animation
    const apiCallsPromise = (async () => {
      try {
        // Step 1: Check if the image is a plant leaf
        console.log("🔍 Checking if image is a plant...");
        const checkResponse = await fetch("/api/check-plant-live", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ image: base64String }),
        });

        const checkData = await checkResponse.json();
        console.log("Plant check result:", checkData);

        if (!checkResponse.ok) {
          throw new Error(
            checkData.error || "Failed to check if image is a plant"
          );
        }

        // If not a plant, show confirmation dialog
        if (!checkData.isPlant) {
          const userConfirmed = window.confirm(
            "⚠️ This image doesn't appear to be a plant leaf.\n\n" +
              "Are you sure the image you uploaded is a leaf from a mango tree?\n\n" +
              'Click "OK" to proceed anyway, or "Cancel" to upload a different image.'
          );

          if (!userConfirmed) {
            // User cancelled
            return { cancelled: true };
          }
          console.log("⚠️ User confirmed to proceed despite not being a plant");
        } else {
          console.log("✅ Image confirmed as plant leaf");
        }

        // Step 2: Call the disease prediction API
        console.log("🤖 Running disease prediction...");
        const response = await fetch("/api/predict-disease", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ image: base64String }),
        });

        const data = await response.json();

        if (response.ok) {
          // Fire AI content generation immediately after disease prediction
          const diseaseName = data.prediction?.disease;
          if (diseaseName) {
            console.log("🚀 Firing all AI content generation calls...");
            // Fire all calls at once - they'll update independently
            generateDiseaseInfo(diseaseName);
            generateDiseaseCauses(diseaseName);
            generateDiseaseSymptoms(diseaseName);
            generateDiseaseTreatment(diseaseName);
            generateDiseasePrevention(diseaseName);

            // Generate alternatives if confidence is low
            if (
              data.prediction?.confidence_percentage < 80 &&
              data.all_probabilities
            ) {
              generateDiseaseAlternatives(data.all_probabilities);
            }
          }

          return { success: true, data };
        } else {
          return {
            success: false,
            data: {
              error: data.error || "Failed to get prediction from API",
              details: data.details,
              instructions: data.instructions,
            },
          };
        }
      } catch (error) {
        console.error("Error calling API:", error);
        return {
          success: false,
          data: {
            error: "Network error",
            details: error instanceof Error ? error.message : "Unknown error",
          },
        };
      }
    })();

    // Simulate the analysis process with variable timing for realism
    let stepIndex = 0;
    const totalDuration = 7000; // 7 seconds total
    const baseDelay = totalDuration / LOADING_STEPS.length; // Average delay per step

    const processNextStep = () => {
      if (stepIndex < LOADING_STEPS.length) {
        setAllSteps((prev) => [...prev, LOADING_STEPS[stepIndex]]);
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
        } else if (stepIndex % 13 === 0) {
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

          // Set results and show them (AI generation already started)
          setApiResults(result.data);
          if (result.success) {
            console.log("API Results:", result.data);
          }
          setIsAnalyzing(false);
          setShowResults(true);
        }, 300);
      }
    };

    // Start the process
    processNextStep();
  };

  // Auto-analyze when image is ready from live mode
  useEffect(() => {
    if (shouldAutoAnalyze && base64String) {
      console.log("🚀 Auto-starting analysis with captured image...");
      setShouldAutoAnalyze(false);
      // Give a small delay to ensure UI is ready
      setTimeout(() => {
        handleAnalyze();
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldAutoAnalyze, base64String]);

  // Camera utility functions
  const captureFrame = (): string | null => {
    if (!videoRef.current) return null;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return null;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(videoRef.current, 0, 0);
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
      const base64Image = captureFrame();
      if (!base64Image) {
        setIsProcessing(false);
        return;
      }

      const response = await fetch('/api/check-plant-live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image }),
      });

      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      if (!response.ok) {
        const errorData = await response.json();
        setCameraError(errorData.error || 'Failed to check plant');
      } else {
        const data = await response.json();
        setIsPlantDetected(data.isPlant);
        setHasMultipleLeaves(data.hasMultipleLeaves);
        setCameraError("");
        setRequestCount(currentRequestNumber);
        setLastResponseTime(responseTime);

        let newStatus: 'no-leaf' | 'single-leaf' | 'multiple-leaves' | 'initializing';
        if (!data.isPlant) {
          newStatus = 'no-leaf';
          setConsecutiveSingleLeafCount(0);
        } else if (data.hasMultipleLeaves) {
          newStatus = 'multiple-leaves';
          setConsecutiveSingleLeafCount(0);
        } else {
          newStatus = 'single-leaf';
          setConsecutiveSingleLeafCount(prev => {
            const newCount = prev + 1;
            console.log(`🍃 Single leaf detected! Consecutive count: ${newCount}/3`);
            if (newCount >= 3) {
              console.log('✅ 3 consecutive detections! Auto-analyzing...');
              if (detectionIntervalRef.current) {
                clearInterval(detectionIntervalRef.current);
                detectionIntervalRef.current = null;
              }
              stopLiveMode();
              setBase64String(base64Image);
              setPreviewUrl(base64Image);
              setShouldAutoAnalyze(true);
              setDetectorMode('upload');
              return 0;
            }
            return newCount;
          });
        }
        setDetectionStatus(newStatus);
      }
    } catch (err) {
      console.error('Error in detection:', err);
      setCameraError(err instanceof Error ? err.message : 'Detection failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const startLiveMode = async () => {
    try {
      setCameraError("");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsLiveMode(true);
        await videoRef.current.play();
        setRequestCount(0);
        setIsPlantDetected(null);
        setHasMultipleLeaves(false);
        setConsecutiveSingleLeafCount(0);
        setDetectionStatus('initializing');

        setTimeout(() => {
          detectPlant();
          const interval = setInterval(() => detectPlant(), 1000);
          detectionIntervalRef.current = interval;
        }, 500);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setCameraError("Unable to access camera. Please ensure camera permissions are granted.");
    }
  };

  const stopLiveMode = () => {
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
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    };
  }, []);

  return (
    <div className="min-h-screen p-8 bg-background relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold">Mango Disease Detector</h1>
          <p className="text-muted-foreground mt-2">
            Upload a mango leaf image for AI-powered disease detection
          </p>
        </div>

        <div
          className={`grid gap-8 transition-all duration-500 ${
            showResults ? "lg:grid-cols-2" : "place-items-center"
          }`}
        >
          {/* Upload/Camera Section */}
          <div
            className={`w-full transition-all duration-500 ${
              !showResults ? "max-w-2xl" : ""
            }`}
          >
            <Card className="pt-0 overflow-hidden">
              {/* Tab Switcher - Attached to top of card */}
              <div className="border-b">
                <div className="flex gap-0">
                  <button
                    onClick={() => {
                      if (detectorMode === 'camera' && isLiveMode) stopLiveMode();
                      setDetectorMode("upload");
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-3.5 transition-all duration-200 border-b-2 ${
                      detectorMode === "upload"
                        ? "border-primary bg-primary/5 text-foreground font-medium"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Image</span>
                  </button>
                  <button
                    onClick={() => setDetectorMode("camera")}
                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-3.5 transition-all duration-200 border-b-2 ${
                      detectorMode === "camera"
                        ? "border-primary bg-primary/5 text-foreground font-medium"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <Camera className="w-4 h-4" />
                    <span>Live Camera</span>
                  </button>
                </div>
              </div>

              <CardHeader>
                <CardTitle>{detectorMode === "upload" ? "Upload Mango Leaf Image" : "Live Camera Feed"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {detectorMode === "upload" ? (
                  // Upload Mode Content
                  <>
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
                        {imageFile.name} ({(imageFile.size / 1024).toFixed(2)}{" "}
                        KB)
                      </p>
                    )}
                  </div>
                )}

                <Button
                  onClick={handleAnalyze}
                  disabled={(!imageFile && !base64String) || isAnalyzing}
                  className="w-full"
                  size="lg"
                >
                  {isAnalyzing ? "Analyzing..." : "Analyze for Diseases"}
                </Button>
                </>
                ) : (
                  // Camera Mode Content
                  <>
                    {/* Video Display */}
                    <div className="relative bg-muted rounded-lg overflow-hidden aspect-video">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full h-full object-cover ${
                          isLiveMode ? "block" : "hidden"
                        }`}
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
                    {cameraError && (
                      <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg text-sm">
                        {cameraError}
                      </div>
                    )}

                    {/* Control Buttons */}
                    <div className="flex gap-4">
                      {!isLiveMode ? (
                        <Button onClick={startLiveMode} className="flex-1" size="lg">
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

                    {/* Status Banner */}
                    {isLiveMode && (
                      <div
                        className={`p-4 rounded-lg border-2 text-center ${
                          detectionStatus === "initializing"
                            ? "bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                            : detectionStatus === "no-leaf"
                            ? "bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-900"
                            : detectionStatus === "multiple-leaves"
                            ? "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-400 dark:border-yellow-900"
                            : "bg-green-50 dark:bg-green-950/20 border-green-400 dark:border-green-900"
                        }`}
                      >
                        <div
                          className={`text-lg font-bold mb-1 ${
                            detectionStatus === "initializing"
                              ? "text-gray-600 dark:text-gray-400"
                              : detectionStatus === "no-leaf"
                              ? "text-red-600 dark:text-red-400"
                              : detectionStatus === "multiple-leaves"
                              ? "text-yellow-700 dark:text-yellow-400"
                              : "text-green-600 dark:text-green-400"
                          }`}
                        >
                          {detectionStatus === "initializing" && "⏳ Initializing..."}
                          {detectionStatus === "no-leaf" && "❌ No Leaf Detected"}
                          {detectionStatus === "multiple-leaves" &&
                            "⚠️ Multiple Leaves Detected"}
                          {detectionStatus === "single-leaf" && "✅ Leaf Detected"}
                        </div>
                        {detectionStatus === "single-leaf" &&
                          consecutiveSingleLeafCount > 0 && (
                            <div className="text-sm text-green-700 dark:text-green-300 font-semibold">
                              {consecutiveSingleLeafCount}/3 -{" "}
                              {3 - consecutiveSingleLeafCount} more to analyze
                            </div>
                          )}
                        {detectionStatus === "multiple-leaves" && (
                          <div className="text-xs text-yellow-700 dark:text-yellow-300">
                            Please focus on a single leaf
                          </div>
                        )}
                        {detectionStatus === "no-leaf" && (
                          <div className="text-xs text-red-700 dark:text-red-300">
                            Point camera at a mango leaf
                          </div>
                        )}
                      </div>
                    )}

                    {/* Live Detection Stats */}
                    {isLiveMode && (
                      <div className="p-4 bg-muted rounded-lg space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Requests Sent:</span>
                          <span className="font-semibold">{requestCount}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Last Response Time:
                          </span>
                          <span className="font-semibold">{lastResponseTime}ms</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Processing:</span>
                          <span
                            className={`font-semibold ${
                              isProcessing
                                ? "text-blue-600"
                                : "text-muted-foreground"
                            }`}
                          >
                            {isProcessing ? "⚡ Active" : "Idle"}
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Loading Section */}
            {isAnalyzing && (
              <Card className="mt-4 animate-in slide-in-from-top duration-300">
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">
                        {allSteps[currentStep]}
                      </span>
                      <span className="text-muted-foreground">
                        {Math.round(progress)}%
                      </span>
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
                      <div
                        ref={logsContainerRef}
                        className="p-3 border-t max-h-48 overflow-y-auto bg-muted/20"
                      >
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
            <AnalysisResults
              apiResults={apiResults}
              diseaseInfo={diseaseInfo}
              diseaseCauses={diseaseCauses}
              diseaseSymptoms={diseaseSymptoms}
              diseaseTreatment={diseaseTreatment}
              diseasePrevention={diseasePrevention}
              diseaseAlternatives={diseaseAlternatives}
              loadingInfo={loadingInfo}
              loadingCauses={loadingCauses}
              loadingSymptoms={loadingSymptoms}
              loadingTreatment={loadingTreatment}
              loadingPrevention={loadingPrevention}
              loadingAlternatives={loadingAlternatives}
              extractedTerms={extractedTerms}
              isExtractingTerms={isExtractingTerms}
            />
          )}
        </div>
      </div>
    </div>
  );
}

'use client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import HighlightedText from "@/components/highlighted-text";

interface ExtractedTerm {
  term: string;
  definition: string;
  usage?: string;
  category: 'pesticide' | 'fungicide' | 'treatment' | 'nutrient' | 'practice' | 'condition';
}

interface AnalysisResultsProps {
  apiResults: any;
  diseaseInfo: string;
  diseaseCauses: string;
  diseaseSymptoms: string;
  diseaseTreatment: string;
  diseasePrevention: string;
  diseaseAlternatives: string;
  loadingInfo: boolean;
  loadingCauses: boolean;
  loadingSymptoms: boolean;
  loadingTreatment: boolean;
  loadingPrevention: boolean;
  loadingAlternatives: boolean;
  extractedTerms: ExtractedTerm[];
  isExtractingTerms: boolean;
}

export default function AnalysisResults({
  apiResults,
  diseaseInfo,
  diseaseCauses,
  diseaseSymptoms,
  diseaseTreatment,
  diseasePrevention,
  diseaseAlternatives,
  loadingInfo,
  loadingCauses,
  loadingSymptoms,
  loadingTreatment,
  loadingPrevention,
  loadingAlternatives,
  extractedTerms,
  isExtractingTerms,
}: AnalysisResultsProps) {
  const isHealthy = apiResults?.prediction?.disease?.toLowerCase() === "healthy";
  const isLowConfidence = apiResults?.prediction && apiResults.prediction.confidence_percentage < 80;

  return (
    <Card className="animate-in slide-in-from-right duration-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          Analysis Results
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Error Display (if any) */}
        {apiResults?.error && (
          <div className="bg-destructive/10 border border-destructive rounded-md p-3 space-y-2">
            <p className="font-semibold text-destructive flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {apiResults.error}
            </p>
            {apiResults.details && (
              <p className="text-xs text-muted-foreground">
                {apiResults.details}
              </p>
            )}
            {apiResults.instructions && (
              <div className="mt-2 p-2 bg-background rounded text-xs">
                <p className="font-semibold mb-1">To fix this:</p>
                <code className="text-primary">
                  {apiResults.instructions}
                </code>
              </div>
            )}
          </div>
        )}

        {/* Plant Type */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Plant Type
          </h3>
          <p className="text-lg font-semibold">Mango</p>
        </div>

        {/* Disease Detected / Health Status */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            {isHealthy ? "Health Status" : "Disease Detected"}
          </h3>
          {apiResults?.prediction && (
            <>
              <p
                className={`text-lg font-semibold flex items-center gap-2 ${
                  isHealthy
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {isHealthy ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                {apiResults.prediction.disease}
              </p>
              <div className="mt-3">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Confidence</span>
                  <span className="font-semibold">
                    {apiResults.prediction.confidence_percentage?.toFixed(2)}%
                  </span>
                </div>
                <Progress
                  value={apiResults.prediction.confidence_percentage}
                  className="h-2"
                />
              </div>
            </>
          )}
        </div>

        {/* Main Content Accordion */}
        <Accordion type="multiple" className="w-full">
          {/* Pesticides Glossary - Show on top ONLY if NOT healthy */}
          {((extractedTerms.filter(t => t.category === 'pesticide').length > 0) || isExtractingTerms) && 
           apiResults?.prediction?.disease?.toLowerCase() !== 'healthy' && (
            <AccordionItem value="pesticides-glossary" className="border-l-4 border-l-red-500">
              <AccordionTrigger className="text-base font-semibold hover:no-underline pl-4">
                <div className="flex items-center gap-2 w-full">
                  <span className="text-red-700 dark:text-red-400">Pesticides</span>
                  {isExtractingTerms ? (
                    <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded-full animate-pulse">
                      Generating...
                    </span>
                  ) : extractedTerms.filter(t => t.category === 'pesticide').length > 0 ? (
                    <>
                      <span className="text-xs font-normal text-muted-foreground">
                        ({extractedTerms.filter(t => t.category === 'pesticide').length} term{extractedTerms.filter(t => t.category === 'pesticide').length !== 1 ? 's' : ''})
                      </span>
                      <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full ml-auto">
                        Generated
                      </span>
                    </>
                  ) : null}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border border-red-200 dark:border-red-900 ml-4">
                  <Accordion type="multiple" className="w-full">
                    {extractedTerms
                      .filter(t => t.category === 'pesticide')
                      .map((term, idx) => (
                        <AccordionItem key={idx} value={`pesticide-${idx}`} className="border-b-red-200 dark:border-b-red-900">
                          <AccordionTrigger className="text-sm font-medium text-red-700 dark:text-red-400 hover:no-underline py-2">
                            {term.term}
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2 pl-4">
                              <div>
                                <p className="text-xs font-semibold text-foreground mb-1">Definition:</p>
                                <p className="text-xs text-muted-foreground">{term.definition}</p>
                              </div>
                              {term.usage && (
                                <div>
                                  <p className="text-xs font-semibold text-foreground mb-1">How to use:</p>
                                  <p className="text-xs text-muted-foreground">{term.usage}</p>
                                </div>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                  </Accordion>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Fungicides Glossary - Show on top ONLY if NOT healthy */}
          {((extractedTerms.filter(t => t.category === 'fungicide').length > 0) || isExtractingTerms) && 
           apiResults?.prediction?.disease?.toLowerCase() !== 'healthy' && (
            <AccordionItem value="fungicides-glossary-top" className="border-l-4 border-l-orange-500">
              <AccordionTrigger className="text-base font-semibold hover:no-underline pl-4">
                <div className="flex items-center gap-2 w-full">
                  <span className="text-orange-700 dark:text-orange-400">Fungicides</span>
                  {isExtractingTerms ? (
                    <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded-full animate-pulse">
                      Generating...
                    </span>
                  ) : extractedTerms.filter(t => t.category === 'fungicide').length > 0 ? (
                    <>
                      <span className="text-xs font-normal text-muted-foreground">
                        ({extractedTerms.filter(t => t.category === 'fungicide').length} term{extractedTerms.filter(t => t.category === 'fungicide').length !== 1 ? 's' : ''})
                      </span>
                      <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full ml-auto">
                        Generated
                      </span>
                    </>
                  ) : null}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg border border-orange-200 dark:border-orange-900 ml-4">
                  <Accordion type="multiple" className="w-full">
                    {extractedTerms
                      .filter(t => t.category === 'fungicide')
                      .map((term, idx) => (
                        <AccordionItem key={idx} value={`fungicide-top-${idx}`} className="border-b-orange-200 dark:border-b-orange-900">
                          <AccordionTrigger className="text-sm font-medium text-orange-700 dark:text-orange-400 hover:no-underline py-2">
                            {term.term}
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2 pl-4">
                              <div>
                                <p className="text-xs font-semibold text-foreground mb-1">Definition:</p>
                                <p className="text-xs text-muted-foreground">{term.definition}</p>
                              </div>
                              {term.usage && (
                                <div>
                                  <p className="text-xs font-semibold text-foreground mb-1">How to use:</p>
                                  <p className="text-xs text-muted-foreground">{term.usage}</p>
                                </div>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                  </Accordion>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Description */}
          <AccordionItem value="description">
            <AccordionTrigger className="text-base font-semibold hover:no-underline">
              <div className="flex items-center gap-2 w-full">
                <span>
                  {isHealthy ? "Health Overview" : "Description"}
                </span>
                {loadingInfo || loadingCauses ? (
                  <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded-full animate-pulse ml-auto">
                    Generating...
                  </span>
                ) : diseaseInfo && diseaseCauses ? (
                  <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full ml-auto">
                    Generated
                  </span>
                ) : null}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="bg-muted/30 p-4 rounded-lg border space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-foreground mb-2">
                    {isHealthy
                      ? "What does a healthy mango plant look like?"
                      : `What is ${apiResults?.prediction?.disease || "this disease"}?`}
                  </h4>
                  {loadingInfo ? (
                    <p className="text-sm text-muted-foreground leading-relaxed animate-pulse">
                      ✨ Generating...
                    </p>
                  ) : (
                    <HighlightedText
                      content={diseaseInfo || "Information about this disease will be displayed here."}
                      terms={extractedTerms}
                      className="text-sm text-foreground leading-relaxed"
                    />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground mb-2">
                    {isHealthy
                      ? "Factors contributing to plant health:"
                      : `Typical causes for ${apiResults?.prediction?.disease || "this disease"} are:`}
                  </h4>
                  {loadingCauses ? (
                    <p className="text-sm text-muted-foreground leading-relaxed animate-pulse">
                      ✨ Generating...
                    </p>
                  ) : (
                    <HighlightedText
                      content={diseaseCauses || "Causes and conditions that lead to this disease will be displayed here."}
                      terms={extractedTerms}
                      className="text-sm text-foreground leading-relaxed"
                    />
                  )}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Key Symptoms to Check / Health Indicators */}
          <AccordionItem value="symptoms">
            <AccordionTrigger className="text-base font-semibold hover:no-underline">
              <div className="flex items-center gap-2 w-full">
                <span>
                  {isHealthy ? "Signs of a Healthy Plant" : "Key Symptoms to Check"}
                </span>
                {loadingSymptoms ? (
                  <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded-full animate-pulse ml-auto">
                    Generating...
                  </span>
                ) : diseaseSymptoms ? (
                  <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full ml-auto">
                    Generated
                  </span>
                ) : null}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="bg-muted/30 p-4 rounded-lg border">
                {loadingSymptoms ? (
                  <p className="text-sm text-muted-foreground animate-pulse">
                    ✨ Generating...
                  </p>
                ) : (
                  <HighlightedText
                    content={diseaseSymptoms || "Key symptoms and visual indicators will be displayed here."}
                    terms={extractedTerms}
                    className="text-sm text-foreground leading-relaxed"
                  />
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Recommended Treatment Plan / Maintenance Plan */}
          <AccordionItem value="treatment">
            <AccordionTrigger className="text-base font-semibold hover:no-underline">
              <div className="flex items-center gap-2 w-full">
                <span>
                  {isHealthy ? "Recommended Maintenance Plan" : "Recommended Treatment Plan"}
                </span>
                {loadingTreatment ? (
                  <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded-full animate-pulse ml-auto">
                    Generating...
                  </span>
                ) : diseaseTreatment ? (
                  <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full ml-auto">
                    Generated
                  </span>
                ) : null}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div
                className={
                  isHealthy
                    ? "bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-900"
                    : "bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-900"
                }
              >
                {loadingTreatment ? (
                  <p className="text-sm text-muted-foreground leading-relaxed animate-pulse">
                    ✨ Generating...
                  </p>
                ) : (
                  <HighlightedText
                    content={diseaseTreatment || "Treatment recommendations and protocols will be displayed here."}
                    terms={extractedTerms}
                    className={`text-sm leading-relaxed ${
                      isHealthy
                        ? "text-foreground dark:text-green-100"
                        : "text-foreground dark:text-blue-100"
                    }`}
                  />
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Preventive Measures / Best Practices */}
          <AccordionItem value="prevention">
            <AccordionTrigger className="text-base font-semibold hover:no-underline">
              <div className="flex items-center gap-2 w-full">
                <span>
                  {isHealthy ? "Best Practices to Stay Healthy" : "Preventive Measures"}
                </span>
                {loadingPrevention ? (
                  <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded-full animate-pulse ml-auto">
                    Generating...
                  </span>
                ) : diseasePrevention ? (
                  <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full ml-auto">
                    Generated
                  </span>
                ) : null}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-900">
                {loadingPrevention ? (
                  <p className="text-sm text-muted-foreground leading-relaxed animate-pulse">
                    ✨ Generating...
                  </p>
                ) : (
                  <HighlightedText
                    content={diseasePrevention || "Preventive measures and best practices will be displayed here."}
                    terms={extractedTerms}
                    className="text-sm text-foreground dark:text-green-100 leading-relaxed"
                  />
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Alternative Possibilities (only if confidence < 80%) */}
          {isLowConfidence && (
            <AccordionItem value="alternatives">
              <AccordionTrigger className="text-base font-semibold hover:no-underline">
                <div className="flex items-center gap-2 w-full">
                  <span>Alternative Possibilities</span>
                  {loadingAlternatives ? (
                    <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded-full animate-pulse ml-auto">
                      Generating...
                    </span>
                  ) : diseaseAlternatives ? (
                    <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full ml-auto">
                      Generated
                    </span>
                  ) : null}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-900">
                  {loadingAlternatives ? (
                    <p className="text-sm text-muted-foreground animate-pulse">
                      ✨ Generating alternative diagnosis analysis...
                    </p>
                  ) : (
                    <HighlightedText
                      content={diseaseAlternatives || "Alternative diagnosis information will be displayed here."}
                      terms={extractedTerms}
                      className="text-sm text-foreground dark:text-yellow-100 leading-relaxed"
                    />
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>

        {/* Recommendations Section Heading */}
        {(isExtractingTerms || extractedTerms.filter(t => ['treatment', 'nutrient', 'practice', 'condition'].includes(t.category)).length > 0 || 
          (apiResults?.prediction?.disease?.toLowerCase() === 'healthy' && extractedTerms.filter(t => ['pesticide', 'fungicide'].includes(t.category)).length > 0)) && (
          <div className="mt-8 mb-4">
            <h3 className="text-lg font-bold text-foreground">Recommendations</h3>
          </div>
        )}

        {/* Recommendations Accordion */}
        <Accordion type="multiple" className="w-full">
          {/* Pesticides Glossary - In Recommendations when Healthy */}
          {((extractedTerms.filter(t => t.category === 'pesticide').length > 0) || isExtractingTerms) && apiResults?.prediction?.disease?.toLowerCase() === 'healthy' && (
            <AccordionItem value="pesticides-glossary-rec" className="border-l-4 border-l-red-500">
              <AccordionTrigger className="text-base font-semibold hover:no-underline pl-4">
                <div className="flex items-center gap-2">
                  <span className="text-red-700 dark:text-red-400">Pesticides</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    ({extractedTerms.filter(t => t.category === 'pesticide').length} term{extractedTerms.filter(t => t.category === 'pesticide').length !== 1 ? 's' : ''})
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border border-red-200 dark:border-red-900 ml-4">
                  <Accordion type="multiple" className="w-full">
                    {extractedTerms
                      .filter(t => t.category === 'pesticide')
                      .map((term, idx) => (
                        <AccordionItem key={idx} value={`pesticide-rec-${idx}`} className="border-b-red-200 dark:border-b-red-900">
                          <AccordionTrigger className="text-sm font-medium text-red-700 dark:text-red-400 hover:no-underline py-2">
                            {term.term}
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2 pl-4">
                              <div>
                                <p className="text-xs font-semibold text-foreground mb-1">Definition:</p>
                                <p className="text-xs text-muted-foreground">{term.definition}</p>
                              </div>
                              {term.usage && (
                                <div>
                                  <p className="text-xs font-semibold text-foreground mb-1">How to use:</p>
                                  <p className="text-xs text-muted-foreground">{term.usage}</p>
                                </div>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                  </Accordion>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Fungicides Glossary - In Recommendations when Healthy */}
          {((extractedTerms.filter(t => t.category === 'fungicide').length > 0) || isExtractingTerms) && apiResults?.prediction?.disease?.toLowerCase() === 'healthy' && (
            <AccordionItem value="fungicides-glossary-rec" className="border-l-4 border-l-orange-500">
              <AccordionTrigger className="text-base font-semibold hover:no-underline pl-4">
                <div className="flex items-center gap-2">
                  <span className="text-orange-700 dark:text-orange-400">Fungicides</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    ({extractedTerms.filter(t => t.category === 'fungicide').length} term{extractedTerms.filter(t => t.category === 'fungicide').length !== 1 ? 's' : ''})
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg border border-orange-200 dark:border-orange-900 ml-4">
                  <Accordion type="multiple" className="w-full">
                    {extractedTerms
                      .filter(t => t.category === 'fungicide')
                      .map((term, idx) => (
                        <AccordionItem key={idx} value={`fungicide-rec-${idx}`} className="border-b-orange-200 dark:border-b-orange-900">
                          <AccordionTrigger className="text-sm font-medium text-orange-700 dark:text-orange-400 hover:no-underline py-2">
                            {term.term}
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2 pl-4">
                              <div>
                                <p className="text-xs font-semibold text-foreground mb-1">Definition:</p>
                                <p className="text-xs text-muted-foreground">{term.definition}</p>
                              </div>
                              {term.usage && (
                                <div>
                                  <p className="text-xs font-semibold text-foreground mb-1">How to use:</p>
                                  <p className="text-xs text-muted-foreground">{term.usage}</p>
                                </div>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                  </Accordion>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Treatments Glossary */}
          {((extractedTerms.filter(t => t.category === 'treatment').length > 0) || isExtractingTerms) && (
            <AccordionItem value="treatments-glossary" className="border-l-4 border-l-blue-500">
              <AccordionTrigger className="text-base font-semibold hover:no-underline pl-4">
                <div className="flex items-center gap-2 w-full">
                  <span className="text-blue-700 dark:text-blue-400">Treatments</span>
                  {isExtractingTerms ? (
                    <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded-full animate-pulse">
                      Generating...
                    </span>
                  ) : extractedTerms.filter(t => t.category === 'treatment').length > 0 ? (
                    <>
                      <span className="text-xs font-normal text-muted-foreground">
                        ({extractedTerms.filter(t => t.category === 'treatment').length} term{extractedTerms.filter(t => t.category === 'treatment').length !== 1 ? 's' : ''})
                      </span>
                      <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full ml-auto">
                        Generated
                      </span>
                    </>
                  ) : null}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-900 ml-4">
                  <Accordion type="multiple" className="w-full">
                    {extractedTerms
                      .filter(t => t.category === 'treatment')
                      .map((term, idx) => (
                        <AccordionItem key={idx} value={`treatment-${idx}`} className="border-b-blue-200 dark:border-b-blue-900">
                          <AccordionTrigger className="text-sm font-medium text-blue-700 dark:text-blue-400 hover:no-underline py-2">
                            {term.term}
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2 pl-4">
                              <div>
                                <p className="text-xs font-semibold text-foreground mb-1">Definition:</p>
                                <p className="text-xs text-muted-foreground">{term.definition}</p>
                              </div>
                              {term.usage && (
                                <div>
                                  <p className="text-xs font-semibold text-foreground mb-1">How to use:</p>
                                  <p className="text-xs text-muted-foreground">{term.usage}</p>
                                </div>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                  </Accordion>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Nutrients Glossary */}
          {((extractedTerms.filter(t => t.category === 'nutrient').length > 0) || isExtractingTerms) && (
            <AccordionItem value="nutrients-glossary" className="border-l-4 border-l-green-500">
              <AccordionTrigger className="text-base font-semibold hover:no-underline pl-4">
                <div className="flex items-center gap-2 w-full">
                  <span className="text-green-700 dark:text-green-400">Nutrients</span>
                  {isExtractingTerms ? (
                    <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded-full animate-pulse">
                      Generating...
                    </span>
                  ) : extractedTerms.filter(t => t.category === 'nutrient').length > 0 ? (
                    <>
                      <span className="text-xs font-normal text-muted-foreground">
                        ({extractedTerms.filter(t => t.category === 'nutrient').length} term{extractedTerms.filter(t => t.category === 'nutrient').length !== 1 ? 's' : ''})
                      </span>
                      <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full ml-auto">
                        Generated
                      </span>
                    </>
                  ) : null}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-900 ml-4">
                  <Accordion type="multiple" className="w-full">
                    {extractedTerms
                      .filter(t => t.category === 'nutrient')
                      .map((term, idx) => (
                        <AccordionItem key={idx} value={`nutrient-${idx}`} className="border-b-green-200 dark:border-b-green-900">
                          <AccordionTrigger className="text-sm font-medium text-green-700 dark:text-green-400 hover:no-underline py-2">
                            {term.term}
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2 pl-4">
                              <div>
                                <p className="text-xs font-semibold text-foreground mb-1">Definition:</p>
                                <p className="text-xs text-muted-foreground">{term.definition}</p>
                              </div>
                              {term.usage && (
                                <div>
                                  <p className="text-xs font-semibold text-foreground mb-1">How to use:</p>
                                  <p className="text-xs text-muted-foreground">{term.usage}</p>
                                </div>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                  </Accordion>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Practices Glossary */}
          {((extractedTerms.filter(t => t.category === 'practice').length > 0) || isExtractingTerms) && (
            <AccordionItem value="practices-glossary" className="border-l-4 border-l-purple-500">
              <AccordionTrigger className="text-base font-semibold hover:no-underline pl-4">
                <div className="flex items-center gap-2 w-full">
                  <span className="text-purple-700 dark:text-purple-400">Practices</span>
                  {isExtractingTerms ? (
                    <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded-full animate-pulse">
                      Generating...
                    </span>
                  ) : extractedTerms.filter(t => t.category === 'practice').length > 0 ? (
                    <>
                      <span className="text-xs font-normal text-muted-foreground">
                        ({extractedTerms.filter(t => t.category === 'practice').length} term{extractedTerms.filter(t => t.category === 'practice').length !== 1 ? 's' : ''})
                      </span>
                      <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full ml-auto">
                        Generated
                      </span>
                    </>
                  ) : null}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg border border-purple-200 dark:border-purple-900 ml-4">
                  <Accordion type="multiple" className="w-full">
                    {extractedTerms
                      .filter(t => t.category === 'practice')
                      .map((term, idx) => (
                        <AccordionItem key={idx} value={`practice-${idx}`} className="border-b-purple-200 dark:border-b-purple-900">
                          <AccordionTrigger className="text-sm font-medium text-purple-700 dark:text-purple-400 hover:no-underline py-2">
                            {term.term}
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2 pl-4">
                              <div>
                                <p className="text-xs font-semibold text-foreground mb-1">Definition:</p>
                                <p className="text-xs text-muted-foreground">{term.definition}</p>
                              </div>
                              {term.usage && (
                                <div>
                                  <p className="text-xs font-semibold text-foreground mb-1">How to use:</p>
                                  <p className="text-xs text-muted-foreground">{term.usage}</p>
                                </div>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                  </Accordion>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Conditions Glossary */}
          {((extractedTerms.filter(t => t.category === 'condition').length > 0) || isExtractingTerms) && (
            <AccordionItem value="conditions-glossary" className="border-l-4 border-l-gray-500">
              <AccordionTrigger className="text-base font-semibold hover:no-underline pl-4">
                <div className="flex items-center gap-2 w-full">
                  <span className="text-gray-700 dark:text-gray-400">Conditions</span>
                  {isExtractingTerms ? (
                    <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded-full animate-pulse">
                      Generating...
                    </span>
                  ) : extractedTerms.filter(t => t.category === 'condition').length > 0 ? (
                    <>
                      <span className="text-xs font-normal text-muted-foreground">
                        ({extractedTerms.filter(t => t.category === 'condition').length} term{extractedTerms.filter(t => t.category === 'condition').length !== 1 ? 's' : ''})
                      </span>
                      <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full ml-auto">
                        Generated
                      </span>
                    </>
                  ) : null}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="bg-gray-50 dark:bg-gray-800/20 p-4 rounded-lg border border-gray-200 dark:border-gray-700 ml-4">
                  <Accordion type="multiple" className="w-full">
                    {extractedTerms
                      .filter(t => t.category === 'condition')
                      .map((term, idx) => (
                        <AccordionItem key={idx} value={`condition-${idx}`} className="border-b-gray-200 dark:border-b-gray-700">
                          <AccordionTrigger className="text-sm font-medium text-gray-700 dark:text-gray-400 hover:no-underline py-2">
                            {term.term}
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2 pl-4">
                              <div>
                                <p className="text-xs font-semibold text-foreground mb-1">Definition:</p>
                                <p className="text-xs text-muted-foreground">{term.definition}</p>
                              </div>
                              {term.usage && (
                                <div>
                                  <p className="text-xs font-semibold text-foreground mb-1">How to use:</p>
                                  <p className="text-xs text-muted-foreground">{term.usage}</p>
                                </div>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                  </Accordion>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>

        {/* Important Disclaimer */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Important Disclaimer
          </h3>
          <div className="bg-muted/50 p-4 rounded-lg border border-muted-foreground/20">
            <p className="text-xs text-muted-foreground leading-relaxed">
              This AI-powered diagnosis is provided for informational
              purposes only and should not replace professional
              agricultural advice. For accurate diagnosis and treatment
              recommendations, please consult with a certified plant
              pathologist or agricultural extension service. The
              accuracy of results depends on image quality and may vary
              based on disease stage and environmental conditions.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

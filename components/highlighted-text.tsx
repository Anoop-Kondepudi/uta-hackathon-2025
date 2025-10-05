'use client';
import { useState } from 'react';
import type { ReactElement } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Term {
  term: string;
  definition: string;
  usage?: string;
  category: 'pesticide' | 'fungicide' | 'treatment' | 'nutrient' | 'practice' | 'condition';
}

interface HighlightedTextProps {
  content: string;
  terms: Term[];
  className?: string;
}

export default function HighlightedText({ content, terms, className = '' }: HighlightedTextProps) {
  const [openPopover, setOpenPopover] = useState<string | null>(null);

  if (!terms || terms.length === 0) {
    // If no terms, just render the content as-is
    return (
      <div 
        className={className}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  // Function to escape special regex characters
  const escapeRegex = (str: string) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  // Sort terms by length (longest first) to avoid partial matches
  const sortedTerms = [...terms].sort((a, b) => b.term.length - a.term.length);

  // Create a map to track which term a word belongs to
  const termMap = new Map<string, Term>();
  
  // Build regex pattern for all terms
  const patterns = sortedTerms.map(term => {
    const escaped = escapeRegex(term.term);
    termMap.set(term.term.toLowerCase(), term);
    return `(${escaped})`;
  });
  
  const regex = new RegExp(patterns.join('|'), 'gi');

  // Parse HTML and highlight terms
  const highlightContent = (html: string): ReactElement[] => {
    const elements: ReactElement[] = [];
    let lastIndex = 0;
    let match;
    let keyIndex = 0;

    // Track which positions have already been highlighted to avoid overlaps
    const highlightedRanges: Array<[number, number]> = [];

    const isOverlapping = (start: number, end: number): boolean => {
      return highlightedRanges.some(([s, e]) => 
        (start >= s && start < e) || (end > s && end <= e) || (start <= s && end >= e)
      );
    };

    while ((match = regex.exec(html)) !== null) {
      const matchedText = match[0];
      const matchStart = match.index;
      const matchEnd = matchStart + matchedText.length;

      // Skip if this position overlaps with an already highlighted term
      if (isOverlapping(matchStart, matchEnd)) {
        continue;
      }

      // Check if we're inside an HTML tag (basic check)
      const beforeMatch = html.substring(0, matchStart);
      const lastOpenTag = beforeMatch.lastIndexOf('<');
      const lastCloseTag = beforeMatch.lastIndexOf('>');
      
      // Skip if we're inside a tag
      if (lastOpenTag > lastCloseTag) {
        continue;
      }

      // Also skip if inside an existing highlight or strong tag
      const openTagCount = (beforeMatch.match(/<span|<strong/gi) || []).length;
      const closeTagCount = (beforeMatch.match(/<\/span>|<\/strong>/gi) || []).length;
      if (openTagCount !== closeTagCount) {
        continue;
      }

      // Add text before the match
      if (matchStart > lastIndex) {
        elements.push(
          <span 
            key={`text-${keyIndex++}`}
            dangerouslySetInnerHTML={{ __html: html.substring(lastIndex, matchStart) }}
          />
        );
      }

      // Find the term data
      const term = termMap.get(matchedText.toLowerCase());
      
      if (term) {
        // Add highlighted term with popover
        const termKey = `${term.term}-${keyIndex++}`;
        
        // Get color classes based on category
        const categoryColors = {
          pesticide: 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30 decoration-red-500 hover:bg-red-100 dark:hover:bg-red-950/50',
          fungicide: 'text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 decoration-orange-500 hover:bg-orange-100 dark:hover:bg-orange-950/50',
          treatment: 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 decoration-blue-500 hover:bg-blue-100 dark:hover:bg-blue-950/50',
          nutrient: 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30 decoration-green-500 hover:bg-green-100 dark:hover:bg-green-950/50',
          practice: 'text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30 decoration-purple-500 hover:bg-purple-100 dark:hover:bg-purple-950/50',
          condition: 'text-gray-700 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/30 decoration-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800/50'
        };
        
        const colorClass = categoryColors[term.category] || categoryColors.condition;
        
        elements.push(
          <Popover key={termKey} open={openPopover === termKey} onOpenChange={(open: boolean) => setOpenPopover(open ? termKey : null)}>
            <PopoverTrigger asChild>
              <span
                className={`relative cursor-help underline decoration-dotted decoration-2 underline-offset-2 transition-all font-medium px-1 rounded ${colorClass}`}
                onMouseEnter={() => setOpenPopover(termKey)}
                onMouseLeave={() => setOpenPopover(null)}
              >
                {matchedText}
              </span>
            </PopoverTrigger>
            <PopoverContent 
              className="w-80 p-4 bg-background border-2 shadow-lg"
              side="top"
              align="start"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-base text-foreground">{term.term}</h4>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    term.category === 'pesticide' ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300' :
                    term.category === 'fungicide' ? 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300' :
                    term.category === 'treatment' ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300' :
                    term.category === 'nutrient' ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300' :
                    term.category === 'practice' ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300' :
                    'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}>
                    {term.category}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {term.definition}
                </p>
                {term.usage && (
                  <div className="pt-2 border-t">
                    <p className="text-xs font-semibold text-foreground mb-1">How to use:</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {term.usage}
                    </p>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        );

        highlightedRanges.push([matchStart, matchEnd]);
      } else {
        // If term not found in map (shouldn't happen), just add as text
        elements.push(
          <span key={`text-${keyIndex++}`}>{matchedText}</span>
        );
      }

      lastIndex = matchEnd;
    }

    // Add remaining text
    if (lastIndex < html.length) {
      elements.push(
        <span 
          key={`text-${keyIndex++}`}
          dangerouslySetInnerHTML={{ __html: html.substring(lastIndex) }}
        />
      );
    }

    return elements;
  };

  const highlightedElements = highlightContent(content);

  return (
    <div className={className}>
      {highlightedElements}
    </div>
  );
}

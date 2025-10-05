import { ExternalLink, Leaf } from "lucide-react";

import { Button } from "@/components/ui/button";
import Link from "next/dist/client/link";

const Hero = () => {
  return (
    <section className="relative overflow-hidden py-22 flex justify-center">
      <div className="absolute inset-x-0 top-0 flex h-full w-full items-center justify-center opacity-100">
        <img
          alt="background"
          src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/patterns/square-alt-grid.svg"
          className="[mask-image:radial-gradient(75%_75%_at_center,white,transparent)] opacity-90"
        />
      </div>
      <div className="relative z-10 container">
        <div className="mx-auto flex max-w-5xl flex-col items-center">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="bg-primary text-primary-foreground flex size-18 items-center justify-center rounded-lg">
              <Leaf size={50} />
            </div>
            <div>
              <h1 className="mb-6 text-2xl font-bold tracking-tight text-pretty lg:text-5xl">
                <span className="text-primary">FarmPro.Tech</span> - AI-Powered Mango Disease Detection
              </h1>
              <p className="mx-auto max-w-3xl text-muted-foreground lg:text-xl">
                Protect your mango crops with cutting-edge artificial intelligence. 
                Instantly detect and diagnose diseases from leaf images, get actionable 
                insights, and safeguard your harvest with precision agriculture.
              </p>
              <p className="mt-4 text-xl font-semibold text-primary italic">
                &quot;Don&apos;t let pests play, use FarmPro.Tech today!&quot;
              </p>
            </div>

            {/* Problem & Solution */}
            <div className="mt-12 w-full max-w-6xl">
              <div className="grid md:grid-cols-2 gap-6 lg:gap-10">
                {/* The Problem */}
                <div className="bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/30 dark:to-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-3xl p-8 shadow-lg">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-red-500 text-white p-3 rounded-xl">
                      <span className="text-2xl">⚠️</span>
                    </div>
                    <h3 className="text-2xl font-bold">The Problem</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <a 
                      href="https://www.fao.org/faostat/en/#data/QCL" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-white/60 dark:bg-black/20 backdrop-blur rounded-xl p-4 border border-red-200/50 dark:border-red-800/50 hover:border-red-300 dark:hover:border-red-700 transition-colors group"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl font-extrabold text-red-600 dark:text-red-400">20-40%</span>
                        <span className="text-sm font-semibold text-red-700 dark:text-red-300">Crop Loss</span>
                      </div>
                      <p className="text-sm text-foreground/80">Mango yield lost to pests & diseases annually</p>
                      <p className="text-xs text-muted-foreground mt-1 group-hover:text-red-600 dark:group-hover:text-red-400">Source: FAO Production Statistics →</p>
                    </a>
                    
                    <a 
                      href="https://www.ishs.org/ishs-article/1183_1" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-white/60 dark:bg-black/20 backdrop-blur rounded-xl p-4 border border-red-200/50 dark:border-red-800/50 hover:border-red-300 dark:hover:border-red-700 transition-colors group"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl font-extrabold text-red-600 dark:text-red-400">$3.7B+</span>
                        <span className="text-sm font-semibold text-red-700 dark:text-red-300">Economic Loss</span>
                      </div>
                      <p className="text-sm text-foreground/80">Annual losses from mango diseases worldwide</p>
                      <p className="text-xs text-muted-foreground mt-1 group-hover:text-red-600 dark:group-hover:text-red-400">Source: ISHS - Horticultural Science →</p>
                    </a>
                    
                    <a 
                      href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7278387/" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-white/60 dark:bg-black/20 backdrop-blur rounded-xl p-4 border border-red-200/50 dark:border-red-800/50 hover:border-red-300 dark:hover:border-red-700 transition-colors group"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl font-extrabold text-red-600 dark:text-red-400">3-7 days</span>
                        <span className="text-sm font-semibold text-red-700 dark:text-red-300">Diagnosis Delay</span>
                      </div>
                      <p className="text-sm text-foreground/80">Typical wait time for expert diagnosis in rural areas</p>
                      <p className="text-xs text-muted-foreground mt-1 group-hover:text-red-600 dark:group-hover:text-red-400">Source: NIH - Agricultural Technology Access →</p>
                    </a>
                    
                    <a 
                      href="https://www.worldbank.org/en/topic/agriculture/overview" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-white/60 dark:bg-black/20 backdrop-blur rounded-xl p-4 border border-red-200/50 dark:border-red-800/50 hover:border-red-300 dark:hover:border-red-700 transition-colors group"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl font-extrabold text-red-600 dark:text-red-400">75%</span>
                        <span className="text-sm font-semibold text-red-700 dark:text-red-300">Limited Access</span>
                      </div>
                      <p className="text-sm text-foreground/80">Smallholder farmers lack timely agricultural expertise</p>
                      <p className="text-xs text-muted-foreground mt-1 group-hover:text-red-600 dark:group-hover:text-red-400">Source: World Bank Agriculture Data →</p>
                    </a>
                  </div>
                </div>

                {/* Our Solution */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-100/50 dark:from-green-950/30 dark:to-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-3xl p-8 shadow-lg">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-green-500 text-white p-3 rounded-xl">
                      <span className="text-2xl">✓</span>
                    </div>
                    <h3 className="text-2xl font-bold">How We Help</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <Link 
                      href="/dashboard"
                      className="block bg-white/60 dark:bg-black/20 backdrop-blur rounded-xl p-4 border border-green-200/50 dark:border-green-800/50 hover:border-green-400 dark:hover:border-green-600 transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl font-extrabold text-green-600 dark:text-green-400">📷</span>
                        <span className="text-sm font-semibold text-green-700 dark:text-green-300">AI Disease Detection</span>
                      </div>
                      <p className="text-sm text-foreground/80">Upload or capture leaf images for instant 95%+ accurate diagnosis</p>
                      <p className="text-xs text-muted-foreground mt-1 group-hover:text-green-600 dark:group-hover:text-green-400">Try Disease Detector →</p>
                    </Link>
                    
                    <Link 
                      href="/dashboard"
                      className="block bg-white/60 dark:bg-black/20 backdrop-blur rounded-xl p-4 border border-green-200/50 dark:border-green-800/50 hover:border-green-400 dark:hover:border-green-600 transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl font-extrabold text-green-600 dark:text-green-400">📹</span>
                        <span className="text-sm font-semibold text-green-700 dark:text-green-300">Live Camera Analysis</span>
                      </div>
                      <p className="text-sm text-foreground/80">Real-time detection using your device camera in &lt;5 seconds</p>
                      <p className="text-xs text-muted-foreground mt-1 group-hover:text-green-600 dark:group-hover:text-green-400">Use Live Detection →</p>
                    </Link>
                    
                    <Link 
                      href="/calendar"
                      className="block bg-white/60 dark:bg-black/20 backdrop-blur rounded-xl p-4 border border-green-200/50 dark:border-green-800/50 hover:border-green-400 dark:hover:border-green-600 transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl font-extrabold text-green-600 dark:text-green-400">📅</span>
                        <span className="text-sm font-semibold text-green-700 dark:text-green-300">Smart Crop Planning</span>
                      </div>
                      <p className="text-sm text-foreground/80">AI-generated schedules & annual plans with weather insights</p>
                      <p className="text-xs text-muted-foreground mt-1 group-hover:text-green-600 dark:group-hover:text-green-400">View Planner →</p>
                    </Link>
                    
                    <Link 
                      href="/dashboard"
                      className="block bg-white/60 dark:bg-black/20 backdrop-blur rounded-xl p-4 border border-green-200/50 dark:border-green-800/50 hover:border-green-400 dark:hover:border-green-600 transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl font-extrabold text-green-600 dark:text-green-400">📊</span>
                        <span className="text-sm font-semibold text-green-700 dark:text-green-300">Dashboard & Analytics</span>
                      </div>
                      <p className="text-sm text-foreground/80">Track crop health 24/7, view history & actionable insights</p>
                      <p className="text-xs text-muted-foreground mt-1 group-hover:text-green-600 dark:group-hover:text-green-400">Open Dashboard →</p>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-center gap-3">
              <Link href={"/dashboard"} className="cursor-pointer">
                <Button variant="default" size="lg" className="group">
                  Get Started Free{" "}
                  <ExternalLink className="ml-2 h-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </Link>
            </div>
            <div className="mt-20 flex flex-col items-center gap-5">
              <p className="font-medium text-muted-foreground lg:text-left">
                Powered by advanced machine learning
              </p>
              <div className="flex flex-wrap items-center justify-center gap-6">
                <div className="flex flex-col items-center gap-2">
                  <div className="text-3xl font-bold text-primary">96%+</div>
                  <p className="text-sm text-muted-foreground">Accuracy Rate</p>
                </div>
                <div className="h-12 w-px bg-border"></div>
                <div className="flex flex-col items-center gap-2">
                  <div className="text-3xl font-bold text-primary">7+</div>
                  <p className="text-sm text-muted-foreground">Diseases Detected</p>
                </div>
                <div className="h-12 w-px bg-border"></div>
                <div className="flex flex-col items-center gap-2">
                  <div className="text-3xl font-bold text-primary">Real-time</div>
                  <p className="text-sm text-muted-foreground">Analysis</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Hero };

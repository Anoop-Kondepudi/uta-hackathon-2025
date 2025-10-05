import { ExternalLink, Leaf } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
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
                AI-Powered{" "}
                <span className="text-primary">Mango Disease</span> Detection
              </h1>
              <p className="mx-auto max-w-3xl text-muted-foreground lg:text-xl">
                Protect your mango crops with cutting-edge artificial intelligence. 
                Instantly detect and diagnose diseases from leaf images, get actionable 
                insights, and safeguard your harvest with precision agriculture.
              </p>
            </div>
            <div className="mt-6 flex justify-center gap-3">
              <Link href={"/dashboard"} className="cursor-pointer">
                <Button variant="outline" className="group">
                  Get Started{" "}
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
                  <div className="text-3xl font-bold text-primary">95%+</div>
                  <p className="text-sm text-muted-foreground">Accuracy Rate</p>
                </div>
                <div className="h-12 w-px bg-border"></div>
                <div className="flex flex-col items-center gap-2">
                  <div className="text-3xl font-bold text-primary">10+</div>
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

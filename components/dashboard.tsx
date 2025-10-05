import Link from "next/link";
import { Leaf, Activity, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function DashboardPage() {

  const services = [
    {
      title: "Mango Disease Detector",
      description:
        "AI-powered leaf analysis to detect and diagnose mango plant diseases",
      icon: Leaf,
      href: "/detector",
      color: "text-green-600",
      bgGradient: "from-green-500/10 to-green-600/5",
    },
    {
      title: "Live Mango",
      description: "Real-time monitoring and tracking of mango plant health",
      icon: Activity,
      href: "/live-mango",
      color: "text-orange-600",
      bgGradient: "from-orange-500/10 to-orange-600/5",
    },
  ];
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-600 to-orange-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-xl text-muted-foreground">
            Choose a service to get started
          </p>
        </div>

        {/* Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <Link key={service.href} href={service.href}>
                <Card
                  className={`group h-full hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer border-2 hover:border-primary bg-gradient-to-br ${service.bgGradient}`}
                >
                  <CardContent className="p-8 flex flex-col items-center text-center h-full justify-between min-h-[300px]">
                    <div className="flex flex-col items-center gap-6 flex-1 justify-center">
                      {/* Icon */}
                      <div
                        className={`w-24 h-24 rounded-2xl bg-background/80 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border-2 ${service.color}`}
                      >
                        <Icon
                          className={`w-12 h-12 ${service.color}`}
                          strokeWidth={2}
                        />
                      </div>

                      {/* Title */}
                      <h2 className="text-3xl font-bold group-hover:text-primary transition-colors">
                        {service.title}
                      </h2>

                      {/* Description */}
                      <p className="text-muted-foreground text-lg leading-relaxed">
                        {service.description}
                      </p>
                    </div>

                    {/* Arrow */}
                    <div className="mt-6 flex items-center gap-2 text-sm font-medium text-muted-foreground group-hover:text-primary group-hover:gap-4 transition-all">
                      Get Started
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">
            Powered by advanced AI technology for accurate mango plant care
          </p>
        </div>
      </div>
    </div>
  );
}

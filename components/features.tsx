import { Scan, Calendar, Camera, Sparkles, TrendingUp, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Features = () => {
  const features = [
    {
      icon: <Scan className="h-10 w-10" />,
      title: "AI Disease Detection",
      description: "Upload mango leaf images and get instant AI-powered disease diagnosis with 95%+ accuracy using advanced deep learning models trained on thousands of disease samples.",
      image: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800&q=80",
      color: "bg-green-500/10 text-green-500",
      stats: ["96%+ Accuracy", "7+ Diseases", "Instant Results"],
      reverse: false
    },
    {
      icon: <Camera className="h-10 w-10" />,
      title: "Live Camera Analysis",
      description: "Real-time disease detection using your device camera. Point and analyze leaves instantly for immediate results and actionable recommendations. Perfect for on-field diagnosis.",
      image: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&q=80",
      color: "bg-blue-500/10 text-blue-500",
      stats: ["Real-time Analysis", "Mobile Friendly", "Offline Capable"],
      reverse: true
    },
    {
      icon: <Calendar className="h-10 w-10" />,
      title: "Smart Crop Planning",
      description: "Generate personalized 2-week schedules and annual farming plans with AI-powered recommendations. Get weather-aware suggestions for optimal mango cultivation throughout the year.",
      image: "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=800&q=80",
      color: "bg-orange-500/10 text-orange-500",
      stats: ["Annual Plans", "Weather Integration", "Custom Schedules"],
      reverse: false
    },
    {
      icon: <TrendingUp className="h-10 w-10" />,
      title: "Dashboard & Analytics",
      description: "Comprehensive dashboard to track your analyses, view history, and monitor the health status of your mango plantation over time with detailed insights and trends.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
      color: "bg-teal-500/10 text-teal-500",
      stats: ["Track History", "Visual Reports", "Export Data"],
      reverse: true
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-20">
          <Badge variant="outline" className="mb-4 px-4 py-1.5">
            <Sparkles className="h-4 w-4 mr-2 inline" />
            Features
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Powerful Features for{" "}
            <span className="text-primary">Smart Farming</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need to protect your mango crops and maximize your yield with cutting-edge AI technology
          </p>
        </div>

        {/* Alternating Feature Rows */}
        <div className="space-y-32">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className={`grid lg:grid-cols-2 gap-12 items-center ${
                feature.reverse ? 'lg:grid-flow-dense' : ''
              }`}
            >
              {/* Text Content */}
              <div className={`space-y-6 ${feature.reverse ? 'lg:col-start-2' : ''}`}>
                <div className={`inline-flex items-center justify-center p-4 rounded-2xl ${feature.color}`}>
                  {feature.icon}
                </div>
                
                <div>
                  <h3 className="text-3xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  {feature.stats.map((stat, statIndex) => (
                    <Badge 
                      key={statIndex} 
                      variant="secondary" 
                      className="px-4 py-2 text-sm font-medium"
                    >
                      <CheckCircle className="h-4 w-4 mr-2 text-primary" />
                      {stat}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Image */}
              <div className={`relative ${feature.reverse ? 'lg:col-start-1 lg:row-start-1' : ''}`}>
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-border hover:border-primary/50 transition-all duration-500 group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent z-10 group-hover:from-primary/20 transition-all duration-500"></div>
                  <img 
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-[400px] object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                
                {/* Decorative Elements */}
                <div className={`absolute -top-6 ${feature.reverse ? '-left-6' : '-right-6'} w-32 h-32 bg-primary/5 rounded-full blur-3xl`}></div>
                <div className={`absolute -bottom-6 ${feature.reverse ? '-right-6' : '-left-6'} w-40 h-40 bg-green-500/5 rounded-full blur-3xl`}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA Section */}
        <div className="mt-32 text-center">
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardContent className="py-12 px-6">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                Ready to Transform Your Mango Farming?
              </h3>
              <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                Join farmers who are already using AI to protect their crops and increase yields
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/dashboard" 
                  className="inline-flex items-center justify-center px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                >
                  Get Started Free
                  <Sparkles className="ml-2 h-5 w-5" />
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export { Features };

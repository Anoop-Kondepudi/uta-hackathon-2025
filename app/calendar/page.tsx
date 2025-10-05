import Planner from "@/components/planner";

export default function CalendarPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-600 to-orange-600 bg-clip-text text-transparent">
            Calendar
          </h1>
          <p className="text-xl text-muted-foreground">
            Schedule and manage your mango crop activities
          </p>
        </div>

        {/* Calendar Component */}
        <div className="flex justify-center">
          <Planner />
        </div>
      </div>
    </div>
  );
}

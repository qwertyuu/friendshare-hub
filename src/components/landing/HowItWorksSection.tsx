import { UserPlus, Package, HandHeart, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Get Approved",
    description: "Sign up and wait for an admin to approve your membership. This keeps the network trusted.",
  },
  {
    icon: Package,
    step: "02",
    title: "List Your Stuff",
    description: "Add items you're happy to lend. Include photos and descriptions so friends know what to expect.",
  },
  {
    icon: HandHeart,
    step: "03",
    title: "Borrow & Lend",
    description: "Request items you need or respond to others' requests. Coordinate pickup directly with friends.",
  },
  {
    icon: CheckCircle,
    step: "04",
    title: "Return & Repeat",
    description: "Return items when done. The owner marks it available again. Simple, trust-based sharing.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-20 md:py-32 bg-secondary/30">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How it works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Four simple steps to start sharing with your community
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
          {steps.map((item, index) => (
            <div
              key={item.step}
              className="relative animate-fade-in"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[60%] w-full h-0.5 bg-gradient-to-r from-primary/30 to-transparent" />
              )}
              
              <div className="text-center">
                <div className="relative inline-flex mb-6">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-hero shadow-medium">
                    <item.icon className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground shadow-soft">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { Package, Search, MessageSquare, Shield, Users, Repeat } from "lucide-react";

const features = [
  {
    icon: Package,
    title: "List Your Items",
    description: "Add things you're willing to lend – tools, books, camping gear, kitchen gadgets. Add photos so friends know exactly what they're getting.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Search,
    title: "Browse Everything",
    description: "See what everyone in your group owns. Filter by category with fun emojis. Find that drill without texting five people.",
    color: "bg-accent/20 text-accent",
  },
  {
    icon: MessageSquare,
    title: "Request to Borrow",
    description: "Click a button, add a message like 'need it for the weekend', and wait for approval. Simple as that.",
    color: "bg-success/10 text-success",
  },
  {
    icon: Repeat,
    title: "Open Demands",
    description: "Post 'Looking for a bicycle' and let someone with one come to you. Reverse searching for the win.",
    color: "bg-warning/10 text-warning",
  },
  {
    icon: Shield,
    title: "Closed Network",
    description: "Admin approval required to join. Keep your circle tight and trusted. No strangers, no spam.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Users,
    title: "Built for Friends",
    description: "No money changes hands. No ratings or reviews. Just friends helping friends. The way it should be.",
    color: "bg-accent/20 text-accent",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 md:py-32 bg-secondary/30">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything you need to share
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            No complicated features. Just the essentials for lending and borrowing among friends.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-6 rounded-2xl bg-card border border-border/50 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

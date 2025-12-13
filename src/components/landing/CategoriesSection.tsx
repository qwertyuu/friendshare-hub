const categories = [
  { emoji: "🔧", name: "Tools", description: "Drills, hammers, ladders" },
  { emoji: "🍳", name: "Kitchen", description: "Appliances, cookware" },
  { emoji: "⚽", name: "Sports", description: "Bikes, equipment" },
  { emoji: "💻", name: "Electronics", description: "Cameras, chargers" },
  { emoji: "📚", name: "Books", description: "Novels, textbooks" },
  { emoji: "🎮", name: "Games", description: "Board & video games" },
  { emoji: "🏕️", name: "Camping", description: "Tents, sleeping bags" },
  { emoji: "📦", name: "Other", description: "Everything else" },
];

export function CategoriesSection() {
  return (
    <section className="py-20 md:py-32">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Organized by category
          </h2>
          <p className="text-lg text-muted-foreground">
            Find what you need fast with emoji-powered filtering
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {categories.map((category, index) => (
            <div
              key={category.name}
              className="group flex flex-col items-center p-5 rounded-2xl bg-card border border-border/50 shadow-soft hover:shadow-medium hover:border-primary/30 transition-all duration-300 cursor-pointer animate-scale-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <span className="text-4xl mb-3 group-hover:scale-125 transition-transform duration-300">
                {category.emoji}
              </span>
              <span className="font-semibold text-foreground text-sm mb-1">
                {category.name}
              </span>
              <span className="text-xs text-muted-foreground text-center">
                {category.description}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

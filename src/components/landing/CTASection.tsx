import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Heart } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-20 md:py-32">
      <div className="container">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-hero p-10 md:p-16 text-center">
          {/* Background decoration */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
          </div>

          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-primary-foreground text-sm font-medium mb-6">
              <Heart className="h-4 w-4" />
              Built for communities
            </div>

            <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-6">
              Ready to start sharing?
            </h2>

            <p className="text-lg text-primary-foreground/80 mb-8">
              Create your club, invite your friends, and stop buying things you'll only use once. It's that simple.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="xl" className="bg-white text-primary hover:bg-white/90 shadow-medium" asChild>
                <Link to="/register">
                  Create Your Club
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button size="xl" variant="ghost" className="text-primary-foreground hover:bg-white/10" asChild>
                <Link to="/login">
                  Already a member?
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div className="text-center mt-12 text-sm text-muted-foreground">
          <p>
            "Raphartage" = <span className="font-medium">Raph</span> + <span className="font-medium">Partage</span> (French for "sharing")
          </p>
          <p className="mt-1">Made with ❤️ for friend groups everywhere</p>
        </div>
      </div>
    </section>
  );
}

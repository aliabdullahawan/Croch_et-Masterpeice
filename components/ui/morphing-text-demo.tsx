import { MorphingTextReveal } from "@/components/ui/morphing-text-reveal";

export default function MorphingTextDemo() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="max-w-4xl mx-auto text-center space-y-12">
        <div className="space-y-8">
          <div className="space-y-2">
            <p className="text-sm font-mono text-muted-foreground tracking-wider uppercase">MORPHING TEXT REVEAL</p>
            <div className="text-3xl md:text-4xl font-light">
              <MorphingTextReveal
                texts={[
                  "Creation Without Limitation",
                  "Innovation Beyond Boundaries",
                  "Design Through Intention",
                  "Building With Purpose",
                ]}
                className="text-foreground"
                interval={4000}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

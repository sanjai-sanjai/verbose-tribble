import { AppLayout } from "@/components/navigation";
import { GameCard } from "@/components/ui/game-card";
import { useTranslation } from "react-i18next";
import {
  Atom,
  FlaskConical,
  Heart,
  Calculator,
  Laptop,
  Wallet,
  Lightbulb,
  TreePine,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const mascotThinkingUrl = "https://cdn.builder.io/api/v1/image/assets%2Fecf135b7255f45f9a20859de9b268e89%2F8f16f520c2f942ffad788bc4dc813e18";

const subjects = [
  { icon: Atom, title: "Physics", progress: 65, color: "primary", path: "/learn/physics" },
  { icon: FlaskConical, title: "Chemistry", progress: 45, color: "secondary", path: "/learn/chemistry" },
  { icon: Heart, title: "Biology", progress: 30, color: "destructive", path: "/learn/biology" },
  { icon: Calculator, title: "Mathematics", progress: 80, color: "badge", path: "/learn/mathematics" },
  { icon: Laptop, title: "Technology", progress: 20, color: "primary", path: "/learn/technology" },
  { icon: Wallet, title: "Finance", progress: 55, color: "accent", path: "/learn/finance" },
  { icon: Lightbulb, title: "Entrepreneurship", progress: 25, color: "badge", path: "/learn/entrepreneurship" },
  { icon: TreePine, title: "Village Skills", progress: 10, color: "secondary", path: "/learn/village-skills" },
];

export default function SubjectsPage() {
  const navigate = useNavigate();

  return (
    <AppLayout 
      role="student" 
      playCoins={1250}
      title="Subjects"
    >
      <div className="px-4 py-6">
        {/* Header with mascot */}
        <div className="mb-6 slide-up flex items-center gap-4">
          <div className="flex-1">
            <h2 className="font-heading text-2xl font-bold text-foreground">Choose a Subject</h2>
            <p className="mt-1 text-muted-foreground text-sm">
              Tap on a subject to start learning
            </p>
          </div>
          <img
            src={mascotThinkingUrl}
            alt="Mascot thinking"
            className="w-20 h-20 object-contain"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {subjects.map((subject, index) => (
            <div 
              key={subject.title}
              className="slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <GameCard
                icon={subject.icon}
                title={subject.title}
                progress={subject.progress}
                variant="default"
                colorScheme={subject.color}
                onClick={() => navigate(subject.path)}
              />
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

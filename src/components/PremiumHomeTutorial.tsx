import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Wand2,
  Library,
  BarChart3,
  Settings,
  Users,
  CreditCard,
  Clock,
  Save,
  MessageSquare,
  ChevronRight,
  Sparkles,
  HelpCircle,
  Star,
  Image,
  Gamepad2,
  Trophy,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface PremiumHomeTutorialProps {
  userName: string;
  onNavigate: (view: string) => void;
}

export const PremiumHomeTutorial = ({ userName, onNavigate }: PremiumHomeTutorialProps) => {
  const features = [
    {
      icon: BookOpen,
      title: "My Stories",
      description: "This is where the magic happens! Tap \"New Story\" to generate a personalized, never-ending story for your child. Each story is crafted using AI based on their name, age, grade, and interests.",
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-950",
      action: "stories",
      steps: [
        "Tap the ✨ New Story button at the top",
        "Optionally add a special request (e.g. \"a story about dinosaurs\")",
        "Watch as pages generate one-by-one with illustrations",
        "Navigate forward & backward through the story at any time",
        "Tap \"Finish Story\" when your child is ready for an ending",
        "Save the story to your Library to re-read later!"
      ]
    },
    {
      icon: Wand2,
      title: "Magic Wand (Re-write)",
      description: "See a magic wand icon while reading? Tap it to completely regenerate the story with fresh content and new illustrations — same child info, brand new adventure.",
      color: "text-purple-600",
      bg: "bg-purple-50 dark:bg-purple-950",
      steps: [
        "Look for the ✨ wand icon while reading a story",
        "Tap it to start a fresh story without leaving the session",
        "Great for when your child wants \"another one!\""
      ]
    },
    {
      icon: Library,
      title: "Story Library",
      description: "Every story you save goes here. Re-read favorites anytime — all the original illustrations are preserved. You can also mark stories as favorites and organize your collection.",
      color: "text-orange-600",
      bg: "bg-orange-50 dark:bg-orange-950",
      action: "library",
      steps: [
        "Tap \"Save Story\" at the end of any reading session",
        "Find all saved stories in the Library sidebar tab",
        "Tap any saved story to re-read it with all original images",
        "Star your favorites for quick access"
      ]
    },
    {
      icon: BarChart3,
      title: "Progress Dashboard",
      description: "Track your child's reading journey with real data — stories read, reading time, vocabulary words learned, quiz scores, game results, and reading streaks. All data is pulled from actual activity, never fake numbers.",
      color: "text-green-600",
      bg: "bg-green-50 dark:bg-green-950",
      action: "progress",
      steps: [
        "View stories read, reading time, and vocabulary count",
        "Check comprehension scores from quizzes",
        "See the current reading streak to encourage daily reading",
        "Review recent activity across all features"
      ]
    },
    {
      icon: Clock,
      title: "Reading Timer",
      description: "A built-in timer tracks each reading session. You can show or hide it from the sidebar toggles. Premium users can dismiss the timer and keep reading as long as they want.",
      color: "text-teal-600",
      bg: "bg-teal-50 dark:bg-teal-950",
      steps: [
        "The timer starts automatically when a story begins",
        "Toggle it on/off from the sidebar under \"Reading Tools\"",
        "Premium users can dismiss it and read indefinitely"
      ]
    },
    {
      icon: Users,
      title: "Parent / Teacher Dashboard",
      description: "Manage child profiles, set up parental controls, and view detailed reading reports. You can create multiple child profiles — each gets personalized stories based on their own age, grade, and interests.",
      color: "text-indigo-600",
      bg: "bg-indigo-50 dark:bg-indigo-950",
      action: "parent",
      steps: [
        "Add child profiles with unique names, grades, and preferences",
        "Switch between children — stories personalize automatically",
        "Review reading activity per child"
      ]
    },
    {
      icon: Settings,
      title: "Profile Settings",
      description: "Update your child's name, age, grade level, native language, avatar, favorite topics, and more. These details directly influence how stories are generated.",
      color: "text-gray-600",
      bg: "bg-gray-50 dark:bg-gray-950",
      action: "profile",
      steps: [
        "Change name, grade, and reading level anytime",
        "Set native language for bilingual support",
        "Customize avatar appearance",
        "Add favorite animals, colors, foods, and hobbies"
      ]
    },
    {
      icon: CreditCard,
      title: "My Account",
      description: "Manage your subscription, update billing information, and view your plan details.",
      color: "text-rose-600",
      bg: "bg-rose-50 dark:bg-rose-950",
      action: "account",
      steps: [
        "View your current subscription plan and status",
        "Update payment method or cancel subscription",
        "Apply discount codes"
      ]
    },
  ];

  const faqs = [
    {
      q: "How do I create a new story?",
      a: "Go to \"My Stories\" from the sidebar, then tap the ✨ New Story button at the top. You can optionally add a special request like \"a story about space\" or \"include my dog named Buddy.\" The AI will generate a personalized, illustrated story page by page."
    },
    {
      q: "Can my child read the same story again?",
      a: "Yes! After finishing a story, tap \"Save Story\" to add it to your Library. You can re-read saved stories anytime with all the original illustrations preserved."
    },
    {
      q: "Do stories ever end?",
      a: "Stories are designed to continue as long as your child wants! When they're ready to wrap up, tap \"Finish Story\" and the AI will write a satisfying ending. You can even continue with a Part II afterward."
    },
    {
      q: "How does the reading timer work?",
      a: "The timer tracks how long each reading session lasts. As a premium user, you can dismiss it and read as long as you like. You can show or hide the timer from the sidebar toggles."
    },
    {
      q: "Can I set up profiles for multiple children?",
      a: "Absolutely! Go to the \"Parent / Teacher Dashboard\" and add child profiles. Each child gets their own personalized stories based on their name, age, grade, and interests. Switch between children anytime."
    },
    {
      q: "What does the Progress Dashboard track?",
      a: "It tracks real activity: stories read, total reading time, vocabulary words encountered, quiz scores, games played, and daily reading streaks. Everything is based on actual usage — no fake metrics."
    },
    {
      q: "How do I give feedback or report a problem?",
      a: "Look for the feedback sticker in the bottom-right corner of any screen! 👉 It's always there. Tap it to send us a message, report a bug, suggest a feature, or just say hi. We read every submission."
    },
    {
      q: "Can stories be generated in other languages?",
      a: "Yes! You can set a story language preference in your Profile Settings. Stories can be generated in Spanish, French, Arabic, Chinese, and more — great for bilingual families."
    },
    {
      q: "What happens if something goes wrong during story generation?",
      a: "Don't worry! The app has multiple backup systems. If the AI has a hiccup, a backup story will be delivered automatically so your child's session is never interrupted. You'll see a small notification if this happens."
    },
    {
      q: "Can I turn off story illustrations?",
      a: "Yes — use the \"Show/Hide Images\" toggle in the sidebar under Reading Tools. This can speed up story loading if you're on a slower connection."
    },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Welcome Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-primary">Premium Member</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
          Welcome to Time2Read, {userName}!
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Here's everything you can do with your premium account. This guide is designed for parents and teachers — no tech skills needed!
        </p>
      </div>

      {/* Quick Start */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-1">Ready to read? Start here!</h2>
              <p className="text-muted-foreground">
                Tap the button below to create your first personalized story. It only takes a few seconds!
              </p>
            </div>
            <Button 
              onClick={() => onNavigate("stories")} 
              size="lg" 
              className="gap-2 whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4" />
              Go to My Stories
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Feature Guide */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Star className="w-6 h-6 text-primary" />
          What You Can Do
        </h2>
        <div className="space-y-4">
          {features.map((feature) => (
            <Card key={feature.title} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className={`${feature.bg} p-6 md:w-80 flex-shrink-0`}>
                    <div className="flex items-center gap-3 mb-3">
                      <feature.icon className={`w-7 h-7 ${feature.color}`} />
                      <h3 className="text-lg font-bold">{feature.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                    {feature.action && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-4 gap-1"
                        onClick={() => onNavigate(feature.action!)}
                      >
                        Go to {feature.title}
                        <ChevronRight className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                  <div className="p-6 flex-1">
                    <p className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">How to use it</p>
                    <ol className="space-y-2">
                      {feature.steps.map((step, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                            {i + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Feedback Callout */}
      <Card className="border-yellow-300 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-xl flex-shrink-0">
              <MessageSquare className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold mb-1">💬 We'd Love Your Feedback!</h3>
              <p className="text-muted-foreground">
                See that little <strong>feedback sticker in the bottom-right corner</strong> of your screen? It's on every page! Tap it anytime to:
              </p>
              <ul className="mt-3 space-y-1 text-sm">
                <li className="flex items-center gap-2">✅ Report a bug or issue</li>
                <li className="flex items-center gap-2">💡 Suggest a new feature</li>
                <li className="flex items-center gap-2">⭐ Tell us what you love</li>
                <li className="flex items-center gap-2">❓ Ask a question</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-3 font-medium">
                👉 Look for it in the <strong>bottom-right corner</strong> of any screen — it's always there!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-primary" />
          Frequently Asked Questions
        </h2>
        <Card>
          <CardContent className="p-2 md:p-6">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left text-sm md:text-base font-medium">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm md:text-base">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>

      {/* Bottom CTA */}
      <div className="text-center pb-8">
        <p className="text-muted-foreground mb-4">Ready to dive in?</p>
        <Button 
          onClick={() => onNavigate("stories")} 
          size="lg" 
          className="gap-2"
        >
          <BookOpen className="w-5 h-5" />
          Start Reading
        </Button>
      </div>
    </div>
  );
};

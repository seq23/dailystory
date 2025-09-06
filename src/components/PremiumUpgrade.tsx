import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Check, Sparkles, BookOpen, TrendingUp, Award, Heart, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PremiumUpgradeProps {
  onBack: () => void;
  onSubscribe: (plan: string) => void;
}

export const PremiumUpgrade: React.FC<PremiumUpgradeProps> = ({
  onBack,
  onSubscribe,
}) => {
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string>('monthly');
  const [isLoading, setIsLoading] = useState(false);

  const plans = [
    {
      id: 'monthly',
      name: 'Monthly Premium',
      price: '$9.99',
      period: '/month',
      savings: null,
      popular: false,
      features: [
        'Unlimited reading time',
        'Access to 1000+ stories',
        'Personalized learning path',
        'Progress tracking',
        'Reading achievements',
        'Parental dashboard',
        'Offline reading',
        'Multiple child profiles'
      ]
    },
    {
      id: 'yearly',
      name: 'Yearly Premium',
      price: '$79.99',
      period: '/year',
      savings: 'Save 33%',
      popular: true,
      features: [
        'Everything in Monthly',
        'Advanced reading analytics',
        'Custom story creation',
        'Priority customer support',
        'Early access to new features',
        'Reading competitions',
        'Teacher dashboard access',
        'Bulk family discounts'
      ]
    }
  ];

  const handleSubscribe = async (planId: string) => {
    try {
      setIsLoading(true);
      setSelectedPlan(planId);
      
      // Create subscription via Supabase edge function
      const { data, error } = await supabase.functions.invoke('create-premium-subscription', {
        body: {
          planId,
          email: 'guest@time2read.com' // Default for guest users
        }
      });

      if (error) throw error;

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      // No toast for payment errors
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Crown className="w-12 h-12 text-yellow-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Unlock Premium Reading
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Give your child unlimited access to personalized stories and advanced learning features
          </p>
          <div className="mt-2">
            <a
              href="/pricing#premium-features"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary underline hover:opacity-90"
            >
              See full Premium feature list
            </a>
          </div>
        </div>

        {/* Benefits Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <BookOpen className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Unlimited Stories</h3>
              <p className="text-gray-600">Access to thousands of age-appropriate stories that grow with your child</p>
            </CardContent>
          </Card>
          
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <TrendingUp className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Smart Learning</h3>
              <p className="text-gray-600">AI-powered personalization adapts to your child's reading level and interests</p>
            </CardContent>
          </Card>
          
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <Award className="w-12 h-12 text-purple-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Progress Tracking</h3>
              <p className="text-gray-600">Detailed analytics and achievements to celebrate your child's growth</p>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-8">
          {plans.map((plan) => (
            <Card 
              key={plan.id}
              className={`relative hover:shadow-xl transition-all duration-300 hover:scale-105 ${
                plan.popular ? 'border-purple-500 border-2 shadow-lg' : ''
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1">
                  <Star className="w-4 h-4 mr-1" />
                  Most Popular
                </Badge>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-4xl font-bold text-primary">{plan.price}</span>
                  <span className="text-gray-600">{plan.period}</span>
                </div>
                {plan.savings && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    {plan.savings}
                  </Badge>
                )}
                <CardDescription className="mt-2">
                  Perfect for growing readers
                </CardDescription>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isLoading}
                  className={`w-full py-3 text-lg font-semibold transition-all duration-200 ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isLoading && selectedPlan === plan.id ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : plan.popular ? (
                    <>
                      <Crown className="w-5 h-5 mr-2" />
                      Start Premium Trial
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Choose This Plan
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>


        {/* Back Button */}
        <div className="text-center">
          <Button onClick={onBack} variant="ghost" className="text-gray-600 hover:text-gray-800">
            ← Back to Reading Session
          </Button>
        </div>
      </div>
    </div>
  );
};
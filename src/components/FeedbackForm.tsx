import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import * as z from "zod";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { DebugLogger } from "@/services/DebugLogger";

const feedbackSchema = z.object({
  rating: z.number().min(1).max(5),
  category: z.string().min(1, "Please select a category"),
  message: z.string().min(1, "Please enter your feedback"),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

interface FeedbackFormProps {
  onClose: () => void;
}

export function FeedbackForm({ onClose }: FeedbackFormProps) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      rating: 0,
      category: "",
      message: "",
    },
  });

  const onSubmit = async (data: FeedbackFormData) => {
    setIsSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.from("feedback").insert({
        user_id: user?.id || null,
        rating: data.rating,
        category: data.category,
        message: data.message,
        page_url: window.location.href,
        user_agent: navigator.userAgent,
      });

      if (error) throw error;

      // Fire-and-forget email notification (don't block UX if it fails)
      supabase.functions
        .invoke('send-feedback-notification', {
          body: {
            rating: data.rating,
            category: data.category,
            message: data.message,
            page_url: window.location.href,
            user_agent: navigator.userAgent,
            user_email: user?.email ?? null,
            user_id: user?.id ?? null,
          },
        })
        .catch((err) => {
          DebugLogger.error('network', 'Feedback email notification failed', err);
        });

      toast({
        title: t("feedback.messages.success"),
        description: t("feedback.messages.successDescription"),
      });
      
      onClose();
    } catch (error) {
      DebugLogger.error('network', 'Error submitting feedback', error);
      toast({
        title: t("feedback.messages.error"),
        description: t("feedback.messages.errorDescription"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRatingClick = (value: number) => {
    setRating(value);
    form.setValue("rating", value);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="rating"
          render={() => (
            <FormItem>
              <FormLabel>{t("feedback.ratingLabel")}</FormLabel>
              <FormControl>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      className="focus:outline-none focus:ring-2 focus:ring-primary rounded"
                      onMouseEnter={() => setHoveredRating(value)}
                      onMouseLeave={() => setHoveredRating(0)}
                      onClick={() => handleRatingClick(value)}
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          value <= (hoveredRating || rating)
                            ? "fill-primary text-primary"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("feedback.categoryLabel")}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("feedback.categoryPlaceholder")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="bug">{t("feedback.categories.bug")}</SelectItem>
                  <SelectItem value="feature">{t("feedback.categories.feature")}</SelectItem>
                  <SelectItem value="content">{t("feedback.categories.content")}</SelectItem>
                  <SelectItem value="usability">{t("feedback.categories.usability")}</SelectItem>
                  <SelectItem value="performance">{t("feedback.categories.performance")}</SelectItem>
                  <SelectItem value="other">{t("feedback.categories.other")}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("feedback.messageLabel")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("feedback.messagePlaceholder")}
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose} type="button">
            {t("feedback.buttons.cancel")}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t("feedback.buttons.submitting") : t("feedback.buttons.submit")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
import { Trans, useTranslation } from "react-i18next";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooterNav } from "@/components/SiteFooterNav";
import { FREE_STORY_LIMIT, PLAN_PRICES, TRIAL_DAYS } from "@/lib/freeStoryAllowance";
import { SITE_URL } from "@/config/site";

export const ABOUT_TITLE = "About Time-2-Read: Personalized Reading Stories for Kids";
export const ABOUT_DESCRIPTION =
  "Who makes Time-2-Read, what it does and how it works: personalized illustrated stories with your child as the hero, read-aloud help and a reading timer.";

/** Who is behind Time-2-Read and what it does. Linked from the homepage and the site footer. */
const About = () => {
  const { t } = useTranslation();
  useEffect(() => {
    document.title = ABOUT_TITLE;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", ABOUT_DESCRIPTION);
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", `${SITE_URL}/about`);
  }, []);

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <Link to="/">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("about.back")}
          </Button>
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold mb-6">{t("about.title")}</h1>
        <section className="space-y-4 text-foreground/80 leading-relaxed">
          <p>
            {t("about.intro")}
          </p>
          <h2 className="text-xl font-semibold text-foreground pt-2">{t("about.how")}</h2>
          <ul className="list-disc ps-6 space-y-1">
            <li>{t("about.setup")}</li>
            <li>{t("about.story")}</li>
            <li>{t("about.word")}</li>
            <li>{t("about.narration")}</li>
            <li>{t("about.timer")}</li>
          </ul>
          <p>{t("about.english")}</p>
          <h2 className="text-xl font-semibold text-foreground pt-2">{t("about.cost")}</h2>
          <p>
            {t("about.plans", { count: FREE_STORY_LIMIT, monthly: PLAN_PRICES.monthly.label, annual: PLAN_PRICES.annual.label, days: TRIAL_DAYS })}{" "}
            <Link to="/pricing" className="underline hover:text-primary">{t("about.pricing")}</Link>.
          </p>
          <h2 className="text-xl font-semibold text-foreground pt-2">{t("about.maker")}</h2>
          <p>
            <Trans i18nKey="about.owner" values={{ operator: "Spry VSL LLC" }} components={{
              privacy: <Link to="/privacy" className="underline hover:text-primary" />,
              ferpa: <Link to="/ferpa" className="underline hover:text-primary" />,
              accessibility: <Link to="/accessibility" className="underline hover:text-primary" />,
            }} />
          </p>
          <p>
            {t("about.contact")}{" "}
            <a href="mailto:privacy@time-2-read.com" className="underline hover:text-primary">privacy@time-2-read.com</a>.
          </p>
        </section>
      </div>
      <SiteFooterNav />
    </main>
  );
};

export default About;

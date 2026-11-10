// Guard (restored 10 Nov 2026, hostile review: the price assertion only). The homepage
// SoftwareApplication offers are what search engines and AI answers quote as the price;
// they must equal the prices checkout charges (PLAN_PRICES). Blocking: runs in
// `npm run test:unit`, the Checks merge gate.
import { describe, expect, it } from "vitest";
import { SOFTWARE_APPLICATION, pageGraph } from "@/seo/schema";
import { PLAN_PRICES } from "@/lib/freeStoryAllowance";

describe("structured-data prices (src/seo/schema.ts)", () => {
  it("the homepage SoftwareApplication offers equal PLAN_PRICES", () => {
    const home = pageGraph("/", "t", "d")["@graph"];
    expect(home).toContainEqual(SOFTWARE_APPLICATION);
    const prices = SOFTWARE_APPLICATION.offers.map((o) => o.price);
    expect(prices).toEqual(["0.00", (PLAN_PRICES.monthly.amountCents / 100).toFixed(2), (PLAN_PRICES.annual.amountCents / 100).toFixed(2)]);
    for (const o of SOFTWARE_APPLICATION.offers as readonly any[]) if (o.priceSpecification) expect(o.priceSpecification.price, o.name).toBe(o.price);
  });
});

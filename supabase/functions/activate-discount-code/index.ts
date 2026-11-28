// Redeem a free-Premium discount code the caller typed. No default code: an empty code is a 400.
// Same rules as apply-discount-code: ../_shared/discountRedeem.ts (once per account, atomic,
// guess-limited). Tests: src/test/edge/discount-and-billing.test.ts.
import { serve } from "../_shared/serve.ts";
import { discountRedeemHandler } from "../_shared/discountRedeemDeno.ts";

serve(discountRedeemHandler("activate-discount-code", { usePendingCode: false }));

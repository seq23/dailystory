// Redeem a free-Premium discount code: the one in the request body (right after sign-up), or
// the one saved on the account (subscribers.discount_code_pending, auto-applied on first load).
// Rules: ../_shared/discountRedeem.ts (once per account, atomic, guess-limited).
// Tests: src/test/edge/discount-and-billing.test.ts.
import { serve } from "../_shared/serve.ts";
import { discountRedeemHandler } from "../_shared/discountRedeemDeno.ts";

serve(discountRedeemHandler("apply-discount-code", { usePendingCode: true }));

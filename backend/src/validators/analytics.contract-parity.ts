import type { z } from "zod";
import type { AnalyticsEventType } from "../../../shared/contracts";
import type { trackEventSchema } from "./analytics.validators";

/**
 * Compile-time parity between the event types the validator accepts and the
 * ones the wire contract declares, the same idea as
 * project.contract-parity.ts. The contract is the declaration; Zod needs the
 * values at runtime, so they're listed twice and checked here. Nothing emits.
 * If this errors, bring the two lists back in line.
 */

type Assignable<A, B> = [A] extends [B] ? true : false;
type Expect<T extends true> = T;

type Accepted = z.infer<typeof trackEventSchema>["eventType"];

// Both ways: a type added to either list and not the other fails one of them.
export type _AcceptedIsDeclared = Expect<
  Assignable<Accepted, AnalyticsEventType>
>;
export type _DeclaredIsAccepted = Expect<
  Assignable<AnalyticsEventType, Accepted>
>;

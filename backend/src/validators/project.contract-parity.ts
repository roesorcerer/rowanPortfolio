import type { z } from "zod";
import type {
  Project as WireProject,
  ProjectPayload as WirePayload,
} from "../../../shared/contracts";
import type { Project as StoredProject } from "../stores/projects-store";
import type { createProjectSchema } from "./project.validators";

/**
 * Compile-time parity between the Zod validators and the wire contract.
 *
 * `shared/contracts.d.ts` cannot be generated from the validators: it is
 * declaration-only by design, and the frontend that reads it has no zod
 * dependency and no view of backend source. So it stays hand-written — but it
 * no longer stays hand-*checked*. The assertions below fail `tsc` the moment
 * the two descriptions of a Project disagree, which is the property that
 * mattered; generation was only ever a means to it.
 *
 * Nothing here emits. If this file errors, the fix is to bring
 * `shared/contracts.d.ts` back in line with the validators — not to loosen
 * the assertion.
 */

/** True only when the two types are mutually assignable. */
type Assignable<A, B> = A extends B ? true : false;

/** Fails to compile unless its argument is exactly `true`. */
type Expect<T extends true> = T;

/**
 * Timestamps are `Date` in the store and ISO strings on the wire — the one
 * deliberate difference between the two, and the reason a plain equality
 * check would be wrong here.
 */
type Wire<T> = { [K in keyof T]: T[K] extends Date ? string : T[K] };

// --- The response shape the frontend reads ---
// Checked both ways: a field added to the validators and not to the contract
// fails the first, and a field left in the contract after the validators drop
// it fails the second.
export type _StoredFitsWire = Expect<Assignable<Wire<StoredProject>, WireProject>>;
export type _WireFitsStored = Expect<Assignable<WireProject, Wire<StoredProject>>>;

// --- The request shape the frontend sends ---
// One-way on purpose: `createProjectSchema` accepts more than the contract
// describes (a bare-string `category`, omitted fields that carry defaults), so
// the property worth asserting is that everything the frontend can send is
// something the backend will take.
export type _PayloadIsAccepted = Expect<
  Assignable<WirePayload, z.input<typeof createProjectSchema>>
>;

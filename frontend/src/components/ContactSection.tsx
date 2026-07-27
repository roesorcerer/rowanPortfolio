import { FormEvent, useState } from "react";
import { useContact } from "../hooks/useContact";
import { ApiError } from "../api/client";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// --- Contact Section ---
// Scroll target: #contact
// Eudaimonic design: warm, direct, respectful of attention.
//
// Single component: layout collapses from single-column on mobile to a
// 2-column grid on lg:. The desktop variant adds an extra "interested in
// strengthening my skillset" paragraph that's hidden below lg:.

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
  website: string; // honeypot — real users leave this empty
}

const emptyForm: FormState = {
  name: "",
  email: "",
  subject: "",
  message: "",
  website: "",
};

interface FormProps {
  form: FormState;
  onChange: (field: keyof FormState, value: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isPending: boolean;
  isSuccess: boolean;
  successMessage: string | null;
  errorMessage: string | null;
}

function ContactForm({
  form,
  onChange,
  onSubmit,
  isPending,
  isSuccess,
  successMessage,
  errorMessage,
}: FormProps) {
  const inputBase =
    "w-full bg-white border border-rule rounded-lg px-4 py-3 text-ink text-[15px] placeholder:text-faint focus:outline-none focus:border-accent-dark focus:ring-2 focus:ring-accent/20 transition-colors";

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      {/* Name + email — stacked on mobile, side-by-side on md+. */}
      <div className="flex flex-col md:grid md:grid-cols-2 gap-4">
        <label className="flex flex-col gap-2">
          <span className="text-body text-sm">Name</span>
          <input
            type="text"
            required
            autoComplete="name"
            value={form.name}
            onChange={(e) => onChange("name", e.target.value)}
            className={inputBase}
            placeholder="Your name"
            maxLength={100}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-body text-sm">Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(e) => onChange("email", e.target.value)}
            className={inputBase}
            placeholder="you@example.com"
          />
        </label>
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-body text-sm">
          Subject <span className="text-faint">(optional)</span>
        </span>
        <input
          type="text"
          value={form.subject}
          onChange={(e) => onChange("subject", e.target.value)}
          className={inputBase}
          placeholder="What's this about?"
          maxLength={200}
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-body text-sm">Message</span>
        <textarea
          required
          value={form.message}
          onChange={(e) => onChange("message", e.target.value)}
          className={`${inputBase} resize-y min-h-[140px] leading-[1.6]`}
          placeholder="Tell me about the project, the research, or what you'd like to explore together."
          minLength={10}
          maxLength={5000}
        />
      </label>

      {/* Honeypot — visually hidden, kept in the tab order out of the way.
          Real users never touch this; bots fill it and get rejected. */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "-10000px",
          top: "auto",
          width: "1px",
          height: "1px",
          overflow: "hidden",
        }}
      >
        <label>
          Website
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={form.website}
            onChange={(e) => onChange("website", e.target.value)}
          />
        </label>
      </div>

      <div className="flex flex-col gap-3 mt-2">
        <button
          type="submit"
          disabled={isPending}
          className={cn(buttonVariants({ variant: "outline", size: "lg" }), "self-start")}
        >
          {isPending ? "Sending..." : "Send message"}
        </button>

        {isSuccess && successMessage && (
          <p
            role="status"
            className="text-accent-dark text-sm flex items-center gap-2"
          >
            <span className="w-2 h-2 bg-accent rounded-full" />
            {successMessage}
          </p>
        )}

        {errorMessage && (
          <p role="alert" className="text-danger text-sm">
            {errorMessage}
          </p>
        )}
      </div>
    </form>
  );
}

function ContactSection() {
  const [form, setForm] = useState<FormState>(emptyForm);
  const { mutate, isPending, isSuccess, data, error, reset } = useContact();

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear a prior success/error once the user edits again, so the banner
    // reflects the current submission attempt rather than the previous one.
    if (isSuccess || error) reset();
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutate(form, {
      onSuccess: () => {
        setForm(emptyForm);
      },
    });
  };

  const errorMessage = error
    ? error instanceof ApiError
      ? error.message
      : (error as Error).message || "Something went wrong. Please try again."
    : null;

  return (
    <section
      id="contact"
      className="px-5 md:px-10 py-16 md:py-20 lg:py-24 border-t border-rule max-w-[1400px] mx-auto w-full"
    >
      <div className="flex items-center gap-2 mb-8 lg:mb-12">
        <div className="w-2 h-2 bg-accent rounded-full" />
        <span className="text-accent-dark text-sm">Work with me</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Left: heading + blurb. Wider/longer copy from lg: up. */}
        <div>
          <h2 className="text-ink text-2xl lg:text-3xl font-normal leading-[1.4] lg:leading-[1.35] tracking-tight mb-4 lg:mb-6">
            Work with me and let's build something catered to your needs.
          </h2>
          <div className="space-y-5 text-muted lg:text-body text-base lg:text-[17px] leading-[1.75]">
            <p>
              Whether it's about my research, or if you would like to work together on a project send your contact information and I will connect with you soon.
            </p>
            <p className="hidden lg:block">
              I'm especially interested in strengthing my skillset across tech stacks and research oppertunties in the fields of development, HCI, and game based features to support wellbeing.
            </p>
          </div>
        </div>

        {/* Right: form. Card framing only appears from lg: up. */}
        <div className="lg:bg-white lg:rounded-2xl lg:border lg:border-rule lg:p-8 lg:h-fit">
          <ContactForm
            form={form}
            onChange={handleChange}
            onSubmit={handleSubmit}
            isPending={isPending}
            isSuccess={isSuccess}
            successMessage={data?.message ?? null}
            errorMessage={errorMessage}
          />
        </div>
      </div>
    </section>
  );
}

export default ContactSection;

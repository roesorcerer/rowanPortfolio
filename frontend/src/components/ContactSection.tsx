import { FormEvent, useState } from "react";
import useBreakpoint from "../utils/ScreenSize";
import { useContact } from "../hooks/useContact";

// --- Contact Section ---
// Scroll target: #contact
// Eudaimonic design: warm, direct, respectful of attention.

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
  errorMessage: string | null;
  compact: boolean;
}

function ContactForm({
  form,
  onChange,
  onSubmit,
  isPending,
  isSuccess,
  errorMessage,
  compact,
}: FormProps) {
  const inputBase =
    "w-full bg-white border border-[#E8E6E1] rounded-lg px-4 py-3 text-[#2C2C2A] text-[15px] placeholder:text-[#B4B2A9] focus:outline-none focus:border-[#0F6E56] focus:ring-2 focus:ring-[#1D9E75]/20 transition-colors";

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <div className={compact ? "flex flex-col gap-4" : "grid grid-cols-2 gap-4"}>
        <label className="flex flex-col gap-2">
          <span className="text-[#5F5E5A] text-sm">Name</span>
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
          <span className="text-[#5F5E5A] text-sm">Email</span>
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
        <span className="text-[#5F5E5A] text-sm">
          Subject <span className="text-[#B4B2A9]">(optional)</span>
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
        <span className="text-[#5F5E5A] text-sm">Message</span>
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
          className="inline-flex items-center justify-center px-6 py-3 bg-[#2C2C2A] text-[#FAF9F7] text-sm rounded-lg hover:bg-[#1a1a1a] transition-colors disabled:opacity-60 disabled:cursor-not-allowed self-start"
        >
          {isPending ? "Sending..." : "Send message"}
        </button>

        {isSuccess && (
          <p
            role="status"
            className="text-[#0F6E56] text-sm flex items-center gap-2"
          >
            <span className="w-2 h-2 bg-[#1D9E75] rounded-full" />
            Thanks — your message is on its way. I'll get back to you soon.
          </p>
        )}

        {errorMessage && (
          <p role="alert" className="text-[#B0443C] text-sm">
            {errorMessage}
          </p>
        )}
      </div>
    </form>
  );
}

function ContactMobile(props: FormProps) {
  return (
    <section id="contact" className="px-5 py-16 border-t border-[#E8E6E1]">
      <div className="flex items-center gap-2 mb-8">
        <div className="w-2 h-2 bg-[#1D9E75] rounded-full" />
        <span className="text-[#0F6E56] text-sm">Work with me</span>
      </div>

      <h2 className="text-[#2C2C2A] text-2xl font-normal leading-[1.4] tracking-tight mb-4">
        Let's build something meaningful together.
      </h2>
      <p className="text-[#888780] text-base leading-[1.75] mb-8">
        Whether it's HCI research, a mental-health-adjacent project, or a chat
        about eudaimonic design — send me a note and I'll reply personally.
      </p>

      <ContactForm {...props} />
    </section>
  );
}

function ContactTabletDesktop({
  isDesktop,
  ...props
}: FormProps & { isDesktop: boolean }) {
  return (
    <section
      id="contact"
      className={`${isDesktop ? "px-10 py-24" : "px-10 py-20"} border-t border-[#E8E6E1] max-w-[1400px] mx-auto w-full`}
    >
      <div className="flex items-center gap-2 mb-12">
        <div className="w-2 h-2 bg-[#1D9E75] rounded-full" />
        <span className="text-[#0F6E56] text-sm">Work with me</span>
      </div>

      <div
        className={`grid ${isDesktop ? "grid-cols-2 gap-16" : "grid-cols-1 gap-12"}`}
      >
        <div>
          <h2 className="text-[#2C2C2A] text-3xl font-normal leading-[1.35] tracking-tight mb-6">
            Let's build something meaningful together.
          </h2>
          <div className="space-y-5 text-[#5F5E5A] text-[17px] leading-[1.75]">
            <p>
              Whether it's HCI research, a mental-health-adjacent project, or a
              chat about eudaimonic design — send me a note and I'll reply
              personally.
            </p>
            <p>
              I'm especially interested in collaborations that treat users as
              partners, not data points.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E8E6E1] p-8 h-fit">
          <ContactForm {...props} />
        </div>
      </div>
    </section>
  );
}

function ContactSection() {
  const { breakpoint } = useBreakpoint();
  const [form, setForm] = useState<FormState>(emptyForm);
  const { mutate, isPending, isSuccess, error, reset } = useContact();

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
    ? // axios errors expose the server's message on error.response.data.error
      (error as { response?: { data?: { error?: string } }; message?: string })
        .response?.data?.error ||
      (error as Error).message ||
      "Something went wrong. Please try again."
    : null;

  const formProps: FormProps = {
    form,
    onChange: handleChange,
    onSubmit: handleSubmit,
    isPending,
    isSuccess,
    errorMessage,
    compact: breakpoint === "mobile",
  };

  if (breakpoint === "mobile") return <ContactMobile {...formProps} />;
  return (
    <ContactTabletDesktop {...formProps} isDesktop={breakpoint === "desktop"} />
  );
}

export default ContactSection;

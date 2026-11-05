import { useState, type FormEvent } from "react";
import { ApiError } from "../api/client";
import { useContact } from "../hooks/useContact";

const EMAIL = "rowanstratton1@gmail.com";

const emptyForm = { name: "", email: "", subject: "", message: "", website: "" };
type FormState = typeof emptyForm;

function ContactPanel() {
  const [form, setForm] = useState<FormState>(emptyForm);
  const { mutate, isPending, isSuccess, data, error, reset } = useContact();

  const update = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (isSuccess || error) reset();
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutate(form, { onSuccess: () => setForm(emptyForm) });
  };

  const errorMessage = error
    ? error instanceof ApiError
      ? error.message
      : "The message was not sent. Try again, or email me directly."
    : null;

  return (
    <section id="contact" className="sec" aria-labelledby="contact-h">
      <h2 id="contact-h" className="d strip">
        Contact
      </h2>
      <div className="sec-body contact-grid">
        <form className="contact-form" onSubmit={submit}>
          <label className="field">
            <span>Your name</span>
            <input
              type="text"
              required
              autoComplete="name"
              maxLength={100}
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </label>
          <label className="field">
            <span>Your email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />
          </label>
          <label className="field">
            <span>Message</span>
            <textarea
              rows={5}
              required
              minLength={10}
              maxLength={5000}
              value={form.message}
              onChange={(e) => update("message", e.target.value)}
            />
          </label>

          {/* Honeypot: people never see this, bots fill it in and get rejected. */}
          <div className="honeypot" aria-hidden="true">
            <label>
              Website
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={form.website}
                onChange={(e) => update("website", e.target.value)}
              />
            </label>
          </div>

          <button className="cmd primary" type="submit" disabled={isPending}>
            {isPending ? "Sending..." : "Send message"}
          </button>
          {isSuccess && <p role="status">{data?.message ?? "Message sent."}</p>}
          {errorMessage && (
            <p role="alert" className="form-error">
              {errorMessage}
            </p>
          )}
        </form>

        <div className="stack contact-aside">
          <p className="lead">
            Prefer your own inbox? Email me at{" "}
            <a className="link" href={`mailto:${EMAIL}`}>
              {EMAIL}
            </a>
          </p>
          <div className="actions">
            <a
              className="cmd"
              href="https://github.com/roesorcerer"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <a
              className="cmd"
              href="https://www.linkedin.com/in/rowan-stratton-611247247"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactPanel;

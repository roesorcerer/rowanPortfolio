import { contactSchema } from "./contact.validators";

describe("contactSchema", () => {
  const validInput = {
    name: "Ada Lovelace",
    email: "ada@example.com",
    message: "I would love to collaborate on an HCI research project.",
  };

  it("accepts valid input with only required fields", () => {
    const result = contactSchema.parse(validInput);
    expect(result.name).toBe("Ada Lovelace");
    expect(result.email).toBe("ada@example.com");
    expect(result.subject).toBeUndefined();
  });

  it("lowercases and trims the email", () => {
    const result = contactSchema.parse({
      ...validInput,
      email: "  ADA@Example.COM  ",
    });
    expect(result.email).toBe("ada@example.com");
  });

  it("rejects invalid email format", () => {
    expect(() =>
      contactSchema.parse({ ...validInput, email: "not-an-email" })
    ).toThrow();
  });

  it("rejects messages shorter than 10 characters", () => {
    expect(() =>
      contactSchema.parse({ ...validInput, message: "too short" })
    ).toThrow();
  });

  it("rejects messages longer than 5000 characters", () => {
    expect(() =>
      contactSchema.parse({ ...validInput, message: "a".repeat(5001) })
    ).toThrow();
  });

  it("rejects a filled honeypot field", () => {
    expect(() =>
      contactSchema.parse({ ...validInput, website: "http://spam.example" })
    ).toThrow();
  });

  it("accepts an empty honeypot field", () => {
    const result = contactSchema.parse({ ...validInput, website: "" });
    expect(result.website).toBe("");
  });

  it("trims name and subject whitespace", () => {
    const result = contactSchema.parse({
      ...validInput,
      name: "  Ada  ",
      subject: "  Hello  ",
    });
    expect(result.name).toBe("Ada");
    expect(result.subject).toBe("Hello");
  });
});

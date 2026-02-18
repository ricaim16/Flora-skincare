"use client";

import { useState } from "react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phoneNumber: phone,
          message,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Your message was sent successfully!");
        setName("");
        setEmail("");
        setPhone("");
        setMessage("");
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-20 md:py-28 bg-white scroll-mt-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-purple-900">
            Get in Touch
          </h2>
          <p className="mt-4 text-xl text-purple-600">
            Have questions or ready to book? We're here to help.
          </p>
        </div>

        {/* Centered Contact Form */}
        <div className="flex justify-center">
          <form className="w-full space-y-6 " onSubmit={handleSubmit}>
            <Input
              label="Full Name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Phone Number"
              placeholder="+251 9xx xxx xxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Textarea
              label="Message"
              placeholder="How can we help you?"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />

            <Button type="submit" variant="primary" size="lg" disabled={loading}>
              {loading ? "Sending..." : "Send Message"}
            </Button>

            {success && <p className="text-green-600 mt-2">{success}</p>}
            {error && <p className="text-red-600 mt-2">{error}</p>}
          </form>
        </div>
      </div>
    </section>
  );
}

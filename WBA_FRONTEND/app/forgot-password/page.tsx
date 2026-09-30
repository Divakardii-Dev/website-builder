"use client";
 
import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { forgotPassword, isApiConnectionError } from "@/lib/api";
import { assetPath } from "@/lib/paths";
import { stripContactWhitespace } from "@/lib/resetFlowValidation";
import {
  MAX_MOBILE_INPUT_LENGTH,
  getDefaultSignupPhoneCountry,
  validateSignupNationalDigits,
} from "@/lib/signupPhoneCountries";
import {
  SIGNUP_PHONE_COUNTRIES,
  getSignupPhoneCountry,
} from "@/lib/signupPhoneCountries";
 
const EMAIL_MAX_LENGTH = 254;
const EMAIL_MAX_ERROR = `Email cannot exceed ${EMAIL_MAX_LENGTH} characters.`;
const MOBILE_MAX_ERROR = `Mobile number cannot exceed ${MAX_MOBILE_INPUT_LENGTH} characters.`;
 
/** Remove spaces from email */
function stripEmailWhitespace(value: string): string {
  return value.replace(
    /[\s\u00A0\uFEFF\u2000-\u200B\u202F\u205F\u3000]+/g,
    ""
  );
}
 
function normalizeSignupEmail(raw: string | undefined | null): string {
  return stripEmailWhitespace(String(raw ?? ""))
    .trim()
    .toLowerCase();
}
 
/** Treat a value as mobile-format when it has digits and only allowed mobile chars. */
const looksLikeMobile = (value: string): boolean =>
  value.length > 0 && /^\+?\d*$/.test(value);
 
function ForgotPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const changeFrom = searchParams.get("changeFrom");
 
  const contactPlaceholder =
    changeFrom === "verify-email"
      ? "Alternative email address"
      : changeFrom === "verify-mobile"
        ? "Alternative mobile number"
        : "Email or mobile number";
 
  const validateEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim().toLowerCase());
 
  const isMobile = (value: string) =>
    /^\+?[0-9]{6,15}$/.test(value.trim());
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    const trimmed = email.trim();
    if (!trimmed) {
      setError(
        changeFrom === "verify-email"
          ? "Email is required."
          : changeFrom === "verify-mobile"
          ? "Mobile number is required."
          : "Enter a valid email or mobile number"
      );
      return;
    }
 
    const isEmailContact = validateEmail(trimmed);
    const isMobileContact = isMobile(trimmed);
 
    // Alternative Email Validation
    if (changeFrom === "verify-email") {
      const emailNormalized = normalizeSignupEmail(trimmed);
 
      if (emailNormalized.length > EMAIL_MAX_LENGTH) {
        const EMAIL_MAX_ERROR = `Email cannot exceed ${EMAIL_MAX_LENGTH} characters.`;
        return;
      }
 
      if (
        !/^[^\s@]+@[^\s@]+\.(com|in)$/.test(emailNormalized)
      ) {
        setError("Please enter a valid email address.");
        return;
      }
 
      const allowedDomains = [
        "gmail.com",
        "yahoo.in",
        "outlook.com",
        "thestackly.com",
      ];
 
      const domain = emailNormalized.split("@")[1];
 
      if (!allowedDomains.includes(domain)) {
        setError(
          "Only Gmail, Yahoo, Outlook, Stackly emails are allowed."
        );
        return;
      }
    }
 
    if (changeFrom === "verify-mobile") {
      const phoneCountry = getDefaultSignupPhoneCountry();
      const mobileValue = trimmed;
 
      const mobileErr = validateSignupNationalDigits(
        mobileValue,
        phoneCountry
      );
 
      if (mobileErr) {
        setError(mobileErr);
        return;
      }
 
      if (mobileValue.startsWith("0")) {
        setError("Number should not start with 0.");
        return;
      }
 
      if (/^(\d)\1+$/.test(mobileValue)) {
        setError("Same numbers not allowed.");
        return;
      }
 
      if (/^(\d{2})\1+$/.test(mobileValue)) {
        setError("Pair of numbers not allowed.");
        return;
      }
    }
    // Normal Forgot Password Validation
    if (!isEmailContact && !isMobileContact) {
      setError("Enter a valid email or mobile number");
      return;
    }
    const targetRoute = isEmailContact ? "/verify-email" : "/verify-mobile";
    const encodedContact = encodeURIComponent(trimmed);
 
    try {
      setIsSubmitting(true);
      const data = await forgotPassword({
        input: isEmailContact ? trimmed.toLowerCase() : trimmed,
        isChange: Boolean(changeFrom),
        primaryUser: searchParams.get("primaryUser") || undefined,
      });
 
      setMessage(data.message || "OTP sent successfully.");
      alert(`Your OTP is: ${data.otp}`);
      router.push(
  `  ${targetRoute}?contact=${encodedContact}&changeFrom=${changeFrom || ""}&pendingAlternate=${encodeURIComponent(trimmed)}`
     );
    } catch (error) {
        if (isApiConnectionError(error)) {
          router.push("/backend-error");
          return;
        }
 
        setError(
          error instanceof Error
            ? error.message
            : "Could not send OTP. Try again later."
        );
    } finally {
      setIsSubmitting(false);
    }
  };
 
  return (
    <div className="reset-flow-page forgot-password-page min-h-[100dvh] bg-white flex flex-col justify-start lg:justify-center items-stretch lg:items-center overflow-y-auto px-0 py-0 lg:px-6 lg:py-6">
      <div className="w-full max-w-6xl mx-auto flex flex-1 flex-col lg:flex-none lg:flex-row items-stretch lg:items-center justify-start lg:justify-center gap-0 lg:gap-12 auth-layout">
        {/* LEFT: Illustration */}
        <div className="auth-image-col hidden lg:flex w-full lg:w-1/2 items-center justify-center order-2 lg:order-1">
          <img
            src={assetPath("/password.webp")}
            alt="Password reset illustration"
            className="auth-image w-[88%] max-w-[480px] object-contain"
          />
        </div>
        {/* RIGHT: Forgot password form card */}
        <div className="flex w-full flex-1 flex-col items-stretch justify-center order-1 lg:order-2 lg:w-1/2 lg:flex-none min-h-0">
          <div
            className="reset-flow-card forgot-password-card relative flex w-full max-w-[420px] flex-1 flex-col justify-center self-center overflow-hidden px-6 py-8 sm:px-10 sm:py-10 lg:flex-none lg:min-h-0 lg:rounded-xl"
            style={{
              background:
                "linear-gradient(180deg, #4A76F3 0%, #2C4FAD 50%, #0A193F 100%)",
              boxShadow: "4px 4px 4px 0 rgba(0,0,0,0.25)",
            }}
          >
            <h1
              className="text-[20px] sm:text-[24px] font-bold text-center mb-3"
              style={{ color: "#FFFFFF" }}
            >
              Forgot Your Password?
            </h1>
            <p
              className="text-center text-[13px] sm:text-[14px] mb-5 leading-relaxed"
              style={{ color: "#FFFFFF" }}
            >
              Enter your email address or mobile number and we will send you
              instructions to reset your password.
            </p>
            <form onSubmit={handleSubmit} noValidate>
              <div className="flex flex-col items-center space-y-5">
                <div className="w-full max-w-[316px]">
                  <input
                    type="text"
                    inputMode="email"
                    placeholder={contactPlaceholder}
                    value={email}
                    maxLength={EMAIL_MAX_LENGTH}
                    onChange={(e) => {
                      const cleaned = stripContactWhitespace(e.target.value);
                      const treatAsMobile = looksLikeMobile(cleaned);
                      const cap = treatAsMobile
                        ? MAX_MOBILE_INPUT_LENGTH
                        : EMAIL_MAX_LENGTH;
                      if (cleaned.length > cap) {
                        setEmail(cleaned.slice(0, cap));
                        setError(
                          treatAsMobile ? MOBILE_MAX_ERROR : EMAIL_MAX_ERROR
                        );
                        return;
                      }
                      setEmail(cleaned);
                      setError("");
                    }}
                    onBlur={() => {
                      setEmail((prev) => prev.trim());
                    }}
                    className="forgot-input w-full h-12 px-5 rounded-[1000px] border text-[14px] text-center outline-none focus:border-white transition bg-transparent"
                    style={{
                      border: "1.5px solid #FFFFFF",
                      color: "#FFFFFF",
                      textAlign: "center",
                    }}
                  />
                  {error && (
                    <p className="auth-error-text mt-1 text-center">{error}</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full max-w-[260px] rounded-[1000px] text-[16px] sm:text-[17px] font-bold shadow-md hover:opacity-95 transition disabled:opacity-60 flex items-center justify-center"
                  style={{
                    height: "48px",
                    backgroundColor: "#F2B541",
                    color: "#FFFFFF",
                  }}
                >
                  {isSubmitting ? "Sending..." : "Continue"}
                </button>
                {message && (
                  <p
                    className="text-center text-xs text-white"
                  >
                    {message}
                  </p>
                )}
              </div>
            </form>
            <div className="w-full max-w-[316px] mx-auto mt-6 text-center">
              <Link
                href="/login"
                className="text-[13px] hover:underline"
                style={{ color: "#FFFFFF" }}
              >
                Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
 
export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordContent />
    </Suspense>
  );
}
 
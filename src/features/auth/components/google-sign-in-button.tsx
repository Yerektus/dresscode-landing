"use client";

import { useEffect, useRef, useState } from "react";

interface GoogleSignInButtonProps {
  onToken: (idToken: string) => Promise<void>;
}

const scriptId = "google-identity-services";

export const GoogleSignInButton = ({ onToken }: GoogleSignInButtonProps) => {
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const setup = () => {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (!clientId || !window.google || !buttonRef.current) {
        return;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          if (!response.credential) {
            return;
          }

          await onToken(response.credential);
        }
      });

      buttonRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "filled_black",
        size: "large",
        text: "signin_with",
        shape: "pill",
        width: 340
      });
      setReady(true);
    };

    if (window.google) {
      setup();
      return;
    }

    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    script.addEventListener("load", setup);
    return () => {
      script?.removeEventListener("load", setup);
    };
  }, [onToken]);

  const disabledMessage = !process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    ? "Укажите NEXT_PUBLIC_GOOGLE_CLIENT_ID для Google входа"
    : null;

  return (
    <div className="space-y-2">
      <div
        ref={buttonRef}
        className="min-h-10 overflow-hidden rounded-xl"
        aria-label="Google sign in"
      />
      {!ready && (
        <p className="text-xs text-brand-mist/55">
          {disabledMessage ?? "Инициализация Google входа..."}
        </p>
      )}
    </div>
  );
};

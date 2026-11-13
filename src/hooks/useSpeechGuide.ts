import { useCallback, useEffect, useState } from "react";

export function useSpeechGuide() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const canSpeak = typeof window !== "undefined" && "speechSynthesis" in window;

  const stop = useCallback(() => {
    if (!canSpeak) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [canSpeak]);

  const toggle = useCallback(
    (text: string) => {
      if (!canSpeak) return;
      if (isSpeaking) {
        stop();
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "pt-BR";
      utterance.rate = 1;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    },
    [canSpeak, isSpeaking, stop],
  );

  useEffect(() => {
    return () => {
      if (canSpeak) {
        window.speechSynthesis.cancel();
      }
    };
  }, [canSpeak]);

  return { canSpeak, isSpeaking, toggle, stop };
}

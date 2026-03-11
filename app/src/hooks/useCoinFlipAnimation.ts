import { useState } from "react";

export const useCoinFlipAnimation = (
  onFinish: (result: { winAmount: number | null }) => void,
) => {
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<{ winAmount: number | null } | null>(
    null,
  );

  const startAnimation = () => {
    setIsFlipping(true);
    setResult(null);
  };

  const finishAnimation = (data: { winAmount: number | null }) => {
    setTimeout(() => {
      setResult(data);
      setIsFlipping(false);
      onFinish(data);
    }, 2000);
  };

  const cancelAnimation = () => {
    setIsFlipping(false);
  };

  return {
    isFlipping,
    result,
    startAnimation,
    finishAnimation,
    cancelAnimation,
    setResult,
  };
};

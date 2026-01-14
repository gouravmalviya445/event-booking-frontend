import React from "react";

export function OtpResendTimer({ isOtpSent, setIsOtpSent }: {isOtpSent: boolean, setIsOtpSent: React.Dispatch<React.SetStateAction<boolean>>}) {
  const [timeLeft, setTimeLeft] = React.useState(15);

  React.useEffect(() => {
    if (timeLeft <= 0) {
      setIsOtpSent(false);
      setTimeLeft(15)
    }

    const t = setInterval(() => { 
      if (timeLeft > 0 && isOtpSent) {
        setTimeLeft(prev => prev - 1);
      }
    }, 1000);

    return () => clearInterval(t);
  }, [isOtpSent, timeLeft])

  return (
    <>{timeLeft + "s"}</>
  )
}

import { useState, useEffect } from "react";

/** Live HH:MM:SS clock for the monitor top bar. Only client state on the page. */
export default function Clock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("ca-ES", { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="font-mono text-[15px] text-text min-w-[88px] text-right">{time}</span>
  );
}

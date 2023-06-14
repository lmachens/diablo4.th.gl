"use client";

import { useEffect, useState } from "react";
import { useDict } from "./(i18n)/i18n-provider";

const EVENT_INTERVAL_MINUTES = 2 * 60 + 15;
const EVENT_DURATION_MINUTES = 60;
const CALIBRATION_START_TIME = Date.UTC(1970, 1, 1, 9, 59, 0);

function calculateTimeLeft() {
  const elapsedTimeMinutes = Math.floor(
    (Date.now() - CALIBRATION_START_TIME) / (1000 * 60)
  );

  const nextEventTimeMinutes =
    Math.ceil(elapsedTimeMinutes / EVENT_INTERVAL_MINUTES) *
    EVENT_INTERVAL_MINUTES;
  let timeLeftMinutes = nextEventTimeMinutes - elapsedTimeMinutes;
  const eventTimeLeftMinutes =
    EVENT_DURATION_MINUTES - (EVENT_INTERVAL_MINUTES - timeLeftMinutes);
  const isActive = eventTimeLeftMinutes > 0;
  if (isActive) {
    timeLeftMinutes = eventTimeLeftMinutes;
  }
  const hoursLeft = Math.floor(timeLeftMinutes / 60)
    .toFixed(0)
    .padStart(2, "0");
  const minutesLeft = (timeLeftMinutes % 60).toFixed(0).padStart(2, "0");
  const secondsLeft = (60 - ((Date.now() / 1000) % 60))
    .toFixed(0)
    .padStart(2, "0");

  return {
    isActive,
    value: `${hoursLeft}:${minutesLeft}:${secondsLeft}`,
  };
}

export default function Helltide() {
  const dict = useDict();
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft);
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  });

  return (
    <div className="text-gray-200 text-sm px-2.5 py-2.5 space-x-1 text-shadow bg-black bg-opacity-50 md:rounded-lg whitespace-nowrap">
      <span className="text-orange-400 uppercase">
        {timeLeft.isActive ? dict.helltide.inProgress : dict.helltide.startsIn}
      </span>
      <span>{timeLeft.value}</span>
    </div>
  );
}

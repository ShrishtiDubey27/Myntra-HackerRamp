import React, { useState, useRef, useEffect } from "react";

const VoiceMessage = ({
  audioUrl,
  duration,
  isOwnMessage = false,
  timestamp,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration || 0);
  const [isLoading, setIsLoading] = useState(true);

  const audioRef = useRef(null);

  // Initialize audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setTotalDuration(audio.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      audio.currentTime = 0;
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("canplay", handleCanPlay);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("canplay", handleCanPlay);
    };
  }, [audioUrl]);

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio || isLoading) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(console.error);
      setIsPlaying(true);
    }
  };

  const handleProgressClick = (e) => {
    const audio = audioRef.current;
    if (!audio || isLoading) return;

    const progressBar = e.currentTarget;
    const clickX = e.nativeEvent.offsetX;
    const width = progressBar.offsetWidth;
    const newTime = (clickX / width) * totalDuration;

    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds === 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercentage =
    totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg min-w-64 max-w-80 ${
        isOwnMessage
          ? "bg-blue-500 text-white ml-auto"
          : "bg-gray-200 text-gray-800"
      }`}
    >
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Play/Pause Button */}
      <button
        onClick={togglePlayback}
        disabled={isLoading}
        className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
          isOwnMessage
            ? "bg-white/20 hover:bg-white/30 text-white"
            : "bg-gray-400 hover:bg-gray-500 text-white"
        } ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        title={isPlaying ? "Pause" : "Play"}
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : isPlaying ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg
            className="w-5 h-5 ml-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </button>

      {/* Waveform and Progress */}
      <div className="flex-1 space-y-2">
        {/* Waveform Visualization */}
        <div
          className="relative h-8 cursor-pointer rounded"
          onClick={handleProgressClick}
        >
          <div className="flex items-center justify-center h-full gap-0.5">
            {[...Array(32)].map((_, i) => {
              const isActive = i < (progressPercentage / 100) * 32;
              const height = Math.random() * 16 + 8; // Random height between 8-24px

              return (
                <div
                  key={i}
                  className={`w-0.5 rounded-full transition-colors duration-150 ${
                    isOwnMessage
                      ? isActive
                        ? "bg-white"
                        : "bg-white/40"
                      : isActive
                      ? "bg-blue-500"
                      : "bg-gray-400"
                  }`}
                  style={{ height: `${height}px` }}
                />
              );
            })}
          </div>

          {/* Progress Bar Overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10 rounded-full">
            <div
              className={`h-full rounded-full transition-all duration-100 ${
                isOwnMessage ? "bg-white" : "bg-blue-500"
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Time Display */}
        <div className="flex justify-between items-center text-xs">
          <span className={isOwnMessage ? "text-white/80" : "text-gray-600"}>
            {formatTime(currentTime)}
          </span>
          <span className={isOwnMessage ? "text-white/80" : "text-gray-600"}>
            {formatTime(totalDuration)}
          </span>
        </div>
      </div>

      {/* Voice Message Icon */}
      <div
        className={`flex items-center ${
          isOwnMessage ? "text-white/60" : "text-gray-500"
        }`}
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      {/* Timestamp (for own messages) */}
      {isOwnMessage && timestamp && (
        <div className="text-xs text-white/60 ml-2">
          {new Date(timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      )}
    </div>
  );
};

export default VoiceMessage;

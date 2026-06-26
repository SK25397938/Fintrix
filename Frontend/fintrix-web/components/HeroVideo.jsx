"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8 sm:h-10 sm:w-10" fill="currentColor" aria-hidden="true">
      <path d="M8 5.8c0-1.02 1.1-1.66 1.99-1.14l8.12 4.83a1.33 1.33 0 0 1 0 2.3l-8.12 4.83C9.1 17.12 8 16.48 8 15.46V5.8Z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8 sm:h-10 sm:w-10" fill="currentColor" aria-hidden="true">
      <path d="M7 5.5A1.5 1.5 0 0 1 8.5 4h1A1.5 1.5 0 0 1 11 5.5v13A1.5 1.5 0 0 1 9.5 20h-1A1.5 1.5 0 0 1 7 18.5v-13Zm6 0A1.5 1.5 0 0 1 14.5 4h1A1.5 1.5 0 0 1 17 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-1A1.5 1.5 0 0 1 13 18.5v-13Z" />
    </svg>
  );
}

function VolumeOnIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M11 6.2 8.2 8.7H5.7A1.7 1.7 0 0 0 4 10.4v3.2a1.7 1.7 0 0 0 1.7 1.7h2.5l2.8 2.5a1.15 1.15 0 0 0 1.9-.86V7.06a1.15 1.15 0 0 0-1.9-.86Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15.2 9.2a4 4 0 0 1 0 5.6M17.8 7a7 7 0 0 1 0 10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function VolumeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M11 6.2 8.2 8.7H5.7A1.7 1.7 0 0 0 4 10.4v3.2a1.7 1.7 0 0 0 1.7 1.7h2.5l2.8 2.5a1.15 1.15 0 0 0 1.9-.86V7.06a1.15 1.15 0 0 0-1.9-.86Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m16.2 10.2 3.6 3.6M19.8 10.2l-3.6 3.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function formatTime(value) {
  if (!Number.isFinite(value)) {
    return "0:00";
  }

  const totalSeconds = Math.max(0, Math.floor(value));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export default function HeroVideo() {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const handleScrollDown = (e) => {
    e.preventDefault();
    const target = document.getElementById("features");
    if (!target) return;

    const targetPosition = target.getBoundingClientRect().top + window.scrollY;
    const startPosition = window.scrollY;
    const distance = targetPosition - startPosition;
    const duration = 1000; // Custom 1000ms duration for visible smooth scroll
    let startTime = null;

    const easeInOutCubic = (t, b, c, d) => {
      t /= d / 2;
      if (t < 1) return (c / 2) * t * t * t + b;
      t -= 2;
      return (c / 2) * (t * t * t + 2) + b;
    };

    const animation = (currentTime) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const run = easeInOutCubic(timeElapsed, startPosition, distance, duration);
      window.scrollTo(0, run);
      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      } else {
        window.scrollTo(0, targetPosition);
      }
    };

    requestAnimationFrame(animation);
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.matchMedia("(max-width: 767px)").matches);
    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    setVideoFailed(false);
    setVideoReady(false);
    setCurrentTime(0);
    setDuration(0);
    video.load();
  }, [isMobile]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return undefined;
    }

    const syncPlay = () => setIsPlaying(true);
    const syncPause = () => setIsPlaying(false);
    const syncTime = () => setCurrentTime(video.currentTime || 0);
    const syncMeta = () => {
      setDuration(video.duration || 0);
      setVideoReady(true);
    };
    const syncEnd = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const syncError = () => {
      setVideoFailed(true);
      setVideoReady(false);
      setIsPlaying(false);
    };

    video.addEventListener("play", syncPlay);
    video.addEventListener("pause", syncPause);
    video.addEventListener("timeupdate", syncTime);
    video.addEventListener("loadedmetadata", syncMeta);
    video.addEventListener("ended", syncEnd);
    video.addEventListener("error", syncError);

    return () => {
      video.removeEventListener("play", syncPlay);
      video.removeEventListener("pause", syncPause);
      video.removeEventListener("timeupdate", syncTime);
      video.removeEventListener("loadedmetadata", syncMeta);
      video.removeEventListener("ended", syncEnd);
      video.removeEventListener("error", syncError);
    };
  }, []);

  const togglePlayback = async () => {
    // playback control removed per request; keep function to avoid silent refs
    return;
  };

  const handleScrub = (event) => {
    const video = videoRef.current;
    if (!video || !duration) {
      return;
    }

    const nextTime = Number(event.target.value);
    video.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  // ensure video autoplays and loops; attempt to play when mounted or when mute toggles
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = isMuted;
    video.loop = true;
    video.playsInline = true;
    video.autoplay = true;

    const tryPlay = async () => {
      try {
        await video.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    };

    tryPlay();
  }, [isMuted]);

  return (
    <section className="relative isolate w-full">
      <div
        className="group relative left-1/2 w-screen -translate-x-1/2 h-screen overflow-hidden bg-fintrix-dark"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <video
          ref={videoRef}
          className="h-full w-full object-cover object-center"
          playsInline
          autoPlay
          preload="metadata"
          muted={isMuted}
          poster=""
          loop
        >
          <source src={isMobile ? "/hero-demo-mobile.mp4" : "/hero-demo.mp4"} type="video/mp4" />
        </video>

        {/* Full-screen subtle dark overlay for video contrast */}
        <div className="absolute inset-0 bg-black/25 z-10 pointer-events-none" />

        {/* Floating scroll down indicator inside a water transparent circle */}
        <a
          href="#features"
          onClick={handleScrollDown}
          aria-label="Scroll to features"
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex h-14 w-14 animate-bob items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-md transition-all duration-300 hover:bg-white/20 hover:border-white/30 hover:scale-105 backdrop-blur-md"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6 stroke-current"
            fill="none"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </a>

        {/* Mute button container */}
        <div className="absolute bottom-6 right-6 z-30">
          <button
            type="button"
            aria-label={isMuted ? "Unmute hero video" : "Mute hero video"}
            onClick={toggleMute}
            disabled={videoFailed}
            className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/20 text-white transition duration-300 hover:bg-white/30 disabled:cursor-not-allowed disabled:opacity-60 backdrop-blur-sm"
          >
            {isMuted ? <VolumeOffIcon /> : <VolumeOnIcon />}
          </button>
        </div>

        {videoFailed ? (
          <div className="absolute inset-x-4 bottom-[6.5rem] z-20 rounded-2xl border border-white/12 bg-black/45 px-4 py-3 text-sm text-white/80 backdrop-blur-md sm:inset-x-auto sm:bottom-28 sm:left-7 sm:max-w-md">
            Add video files at <span className="font-semibold text-white">public/hero-demo.mp4</span> and optionally <span className="font-semibold text-white">public/hero-demo-mobile.mp4</span> for mobile playback.
          </div>
        ) : null}
      </div>
    </section>
  );
}

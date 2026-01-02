"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createRoom, joinRoom } from "@/lib/firebaseGame";

export default function Home() {
  const router = useRouter();
  const [gameIdInput, setGameIdInput] = useState("");
  const [playerName, setPlayerName] = useState("AlexGamer");
  const [uid, setUid] = useState("");
  const [error, setError] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [searchTime, setSearchTime] = useState(0);

  useEffect(() => {
    // Simple UID generation or retrieval
    let storedUid = localStorage.getItem("ludo_uid");
    if (!storedUid) {
      storedUid = "user_" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("ludo_uid", storedUid);
    }
    setUid(storedUid);

    const storedName = localStorage.getItem("ludo_name");
    if (storedName) setPlayerName(storedName);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSearching) {
      interval = setInterval(() => {
        setSearchTime((prev) => prev + 1);
      }, 1000);
    } else {
      setSearchTime(0);
    }
    return () => clearInterval(interval);
  }, [isSearching]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCreateGame = async () => {
    if (!playerName.trim()) {
      setError("Please enter your name");
      return;
    }
    localStorage.setItem("ludo_name", playerName);

    try {
      setIsCreatingRoom(true);
      const roomId = await createRoom(playerName, uid);
      if (roomId) {
        window.location.href = `/game/${roomId}`;
      } else {
        setError("Failed to create room. Check Firebase config.");
        setIsCreatingRoom(false);
      }
    } catch (err) {
      console.error(err);
      setError("Error creating room");
      setIsCreatingRoom(false);
    }
  };

  const handleJoinGame = async () => {
    if (!gameIdInput.trim()) {
      setError("Please enter Room Code");
      return;
    }
    if (!playerName.trim()) {
      setError("Please enter your name");
      return;
    }
    localStorage.setItem("ludo_name", playerName);

    try {
      const result = await joinRoom(gameIdInput, playerName, uid);
      if (result.success) {
        router.push(`/game/${gameIdInput}`);
      } else {
        setError(result.message || "Failed to join room");
      }
    } catch (err) {
      console.error(err);
      setError("Error joining room");
    }
  };

  const handleFindMatch = () => {
    if (!playerName.trim()) {
      setError("Please enter your name");
      return;
    }
    localStorage.setItem("ludo_name", playerName);
    setIsSearching(true);
  };

  const handleCancelSearch = () => {
    setIsSearching(false);
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-gray-200 dark:border-surface-variant bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-6 py-3 lg:px-10">
        <div className="flex items-center gap-4">
          <div className="size-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-[28px]">casino</span>
          </div>
          <h2 className="text-xl font-bold leading-tight tracking-tight text-white">Ludo Master</h2>
        </div>
        <div className="flex items-center gap-4 lg:gap-8">
          {/* Currency Display */}
          <div className="hidden md:flex items-center gap-4 bg-surface-dark/50 p-1.5 rounded-full border border-surface-variant">
            <div className="flex items-center gap-2 px-3">
              <span className="material-symbols-outlined text-yellow-400 fill-1">monetization_on</span>
              <span className="text-sm font-bold text-white">24,500</span>
            </div>
            <div className="w-px h-4 bg-surface-variant"></div>
            <div className="flex items-center gap-2 px-3">
              <span className="material-symbols-outlined text-purple-400 fill-1">diamond</span>
              <span className="text-sm font-bold text-white">120</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="relative flex size-10 items-center justify-center rounded-full bg-gray-200 dark:bg-surface-variant text-slate-700 dark:text-white hover:bg-gray-300 dark:hover:bg-slate-700 transition-colors">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-surface-variant"></span>
            </button>
            <button className="flex size-10 items-center justify-center rounded-full bg-gray-200 dark:bg-surface-variant text-slate-700 dark:text-white hover:bg-gray-300 dark:hover:bg-slate-700 transition-colors">
              <span className="material-symbols-outlined">settings</span>
            </button>
          </div>
          <div className="flex items-center gap-3 pl-2 border-l border-gray-200 dark:border-surface-variant">
            <div
              className="bg-center bg-no-repeat bg-cover rounded-full size-10 ring-2 ring-primary ring-offset-2 ring-offset-background-dark cursor-pointer"
              style={{
                backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuDEi4u5SiirSo7pdk6OpdsI4giHQf2BwY4Fidpnmg6w_flIFhzAu45Kyg5_q1KNtEdyvIgxD2FvoZ59BrKr4zUv0-C-wRzkoANJIhHyP0aEZzFVMrQDNjzr5mVEXX2Mi_ijzQkc8M65XRyDXEAuF3NcsI_WhRLFCFMmZqqKE8KrkILr2YtC-EqNH0l5bDUvbLwQQNOoHLg14ypLOWqa3SESHuPJCAYKmdSqNHgkYLnuXzd-RUwqr1LmZL3U9aQYtepcDUP-j_MaqUE")`,
              }}
            ></div>
            <div className="hidden lg:flex flex-col">
              <span className="text-sm font-bold leading-none text-white">{playerName}</span>
              <span className="text-xs text-secondary font-medium mt-1">Lvl. 12</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 lg:px-10 py-6 flex flex-col items-center">
        {/* Left & Center Content Area */}
        <div className="w-full max-w-4xl flex flex-col gap-8">
          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl text-sm font-bold flex items-center gap-2">
              <span className="material-symbols-outlined">error</span>
              {error}
            </div>
          )}

          {/* Hero / Featured Banner 
          <section className="relative w-full rounded-2xl overflow-hidden shadow-2xl group">
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10"></div>
            <div
              className="w-full bg-center bg-cover h-[320px] lg:h-[400px] transition-transform duration-700 group-hover:scale-105"
              style={{
                backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuB0TPbfDVpOhzmxleBs-iurn5l-zsqDauCwKRAOWhLc4xfx2gqs_MysR-wbXNoUYnvL0aGZFexAY-wgV5PONINhXa8cepiMQS-nJTC2dEUX_Zg23Npkrnq87g5k0DwlWTOans7HWVCQgfbzdRq_egWtg-iQdCsUR-dIvfsp_0nUCFkhcIcIW9TW4z1Q-xLmoZZCybVGLKv4xjRLbxNLLSpPMGiosH9blL_zD3HQlIVGHTvbYu28a_c52_TWKJJTtiaKh33QyAmiEck")`,
              }}
            ></div>
            <div className="absolute bottom-0 left-0 z-20 p-6 lg:p-10 max-w-2xl flex flex-col gap-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/90 text-white text-xs font-bold uppercase tracking-wider w-fit">
                <span className="material-symbols-outlined text-[16px]">local_fire_department</span>
                Live Event
              </div>
              <h1 className="text-3xl lg:text-5xl font-bold text-white leading-tight drop-shadow-md">
                Neon Nights Tournament
              </h1>
              <p className="text-gray-200 text-lg lg:text-xl font-medium drop-shadow-sm max-w-lg">
                Compete for the 50k Coin Grand Prize! Limited time event ends in 24h.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <button
                  onClick={() => router.push('/lobby')}
                  className="flex items-center gap-2 px-6 h-12 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold shadow-lg shadow-primary/30 transition-all hover:translate-y-[-2px]"
                >
                  <span className="material-symbols-outlined">play_circle</span>
                  Join Tournament
                </button>
                <button className="flex items-center gap-2 px-6 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 rounded-xl font-bold transition-all">
                  More Details
                </button>
              </div>
            </div>
          </section>
          */}

          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quick Play Card */}
            <div className={`group relative overflow-hidden rounded-2xl bg-surface-dark border transition-all min-h-[220px] flex flex-col ${isSearching
                ? 'border-primary shadow-lg shadow-primary/10 p-4 lg:p-6'
                : isCreatingRoom
                  ? 'border-surface-variant opacity-40 grayscale pointer-events-none scale-[0.98] p-6'
                  : 'border-surface-variant p-6 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10'
              }`}>
              {isSearching ? (
                <div className="flex flex-col h-full justify-between animate-in fade-in zoom-in duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                        <span className="material-symbols-outlined text-primary text-xl">radar</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white leading-none">Searching...</h3>
                        <p className="text-secondary text-xs mt-1">Finding opponents</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-background-dark/50 px-3 py-1 rounded-full border border-surface-variant">
                      <span className="material-symbols-outlined text-primary text-sm">timer</span>
                      <span className="text-sm font-mono font-bold text-white">{formatTime(searchTime)}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center py-2">
                    <div className="flex gap-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={`size-8 rounded-full border flex items-center justify-center transition-all duration-500 ${i <= 1 ? 'border-primary bg-primary/10' : 'border-surface-variant bg-surface-variant/20 opacity-40'}`}>
                          <span className="material-symbols-outlined text-white text-sm">{i <= 1 ? 'person' : 'person_outline'}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-secondary/60 font-medium mt-2 uppercase tracking-wider">1/4 Players Ready</p>
                  </div>

                  <button
                    onClick={handleCancelSearch}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 rounded-xl text-sm font-bold transition-all"
                  >
                    <span className="material-symbols-outlined text-lg">cancel</span>
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="material-symbols-outlined text-[120px] text-white">bolt</span>
                  </div>
                  <div className="relative z-10">
                    <div className="size-12 rounded-xl bg-gradient-to-br from-blue-500 to-primary flex items-center justify-center mb-4 shadow-lg shadow-primary/30">
                      <span className="material-symbols-outlined text-white text-3xl">sports_esports</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Quick Play</h3>
                    <p className="text-secondary text-sm">Jump into a classic 4-player match instantly.</p>
                  </div>
                  <button
                    onClick={handleFindMatch}
                    className="relative z-10 mt-6 w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white h-12 rounded-xl font-bold transition-colors"
                  >
                    Find Match
                  </button>
                </>
              )}
            </div>

            {/* Create/Join Room Card */}
            <div className={`flex flex-col gap-6 transition-all duration-300 ${isSearching || isCreatingRoom ? 'opacity-40 grayscale pointer-events-none scale-[0.98]' : ''} ${isCreatingRoom ? 'opacity-100 grayscale-0 pointer-events-auto scale-100' : ''}`}>
              {/* Join Room Input */}
              <div className="bg-surface-dark border border-surface-variant rounded-2xl p-6 flex flex-col justify-center flex-1">
                <label className="flex flex-col gap-3 w-full">
                  <div className="flex items-center justify-between">
                    <span className="text-white text-lg font-bold">Join Private Room</span>
                    <span className="material-symbols-outlined text-secondary">vpn_key</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 bg-background-dark border border-surface-variant rounded-xl px-4 py-3 text-white placeholder:text-secondary focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-mono tracking-widest uppercase"
                      placeholder="Enter Room Code"
                      type="text"
                      value={gameIdInput}
                      onChange={(e) => setGameIdInput(e.target.value)}
                      disabled={isSearching || isCreatingRoom}
                    />
                    <button
                      onClick={handleJoinGame}
                      disabled={isSearching || isCreatingRoom}
                      className="bg-surface-variant hover:bg-surface-variant/80 text-white rounded-xl px-4 flex items-center justify-center transition-colors disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                  </div>
                </label>
              </div>
              {/* Create Room Button */}
              <button
                onClick={handleCreateGame}
                disabled={isSearching || isCreatingRoom}
                className={`flex items-center justify-between bg-surface-dark hover:bg-surface-variant border rounded-2xl p-5 group transition-all disabled:opacity-50 ${isCreatingRoom ? 'border-primary shadow-lg shadow-primary/10 bg-surface-variant/20' : 'border-surface-variant'}`}
              >
                {isCreatingRoom ? (
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                        <span className="material-symbols-outlined text-primary text-xl">sync</span>
                      </div>
                      <div className="text-left">
                        <p className="text-white font-bold">Creating Room...</p>
                        <p className="text-secondary text-xs">Please wait</p>
                      </div>
                    </div>
                    <div className="animate-spin size-5 border-2 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center">
                        <span className="material-symbols-outlined">add_circle</span>
                      </div>
                      <div className="text-left">
                        <p className="text-white font-bold">Create Private Room</p>
                        <p className="text-secondary text-xs">Host a game for friends</p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-secondary group-hover:translate-x-1 transition-transform">chevron_right</span>
                  </>
                )}
              </button>
            </div>
          </section>



          {/* Popular Modes Carousel 
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-bold text-white">Popular Modes</h3>
              <a className="text-primary text-sm font-bold hover:underline" href="#">
                View All
              </a>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
              <div
                onClick={() => router.push('/lobby')}
                className="snap-start min-w-[260px] bg-surface-dark rounded-xl overflow-hidden border border-surface-variant group hover:border-surface-variant/80 cursor-pointer"
              >
                <div
                  className="h-32 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                  style={{
                    backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuCyY1AGEuoJEFYpjEnjncHxS6yggJbW4bLyjQE4-at1ThMOwcRxIzA7F0Msb6tBeGAU1CjTOVYm7j8i0Reeg8nMlBFc7ag9Fo_h_UpBz9crhUpxtvTCYFEUyvBeEA2wsAxW4jqllikopaTDE-5FtftnzffAwH-fTKW9RMXVQlzRMrKv4sLkzqoAgwFkz1FXhWUk-bGIZZqvklWCxswjKDB4UQR0ZZZImC890bQ4R4jZFgnIEZXmyOixW6rc9ng-gV1PwMVYsELEpnc")`,
                  }}
                ></div>
                <div className="p-4">
                  <h4 className="font-bold text-white">Team Up (2v2)</h4>
                  <p className="text-xs text-secondary mt-1">Co-op strategy mode</p>
                </div>
              </div>
              <div
                onClick={() => router.push('/lobby')}
                className="snap-start min-w-[260px] bg-surface-dark rounded-xl overflow-hidden border border-surface-variant group hover:border-surface-variant/80 cursor-pointer"
              >
                <div
                  className="h-32 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                  style={{
                    backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuAao8vq4J9YXd8X4FA066PCCGU4bUo5ozUKWPJKxOfUI43nw_PAmaRg6afOn-85c-T9OM8QPvTXqwvifYqBo69-QwqEbnwgmMAh4STZijq3-YQI9RCXS-9JMyAFipIGB0a_M492_PCV2swXvp8TTugWBVM_QQJKlVpYlYdVc5cgqzWB6XBxRzxmUPboVHVH9z-qXNaH9NLY6cjyUqE_N5EAawlf4fzyfj30rAm17o5LNzBN0Lu4aWDzwYd1oRaOYTeEmzdwm0oPuJY")`,
                  }}
                ></div>
                <div className="p-4">
                  <h4 className="font-bold text-white">Blitz Mode</h4>
                  <p className="text-xs text-secondary mt-1">5 min timer match</p>
                </div>
              </div>
              <div
                onClick={() => router.push('/local')}
                className="snap-start min-w-[260px] bg-surface-dark rounded-xl overflow-hidden border border-surface-variant group hover:border-surface-variant/80 cursor-pointer"
              >
                <div
                  className="h-32 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                  style={{
                    backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuBIFdCwRNY9k8It8aJXMzA2FEDYuOrRl95zWoB3hwYvWmIF7qjy3FBTHXpK_cXjDn6Iuts7N9t7Xh2IBDCN8mHt5wBTDDT8sYN3M_vn-TM7cV8ZhXCNub_Al9gMLQmSFB3quQsSsHMd9VzibJJBmPJdo69_x1SMm2-_Sh-PwYCcYhLIZ9U51g1-JuckTvxX_vX2ek9pE7KPqBt8vCS6U6F1dkG3AeL7vvTsVTM2MKLjzdi_KmqMeO_iACzR461xHcau6xpf-2wsGCE")`,
                  }}
                ></div>
                <div className="p-4">
                  <h4 className="font-bold text-white">Master Bot</h4>
                  <p className="text-xs text-secondary mt-1">Train against AI</p>
                </div>
              </div>
            </div>
          </section>
          */}
        </div>

        {/* Right Sidebar (4 Cols) 
        <aside className="lg:col-span-4 flex flex-col gap-6 h-full">
          <div className="bg-surface-dark rounded-2xl border border-surface-variant p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-yellow-500">trophy</span>
                Top Players
              </h3>
              <select className="bg-transparent text-xs font-medium text-secondary border-none focus:ring-0 p-0 cursor-pointer">
                <option>Global</option>
                <option>Friends</option>
              </select>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                <div className="font-bold text-yellow-500 w-4 text-center">1</div>
                <div
                  className="size-8 rounded-full bg-cover bg-center"
                  style={{
                    backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuApHcEM23fMkmu9flNK9tAlVU3y3r18qhdmLrzGOMXdtSGrw6aQ-kszU71oK3TKT1S-o2Hbit9h_ibX7hZP5hLqXgeI59JthjsEElG2Ma-URg0HhDqxdrlCUP5q9n5hCqK28a5VpySj-PmxcT3oXxSUYdiegY0d0Yx3XlOcIyQ1bDZMWWq7Eheh_tNBlCjzxYAyTlmDdsK7uX9xyrdbZn5mh4pkk42eTruXY_vKGC2TDqtU-1J58A4mlBFyyvBqdYqIZ8_1I18844I")`,
                  }}
                ></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">CyberKing</p>
                  <p className="text-xs text-secondary">2.4M XP</p>
                </div>
                <span className="material-symbols-outlined text-yellow-500 text-[16px]">military_tech</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                <div className="font-bold text-gray-400 w-4 text-center">2</div>
                <div
                  className="size-8 rounded-full bg-cover bg-center"
                  style={{
                    backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuBkSJbvEAR5LEc4Wk7r9gcizECuaslKQ_bcj7FIAW05HG0DuBQD-I_wsI5kl-raofdssMvTWcxsIAldEiK6Lk3etntKL-gPGI0-7PklC5RZ-MpBggQ4F6iA19pV8UWTHsQMCKMWZE_FVl3TM60WMLTFlQ1INHk7NVcm_rBmO8Yk05Xu4RKORERS72521M7hw1Sn0SzPdwyw_BxwYXwVv_kQqrB83rWkdDnb1YgFTxQ9foDAd3BaK_KXJ7duxvhRYlXpg_OSrhcDu1w")`,
                  }}
                ></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">LudoQueen</p>
                  <p className="text-xs text-secondary">2.1M XP</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                <div className="font-bold text-orange-700 w-4 text-center">3</div>
                <div
                  className="size-8 rounded-full bg-cover bg-center"
                  style={{
                    backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuD6HB7vPY5pRuXRWoB-vR71uhc4PzOYEcbIvplQ-y5bit8gE6QP5ZHg6IlEDJht7PEjzC8MRdZWEpWWmgQ6XZF3UIOhf-0ElKh2HythC0l8jRklZNV3t6Jp-KZk56bsz75BXdy7ip5pkG80iqZILW6Y4cLhVZN7gRaDmN6ANhQqm8TnrRqtpiU-vs_w78OxEF2RduhG1jzkZLXF1LCWjoDwhGDk3eE5ZWL0kRWmjKV70N_s1-mtsiBCCIYtOEe556bQzIZwUmPRgnU")`,
                  }}
                ></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">DiceRoller99</p>
                  <p className="text-xs text-secondary">1.9M XP</p>
                </div>
              </div>
            </div>
            <button className="w-full mt-4 py-2 text-xs font-bold text-secondary hover:text-white transition-colors">
              View Full Leaderboard
            </button>
          </div>

          <div className="flex-1 bg-surface-dark rounded-2xl border border-surface-variant flex flex-col overflow-hidden min-h-[300px]">
            <div className="p-5 border-b border-surface-variant flex items-center justify-between">
              <h3 className="font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-green-400">group</span>
                Friends
              </h3>
              <div className="flex gap-2">
                <span className="size-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-xs font-medium text-green-400">4 Online</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-variant/50 cursor-pointer group transition-colors">
                <div className="relative">
                  <div
                    className="size-10 rounded-full bg-cover bg-center"
                    style={{
                      backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuCNxzsvNYfVqdJTjcOy-GJUyxewzBBczHZUjc_8Bnu39SvPYD3_CKiN-rP8MTgF0X9QvV6mivJEe-ZZHAV430N7LvjvL8s2n5lZc_DJiVmwcEDFBpcnFGl1TFiTpdJs9fCSoplrW7BpwD9L2FU8pvQkPpTevkjvzDG6cNOirXjS_-DX4_9zRQRsSPAnC-Ah0E2aLobdZYBr8-le6Bp_np56A92aY-Oe01dtlZuycSMHCezPzKAFEneiXGSBTVljH3VFoubxjx5ExYM")`,
                    }}
                  ></div>
                  <span className="absolute bottom-0 right-0 size-3 bg-green-500 border-2 border-surface-dark rounded-full"></span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">Sarah Jenkins</p>
                  <p className="text-xs text-green-400">In Lobby</p>
                </div>
                <button className="size-8 rounded-full bg-surface-variant text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary">
                  <span className="material-symbols-outlined text-[18px]">swords</span>
                </button>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-variant/50 cursor-pointer group transition-colors">
                <div className="relative">
                  <div
                    className="size-10 rounded-full bg-cover bg-center"
                    style={{
                      backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuD5tWukQZlK2sX8fdRkGRj4T8zc-lnGprvf9LmgVrJq5gG4dBkcSE7VQYUQ5JA3otsAmkHf5ULwi1_o_iUEGlYYrY9gcsM9eABMD2uvF9S2d3xnM4dR7F8TpqyZipXOQRn7kXAe4dGWagP2ZmnIH1yURFrwuBq5fH2nPEz3sL2BKGsBFO9rFjLpxrqKxsAOPB24KbTssZR_dlkvh89QBk950L8gakRA6rVZIq8nLF7_MjXxtoKw75DHKE2m2Y8xQkqxPm1LHBe2pJ0")`,
                    }}
                  ></div>
                  <span className="absolute bottom-0 right-0 size-3 bg-yellow-500 border-2 border-surface-dark rounded-full"></span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">Mike Ross</p>
                  <p className="text-xs text-yellow-500">Playing Classic (2/4)</p>
                </div>
                <button className="size-8 rounded-full bg-surface-variant text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary">
                  <span className="material-symbols-outlined text-[18px]">visibility</span>
                </button>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-variant/50 cursor-pointer group transition-colors">
                <div className="relative">
                  <div
                    className="size-10 rounded-full bg-cover bg-center"
                    style={{
                      backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuCYqlptdNu5SPwkmif84ZwXlhbLhuPnbQn0mFyMUaYWDgCNpb5vnY6qIZGWpbPaA7eDKyK_LvMafaSevm-wTMlODZ5rWebrsglcv0sty4Nscz5vrLrF_zHGSp4IYWW0x06XdGXEYnxLie_Ap5fMx1fUJWGcjKrzHxRywJlUzYm7FC1bbbWyXb7pl6jgISXDkWlXJDsfXggrwVtdQ79XKgM6pmhOXEmZrIyKG2ReVARti6C2B2_0Uj78nNiGCLG43nkOWLn8VE6ilm4")`,
                    }}
                  ></div>
                  <span className="absolute bottom-0 right-0 size-3 bg-green-500 border-2 border-surface-dark rounded-full"></span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">Elena G.</p>
                  <p className="text-xs text-green-400">Online</p>
                </div>
                <button className="size-8 rounded-full bg-surface-variant text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary">
                  <span className="material-symbols-outlined text-[18px]">chat</span>
                </button>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-variant/50 cursor-pointer group opacity-60 hover:opacity-100 transition-all">
                <div className="relative">
                  <div
                    className="size-10 rounded-full bg-cover bg-center grayscale"
                    style={{
                      backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuBLRAVc_yWnh_M5hkU8mIZFm0ZGiujB0ORcTqSwtKyXgDP0uPbpSn4H_etauGDzhAI4rNwLpNle-QU89WKHUweGfeegqXElDXqx4F6-7VIqamtKw1OK3KmxtAgr65TmmZZKHc7H5sNd1iUiklnvJ26zaYuxvvYcHxwX-VeMrUx39BrVGJ5Ne6VMGlm9hnxgnQGidmRt0TqI_elKG8_RI9sBfLmduSQsumBlOwD_33rX1Yu7xVTFek_clayvXEro1B2NMNuOD6XxSfQ")`,
                    }}
                  ></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">David Chen</p>
                  <p className="text-xs text-secondary">Offline 2h ago</p>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-surface-variant">
              <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-primary/50 text-primary font-bold hover:bg-primary/10 transition-colors">
                <span className="material-symbols-outlined">person_add</span>
                Invite Friends
              </button>
            </div>
          </div>
        </aside>
        */}
      </main>

      {/* Floating Action Button 
      <div className="fixed bottom-6 right-6 z-50">
        <button className="size-14 rounded-full bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/30 flex items-center justify-center transition-transform hover:scale-110 active:scale-95 group">
          <span className="material-symbols-outlined text-2xl group-hover:animate-bounce">chat_bubble</span>
        </button>
      </div>
      */}
    </>
  );
}

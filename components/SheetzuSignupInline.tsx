"use client"

import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { getLastSignups } from "../lib/sheets"
import type { UserData } from "../lib/sheets"

const SHEET_TEMPLATE_URL = "https://docs.google.com/spreadsheets/d/1us2AuraLRJ_M2A-k0Vpt1IRAgZdqyH48KCQRH1UPfSU/copy"
const GOOGLE_FORM_URL_BASE = "https://docs.google.com/forms/d/1umiQQS_StmH7BvdVR9DjUpJF4xtL65DE6apKOfFgGgE/viewform"
const ENTRY_SHEETID = "entry.2044181255"
const ENTRY_USERNAME = "entry.823692039"

function extractSheetId(input: string): string {
  // Match /d/{id} anywhere after /spreadsheets, regardless of /u/ or /edit, /htmlview, etc.
  const match = input.match(/\/spreadsheets(?:\/u\/\d+)?\/d\/([a-zA-Z0-9-_]+)/);
  if (match) return match[1];
  if (/^[a-zA-Z0-9-_]{30,60}$/.test(input)) return input;
  return "";
}

const slideVariants = {
  initial: { x: 80, opacity: 0, filter: "blur(12px)" },
  animate: { x: 0, opacity: 1, filter: "blur(0px)", transition: { type: "spring", stiffness: 80, damping: 20 } },
  exit: { x: -80, opacity: 0, filter: "blur(12px)", transition: { duration: 0.35 } }
}

const iconBtn =
  "inline-flex items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm hover:bg-green-50 hover:border-green-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-40 disabled:cursor-not-allowed";

export default function SheetzuSignupInline() {
  const [step, setStep] = useState<"button" | "permissions" | "details" | "submit">("button")
  const [sheetUrl, setSheetUrl] = useState("")
  const [sheetId, setSheetId] = useState("")
  const [sheetError, setSheetError] = useState("")
  const [username, setUsername] = useState("")
  const [usernameError, setUsernameError] = useState("")
  const [checking, setChecking] = useState(false)
  const [allUsernames, setAllUsernames] = useState<string[]>([])

  // New states for waiting and polling
  const [waitingForSite, setWaitingForSite] = useState(false)
  const [pollCount, setPollCount] = useState(0)
  const [siteReady, setSiteReady] = useState(false)
  const [celebrated, setCelebrated] = useState(false)
  const [manualPasteNotice, setManualPasteNotice] = useState(""); // New state for manual paste notice
  const maxPolls = 10

  // Fetch all usernames for validation (like in your modal)
  useEffect(() => {
    getLastSignups(1000).then(users => setAllUsernames(users.map(u => u.username)))
  }, [])

  // Username validation logic (same as modal)
  useEffect(() => {
    if (step !== "details") return
    if (!username) {
      setUsernameError("")
      return
    }
    setChecking(true)
    const valid = /^[a-z0-9]+(-[a-z0-9]+)*$/.test(username) && username.length >= 5 && username.length <= 25
    if (!valid) {
      setUsernameError("5-25 lowercase letters/numbers, single hyphens allowed.")
      setChecking(false)
      return
    }
    if (allUsernames.includes(username)) {
      setUsernameError("This username is taken.")
      setChecking(false)
      return
    }
    setUsernameError("")
    setChecking(false)
    // No auto-advance here
  }, [username, allUsernames, step])

  const getPrefilledFormUrl = () => {
    const params = new URLSearchParams()
    if (sheetId) params.append(ENTRY_SHEETID, sheetId)
    if (username) params.append(ENTRY_USERNAME, username)
    return `${GOOGLE_FORM_URL_BASE}?${params.toString()}`
  }

  const openFormPopup = () => {
    const url = getPrefilledFormUrl()
    const popup = window.open(url, "sheetzu_signup", "width=600,height=800")
    if (!popup) window.open(url, "_blank")
    setWaitingForSite(true)
  }

  // Polling effect to check if the site is ready
  useEffect(() => {
    if (!waitingForSite) return
    if (siteReady || pollCount >= maxPolls) return
    const interval = setInterval(() => {
      getLastSignups(1000).then(users => {
        if (users.some(u => u.username === username)) {
          setSiteReady(true)
          clearInterval(interval)
        } else {
          setPollCount(c => c + 1)
        }
      })
    }, 5000)
    return () => clearInterval(interval)
  }, [waitingForSite, siteReady, pollCount, username])

  // Celebration effect
  useEffect(() => {
    if (siteReady && !celebrated) {
      setCelebrated(true)
      try {
        // If window.confetti is available (e.g. canvas-confetti)
        if (typeof window !== 'undefined' && (window as any).confetti) {
          (window as any).confetti({
            particleCount: 200,
            spread: 90,
            origin: { y: 0.6 }
          })
        } else {
          // fallback: simple emoji burst
          for (let i = 0; i < 10; i++) {
            setTimeout(() => {
              const el = document.createElement('div')
              el.textContent = '🎉'
              el.style.position = 'fixed'
              el.style.left = Math.random() * 100 + 'vw'
              el.style.top = Math.random() * 80 + 'vh'
              el.style.fontSize = '2rem'
              el.style.zIndex = '9999'
              document.body.appendChild(el)
              setTimeout(() => el.remove(), 1200)
            }, i * 80)
          }
        }
      } catch {}
    }
  }, [siteReady, celebrated])

  // Auto‐advance from "permissions" when user returns with a sheet URL on clipboard
  useEffect(() => {
    function onVisibilityChange() {
      if (!document.hidden && step === "permissions") {
        if (
          typeof navigator !== "undefined" &&
          navigator.clipboard &&
          navigator.clipboard.readText
        ) {
          navigator.clipboard.readText().then(text => {
            const id = extractSheetId(text);
            if (id) {
              setSheetUrl(text);
              setSheetId(id);
              setSheetError("");
              setManualPasteNotice("");
              setStep("details");
            }
          }).catch(() => {});
        }
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange)
    return () => document.removeEventListener("visibilitychange", onVisibilityChange)
  }, [step])

  // Auto-paste sheet URL when details step starts
  useEffect(() => {
    if (step === "details") {
      if (
        typeof navigator === "undefined" ||
        !navigator.clipboard ||
        !navigator.clipboard.readText
      ) {
        setManualPasteNotice("Automatic pasting is not available on your device. Paste manually.");
        return;
      }
      navigator.clipboard.readText()
        .then(text => {
          const id = extractSheetId(text);
          if (id) {
            setSheetUrl(text);
            setSheetId(id);
            setSheetError("");
          }
        })
        .catch(() => {});
    }
  }, [step]);

  // Back step logic
  const handleBack = () => {
    if (step === "permissions") setStep("button")
    if (step === "details") setStep("permissions")
    if (step === "submit") setStep("details")
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-2xl pt-8 px-8 flex flex-col items-center gap-6">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-900">Get your 🐶 Sheetzu Store</h2>
      {/* Progress Bar */}
<div className="w-full flex justify-between items-center">
  {["Copy", "Share", "Name", "Submit"].map((label, idx) => {
    // Determine step index
    const stepOrder = ["button", "permissions", "details", "submit"];
    const currentIdx = stepOrder.indexOf(step);

    // Finished: idx < currentIdx
    // Current: idx === currentIdx
    // Upcoming: idx > currentIdx
    const isFinished = idx < currentIdx;
    const isCurrent = idx === currentIdx;

    return (
      <div key={label} className="flex-1 flex flex-col items-center">
        <div
          className={
            "w-8 h-8 rounded-full mb-1 flex items-center justify-center " +
            (isFinished
              ? "bg-green-100"
              : isCurrent
              ? "bg-[#0F9D58]"
              : "bg-gray-300")
          }
        >
          {isFinished ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="10" fill="none" />
              <path
                d="M6 10.5l3 3 5-5"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <span
              className={
                "text-sm font-medium " +
                (isCurrent ? "text-white" : "text-gray-500")
              }
            >
              {idx + 1}
            </span>
          )}
        </div>
        <span
          className={
            "text-xs " +
            (isCurrent
              ? "text-[#0F9D58]"
              : isFinished
              ? "text-green-700"
              : "text-gray-500")
          }
        >
          {label}
        </span>
      </div>
    );
  })}
</div>
      <div className="relative w-full min-h-[90px]">
        {/* Coach Overlay */}
        {step === "permissions" && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
          >
            <div className="bg-white rounded-lg py-6 px-2 max-w-md mx-4 text-center shadow-xl">
              <h4 className="text-2xl font-bold mb-4 text-center text-gray-900">🐶 Share Permission 🐶</h4>
              <img
                src="/sheetzu_flow.gif"
                alt="Click Share → Anyone with link can view"
                className="my-4 w-full"
              />
              <p className="text-sm text-red-400 mb-4 mx-0 px-0">
                ‼️ <b>On mobile?</b> You'll need Sheets app for this</p>
                <button
                  aria-label="Back"
                  className={iconBtn + " mr-2"}
                  onClick={() => setStep("button")}
                  type="button"
                  style={{ height: 36, width: 36 }}
                >
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <path d="M15 19l-7-7 7-7" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button
                  onClick={async () => {
                    if (
                      typeof navigator === "undefined" ||
                      !navigator.clipboard ||
                      !navigator.clipboard.readText
                    ) {
                      setManualPasteNotice("Automatic pasting is not available on your device. Paste manually.");
                      setStep("details");
                      return;
                    }
                    try {
                      const text = await navigator.clipboard.readText();
                      const id = extractSheetId(text);
                      if (id) {
                        setSheetUrl(text);
                        setSheetId(id);
                        setSheetError("");
                        setManualPasteNotice("");
                        setStep("details");
                      } else {
                        setSheetError("Copy a valid sheet URL to proceed.");
                      }
                    } catch {
                      setManualPasteNotice("Automatic pasting is not available on your device. Paste manually.");
                      setStep("details");
                    }
                  }}
                  className="px-8 py-3 bg-[#0F9D58] text-white rounded hover:bg-[#0c7c43] transition"
                  style={{ width: "max-content" }}
                >
                  Follow GIF 👆 then Proceed!
                </button>
              {sheetError && (
                <div className="text-red-600 mt-2 text-sm">{sheetError}</div>
              )}
            </div>
          </motion.div>
        )}
        <AnimatePresence mode="wait">
          {step === "button" && (
            <motion.div
              key="button"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full"
            >
              <button
                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-[#0F9D58] text-white font-bold text-lg shadow-xl hover:bg-[#0c7c43] transition-all duration-300 border border-[#0F9D58] text-center"
                onClick={() => {
                  window.open(SHEET_TEMPLATE_URL, "_blank")
                  setStep("permissions")
                }}
              >
                <img src="/google_sheets_icon.png" alt="Google Sheets" className="w-6 h-6 mr-6" />
                Copy this sheet
              </button>
            </motion.div>
          )}
          {step === "details" && (
            <motion.div
              key="details"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full"
            >
              {/* Manual paste notice if clipboard fails */}
              {manualPasteNotice && (
                <div className="text-yellow-700 bg-yellow-100 border border-yellow-300 rounded px-3 py-2 mb-2 text-sm">
                  {manualPasteNotice}
                </div>
              )}
              {/* Sheet URL Input */}
              <div className="flex items-center mb-4">
                {/* <button
                  aria-label="Back"
                  className={iconBtn + " mr-2"}
                  onClick={() => setStep("permissions")}
                  type="button"
                  style={{ height: 36, width: 36 }}
                >
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <path d="M15 19l-7-7 7-7" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button> */}
                <input
                  id="sheet-url-input"
                  type="text"
                  className="flex-1 border border-gray-300 rounded px-3 py-2 mr-2 text-gray-900"
                  placeholder="Paste sheet URL"
                  value={sheetUrl}
                  onChange={e => {
                    const val = e.target.value;
                    setSheetUrl(val);
                    const id = extractSheetId(val);
                    setSheetId(id);
                    setSheetError(val && !id ? "Invalid sheet URL." : "");
                  }}
                />
                {/* <button
                  aria-label="Next"
                  className={iconBtn}
                  onClick={() => setStep("submit")}
                  disabled={!sheetId}
                  type="button"
                  style={{ height: 36, width: 36 }}
                >
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <path d="M9 5l7 7-7 7" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button> */}
              </div>
              {sheetError && <div className="text-red-600 text-sm mb-4">{sheetError}</div>}
              {/* Username Input */}
              <div className="flex flex-col w-full mb-4">
                <div className="flex items-center">
                  <button
                    aria-label="Back"
                    className={iconBtn + " mr-2"}
                    onClick={() => setStep("permissions")}
                    type="button"
                    style={{ height: 36, width: 36 }}
                  >
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                      <path d="M15 19l-7-7 7-7" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <input
                    type="text"
                    className="flex-1 border border-gray-300 rounded px-3 py-2 mr-2 text-gray-900"
                    placeholder="Choose a store name"
                    value={username}
                    onChange={e => setUsername(e.target.value.toLowerCase())}
                  />
                  <button
                    aria-label="Next"
                    className={iconBtn}
                    onClick={() => {
                      if (!usernameError && username) {
                        openFormPopup();
                        setWaitingForSite(true);
                        setStep("submit");
                      }
                    }}
                    disabled={!!usernameError || !username || checking}
                    type="button"
                    style={{ height: 36, width: 36 }}
                  >
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                      <path d="M9 5l7 7-7 7" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
                {/* Error and checking messages always inside the modal */}
                {checking && <div className="text-blue-500 text-sm mt-1">Checking…</div>}
                {usernameError && <div className="text-red-600 text-sm mt-1">{usernameError}</div>}
              </div>
            </motion.div>
          )}
          {step === "submit" && (
            <motion.div
              key="submit"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full"
            >
              <div className="relative w-full">
                {/* Back button absolutely inside the container, not inside the submit button */}
                {/* <button
                  className="w-full flex items-center justify-center gap-2 px-12 py-4 rounded-xl bg-green-600 text-white font-bold text-lg shadow-xl hover:bg-green-700 transition-all duration-300 border border-blue-600 text-center"
                  onClick={openFormPopup}
                  style={{ position: "relative" }}
                >
                  submit the form
                </button> */}
{/* Polling status below the button */}
      {waitingForSite && (
        <div className="mt-4 flex flex-col items-center">
          {!siteReady && pollCount < maxPolls && (
            <div className="flex flex-col items-center animate-fade-in">
              <span className="animate-bounce text-2xl">🐶</span>
              <div className="text-gray-600 text-lg font-medium">
                Waiting for your site to be ready...
              </div>
              <div className="my-2 text-xs text-gray-400">Submit the Google form to see it live</div>
            </div>
          )}
          {siteReady && (
            <div className="flex flex-col items-center gap-4 animate-fade-in">
              <div className="text-5xl animate-bounce">🎉🥳🎊</div>
              <a
                href={`http://${username}.${process.env.NEXT_PUBLIC_BASE_DOMAIN || 'fenil.life'}`}
                className="mb-4 px-8 py-3 rounded bg-[#0F9D58] text-white text-lg shadow hover:bg-[#0c7c43] transition"
                target="_blank"
                rel="noopener noreferrer"
              >
                Your Sheetzu store is live!
              </a>
              <div className="text-gray-600 text-sm">Visit: <span className="font-mono">{username}.{process.env.NEXT_PUBLIC_BASE_DOMAIN || 'fenil.life'}</span></div>
            </div>
          )}
          {pollCount >= maxPolls && !siteReady && (
            <button
              className="text-yellow-600 mt-2 underline hover:text-yellow-800 transition"
              onClick={() => {
              openFormPopup();
              setPollCount(0);
              setSiteReady(false);
              setCelebrated(false);
              setWaitingForSite(true);
              }}
              type="button"
            >
              Couldn't find your form 😿 Retry?
            </button>
          )}
        </div>
      )}
    </div>
  </motion.div>
)}
        </AnimatePresence>
      </div>
    </div>
  )
}
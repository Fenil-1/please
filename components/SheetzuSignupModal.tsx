"use client"

import { useState, useEffect, useRef } from "react"
import { getLastSignups } from "../lib/sheets"
import type { UserData } from "../lib/sheets"

const GOOGLE_FORM_ID = "1umiQQS_StmH7BvdVR9DjUpJF4xtL65DE6apKOfFgGgE"
// You will need to provide the correct entry IDs for username, sheetId, fullName, phone
const ENTRY_USERNAME = "entry.823692039" // update with real entry ID
const ENTRY_SHEETID = "entry.2044181255" // update with real entry ID
const ENTRY_FULLNAME = "entry.1784027031" // update with real entry ID
const ENTRY_PHONE = "entry.1387084997" // update with real entry ID

export default function SheetzuSignupModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1)
  const [sheetId, setSheetId] = useState("")
  const [username, setUsername] = useState("")
  const [usernameStatus, setUsernameStatus] = useState<null | "checking" | "valid" | "invalid">()
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [country, setCountry] = useState("+91") // Default to India
  const [allUsernames, setAllUsernames] = useState<string[]>([])
  const [error, setError] = useState("")
  const [siteReady, setSiteReady] = useState(false)
  const [checkingSite, setCheckingSite] = useState(false)
  const [celebrate, setCelebrate] = useState(false)
  const [pollCount, setPollCount] = useState(0)
  const [celebrated, setCelebrated] = useState(false)
  const maxPolls = 10
  const pollInterval = 5000 // 5 seconds

  // Fetch all usernames for validation
  useEffect(() => {
    getLastSignups(1000).then(users => setAllUsernames(users.map(u => u.username)))
  }, [])

  // Username validation
  useEffect(() => {
    if (!username) return setUsernameStatus(null)
    setUsernameStatus("checking")
    const valid = /^[a-z0-9]+(-[a-z0-9]+)*$/.test(username) && username.length >= 5 && username.length <= 25
    if (!valid) {
      setUsernameStatus("invalid")
      return
    }
    if (allUsernames.includes(username)) {
      setUsernameStatus("invalid")
      return
    }
    setUsernameStatus("valid")
  }, [username, allUsernames])

  // Check if site is ready (username exists in main sheet)
  useEffect(() => {
    if (step === 3 && username) {
      setCheckingSite(true)
      getLastSignups(1000).then(users => {
        setSiteReady(users.some(u => u.username === username))
        setCheckingSite(false)
      })
    }
  }, [step, username])

  // Polling for site readiness in Step 3
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (step === 3 && username && !siteReady && pollCount < maxPolls) {
      interval = setInterval(() => {
        setCheckingSite(true)
        getLastSignups(1000).then(users => {
          const ready = users.some(u => u.username === username)
          setSiteReady(ready)
          setCheckingSite(false)
          setPollCount(count => count + 1)
        })
      }, pollInterval)
    }
    if (siteReady && !celebrated) {
      // Confetti celebration (handle window.confetti type)
      setCelebrated(true)
      try {
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
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [step, username, siteReady, pollCount, celebrated])

  // Prefill Google Form URL
  function getPrefillUrl() {
    // You must update the entry IDs below to match your Google Form fields
    const params = new URLSearchParams({
      [ENTRY_USERNAME]: username,
      [ENTRY_SHEETID]: sheetId,
      [ENTRY_FULLNAME]: fullName,
      [ENTRY_PHONE]: country + phone,
    })
    return `https://docs.google.com/forms/d/${GOOGLE_FORM_ID}/viewform?usp=pp_url&${params.toString()}`
  }

  // --- Step 1 ---
  if (step === 1) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative text-gray-900 animate-fadeIn">
          <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl" onClick={onClose}>&times;</button>
          <h2 className="text-2xl font-bold mb-4 text-center">Step 1: Copy the Sheetzu template</h2>
          <p className="mb-6 text-center text-gray-600">Copy our <a href="https://docs.google.com/spreadsheets/d/1us2AuraLRJ_M2A-k0Vpt1IRAgZdqyH48KCQRH1UPfSU/copy" target="_blank" rel="noopener" className="text-blue-600 underline font-semibold">Google Sheet template</a> to your own Google Drive. Then paste your new Sheet ID below.</p>
          <div className="flex flex-col items-center gap-4 mb-6">
            <a href="https://docs.google.com/spreadsheets/d/1us2AuraLRJ_M2A-k0Vpt1IRAgZdqyH48KCQRH1UPfSU/copy" target="_blank" rel="noopener" className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#0F9D58] text-white font-bold text-lg shadow hover:bg-[#0c7c43] transition border border-[#0F9D58]">
              <img src="/placeholder-logo.png" alt="Google Sheets" className="w-6 h-6" />
              Copy Google Sheet
            </a>
            <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 text-lg focus:ring-2 focus:ring-blue-400" placeholder="Paste your Sheet ID here" value={sheetId} onChange={e => setSheetId(e.target.value)} />
          </div>
          <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold text-lg shadow hover:bg-blue-700 transition disabled:opacity-50" disabled={!sheetId} onClick={() => setStep(2)}>
            Next
          </button>
        </div>
      </div>
    )
  }

  // --- Step 2 ---
  if (step === 2) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative text-gray-900 animate-fadeIn">
          <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl" onClick={onClose}>&times;</button>
          <h2 className="text-2xl font-bold mb-4 text-center">Step 2: Choose your username</h2>
          <div className="mb-2 flex items-center gap-2">
            <input type="text" className="flex-1 border border-gray-300 rounded px-3 py-2 text-lg focus:ring-2 focus:ring-blue-400" placeholder="username" value={username} onChange={e => setUsername(e.target.value)} />
            {usernameStatus === "checking" && <span className="text-gray-400">...</span>}
            {usernameStatus === "valid" && <span className="text-green-600">✔</span>}
            {usernameStatus === "invalid" && <span className="text-red-600">✖</span>}
          </div>
          <p className="text-xs text-gray-500 mb-2 text-center">5-25 lowercase letters, numbers, single hyphens allowed. Must be unique.</p>
          {usernameStatus === "invalid" && <div className="text-red-600 text-sm mb-2 text-center">Username not available or invalid.</div>}
          <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 mb-2 text-lg focus:ring-2 focus:ring-blue-400" placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} />
          <div className="flex gap-2 mb-4">
            <select className="border border-gray-300 rounded px-2 py-2 text-lg focus:ring-2 focus:ring-blue-400" value={country} onChange={e => setCountry(e.target.value)}>
              <option value="+91">🇮🇳 +91</option>
              <option value="+1">🇺🇸 +1</option>
              <option value="+44">🇬🇧 +44</option>
              <option value="+61">🇦🇺 +61</option>
              <option value="+81">🇯🇵 +81</option>
              <option value="+49">🇩🇪 +49</option>
              <option value="+33">🇫🇷 +33</option>
              <option value="+971">🇦🇪 +971</option>
              <option value="+880">🇧🇩 +880</option>
              <option value="+92">🇵🇰 +92</option>
              <option value="+234">🇳🇬 +234</option>
              <option value="+55">🇧🇷 +55</option>
              <option value="+7">🇷🇺 +7</option>
              <option value="+86">🇨🇳 +86</option>
              <option value="+62">🇮🇩 +62</option>
              <option value="+63">🇵🇭 +63</option>
              <option value="+60">🇲🇾 +60</option>
              <option value="+27">🇿🇦 +27</option>
              <option value="+82">🇰🇷 +82</option>
              <option value="+34">🇪🇸 +34</option>
              <option value="+39">🇮🇹 +39</option>
              <option value="+351">🇵🇹 +351</option>
              <option value="+90">🇹🇷 +90</option>
              <option value="+966">🇸🇦 +966</option>
              <option value="+20">🇪🇬 +20</option>
              <option value="+212">🇲🇦 +212</option>
              <option value="+998">🇺🇿 +998</option>
              <option value="+380">🇺🇦 +380</option>
              <option value="+84">🇻🇳 +84</option>
              <option value="+66">🇹🇭 +66</option>
              <option value="+48">🇵🇱 +48</option>
              <option value="+420">🇨🇿 +420</option>
              <option value="+36">🇭🇺 +36</option>
              <option value="+31">🇳🇱 +31</option>
              <option value="+358">🇫🇮 +358</option>
              <option value="+46">🇸🇪 +46</option>
              <option value="+47">🇳🇴 +47</option>
              <option value="+45">🇩🇰 +45</option>
              <option value="+386">🇸🇮 +386</option>
              <option value="+421">🇸🇰 +421</option>
              <option value="+43">🇦🇹 +43</option>
              <option value="+40">🇷🇴 +40</option>
              <option value="+372">🇪🇪 +372</option>
              <option value="+370">🇱🇹 +370</option>
              <option value="+371">🇱V +371</option>
              <option value="+375">🇧🇾 +375</option>
              <option value="+373">🇲🇩 +373</option>
              <option value="+995">🇬🇪 +995</option>
              <option value="+994">🇦🇿 +994</option>
            </select>
            <input type="tel" className="flex-1 border border-gray-300 rounded px-3 py-2 text-lg focus:ring-2 focus:ring-blue-400" placeholder="Phone number" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold text-lg shadow hover:bg-blue-700 transition disabled:opacity-50" disabled={usernameStatus !== "valid" || !fullName || !phone} onClick={() => setStep(3)}>
            Next
          </button>
        </div>
      </div>
    )
  }

  // --- Step 3 ---
  if (step === 3) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative text-gray-900 animate-fadeIn text-center">
          <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl" onClick={onClose}>&times;</button>
          <h2 className="text-2xl font-bold mb-4">Step 3: Submit your Sheetzu to Google</h2>
          <p className="mb-4 text-gray-600">To finish, click below to open the Google Form. Sign in with your Google account and submit your details to activate your Sheetzu site.</p>
          <a href={getPrefillUrl()} target="_blank" rel="noopener" className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold text-lg shadow hover:bg-blue-700 transition block mb-4">Submit your Sheetzu to Google</a>
          <p className="text-sm text-gray-500 mb-4">After submitting, your Sheetzu site will be ready. Start editing your sheet to see your products/events live!</p>

          {siteReady ? (
            <div className="flex flex-col items-center gap-4">
              <div className="text-3xl mb-2 animate-bounce">🎉</div>
              <div className="text-green-700 font-bold text-lg mb-2">Congratulations! Your Sheetzu site is live.</div>
              <a href={`/${username}`} className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold text-lg shadow hover:bg-green-700 transition block mb-2" target="_blank" rel="noopener">Go to your Sheetzu site</a>
              <div className="text-gray-600 text-sm">Or visit: <span className="font-mono">sheetzu.com/{username}</span></div>
            </div>
          ) : pollCount >= maxPolls ? (
            <div className="flex flex-col items-center gap-4">
              <div className="text-yellow-500 text-2xl">⏳</div>
              <div className="text-gray-700 font-semibold">Still waiting for your site to be ready.</div>
              <div className="text-gray-500 text-sm mb-2">It can take a few minutes for Google to process your submission. Please check back soon or click below to try again.</div>
              <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold text-lg shadow hover:bg-blue-700 transition" onClick={() => { setPollCount(0); setSiteReady(false); setCelebrated(false); }}>Check again</button>
            </div>
          ) : (
            <button className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold text-lg shadow disabled:opacity-50" disabled>
              {checkingSite ? "Checking..." : "Waiting for your site to be ready..."}
            </button>
          )}
        </div>
      </div>
    )
  }

  return null
}

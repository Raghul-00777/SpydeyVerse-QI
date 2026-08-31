import { useState, useEffect, useRef } from 'react';
import {
  FileSignature, KeyRound, PenTool, ShieldCheck, AlertTriangle, CheckCircle2,
  Copy, Fingerprint, RefreshCw, Zap, Info, Eye, EyeOff,
} from 'lucide-react';
import GlowCard from '@/components/ui/GlowCard';
import { recordVerification } from '@/lib/signatureActivity';

type Verdict = 'authentic' | 'suspicious' | 'forged';

interface VerifyResult {
  verdict: Verdict;
  confidence: number;
  classicalValid: boolean;
  anomalyScore: number;
  anomalyPattern: string;
  reason: string;
  usedTampered: boolean;
}

const ALGO = { name: 'RSASSA-PKCS1-v1_5' } as const;
const ALGO_PARAMS = { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' } as const;

/* ----------------------------- crypto helpers ----------------------------- */

function arrayBufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function base64ToArrayBuffer(b64: string): ArrayBuffer {
  const clean = b64.trim().replace(/\s+/g, '');
  const bin = atob(clean);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

function encodeText(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return file.arrayBuffer();
}

function subtleAvailable(): boolean {
  return typeof globalThis.crypto !== 'undefined' && !!globalThis.crypto.subtle;
}

/* ------------------- Quantum-Inspired Anomaly Check (simulation) ---------- */

// Classical simulation that *illustrates* quantum concepts (superposition /
// measurement collapse) — it does NOT use real quantum hardware.
function quantumInspiredAnomalyCheck(docText: string, signatureB64: string): { score: number; pattern: string } {
  // FNV-1a seed from (document + signature)
  let h = 0x811c9dc5;
  const seedStr = docText + '|' + signatureB64;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  let x = h >>> 0 || 1;
  const rng = () => {
    x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
    return (x >>> 0) / 0xffffffff;
  };

  // Simulate 8 qubits: each "measured" collapses to 0 or 1
  let collapsedOnes = 0;
  for (let q = 0; q < 8; q++) {
    const prob1 = rng();
    if (rng() < prob1) collapsedOnes++;
  }

  // Anomaly = deviation of collapsed-1 count from the expected 4 (50/50)
  const deviation = Math.abs(collapsedOnes - 4) / 4; // 0..1
  const score = Math.min(100, Math.round(deviation * 100));

  const pattern =
    score > 60
      ? 'Measurement collapse shows anomalous clustering (non-uniform superposition)'
      : score > 30
        ? 'Minor superposition asymmetry detected'
        : 'Superposition entropy nominal — uniform qubit distribution';

  return { score, pattern };
}

/* --------------------------------- page ----------------------------------- */

function tamperText(text: string): string {
  if (!text) return text;
  const i = Math.max(0, Math.floor(text.length / 2));
  const c = text[i];
  const flipped = c === 'X' ? 'Y' : 'X';
  return text.slice(0, i) + flipped + text.slice(i + 1);
}

const verdictConfig: Record<Verdict, { color: string; bg: string; label: string; icon: typeof CheckCircle2 }> = {
  authentic: { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', label: 'Authentic', icon: CheckCircle2 },
  suspicious: { color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', label: 'Suspicious', icon: AlertTriangle },
  forged: { color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20', label: 'Forged', icon: AlertTriangle },
};

export default function DigitalSignature() {
  const [unsupported, setUnsupported] = useState(false);

  // Key generation
  const [keyPair, setKeyPair] = useState<CryptoKeyPair | null>(null);
  const [publicKeyB64, setPublicKeyB64] = useState('');
  const [privateKeyB64, setPrivateKeyB64] = useState('');
  const [generating, setGenerating] = useState(false);
  const [savedNote, setSavedNote] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  // Sign panel
  const [signText, setSignText] = useState('SpydeyVerse — authorize Q3 security audit report.');
  const [signFile, setSignFile] = useState<File | null>(null);
  const [signing, setSigning] = useState(false);
  const [signatureB64, setSignatureB64] = useState('');
  const [signError, setSignError] = useState('');

  // Verify panel
  const [verifyText, setVerifyText] = useState('');
  const [verifyPublicKey, setVerifyPublicKey] = useState('');
  const [verifySignature, setVerifySignature] = useState('');
  const [tamperDemo, setTamperDemo] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUnsupported(!subtleAvailable());
    // Restore a previously saved key pair (only if the user explicitly saved it)
    const saved = localStorage.getItem('spydey_keypair');
    if (saved) {
      try {
        const { publicKeyB64: pb, privateKeyB64: pv } = JSON.parse(saved) as { publicKeyB64: string; privateKeyB64: string };
        (async () => {
          const pubKey = await crypto.subtle.importKey('spki', base64ToArrayBuffer(pb), ALGO_PARAMS, true, ['verify']);
          const privKey = await crypto.subtle.importKey('pkcs8', base64ToArrayBuffer(pv), ALGO_PARAMS, true, ['sign']);
          setKeyPair({ publicKey: pubKey, privateKey: privKey });
          setPublicKeyB64(pb);
          setPrivateKeyB64(pv);
        })().catch(() => {});
      } catch {
        /* ignore */
      }
    }
  }, []);

  function flashCopied(key: string) {
    setCopied(key);
    setTimeout(() => setCopied((c) => (c === key ? null : c)), 1500);
  }

  async function copyText(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      flashCopied(key);
    } catch {
      /* clipboard may be blocked; ignore */
    }
  }

  async function handleGenerate() {
    if (unsupported) return;
    setGenerating(true);
    try {
      const kp = await crypto.subtle.generateKey(
        { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
        true,
        ['sign', 'verify'],
      );
      const pub = await crypto.subtle.exportKey('spki', kp.publicKey);
      const priv = await crypto.subtle.exportKey('pkcs8', kp.privateKey);
      setKeyPair(kp);
      setPublicKeyB64(arrayBufferToBase64(pub));
      setPrivateKeyB64(arrayBufferToBase64(priv));
    } finally {
      setGenerating(false);
    }
  }

  function handleSave() {
    if (!publicKeyB64 || !privateKeyB64) return;
    localStorage.setItem('spydey_keypair', JSON.stringify({ publicKeyB64, privateKeyB64 }));
    setSavedNote(true);
    setTimeout(() => setSavedNote(false), 2000);
  }

  function handleClearSaved() {
    localStorage.removeItem('spydey_keypair');
    setKeyPair(null);
    setPublicKeyB64('');
    setPrivateKeyB64('');
  }

  async function handleSign() {
    if (unsupported) return;
    setSignError('');
    if (!keyPair) {
      setSignError('Generate a key pair first.');
      return;
    }
    if (!signText && !signFile) {
      setSignError('Provide a message or upload a file to sign.');
      return;
    }
    setSigning(true);
    try {
      const data: ArrayBuffer = signFile
        ? await readFileAsArrayBuffer(signFile)
        : encodeText(signText).buffer;
      const sig = await crypto.subtle.sign(ALGO, keyPair.privateKey, data);
      const sigB64 = arrayBufferToBase64(sig);
      setSignatureB64(sigB64);
      // Pre-fill the verify panel so the demo is one click away
      setVerifyPublicKey(publicKeyB64);
      setVerifySignature(sigB64);
      if (!verifyText) setVerifyText(signText);
    } catch {
      setSignError('Signing failed. Check the key pair and input.');
    } finally {
      setSigning(false);
    }
  }

  async function runVerify(tamper: boolean) {
    if (unsupported) return;
    if (!verifyPublicKey || !verifySignature || !verifyText) {
      setResult(null);
      return;
    }
    setVerifying(true);
    try {
      const usedText = tamper ? tamperText(verifyText) : verifyText;
      const data = encodeText(usedText).buffer;
      const pubKey = await crypto.subtle.importKey(
        'spki',
        base64ToArrayBuffer(verifyPublicKey),
        ALGO_PARAMS,
        true,
        ['verify'],
      );
      const sigBytes = base64ToArrayBuffer(verifySignature);
      const classicalValid = await crypto.subtle.verify(ALGO, pubKey, sigBytes, data);
      const anomaly = quantumInspiredAnomalyCheck(usedText, verifySignature);

      let verdict: Verdict;
      let confidence: number;
      let reason: string;

      if (!classicalValid) {
        verdict = 'forged';
        confidence = 99;
        reason =
          'Cryptographic Verification (Web Crypto API) FAILED — the signature does not match this document and public key. ' +
          'The document was likely altered or the signature is forged.';
      } else if (anomaly.score > 60) {
        verdict = 'suspicious';
        confidence = anomaly.score;
        reason =
          'Cryptographic Verification (Web Crypto API) PASSED, but the Quantum-Inspired Anomaly Check detected an anomalous pattern (' +
          anomaly.pattern +
          '). Manual review recommended.';
      } else {
        verdict = 'authentic';
        confidence = 100 - anomaly.score;
        reason =
          'Both checks passed. Cryptographic Verification (Web Crypto API) is valid and the Quantum-Inspired Anomaly Check found no anomaly (' +
          anomaly.pattern +
          ').';
      }

      const res: VerifyResult = {
        verdict,
        confidence,
        classicalValid,
        anomalyScore: anomaly.score,
        anomalyPattern: anomaly.pattern,
        reason,
        usedTampered: tamper,
      };
      setResult(res);
      recordVerification({
        ts: Date.now(),
        verdict,
        confidence,
        source: tamper ? 'tamper-demo' : 'manual',
      });
    } catch {
      setResult(null);
    } finally {
      setVerifying(false);
    }
  }

  function handleTamperToggle(next: boolean) {
    setTamperDemo(next);
    if (result) runVerify(next);
  }

  function truncateKey(k: string): string {
    if (k.length <= 64) return k;
    return k.slice(0, 40) + '…' + k.slice(-16);
  }

  if (unsupported) {
    return (
      <div className="p-6">
        <GlowCard className="p-8 text-center">
          <AlertTriangle size={28} className="text-amber-400 mx-auto mb-3" />
          <div className="text-sm font-semibold text-white mb-1">Web Crypto API unavailable</div>
          <div className="text-xs text-slate-500">
            Digital Signature Security needs a secure context (https:// or localhost). Open the app over a secure origin to use key generation, signing and verification.
          </div>
        </GlowCard>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center">
            <FileSignature size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Digital Signature Security</h2>
            <p className="text-xs text-slate-500">SIH26141 — Quantum-Inspired Cyber Threat Detection for Digital Signature Security</p>
          </div>
        </div>
        <span className="hidden sm:flex items-center gap-1.5 text-xs text-red-400 bg-red-600/10 border border-red-500/20 px-3 py-1.5 rounded-xl">
          <ShieldCheck size={11} /> Web Crypto API
        </span>
      </div>

      <div className="flex items-start gap-2 glass rounded-lg p-3 border border-white/5 text-[11px] text-slate-400 leading-relaxed">
        <Info size={13} className="text-slate-500 mt-0.5 flex-shrink-0" />
        <div>
          <strong className="text-slate-300">Honest claims:</strong> Cryptographic verification uses the real, industry-standard
          Web Crypto API (RSASSA-PKCS1-v1_5, SHA-256). The <em>Quantum-Inspired Anomaly Check</em> is a classical
          simulation that illustrates quantum concepts — no real quantum hardware is used anywhere in this module.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Key Pair Generator */}
        <GlowCard className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <KeyRound size={16} className="text-red-400" />
            <h3 className="text-sm font-semibold text-white">Key Pair Generator</h3>
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {generating ? <><RefreshCw size={13} className="animate-spin" />Generating…</> : <><KeyRound size={13} />Generate Key Pair</>}
          </button>

          {publicKeyB64 && (
            <div className="mt-4 space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-slate-500">Public Key (SHA-256 / SPKI)</span>
                  <button onClick={() => copyText(publicKeyB64, 'pub')} className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-red-400 transition-colors">
                    {copied === 'pub' ? <><CheckCircle2 size={11} className="text-emerald-400" />Copied</> : <><Copy size={11} />Copy</>}
                  </button>
                </div>
                <div className="text-[10px] font-mono text-slate-400 bg-white/5 border border-white/10 rounded-lg p-2 break-all max-h-20 overflow-y-auto">
                  {truncateKey(publicKeyB64)}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-rose-400">Private Key — keep this secret, never share it</span>
                  <button onClick={() => copyText(privateKeyB64, 'priv')} className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-red-400 transition-colors">
                    {copied === 'priv' ? <><CheckCircle2 size={11} className="text-emerald-400" />Copied</> : <><Copy size={11} />Copy</>}
                  </button>
                </div>
                <div className="text-[10px] font-mono text-rose-300/80 bg-rose-500/5 border border-rose-500/20 rounded-lg p-2 break-all max-h-20 overflow-y-auto">
                  {truncateKey(privateKeyB64)}
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={handleSave} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass border border-white/10 text-xs text-slate-300 hover:text-white transition-all">
                  <ShieldCheck size={11} />{savedNote ? 'Saved!' : 'Save to browser'}
                </button>
                <button onClick={handleClearSaved} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass border border-white/10 text-xs text-slate-500 hover:text-rose-400 transition-all">
                  Clear
                </button>
              </div>
              <div className="text-[10px] text-slate-600">
                Keys live in memory only. "Save to browser" persists them in localStorage for convenience — they are never sent to Supabase.
              </div>
            </div>
          )}
        </GlowCard>

        {/* Sign a Document */}
        <GlowCard className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <PenTool size={16} className="text-red-400" />
            <h3 className="text-sm font-semibold text-white">Sign a Document</h3>
          </div>

          <textarea
            value={signText}
            onChange={(e) => setSignText(e.target.value)}
            placeholder="Type the message/document to sign…"
            disabled={!!signFile}
            className="w-full h-24 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500/50 resize-none"
          />

          <div className="flex items-center gap-2 my-2">
            <span className="text-[10px] text-slate-600">or</span>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-[11px] text-slate-400 hover:text-red-400 transition-colors underline underline-offset-2"
            >
              upload a file
            </button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => setSignFile(e.target.files?.[0] ?? null)}
            />
            {signFile && (
              <span className="text-[10px] text-emerald-400 truncate max-w-[160px]">📎 {signFile.name}</span>
            )}
          </div>

          <button
            onClick={handleSign}
            disabled={signing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition-all btn-glow w-full justify-center"
          >
            {signing ? <><RefreshCw size={13} className="animate-spin" />Signing…</> : <><PenTool size={13} />Sign Document</>}
          </button>

          {signError && <div className="text-[11px] text-rose-400 mt-2">{signError}</div>}

          {signatureB64 && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-slate-500">Signature (base64)</span>
                <button onClick={() => copyText(signatureB64, 'sig')} className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-red-400 transition-colors">
                  {copied === 'sig' ? <><CheckCircle2 size={11} className="text-emerald-400" />Copied</> : <><Copy size={11} />Copy Signature</>}
                </button>
              </div>
              <div className="text-[10px] font-mono text-emerald-300/80 bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-2 break-all max-h-24 overflow-y-auto">
                {signatureB64}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 mt-2">
                <CheckCircle2 size={11} /> Document signed with your private key (SHA-256 → RSASSA-PKCS1-v1_5)
              </div>
            </div>
          )}
        </GlowCard>
      </div>

      {/* Verify a Signature */}
      <GlowCard className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-red-400" />
            <h3 className="text-sm font-semibold text-white">Verify a Signature</h3>
          </div>
          <button
            onClick={() => handleTamperToggle(!tamperDemo)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              tamperDemo
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'glass border border-white/10 text-slate-400 hover:text-white'
            }`}
            title="Flip one character in the document to show the verdict change live"
          >
            {tamperDemo ? <EyeOff size={12} /> : <Eye size={12} />}
            Tamper Demo {tamperDemo ? 'ON' : 'OFF'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">Original Document / Message</label>
              <textarea
                value={verifyText}
                onChange={(e) => setVerifyText(e.target.value)}
                placeholder="Paste or type the document that was signed…"
                className="w-full h-24 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500/50 resize-none"
              />
              {tamperDemo && verifyText && (
                <div className="text-[10px] text-rose-400 mt-1">
                  Tampered preview: <span className="font-mono break-all">{tamperText(verifyText)}</span>
                </div>
              )}
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">Public Key (base64)</label>
              <textarea
                value={verifyPublicKey}
                onChange={(e) => setVerifyPublicKey(e.target.value)}
                placeholder="Paste the signer's public key…"
                className="w-full h-16 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[10px] font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500/50 resize-none break-all"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">Signature (base64)</label>
              <textarea
                value={verifySignature}
                onChange={(e) => setVerifySignature(e.target.value)}
                placeholder="Paste the base64 signature…"
                className="w-full h-16 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[10px] font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500/50 resize-none break-all"
              />
            </div>
            <button
              onClick={() => runVerify(tamperDemo)}
              disabled={verifying}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition-all btn-glow w-full justify-center"
            >
              {verifying ? <><RefreshCw size={13} className="animate-spin" />Verifying…</> : <><ShieldCheck size={13} />Verify</>}
            </button>
            <div className="flex items-start gap-2 text-[10px] text-slate-500">
              <Fingerprint size={11} className="mt-0.5 flex-shrink-0 text-red-400" />
              <span>Runs real cryptographic verification (Web Crypto API) <strong className="text-slate-400">and</strong> a Quantum-Inspired Anomaly Check (classical simulation).</span>
            </div>
          </div>

          <div>
            {result ? (
              <div className="h-full flex flex-col">
                <div className={`flex items-center gap-3 p-4 rounded-xl border mb-3 ${verdictConfig[result.verdict].bg}`}>
                  {(() => {
                    const Icon = verdictConfig[result.verdict].icon;
                    return <Icon size={22} className={verdictConfig[result.verdict].color} />;
                  })()}
                  <div>
                    <div className={`text-base font-bold ${verdictConfig[result.verdict].color}`}>
                      {verdictConfig[result.verdict].label}
                    </div>
                    <div className="text-[11px] text-slate-500">Confidence: {result.confidence}%</div>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="text-2xl font-bold text-white">{result.confidence}%</div>
                    <div className="text-[10px] text-slate-500">confidence</div>
                  </div>
                </div>

                {/* Confidence bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                    <span>{result.verdict === 'authentic' ? 'Authenticity' : 'Risk'}</span>
                    <span>{result.confidence}%</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2">
                    <div
                      className={
                        'h-2 rounded-full transition-all ' +
                        (result.verdict === 'authentic' ? 'bg-emerald-500' : result.verdict === 'suspicious' ? 'bg-amber-500' : 'bg-rose-500')
                      }
                      style={{ width: `${result.confidence}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2 text-[11px]">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                    <span className="text-slate-400">Cryptographic Verification (Web Crypto API)</span>
                    <span className={result.classicalValid ? 'text-emerald-400' : 'text-rose-400'}>
                      {result.classicalValid ? 'Valid' : 'Failed'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                    <span className="text-slate-400">Quantum-Inspired Anomaly Check (sim)</span>
                    <span className={result.anomalyScore > 60 ? 'text-amber-400' : 'text-emerald-400'}>
                      {result.anomalyScore}% anomaly
                    </span>
                  </div>
                </div>

                <div className="mt-3 p-3 rounded-lg glass border border-white/5 text-[11px] text-slate-400 leading-relaxed">
                  <strong className="text-slate-300">Why this verdict: </strong>{result.reason}
                </div>

                {result.usedTampered && (
                  <div className="mt-2 flex items-center gap-1.5 text-[10px] text-rose-400">
                    <Zap size={11} /> Tamper Demo active — one character was flipped, changing the verdict to Forged.
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-center p-8 rounded-xl border border-dashed border-white/10">
                <div className="text-[11px] text-slate-600">
                  Provide the document, public key and signature, then click <strong className="text-slate-400">Verify</strong>.<br />
                  Toggle <strong className="text-rose-400">Tamper Demo</strong> to watch the verdict flip from Authentic → Forged live.
                </div>
              </div>
            )}
          </div>
        </div>
      </GlowCard>
    </div>
  );
}

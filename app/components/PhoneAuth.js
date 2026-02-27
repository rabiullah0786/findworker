"use client";

import { useState } from "react";
import { createRecaptcha, sendOtp, confirmOtp } from "@/lib/firebaseClient";

export default function PhoneAuth() {
    const [phone, setPhone] = useState("");
    const [code, setCode] = useState("");
    const [confirmation, setConfirmation] = useState(null);
    const [message, setMessage] = useState("");

    async function handleSend(e) {
        e.preventDefault();
        setMessage("");
        try {
            const appVerifier = createRecaptcha();
            const result = await sendOtp(phone, appVerifier);
            setConfirmation(result);
            setMessage("OTP sent. Check your SMS.");
        } catch (err) {
            setMessage("Failed to send OTP: " + err.message);
        }
    }

    async function handleVerify(e) {
        e.preventDefault();
        setMessage("");
        try {
            if (!confirmation) return setMessage("No OTP request found");
            const user = await confirmOtp(confirmation, code);
            setMessage("Phone verified: " + user.user.uid);
        } catch (err) {
            setMessage("Failed to verify OTP: " + err.message);
        }
    }

    return (
        <div>
            <form onSubmit={handleSend}>
                <label>Phone (E.164, e.g. +919999999999)</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} />
                <div id="recaptcha-container"></div>
                <button type="submit">Send OTP</button>
            </form>

            <form onSubmit={handleVerify}>
                <label>OTP Code</label>
                <input value={code} onChange={(e) => setCode(e.target.value)} />
                <button type="submit">Verify OTP</button>
            </form>

            {message && <div>{message}</div>}
        </div>
    );
}

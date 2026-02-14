"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
    const [open, setOpen] = useState(false);
    const [showLanguages, setShowLanguages] = useState(false);
    const { language, changeLanguage, t, isLoaded } = useLanguage();

    const languages = [
        { code: "en", flag: "🇬🇧", name: "English" },
        { code: "ur", flag: "🇵🇰", name: "اردو" },
        { code: "hi", flag: "🇮🇳", name: "हिन्दी" }
    ];

    const currentLanguage = languages.find(lang => lang.code === language);

    if (!isLoaded) return null;

    return (
        <nav className="w-full bg-lime-200 shadow-md px-6 py-3 flex items-center justify-between relative">

            {/* LEFT - LOGIN */}
            <button className="px-4 py-2 text-sm rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md hover:opacity-90 transition">
                {t("login")}
            </button>

            {/* CENTER - LOGO */}
            <h1 className="text-2xl md:text-xl font-bold tracking-wide">
                Work<span className="text-blue-600">Bridge</span>
            </h1>

            {/* RIGHT - HAMBURGER */}
            <button
                onClick={() => setOpen(!open)}
                className="flex flex-col gap-[5px] md:hidden"
            >
                <span className="w-6 h-[2px] bg-black"></span>
                <span className="w-6 h-[2px] bg-black"></span>
                <span className="w-6 h-[2px] bg-black"></span>
            </button>

            {/* DESKTOP MENU */}
            <div className="hidden md:flex gap-6 font-medium items-center">
                <Link href="/" className="hover:text-blue-600 text-sm">
                    {t("home")}
                </Link>

                <Link href="/about" className="hover:text-blue-600 text-sm">
                    {t("about")}
                </Link>



                {/* Language Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setShowLanguages(!showLanguages)}
                        className="flex items-center gap-2 px-3 py-1 rounded hover:bg-blue-100 transition text-sm"
                    >
                        {currentLanguage?.flag} {currentLanguage?.name}
                    </button>
                    {showLanguages && (
                        <div className="absolute top-full right-0 mt-1 bg-white shadow-lg rounded-lg p-2 z-50 min-w-[140px]">
                            {languages.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => {
                                        changeLanguage(lang.code);
                                        setShowLanguages(false);
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-blue-50 transition ${language === lang.code ? "bg-blue-100 font-bold" : ""}`}
                                >
                                    {lang.flag} {lang.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* MOBILE MENU */}
            {open && (
                <div className="absolute flex flex-col top-16 right-4 w-48 bg-white shadow-xl rounded-xl p-4 z-50">
                    <Link href="/" className="py-2 px-2 rounded hover:bg-blue-50 cursor-pointer text-sm">
                        {t("home")}
                    </Link>
                    <Link href="/about" className="py-2 px-2 rounded hover:bg-blue-50 cursor-pointer text-sm">
                        {t("about")}
                    </Link>
                    <hr className="my-2" />

                    {/* Language Selector in Mobile Menu */}
                    <div className="py-2">
                        <button
                            onClick={() => setShowLanguages(!showLanguages)}
                            className="w-full text-left px-2 py-2 rounded hover:bg-blue-50 transition  text-sm flex justify-between items-center"
                        >
                            {/* <span>{currentLanguage?.flag} {currentLanguage?.name}</span> */}
                            <span>🌐  Language</span>
                            <span className={`text-xs transition ${showLanguages ? "rotate-180" : ""}`}>▼</span>
                        </button>
                        {showLanguages && (
                            <div className="mt-2 bg-blue-50 rounded p-2">
                                {languages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => {
                                            changeLanguage(lang.code);
                                            setShowLanguages(false);
                                            setOpen(false);
                                        }}
                                        className={`w-full text-left px-2 py-1 text-sm rounded hover:bg-blue-100 transition ${language === lang.code ? "bg-blue-200 font-bold" : ""}`}
                                    >
                                        {lang.flag} {lang.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <hr className="my-2" />

                    <Link href="/settings" className="py-2 px-2 rounded hover:bg-blue-50 cursor-pointer text-sm">
                        ⚙️ {t("settings")}
                    </Link>
                    <Link href="/privacy-policy" className="py-2 px-2 rounded hover:bg-blue-50 cursor-pointer text-sm">
                        📋 {t("privacyPolicy")}
                    </Link>
                </div>
            )}
        </nav>
    );
}


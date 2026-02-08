// "use client";

// import { useState } from "react";
// import Link from "next/link";


// export default function Navbar() {
//     const [open, setOpen] = useState(false);

//     return (
//         <nav className="w-full bg-lime-200 shadow-md px-6 py-3 flex items-center justify-between relative">

//             {/* LEFT - LOGIN */}
//             <button className="px-4 py-2 text-sm rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md hover:opacity-90 transition">
//                 Login
//             </button>

//             {/* CENTER - LOGO */}
//             <h1 className="text-2xl font-bold tracking-wide">
//                 Work<span className="text-blue-600">Bridge</span>
//             </h1>

//             {/* RIGHT - HAMBURGER */}
//             <button
//                 onClick={() => setOpen(!open)}
//                 className="flex flex-col   gap-[5px] md:hidden"
//             >
//                 <span className="w-6 h-[2px] bg-black"></span>
//                 <span className="w-6 h-[2px] bg-black"></span>
//                 <span className="w-6 h-[2px] bg-black"></span>
//             </button>


//             {/* DESKTOP MENU */}
//             <div className="hidden md:flex gap-6 font-medium">
//                 <Link href="/" className="hover:text-blue-600 text-sm">
//                     Home
//                 </Link>

//                 <Link href="/about" className="hover:text-blue-600 text-sm">
//                     About
//                 </Link>

//                 <Link href="/contact" className="hover:text-blue-600 text-sm">
//                     Contact
//                 </Link>
//             </div>


//             {/* MOBILE MENU */}
//             {open && (
//                 <div className="absolute flex flex-col top-16 right-4 w-44 bg-white shadow-xl rounded-xl p-4  z-50">
//                     <Link href="/" className="py-2 px-2 rounded hover:bg-blue-50 cursor-pointer">Home</Link>
//                     <Link href="/about" className="py-2 px-2 rounded hover:bg-blue-50 cursor-pointer">About</Link>
//                     <Link href="/contact" className="py-2 px-2 rounded hover:bg-blue-50 cursor-pointer">Contact</Link>
//                 </div>
//             )}
//         </nav>
//     );
// }




"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Navbar() {
    const [open, setOpen] = useState(false);
    const [language, setLanguage] = useState("en");
    const [openLang, setOpenLang] = useState(false);


    // Load saved language
    useEffect(() => {
        const savedLang = localStorage.getItem("language");
        if (savedLang) setLanguage(savedLang);
    }, []);

    // Change language
    const changeLanguage = (lang) => {
        setLanguage(lang);
        localStorage.setItem("language", lang);
        setOpen(false);
    };

    return (
        <nav className="w-full bg-lime-200 shadow-md px-6 py-3 flex items-center justify-between relative">

            {/* LEFT - LOGIN */}
            <button className="px-4 py-2 text-sm rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md hover:opacity-90 transition">
                Login
            </button>

            {/* CENTER - LOGO */}
            <h1 className="text-2xl font-bold tracking-wide">
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

            {/* DESKTOP MENU (UNCHANGED) */}
            <div className="hidden md:flex gap-6 font-medium">
                <Link href="/" className="hover:text-blue-600 text-sm">Home</Link>
                <Link href="/about" className="hover:text-blue-600 text-sm">About</Link>
                <Link href="/contact" className="hover:text-blue-600 text-sm">Contact</Link>
            </div>

            {/* MOBILE MENU */}
            {open && (
                <div className="absolute top-16 right-4 w-56 bg-white shadow-xl rounded-xl p-4 z-50 flex flex-col">

                    {/* Main Links */}
                    <Link onClick={() => setOpen(false)} href="/" className="menu-item">Home</Link>
                    <Link onClick={() => setOpen(false)} href="/about" className="menu-item">About</Link>
                    <Link onClick={() => setOpen(false)} href="/contact" className="menu-item">Contact</Link>


                    {/* LANGUAGE SECTION */}
                    <div className="mt-1">
                        {/* Language Header (clickable) */}
                        <button
                            onClick={() => setOpenLang(!openLang)}
                            className="w-full flex items-center justify-between px-2 py-2 text-sm font-medium rounded hover:bg-blue-50"
                        >
                            <span className="flex items-center gap-2">
                                🌐 Language
                            </span>
                            <span className="text-xs">{openLang ? "▲" : "▼"}</span>
                        </button>

                        {/* Language Options */}
                        {openLang && (
                            <div className="ml-4 mt-1 flex flex-col gap-1">
                                <button
                                    onClick={() => changeLanguage("hi")}
                                    className={`lang-btn ${language === "hi" ? "active" : ""}`}
                                >
                                    🇮🇳 Hindi
                                </button>

                                <button
                                    onClick={() => changeLanguage("en")}
                                    className={`lang-btn ${language === "en" ? "active" : ""}`}
                                >
                                    🇬🇧 English
                                </button>

                                <button
                                    onClick={() => changeLanguage("ur")}
                                    className={`lang-btn ${language === "ur" ? "active" : ""}`}
                                >
                                    🇵🇰 Urdu
                                </button>
                            </div>
                        )}
                    </div>



                    {/* OTHER SETTINGS */}
                    <Link onClick={() => setOpen(false)} href="/privacy-policy" className="menu-item">
                        🔒 Privacy Policy
                    </Link>
                    <Link onClick={() => setOpen(false)} href="/terms" className="menu-item">
                        📄 Terms & Conditions
                    </Link>
                    <Link onClick={() => setOpen(false)} href="/help" className="menu-item">
                        ❓ Help & Support
                    </Link>
                </div>
            )}
        </nav>
    );
}

/* 🔽 SMALL HELPERS (TAILWIND SAFE) */

const menuItem =
    "py-2 px-2 rounded hover:bg-blue-50 text-sm cursor-pointer";

const langBtn =
    "w-full text-left px-3 py-2 rounded text-sm hover:bg-blue-50";



"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import Navbar from "./components/Navbar";
import { categories } from "./data/categories";
import { indiaData } from "./data/locations";
import { getStates, getDistricts, getCities } from "@/lib/locationHelpers";
import { randomWorkers } from "./data/workers";



export default function Home() {
  const { t, language } = useLanguage();

  const [worker, setWorker] = useState({
    name: "",
    age: "",
    skill: "",
    state: "",
    district: "",
    city: "",
    whatsapp: "",
    photo: null,
  });

  const [formData, setFormData] = useState({
    state: "",
    district: "",
    city: "",
  });

  const statesList = getStates(language);
  const workerDistricts = getDistricts(worker.state, language);
  const workerCities = getCities(worker.state, worker.district);
  const findDistricts = getDistricts(formData.state, language);
  const findCities = getCities(formData.state, formData.district);
  const [isAccountCreated, setIsAccountCreated] = useState(false);

  const [editingProfile, setEditingProfile] = useState(false);
  const [showWorkers, setShowWorkers] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [workersList, setWorkersList] = useState([]);
  const [filteredWorkers, setFilteredWorkers] = useState([]);

  // Selected worker modal
  const [selectedResultWorker, setSelectedResultWorker] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showFindForm, setShowFindForm] = useState(false);
  const [showWorkerDetails, setShowWorkerDetails] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);


  const [selectedCategory, setSelectedCategory] = useState("");

  const currentYear = new Date().getFullYear();

  const [dob, setDob] = useState({
    day: "",
    month: "",
    year: "",
  });

  // Calculate age automatically
  useEffect(() => {
    if (dob.day && dob.month && dob.year) {
      const birthDate = new Date(dob.year, dob.month - 1, dob.day);

      // Validate date
      if (
        birthDate.getDate() !== Number(dob.day) ||
        birthDate.getMonth() !== Number(dob.month) - 1
      ) {
        return;
      }

      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();

      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      setWorker({
        ...worker,
        dob: `${dob.year}-${dob.month}-${dob.day}`,
        age,
      });
    }
  }, [dob]);

  const [otpRequestId, setOtpRequestId] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpStatus, setOtpStatus] = useState("");
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const normalizePhone = (input) => {
    const digits = (input || "").replace(/\D/g, "");
    if (digits.length === 10) return `+91${digits}`;
    if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
    if (digits.startsWith("+") && digits.length >= 12) return input;
    return null;
  };

  // ---------------- RANDOM WORKERS ----------------


  // ---------------- CREATE ACCOUNT ----------------
  const handleSubmit = async () => {
    if (!worker.name || !selectedCategory || !worker.state || !worker.district || !worker.city) {
      alert("Please fill all fields");
      return;
    }
    if (!worker.whatsapp) {
      alert("Please enter WhatsApp number");
      return;
    }
    if (!isOtpVerified || !otpRequestId) {
      alert("Please verify OTP first");
      return;
    }

    const normalizedPhone = normalizePhone(worker.whatsapp);
    if (!normalizedPhone) {
      alert("Invalid phone number");
      return;
    }

    const newWorker = {
      ...worker,
      skill: selectedCategory,
      state: worker.state,
      district: worker.district,
      city: worker.city,
      whatsapp: normalizedPhone,
    };

    const res = await fetch("/api/workers/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ worker: newWorker, requestId: otpRequestId }),
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data?.error || "Failed to create account");
      return;
    }

    const updatedWorkers = [...workersList, newWorker];

    // ✅ Save locally
    setWorkersList(updatedWorkers);
    localStorage.setItem("workersList", JSON.stringify(updatedWorkers));

    // ✅ Set current user
    setWorker(newWorker);
    localStorage.setItem("currentWorker", JSON.stringify(newWorker));

    setIsLoggedIn(true);
    setIsAccountCreated(true);
    setShowCreateForm(false);
  };

  const handleSendOtp = async () => {
    const normalizedPhone = normalizePhone(worker.whatsapp);
    if (!normalizedPhone) {
      alert("Invalid phone number");
      return;
    }

    setIsSendingOtp(true);
    setOtpStatus("");
    setIsOtpVerified(false);
    setOtpRequestId("");

    const res = await fetch("/api/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: normalizedPhone }),
    });

    const data = await res.json();
    setIsSendingOtp(false);

    if (!res.ok) {
      setOtpStatus(data?.error || "Failed to send OTP");
      return;
    }

    setOtpRequestId(data.requestId);
    setOtpStatus("OTP sent successfully");
  };

  const handleVerifyOtp = async () => {
    const normalizedPhone = normalizePhone(worker.whatsapp);
    if (!normalizedPhone) {
      alert("Invalid phone number");
      return;
    }
    if (!otpCode || !otpRequestId) {
      alert("Please enter OTP");
      return;
    }

    setIsVerifyingOtp(true);
    setOtpStatus("");

    const res = await fetch("/api/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: normalizedPhone,
        otp: otpCode,
        requestId: otpRequestId,
      }),
    });

    const data = await res.json();
    setIsVerifyingOtp(false);

    if (!res.ok) {
      setOtpStatus(data?.error || "OTP verification failed");
      setIsOtpVerified(false);
      return;
    }

    setIsOtpVerified(true);
    setOtpStatus("OTP verified");
  };


  const handlePhotoChange = (e) => {
    const file = e.target.files[0]; if (file) {
      const reader = new FileReader(); reader.onloadend = () => setWorker({ ...worker, photo: reader.result });
      reader.readAsDataURL(file);
    }
  };

  // ---------------- FIND WORKERS ----------------
  const handleAdd = () => {
    if (!selectedCategory || !formData.state || !formData.district || !formData.city) {
      alert("Please select all fields");
      return;
    }

    const normalize = (str) => str?.toLowerCase().trim();

    const createdMatches = workersList.filter((w) =>
      normalize(w.skill) === normalize(selectedCategory) &&
      normalize(w.state) === normalize(formData.state) &&
      normalize(w.district) === normalize(formData.district) &&
      normalize(w.city) === normalize(formData.city)
    );

    const randomMatches = randomWorkers.filter((w) =>
      normalize(w.skill) === normalize(selectedCategory) &&
      normalize(w.state) === normalize(formData.state) &&
      normalize(w.district) === normalize(formData.district) &&
      normalize(w.city) === normalize(formData.city)
    );

    setFilteredWorkers([...createdMatches, ...randomMatches]);
    setShowWorkers(true);
    setShowFindForm(false);
  };


  const handleLogout = () => {
    setIsAccountCreated(false); setIsLoggedIn(false);
    setWorker({ name: "", age: "", skill: "", district: "", city: "", whatsapp: "", photo: null, });
    setOtpRequestId("");
    setOtpCode("");
    setOtpStatus("");
    setIsOtpVerified(false);
  };

  // ---------------- LOCAL STORAGE ----------------
  useEffect(() => {
    const savedWorkers = JSON.parse(localStorage.getItem("workersList")) || [];
    const savedUser = JSON.parse(localStorage.getItem("currentWorker"));

    setWorkersList(savedWorkers);

    if (savedUser) {
      setWorker(savedUser);
      setIsLoggedIn(true);
      setIsAccountCreated(true);
    }
  }, []);

  // INDIA DATA (states/cities)


  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-100 relative p-4">


        {/* CREATE FORM */}
        {showCreateForm && !isAccountCreated && !editingProfile && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center">
            <div className="bg-white w-full h-[92vh] sm:h-auto sm:max-w-md rounded-t-2xl sm:rounded-xl p-6 overflow-y-auto shadow-md">
              <h2 className="text-lg font-semibold mb-3">{t("createWorker")}</h2>
              <input type="text" placeholder={t("name")} className="w-full border p-2 mb-2"
                onChange={(e) => setWorker({ ...worker, name: e.target.value })} />
              <div className="flex gap-2">
                {/* Day */}
                <input
                  type="number"
                  placeholder="DD"
                  min="1"
                  max="31"
                  className="w-1/3 border p-2 rounded"
                  value={dob.day}
                  onChange={(e) => setDob({ ...dob, day: e.target.value })}
                />

                {/* Month */}
                <select
                  className="w-1/3 border p-2 rounded"
                  value={dob.month}
                  onChange={(e) => setDob({ ...dob, month: e.target.value })}
                >
                  <option value="">MM</option>
                  {[
                    "January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"
                  ].map((m, i) => (
                    <option key={i} value={i + 1}>{m}</option>
                  ))}
                </select>

                {/* Year */}
                <select
                  className="w-1/3 border p-2 rounded"
                  value={dob.year}
                  onChange={(e) => setDob({ ...dob, year: e.target.value })}
                >
                  <option value="">YYYY</option>
                  {Array.from(
                    { length: currentYear - 1954 },
                    (_, i) => 1955 + i
                  ).map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}


                </select>

              </div>

              {worker.age && (
                <p className="text-sm text-gray-600 mt-1">
                  Age: <strong>{worker.age}</strong>
                </p>
              )}



              <select
                className="w-full border p-2 mb-2"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setWorker({ ...worker, skill: e.target.value });
                }}
              >
                <option value="">{t("selectCategory")}</option>
                {categories.map((cat, i) => (
                  <option key={i} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>


              <select
                className="w-full border p-2 mb-2"
                value={worker.state}
                onChange={(e) => setWorker({ ...worker, state: e.target.value })}
              >
                <option value="">{t("select State")}</option>
                {statesList.map((s) => (
                  <option key={s.key} value={s.key}>{s.label}</option>
                ))}
              </select>

              <select
                className="w-full border p-2 mb-2"
                value={worker.district}
                onChange={(e) => setWorker({ ...worker, district: e.target.value })}
              >
                <option value="">{t("select District")}</option>
                {worker.state &&
                  workerDistricts.map((d) => (
                    <option key={d.key} value={d.key}>{d.label}</option>
                  ))}
              </select>

              <select
                className="w-full border p-2 mb-2"
                value={worker.city}
                onChange={(e) => setWorker({ ...worker, city: e.target.value })}
              >
                <option value="">{t("select City")}</option>
                {worker.state &&
                  worker.district &&
                  workerCities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
              </select>


              <input
                type="tel"
                placeholder={t("phoneNumber")}
                className="w-full border p-2 mb-2"
                value={worker.whatsapp}
                onChange={(e) => {
                  setWorker({ ...worker, whatsapp: e.target.value });
                  setOtpRequestId("");
                  setOtpCode("");
                  setOtpStatus("");
                  setIsOtpVerified(false);
                }}
              />

              <div className="flex flex-col sm:flex-row gap-2 mb-2">
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isSendingOtp}
                  className="flex-1 bg-blue-600 text-white py-2 rounded disabled:opacity-60"
                >
                  {isSendingOtp ? "Sending..." : "Send OTP"}
                </button>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter OTP"
                  className="flex-1 border p-2 rounded"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={isVerifyingOtp}
                  className="flex-1 bg-green-600 text-white py-2 rounded disabled:opacity-60"
                >
                  {isVerifyingOtp ? "Verifying..." : "Verify"}
                </button>
              </div>
              {otpStatus && (
                <p className={`text-sm mb-2 ${isOtpVerified ? "text-green-600" : "text-red-600"}`}>
                  {otpStatus}
                </p>
              )}
              <div className="mb-3">
                <label className="block mb-1 font-medium">Profile Photo</label>
                <input type="file" accept="image/*" onChange={handlePhotoChange} />
              </div>
              <button onClick={handleSubmit} className="w-full bg-green-600 text-white py-2 rounded">{t("submit")}</button>
              <button onClick={() => setShowCreateForm(false)} className="mt-2 w-full bg-gray-300 text-black py-2 rounded">{t("cancel")}</button>
            </div>
          </div>
        )}


        <div className="text-center space-y-2">
          {/* TEXT */}
          <div className="text-3xl md:text-2xl font-extrabold text-gray-800">
            {t("Find Skilled Worker")}
          </div>

          <div className="text-2xl md:text-2xl font-extrabold text-blue-600">
            In Your Area
          </div>

          <div className="flex justify-center items-center gap-4 mt-4 pt-6">

            {/* FIND WORKERS – 3D BUTTON */}
            <button
              onClick={() => {
                setSelectedCategory("");   // 👈 important
                setShowFindForm(true);
                setShowCreateForm(false);
              }}
              className="
              bg-gradient-to-r from-blue-600 to-indigo-600
              text-white
              px-6
              py-3
              rounded-xl
              font-semibold
              shadow-md
              hover:scale-105
              transition
            "
            >
              {t("findWorker")}
            </button>

            {/* CREATE ACCOUNT BUTTON (RIGHT SIDE) */}
            <button
              onClick={() => {
                setShowCreateForm(true);
                setShowFindForm(false);
              }}
              className="
      bg-gradient-to-r from-blue-600 to-indigo-600
      text-white
      px-6
      py-3
      rounded-xl
      font-semibold
      shadow-md
      hover:scale-105
      transition
    "
            >
              {t("createWorker")}
            </button>
          </div>

        </div>


        {/* CATEGORY SECTION */}
        <div className="pt-16">

          {/* TITLE + VIEW ALL */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              {t("categories")}
            </h2>

            {categories.length > 6 && (
              <button
                onClick={() => setShowAllCategories(true)}
                className="text-blue-600 text-sm font-medium hover:underline"
              >
                View All
              </button>
            )}
          </div>

          {/* CATEGORY GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-0.5 sm:gap-1">
            {(showAllCategories ? categories : categories.slice(0, 6)).map((cat, index) => (
              <button
                key={index}
                onClick={() => {
                  setSelectedCategory(cat.name);
                  setShowFindForm(true);
                  setShowCreateForm(false);
                }}
                className="flex flex-col items-center justify-start gap-1 p-0.5 cursor-pointer bg-white rounded-md shadow-sm hover:shadow-md transition"
                aria-label={`Category ${cat.name}`}
              ><div className="w-40 h-40 sm:w-48 sm:h-56 md:w-56 md:h-56 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="object-cover w-full h-full"
                  />
                </div>


                <p className="mt-1 text-sm font-semibold text-gray-800 truncate">{cat.name}</p>
              </button>
            ))}
          </div>
        </div>


        <div className="w-full h-[2px] bg-gray-600 my-4"></div>


        {/* FIND FORM */}
        {showFindForm && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center">
            <div className="bg-white w-full h-[92vh] sm:h-auto sm:max-w-md rounded-t-2xl sm:rounded-xl p-5 overflow-y-auto animate-slideUp">
              <div className="flex justify-between items-center mb-4">
                <h1 className="font-bold text-lg">{t("findWorker")} {selectedCategory}</h1>
                <button onClick={() => setShowFindForm(false)} className="text-2xl font-bold text-gray-600">✕</button>
              </div>

              <select
                className="w-full border p-2 mb-2"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">{t("selectCategory")}</option>
                {categories.map((cat, i) => (
                  <option key={i} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>


              <select
                className="w-full border p-2 mb-2"
                value={formData.state}
                onChange={(e) =>
                  setFormData({ state: e.target.value, district: "", city: "" })
                }
              >
                <option value="">{t("select State")}</option>
                {statesList.map((s) => (
                  <option key={s.key} value={s.key}>{s.label}</option>
                ))}
              </select>

              <select
                className="w-full border p-2 mb-2"
                value={formData.district}
                onChange={(e) =>
                  setFormData({ ...formData, district: e.target.value, city: "" })
                }
              >
                <option value="">{t("select District")}</option>
                {formData.state &&
                  findDistricts.map((d) => (
                    <option key={d.key} value={d.key}>{d.label}</option>
                  ))}
              </select>

              <select
                className="w-full border p-2 mb-2"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
              >
                <option value="">{t("select City")}</option>
                {formData.state &&
                  formData.district &&
                  findCities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
              </select>

              <button onClick={handleAdd} className="w-full bg-blue-600 text-white p-3 rounded font-semibold">{t("findWorker")}</button>
            </div>
          </div>
        )}

        {/* WORKER RESULTS */}
        {showWorkers && (
          <div className="mt-8">
            {filteredWorkers.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {filteredWorkers.map((w, index) => (
                  <div
                    key={index}
                    className="border p-3 rounded-xl shadow bg-white flex flex-col gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setSelectedResultWorker(w);
                          setShowResultModal(true);
                        }}
                        className="shrink-0 rounded-full overflow-hidden w-16 h-16 md:w-20 md:h-20"
                      >
                        {w.photo ? (
                          <img src={w.photo} alt={w.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">No Image</div>
                        )}
                      </button>

                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{w.name}</h3>
                        <p className="text-sm mt-1">{w.skill}</p>
                        <p className="text-sm">📍 {w.city}, {w.district}</p>
                      </div>
                    </div>

                    <a
                      href={`https://wa.me/${(w.whatsapp || "").replace(/\D/g, "")}`}
                      target="_blank"
                      className="block mt-1 bg-green-500 text-white text-center py-2 rounded-lg"
                    >
                      WhatsApp
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-red-500 mt-4">
                {t("noResults")}
              </p>
            )}
          </div>
        )}

        {/* Worker details modal (full photo + info) */}
        {showResultModal && selectedResultWorker && (
          <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-xl rounded-lg overflow-y-auto shadow-lg p-4">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg">{selectedResultWorker.name}</h3>
                <button onClick={() => setShowResultModal(false)} className="text-xl font-bold">✕</button>
              </div>

              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="w-full flex items-center justify-center">
                  {selectedResultWorker.photo ? (
                    <img src={selectedResultWorker.photo} alt={selectedResultWorker.name} className="w-full max-h-[60vh] object-contain rounded" />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">No Image</div>
                  )}
                </div>

                <div>
                  <p className="mb-2"><b>Skill:</b> {selectedResultWorker.skill}</p>
                  <p className="mb-2"><b>Age:</b> {selectedResultWorker.age || "-"}</p>
                  <p className="mb-2"><b>State:</b> {selectedResultWorker.state || "-"}</p>
                  <p className="mb-2"><b>District:</b> {selectedResultWorker.district || "-"}</p>
                  <p className="mb-2"><b>City:</b> {selectedResultWorker.city || "-"}</p>
                  <p className="mb-2"><b>WhatsApp:</b> {selectedResultWorker.whatsapp || "-"}</p>

                  <div className="mt-4 flex gap-2">
                    <a href={`https://wa.me/${(selectedResultWorker.whatsapp || "").replace(/\D/g, "")}`} target="_blank" className="flex-1 bg-green-500 text-white py-2 rounded text-center">WhatsApp</a>
                    <button onClick={() => setShowResultModal(false)} className="flex-1 bg-gray-300 py-2 rounded">Close</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}



        {/* LOGO PANEL */}
        {isAccountCreated && worker?.name && (

          <div className="fixed bottom-4 left-2 z-50">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-600 cursor-pointer" onClick={() => setShowWorkerDetails(!showWorkerDetails)}>
              {worker.photo ? (
                <img src={worker.photo} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-700 font-bold">Logo</span>
                </div>
              )}
            </div>
            {showWorkerDetails && !editingProfile && (
              <div className="bg-white shadow-lg p-3 rounded mt-2 w-72">
                <h3 className="font-bold mb-1">{worker.name}</h3>
                <p><b>{t("age")}:</b> {worker.age}</p>
                <p><b>{t("skill")}:</b> {worker.skill}</p>
                <p><b>{t("city")}:</b> {worker.city}</p>
                <p><b>{t("whatsAppNumber")}:</b> {worker.whatsapp}</p>
                <div className="flex justify-between mt-2">
                  <button onClick={() => { setEditingProfile(true); setShowWorkerDetails(false); }} className="bg-yellow-400 px-3 py-1 rounded text-sm">{t("editProfile")}</button>
                  <button onClick={handleLogout} className="bg-red-500 px-3 py-1 rounded text-sm text-white">{t("logout")}</button>
                </div>
              </div>
            )}
            {editingProfile && (
              <div className="bg-white shadow-lg p-4 rounded mt-2 w-72">
                <h3 className="font-bold mb-2">{t("editProfile")}</h3>
                <input type="text" placeholder={t("name")} className="w-full border p-2 mb-2" value={worker.name} onChange={(e) => setWorker({ ...worker, name: e.target.value })} />
                <input type="number" placeholder={t("age")} className="w-full border p-2 mb-2" value={worker.age} onChange={(e) => setWorker({ ...worker, age: e.target.value })} />
                <input type="text" placeholder={t("skill")} className="w-full border p-2 mb-2" value={worker.skill} onChange={(e) => setWorker({ ...worker, skill: e.target.value })} />
                <input type="text" placeholder={t("district")} className="w-full border p-2 mb-2" value={worker.district} onChange={(e) => setWorker({ ...worker, district: e.target.value })} />
                <input type="text" placeholder={t("city")} className="w-full border p-2 mb-2" value={worker.city} onChange={(e) => setWorker({ ...worker, city: e.target.value })} />
                <input type="text" placeholder={t("whatsAppNumber")} className="w-full border p-2 mb-2" value={worker.whatsapp} onChange={(e) => setWorker({ ...worker, whatsapp: e.target.value })} />
                <div className="mb-3">
                  <label className="block mb-1 font-medium">{t("profilePhoto")}</label>
                  <input type="file" accept="image/*" onChange={handlePhotoChange} />
                </div>
                <button onClick={() => setEditingProfile(false)} className="w-full bg-green-600 text-white py-2 rounded">{t("saveChanges")}</button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

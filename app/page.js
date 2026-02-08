
"use client";

import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import { categories } from "./data/categories";
import { indiaData } from "./data/locations";
import { randomWorkers } from "./data/workers";



export default function Home() {
  const [isAccountCreated, setIsAccountCreated] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [showWorkers, setShowWorkers] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [workersList, setWorkersList] = useState([]);
  const [filteredWorkers, setFilteredWorkers] = useState([]);

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
          <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center py-6  m-10">
            <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
              <h2 className="text-lg font-semibold mb-3">Create Worker Account</h2>
              <input type="text" placeholder="Full Name" className="w-full border p-2 mb-2"
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
                <option value="">Select Category</option>
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
                <option value="">Select State</option>
                {Object.keys(indiaData).map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>

              <select
                className="w-full border p-2 mb-2"
                value={worker.district}
                onChange={(e) => setWorker({ ...worker, district: e.target.value })}
              >
                <option value="">Select District</option>
                {worker.state &&
                  Object.keys(indiaData[worker.state].districts).map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
              </select>

              <select
                className="w-full border p-2 mb-2"
                value={worker.city}
                onChange={(e) => setWorker({ ...worker, city: e.target.value })}
              >
                <option value="">Select City</option>
                {worker.state &&
                  worker.district &&
                  indiaData[worker.state].districts[worker.district].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
              </select>


              <input
                type="tel"
                placeholder="WhatsApp Number"
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

              <div className="flex gap-2 mb-2">
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
              <button onClick={handleSubmit} className="w-full bg-green-600 text-white py-2 rounded">Create Account</button>
              <button onClick={() => setShowCreateForm(false)} className="mt-2 w-full bg-gray-300 text-black py-2 rounded">Cancel</button>
            </div>
          </div>
        )}


        <div className="text-center space-y-2">
          {/* TEXT */}
          <div className="text-3xl md:text-4xl font-extrabold text-gray-800">
            Find Skilled Workers
          </div>

          <div className="text-2xl md:text-4xl font-extrabold text-blue-600">
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
              Find Workers
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
              Create Account
            </button>
          </div>

        </div>


        {/* CATEGORY SECTION */}
        <div className="pt-16">

          {/* TITLE + VIEW ALL */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              Categories
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
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
            {(showAllCategories ? categories : categories.slice(0, 6)).map(
              (cat, index) => (
                <div
                  key={index}
                  onClick={() => {
                    setSelectedCategory(cat.name);
                    setShowFindForm(true);
                    setShowCreateForm(false);
                  }}
                  className="text-center cursor-pointer"
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="mx-auto object-cover rounded-xl
              w-28 h-28
              sm:w-32 sm:h-32
              md:w-80 md:h-80
              transition-transform duration-300 hover:scale-105"
                  />
                  <p className="mt-2 font-semibold text-gray-800">
                    {cat.name}
                  </p>
                </div>
              )
            )}
          </div>
        </div>


        <div className="w-full h-[2px] bg-gray-600 my-4"></div>


        {/* FIND FORM */}
        {showFindForm && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center">
            <div className="bg-white w-full h-[92vh] sm:h-auto sm:max-w-md rounded-t-2xl sm:rounded-xl p-5 overflow-y-auto animate-slideUp">
              <div className="flex justify-between items-center mb-4">
                <h1 className="font-bold text-lg">Find {selectedCategory} Workers</h1>
                <button onClick={() => setShowFindForm(false)} className="text-2xl font-bold text-gray-600">✕</button>
              </div>

              <select
                className="w-full border p-2 mb-2"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Select Category</option>
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
                <option value="">Select State</option>
                {Object.keys(indiaData).map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>

              <select
                className="w-full border p-2 mb-2"
                value={formData.district}
                onChange={(e) =>
                  setFormData({ ...formData, district: e.target.value, city: "" })
                }
              >
                <option value="">Select District</option>
                {formData.state &&
                  Object.keys(indiaData[formData.state].districts).map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
              </select>

              <select
                className="w-full border p-2 mb-2"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
              >
                <option value="">Select City</option>
                {formData.state &&
                  formData.district &&
                  indiaData[formData.state].districts[formData.district].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
              </select>

              <button onClick={handleAdd} className="w-full bg-blue-600 text-white p-3 rounded font-semibold">Find Workers</button>
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
                    className="border p-4 mx-4 rounded-xl shadow bg-white"
                  >
                    {/* TOP ROW: IMAGE + NAME */}
                    <div className="flex items-center gap-2">
                      {/* LEFT: LOGO */}
                      <img
                        src={w.photo}
                        className="w-16 h-16 rounded-full object-cover"
                        alt="profile"
                      />
                      {/* RIGHT: NAME + RATING */}
                      <div>
                        <h3 className="font-bold text-lg">{w.name}</h3>
                      </div>
                    </div>

                    {/* DETAILS */}
                    <p className="mt-2 text-sm">{w.skill}</p>
                    <p className="text-sm">📍 {w.city}, {w.district}</p>

                    {/* WHATSAPP BUTTON */}
                    <a
                      href={`https://wa.me/${(w.whatsapp || "").replace(/\D/g, "")}`}
                      target="_blank"
                      className="block mt-3 bg-green-500 text-white text-center py-2 rounded-lg"
                    >
                      WhatsApp
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-red-500 mt-4">
                Not avialable workers
              </p>
            )}
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
                <p><b>Age:</b> {worker.age}</p>
                <p><b>Skill:</b> {worker.skill}</p>
                <p><b>City:</b> {worker.city}</p>
                <p><b>WhatsApp:</b> {worker.whatsapp}</p>
                <div className="flex justify-between mt-2">
                  <button onClick={() => { setEditingProfile(true); setShowWorkerDetails(false); }} className="bg-yellow-400 px-3 py-1 rounded text-sm">Edit Profile</button>
                  <button onClick={handleLogout} className="bg-red-500 px-3 py-1 rounded text-sm text-white">Logout</button>
                </div>
              </div>
            )}
            {editingProfile && (
              <div className="bg-white shadow-lg p-4 rounded mt-2 w-72">
                <h3 className="font-bold mb-2">Edit Profile</h3>
                <input type="text" placeholder="Full Name" className="w-full border p-2 mb-2" value={worker.name} onChange={(e) => setWorker({ ...worker, name: e.target.value })} />
                <input type="number" placeholder="Age" className="w-full border p-2 mb-2" value={worker.age} onChange={(e) => setWorker({ ...worker, age: e.target.value })} />
                <input type="text" placeholder="Skill" className="w-full border p-2 mb-2" value={worker.skill} onChange={(e) => setWorker({ ...worker, skill: e.target.value })} />
                <input type="text" placeholder="District" className="w-full border p-2 mb-2" value={worker.district} onChange={(e) => setWorker({ ...worker, district: e.target.value })} />
                <input type="text" placeholder="City" className="w-full border p-2 mb-2" value={worker.city} onChange={(e) => setWorker({ ...worker, city: e.target.value })} />
                <input type="text" placeholder="WhatsApp Number" className="w-full border p-2 mb-2" value={worker.whatsapp} onChange={(e) => setWorker({ ...worker, whatsapp: e.target.value })} />
                <div className="mb-3">
                  <label className="block mb-1 font-medium">Profile Photo</label>
                  <input type="file" accept="image/*" onChange={handlePhotoChange} />
                </div>
                <button onClick={() => setEditingProfile(false)} className="w-full bg-green-600 text-white py-2 rounded">Save Changes</button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

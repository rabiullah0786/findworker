export const metadata = {
    title: "Privacy Policy - FindWorker",
    description: "Privacy policy for FindWorker: what data we collect and how we use it.",
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-gray-50 p-6 sm:p-12">
            <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6 sm:p-10">
                <h1 className="text-2xl font-bold mb-4">Privacy Policy</h1>

                <p className="mb-3 text-sm text-gray-700">
                    This Privacy Policy describes how FindWorker collects, uses, and
                    protects information when people create worker profiles or search for
                    workers on the FindWorker platform.
                </p>

                <h2 className="font-semibold mt-4">1. Data We Collect</h2>
                <ul className="list-disc pl-5 text-sm text-gray-700 mb-3">
                    <li>Profile information: name, age, skill/category, state, district, city.</li>
                    <li>Contact: WhatsApp/phone number (used for OTP verification).</li>
                    <li>Profile photo: image uploaded by the user.</li>
                    <li>Usage data: basic usage and analytics to help improve the service.</li>
                    <li>Local storage: some data (like created profiles or current user) may be stored in the browser's localStorage for convenience.</li>
                </ul>

                <h2 className="font-semibold mt-4">2. How We Use Your Data</h2>
                <p className="text-sm text-gray-700 mb-3">
                    We use collected data to provide and improve the FindWorker service: to
                    create and display worker profiles, power searches, verify phone numbers
                    via OTP, and communicate with users when necessary.
                </p>

                <h2 className="font-semibold mt-4">3. Sharing & Third Parties</h2>
                <p className="text-sm text-gray-700 mb-3">
                    Worker profile information is visible to anyone using the platform to
                    find workers. We do not sell personal data. We may use third-party
                    services (e.g., hosting, database providers) which process data on our
                    behalf under contractual terms.
                </p>

                <h2 className="font-semibold mt-4">4. Security</h2>
                <p className="text-sm text-gray-700 mb-3">
                    We take reasonable measures to protect data (access controls, encrypted
                    transport). However, no system is completely secure—please avoid
                    publishing sensitive personal information in a profile.
                </p>

                <h2 className="font-semibold mt-4">5. Retention</h2>
                <p className="text-sm text-gray-700 mb-3">
                    Profiles and related data are retained while the account exists. You
                    can request deletion or remove your profile; local copies stored in a
                    browser (localStorage) must be cleared by the user or via our UI if provided.
                </p>

                <h2 className="font-semibold mt-4">6. Your Rights</h2>
                <p className="text-sm text-gray-700 mb-3">
                    You may request access, correction, or deletion of your personal data.
                    To exercise these rights or ask privacy questions, contact us at the
                    support address below.
                </p>

                <h2 className="font-semibold mt-4">7. OTP & Phone Verification</h2>
                <p className="text-sm text-gray-700 mb-3">
                    Phone numbers are used solely for sending/verifying OTPs during
                    account creation and are not displayed publicly unless stored as the
                    user's contact in their profile.
                </p>

                <h2 className="font-semibold mt-4">8. Contact</h2>
                <p className="text-sm text-gray-700 mb-6">
                    For privacy requests or concerns, email: support@findworker.example
                </p>

                <p className="text-xs text-gray-500">Last updated: February 2026</p>
            </div>
        </div>
    );
}

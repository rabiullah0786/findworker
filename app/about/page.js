


import Link from "next/link";

export const metadata = {
    title: "About | Work Bridge",
    description:
        "Free and fast work bridge platform to find skilled workers nearby in India",
};

export default function AboutPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-10 space-y-12">
            {/* ================= ENGLISH SECTION ================= */}
            <section>
                <h1 className="text-3xl font-bold mb-4">
                    About Work Bridge
                </h1>

                <p className="text-gray-700 mb-6">
                    <strong>Work Bridge</strong> is a <b>free and fast work-bridge platform</b>
                    that helps people easily <b>find skilled workers</b> or
                    <b> create a worker account</b> in just a few simple steps.
                    This platform is designed to connect local workers and users
                    without any complex process.
                </p>

                <h2 className="text-2xl font-semibold mb-3">
                    How to Use Work Bridge
                </h2>

                <div className="space-y-4 text-gray-700">
                    <p>
                        <b>1.</b> If you have any skill (Electrician, Plumber, Mason, etc.),
                        simply{" "}

                        click Create Account button and fill basic  details like name, skill, city, and contact
                        number.
                    </p>

                    <p>
                        <b>2.</b> If you need a worker, go to the{" "}

                        page, select your category, choose your nearby location,
                        click on any worker image, fill the basic form, submit it,
                        and instantly find nearby workers.
                    </p>
                </div>

                <h2 className="text-2xl font-semibold mt-8 mb-3">
                    Why Choose Work Bridge?
                </h2>

                <ul className="list-disc pl-5 text-gray-700 space-y-2">
                    <li>100% free platform – no hidden charges</li>
                    <li>Fast and easy account creation</li>
                    <li>Connects local workers and users directly</li>
                    <li>No agents, no middleman</li>
                    <li>Perfect for daily wage workers and local services</li>
                    <li>Mobile-friendly and easy to use</li>
                </ul>
            </section>

            {/* ================= HINDI SECTION ================= */}
            <section className="pt-10 border-t">
                <h1 className="text-3xl font-bold mb-4">
                    Work Bridge के बारे में
                </h1>

                <p className="text-gray-700 mb-6">
                    <strong>Work Bridge</strong> एक <b>मुफ़्त और तेज़ वर्क-ब्रिज प्लेटफ़ॉर्म</b> है,
                    जो लोगों को आसानी से <b>कुशल कामगार खोजने</b> या
                    <b> कामगार अकाउंट बनाने</b> में मदद करता है।
                    यह प्लेटफ़ॉर्म स्थानीय कामगारों और ज़रूरतमंद लोगों को
                    बिना किसी जटिल प्रक्रिया के आपस में जोड़ने के लिए बनाया गया है।
                </p>

                <h2 className="text-2xl font-semibold mb-3">
                    Work Bridge का उपयोग कैसे करें
                </h2>

                <div className="space-y-4 text-gray-700">
                    <p>
                        <b>1.</b> अगर आपके पास कोई भी हुनर है
                        (जैसे Electrician, Plumber, Mason आदि),
                        तो आसानी से{" "}

                        और अपना नाम, स्किल, शहर और संपर्क नंबर जैसी
                        बेसिक जानकारी जोड़ें।
                    </p>

                    <p>
                        <b>2.</b> अगर आपको किसी कामगार की ज़रूरत है,
                        तो{" "}

                        पेज पर जाएँ, अपनी कैटेगरी चुनें,
                        नज़दीकी लोकेशन सेलेक्ट करें,
                        किसी भी कामगार की फोटो पर क्लिक करें,
                        छोटा सा फॉर्म भरें और सबमिट करें।
                        तुरंत नज़दीकी कामगार मिल जाएगा।
                    </p>
                </div>

                <h2 className="text-2xl font-semibold mt-8 mb-3">
                    Work Bridge क्यों चुनें?
                </h2>

                <ul className="list-disc pl-5 text-gray-700 space-y-2">
                    <li>100% मुफ़्त प्लेटफ़ॉर्म – कोई छुपा हुआ चार्ज नहीं</li>
                    <li>तेज़ और आसान अकाउंट बनाने की प्रक्रिया</li>
                    <li>स्थानीय कामगारों और यूज़र्स को सीधे जोड़ता है</li>
                    <li>कोई एजेंट नहीं, कोई बिचौलिया नहीं</li>
                    <li>दैनिक मज़दूरों और लोकल सर्विस के लिए बेहतरीन</li>
                    <li>मोबाइल फ्रेंडली और इस्तेमाल में आसान</li>
                </ul>
            </section>

            {/* FOOTER LINKS */}
            <div className="flex gap-4">

            </div>
        </div>
    );
}
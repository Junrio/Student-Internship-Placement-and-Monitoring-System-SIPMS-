import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg text-white flex items-center justify-center font-bold text-lg"
                style={{
                  background: "linear-gradient(to bottom right, #001F3F, #002F6C)",
                }}
              >
                S
              </div>
              <span className="text-xl font-bold text-gray-900">SIPMS</span>
            </Link>
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-lg text-gray-600 mb-8">Effective Date: January 2025</p>

          <div className="space-y-6 text-gray-700 leading-relaxed">
            <section>
              <p className="mb-4">
                By using SIPMS (Student Internship Placement & Monitoring System), you agree to follow all guidelines
                outlined in this Terms of Service agreement. This ensures a safe, fair, and transparent internship
                management experience for all users.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Acceptance of Terms</h2>
              <p className="mb-4">
                By accessing or using SIPMS, you acknowledge that you have read, understood, and agree to be bound by
                these Terms of Service. If you do not agree with any part of these terms, you must not use the system.
              </p>
              <p className="mb-4">
                These terms apply to all users of SIPMS, including students, coordinators, supervisors, administrators,
                and any other individuals or entities accessing the platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">User Responsibilities</h2>
              <p className="mb-4">All users are responsible for:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>
                  <strong>Accurate Information:</strong> Providing truthful, accurate, and up-to-date information when
                  creating accounts and submitting data
                </li>
                <li>
                  <strong>Account Security:</strong> Maintaining the confidentiality of login credentials and
                  immediately reporting any unauthorized access
                </li>
                <li>
                  <strong>Ethical Use:</strong> Using SIPMS only for legitimate academic and internship management
                  purposes
                </li>
                <li>
                  <strong>Compliance:</strong> Adhering to all applicable laws, regulations, and institutional policies
                </li>
                <li>
                  <strong>Respectful Conduct:</strong> Treating all users with respect and professionalism in all
                  communications and interactions
                </li>
                <li>
                  <strong>Data Integrity:</strong> Ensuring that all submitted data, including attendance records and
                  evaluations, is accurate and truthful
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Institutional Use</h2>
              <p className="mb-4">
                SIPMS is designed to serve accredited academic institutions and their authorized personnel. The system
                is intended for:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Managing student internship programs and placements</li>
                <li>Tracking attendance and performance evaluations</li>
                <li>Generating reports for academic and administrative purposes</li>
                <li>Facilitating communication between students, coordinators, and supervisors</li>
              </ul>
              <p className="mb-4">
                Institutions using SIPMS are responsible for ensuring that all users within their organization comply
                with these terms and applicable data protection regulations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Prohibited Activities</h2>
              <p className="mb-4">Users are strictly prohibited from:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Attempting to gain unauthorized access to the system or other users' accounts</li>
                <li>Manipulating, falsifying, or tampering with any data or records</li>
                <li>Using the system for any illegal, fraudulent, or malicious purposes</li>
                <li>Sharing login credentials with unauthorized individuals</li>
                <li>Interfering with or disrupting the system's functionality or security</li>
                <li>Reverse engineering, decompiling, or attempting to extract the source code</li>
                <li>Using automated scripts or bots to access or interact with the system without authorization</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Intellectual Property</h2>
              <p className="mb-4">
                All content, features, and functionality of SIPMS, including but not limited to text, graphics, logos,
                icons, and software, are the exclusive property of SIPMS and are protected by copyright, trademark, and
                other intellectual property laws.
              </p>
              <p className="mb-4">
                Users retain ownership of the data they submit to SIPMS but grant SIPMS a license to use, store, and
                process such data for the purposes of providing the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Limitations of Liability</h2>
              <p className="mb-4">
                SIPMS is provided "as is" and "as available" without warranties of any kind, either express or implied.
                While we strive to maintain system availability and data accuracy, we do not guarantee:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Uninterrupted or error-free operation of the system</li>
                <li>Absolute security of data transmission or storage</li>
                <li>Completeness or accuracy of all information displayed</li>
                <li>Compatibility with all devices or browsers</li>
              </ul>
              <p className="mb-4">
                SIPMS shall not be liable for any indirect, incidental, special, consequential, or punitive damages
                arising from the use or inability to use the system, including but not limited to loss of data, loss of
                profits, or business interruption.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Termination</h2>
              <p className="mb-4">
                SIPMS reserves the right to suspend or terminate user accounts that violate these Terms of Service or
                engage in prohibited activities. Users may also request account deletion by contacting us through the
                channels provided in the Contact section.
              </p>
              <p className="mb-4">
                Upon termination, users' access to the system will be immediately revoked, and data retention will be
                subject to applicable legal and institutional requirements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Modifications to Terms</h2>
              <p className="mb-4">
                SIPMS reserves the right to modify these Terms of Service at any time. Users will be notified of
                material changes through the system or via email. Continued use of SIPMS after such modifications
                constitutes acceptance of the updated terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Governing Law</h2>
              <p className="mb-4">
                These Terms of Service shall be governed by and construed in accordance with the laws of the Republic
                of the Philippines. Any disputes arising from these terms shall be subject to the exclusive jurisdiction
                of the courts of the Philippines.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Contact</h2>
              <p className="mb-4">
                If you have any questions, concerns, or disputes regarding these Terms of Service, please contact us
                through{" "}
                <a
                  href="https://www.facebook.com/Yodizzy1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#002F6C] hover:underline font-medium"
                >
                  Facebook
                </a>
                .
              </p>
              <p className="mb-4">
                We are committed to addressing your concerns and resolving any issues in a timely and fair manner.
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-white py-8 mt-16 border-t border-gray-200" style={{ backgroundColor: "#001F3F" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-white/80 text-sm">© 2025 Student Internship Placement & Monitoring System. All rights reserved.</p>
            <div className="flex gap-6 text-sm">
              <Link href="/privacy" className="text-white/80 hover:text-white hover:underline transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-white/80 hover:text-white hover:underline transition-colors">
                Terms of Service
              </Link>
              <a
                href="https://www.facebook.com/Yodizzy1"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/80 hover:text-white hover:underline transition-colors"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}





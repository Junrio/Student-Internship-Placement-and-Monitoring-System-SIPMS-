import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function PrivacyPage() {
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
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-lg text-gray-600 mb-8">Effective Date: January 2025</p>

          <div className="space-y-6 text-gray-700 leading-relaxed">
            <section>
              <p className="mb-4">
                SIPMS respects your privacy and is committed to protecting your personal data. This policy explains how
                we collect, use, and safeguard your information within the Student Internship Placement & Monitoring
                System.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Information We Collect</h2>
              <p className="mb-4">
                SIPMS collects the following types of information to facilitate internship management:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>
                  <strong>Personal Information:</strong> Names, email addresses, student identification numbers, and
                  contact details
                </li>
                <li>
                  <strong>Academic Data:</strong> Course information, academic year, and enrollment status
                </li>
                <li>
                  <strong>Internship Information:</strong> Company assignments, placement dates, attendance records, and
                  evaluation data
                </li>
                <li>
                  <strong>Usage Data:</strong> System logs, access times, and interaction patterns within the platform
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">How We Use Your Information</h2>
              <p className="mb-4">SIPMS uses collected information for the following purposes:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Facilitating internship placement and assignment processes</li>
                <li>Tracking and monitoring student attendance and performance</li>
                <li>Generating reports for academic institutions and coordinators</li>
                <li>Enabling supervisors to evaluate intern performance</li>
                <li>Maintaining system security and preventing unauthorized access</li>
                <li>Improving platform functionality and user experience</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Data Protection</h2>
              <p className="mb-4">
                SIPMS is committed to protecting your personal data in compliance with the{" "}
                <strong>Republic Act No. 10173 (Data Privacy Act of 2012)</strong> of the Philippines. We implement
                appropriate technical and organizational measures to ensure data security, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Encryption of sensitive data during transmission and storage</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Secure backup and recovery procedures</li>
                <li>Staff training on data privacy and security best practices</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">User Rights</h2>
              <p className="mb-4">Under the Data Privacy Act, you have the right to:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>
                  <strong>Access:</strong> Request a copy of your personal data held by SIPMS
                </li>
                <li>
                  <strong>Correction:</strong> Request correction of inaccurate or incomplete information
                </li>
                <li>
                  <strong>Deletion:</strong> Request deletion of your personal data, subject to legal and institutional
                  requirements
                </li>
                <li>
                  <strong>Objection:</strong> Object to processing of your personal data for specific purposes
                </li>
                <li>
                  <strong>Data Portability:</strong> Request transfer of your data to another system, where technically
                  feasible
                </li>
              </ul>
              <p className="mb-4">
                To exercise these rights, please contact us through the channels provided in the Contact section below.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Data Retention</h2>
              <p className="mb-4">
                SIPMS retains personal data only for as long as necessary to fulfill the purposes outlined in this
                policy, comply with legal obligations, resolve disputes, and enforce agreements. Academic and internship
                records may be retained for extended periods as required by institutional policies and applicable laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Third-Party Services</h2>
              <p className="mb-4">
                SIPMS may integrate with third-party services for hosting, analytics, or other operational purposes. We
                ensure that any third-party service providers comply with applicable data protection laws and maintain
                appropriate security measures.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Changes to This Policy</h2>
              <p className="mb-4">
                SIPMS reserves the right to update this Privacy Policy from time to time. We will notify users of any
                material changes by posting the updated policy on this page and updating the "Effective Date" at the top
                of this document.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Contact</h2>
              <p className="mb-4">
                For any inquiries, concerns, or requests regarding your personal data or this Privacy Policy, please
                contact us via{" "}
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
                We are committed to addressing your privacy concerns promptly and transparently.
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





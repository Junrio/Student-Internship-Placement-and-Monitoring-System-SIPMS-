"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { motion, useInView, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Briefcase,
  ClipboardCheck,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Users,
  Quote,
  Menu,
  X,
  UserCheck,
  FileText,
  TrendingUp,
} from "lucide-react"

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const aboutRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const howItWorksRef = useRef<HTMLDivElement>(null)
  const testimonialsRef = useRef<HTMLDivElement>(null)

  const aboutInView = useInView(aboutRef, { once: true, margin: "-100px" })
  const featuresInView = useInView(featuresRef, { once: true, margin: "-100px" })
  const howItWorksInView = useInView(howItWorksRef, { once: true, margin: "-100px" })
  const testimonialsInView = useInView(testimonialsRef, { once: true, margin: "-100px" })

  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 500], [0, 150])
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
      setMobileMenuOpen(false)
    }
  }

  const features = [
    {
      icon: Briefcase,
      title: "Smart Placements",
      description: "Assign and confirm internships in seconds — no paperwork needed.",
    },
    {
      icon: ClipboardCheck,
      title: "Real-Time Evaluation",
      description: "Supervisors can evaluate interns digitally and instantly.",
    },
    {
      icon: BarChart3,
      title: "Automated Reports",
      description: "Generate and export student and company reports with one click.",
    },
  ]

  const steps = [
    {
      number: "01",
      icon: FileText,
      title: "Coordinator creates internship program",
      description: "Set up internship opportunities with company details and requirements.",
    },
    {
      number: "02",
      icon: UserCheck,
      title: "Students apply or get assigned",
      description: "Match students with suitable internship programs and companies.",
    },
    {
      number: "03",
      icon: TrendingUp,
      title: "Supervisors evaluate performance",
      description: "Monitor attendance, performance, and evaluation progress in real-time.",
    },
    {
      number: "04",
      icon: BarChart3,
      title: "Reports are generated and synced",
      description: "Create comprehensive reports for academic records and compliance.",
    },
  ]

  const testimonials = [
    {
      quote: "SIPMS made our OJT management completely paperless. It's a game-changer for our department.",
      author: "Dr. Maria Santos",
      role: "Faculty Coordinator",
      initial: "MS",
    },
    {
      quote: "I tracked my progress and evaluations easily. The system is intuitive and saves us hours of paperwork.",
      author: "Sarah Martinez",
      role: "Computer Science Student",
      initial: "SM",
    },
    {
      quote: "The system is intuitive and saves us hours of paperwork. Students love the real-time updates.",
      author: "Prof. John Reyes",
      role: "Internship Supervisor",
      initial: "JR",
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md z-50 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg text-white flex items-center justify-center font-bold text-lg shadow-md"
                style={{
                  background: "linear-gradient(to bottom right, #001F3F, #002F6C)",
                }}
              >
                S
              </div>
              <span className="text-xl font-bold text-gray-900">SIPMS</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <button
                onClick={() => scrollToSection("about")}
                className="text-gray-700 hover:text-[#002F6C] transition-colors font-medium"
              >
                About
              </button>
              <button
                onClick={() => scrollToSection("features")}
                className="text-gray-700 hover:text-[#002F6C] transition-colors font-medium"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="text-gray-700 hover:text-[#002F6C] transition-colors font-medium"
              >
                How It Works
              </button>
              <Link href="/auth/signin">
                <Button variant="outline" className="rounded-full">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signin">
                <Button
                  className="rounded-full text-white shadow-md hover:shadow-lg transition-shadow"
                  style={{
                    background: "linear-gradient(to right, #001F3F, #002F6C)",
                  }}
                >
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-200 bg-white"
          >
            <div className="px-4 py-4 space-y-3">
              <button
                onClick={() => scrollToSection("about")}
                className="block w-full text-left text-gray-700 hover:text-[#002F6C] py-2 transition-colors"
              >
                About
              </button>
              <button
                onClick={() => scrollToSection("features")}
                className="block w-full text-left text-gray-700 hover:text-[#002F6C] py-2 transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="block w-full text-left text-gray-700 hover:text-[#002F6C] py-2 transition-colors"
              >
                How It Works
              </button>
              <Link href="/auth/signin" className="block">
                <Button variant="outline" className="w-full rounded-full">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signin" className="block">
                <Button
                  className="w-full rounded-full text-white"
                  style={{
                    background: "linear-gradient(to right, #001F3F, #002F6C)",
                  }}
                >
                  Get Started
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section 
        className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16"
        style={{
          background: "linear-gradient(to bottom right, #001F3F, #002F6C, #E6F0FF)",
        }}
      >
        {/* Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center md:text-left"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="mb-6"
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight" style={{ color: "#ffffff" }}>
                  Student Internship Placement and Monitoring System (SIPMS)
                </h1>
                <p className="text-lg md:text-xl mb-8 leading-relaxed" style={{ color: "rgba(255, 255, 255, 0.9)" }}>
                  A modern, secure system that connects students, coordinators, and companies — making internship
                  tracking and evaluations effortless.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
              >
                <Link href="/auth/signin">
                  <Button
                    size="lg"
                    className="bg-white hover:bg-gray-100 rounded-full px-8 py-6 text-lg font-semibold shadow-xl hover:scale-105 transition-transform"
                    style={{ color: "#002F6C" }}
                  >
                    Get Started
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Button
                  size="lg"
                  onClick={() => scrollToSection("about")}
                  className="border-2 rounded-full px-8 py-6 text-lg font-semibold backdrop-blur-sm hover:bg-white/20 transition-all"
                  style={{ 
                    color: "#ffffff", 
                    borderColor: "#ffffff",
                    backgroundColor: "transparent"
                  }}
                >
                  Learn More
                </Button>
              </motion.div>
            </motion.div>

            {/* Right Column - Illustration */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden md:flex items-center justify-center"
            >
              <div className="relative w-full max-w-lg">
                <div
                  className="aspect-square rounded-3xl p-8 flex items-center justify-center shadow-2xl"
                  style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255,255,255,0.3)",
                  }}
                >
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="bg-white/25 backdrop-blur-md rounded-2xl p-6 border border-white/40">
                      <Users className="w-12 h-12 text-white mb-3 mx-auto" />
                      <div className="text-2xl font-bold text-white text-center">500+</div>
                      <div className="text-sm text-white/90 text-center">Students</div>
                    </div>
                    <div className="bg-white/25 backdrop-blur-md rounded-2xl p-6 border border-white/40">
                      <Briefcase className="w-12 h-12 text-white mb-3 mx-auto" />
                      <div className="text-2xl font-bold text-white text-center">200+</div>
                      <div className="text-sm text-white/90 text-center">Internships</div>
                    </div>
                    <div className="bg-white/25 backdrop-blur-md rounded-2xl p-6 border border-white/40">
                      <CheckCircle2 className="w-12 h-12 text-white mb-3 mx-auto" />
                      <div className="text-2xl font-bold text-white text-center">95%</div>
                      <div className="text-sm text-white/90 text-center">Success Rate</div>
                    </div>
                    <div className="bg-white/25 backdrop-blur-md rounded-2xl p-6 border border-white/40">
                      <BarChart3 className="w-12 h-12 text-white mb-3 mx-auto" />
                      <div className="text-2xl font-bold text-white text-center">100%</div>
                      <div className="text-sm text-white/90 text-center">Paperless</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-1 h-3 bg-white/50 rounded-full mt-2"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* About Section */}
      <section id="about" ref={aboutRef} className="py-20 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={aboutInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">About SIPMS</h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                The Student Internship Placement & Monitoring System (SIPMS) is designed for schools to automate and
                digitize the entire OJT process — from internship assignments to performance evaluation.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Our platform streamlines the entire internship lifecycle, making it easier for coordinators to manage
                placements, for supervisors to track progress, and for students to stay informed about their internship
                journey.
              </p>
            </div>
            <div className="relative">
              <div
                className="aspect-square rounded-2xl p-8 flex items-center justify-center shadow-xl"
                style={{
                  background: "linear-gradient(to bottom right, rgba(0, 31, 63, 0.1), rgba(0, 47, 108, 0.1), rgba(230, 240, 255, 0.2))",
                }}
              >
                <div className="grid grid-cols-2 gap-4 w-full">
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <Users className="w-8 h-8 mb-3" style={{ color: "#002F6C" }} />
                    <div className="text-3xl font-bold text-gray-900">500+</div>
                    <div className="text-sm text-gray-600">Students</div>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <Briefcase className="w-8 h-8 mb-3" style={{ color: "#002F6C" }} />
                    <div className="text-3xl font-bold text-gray-900">200+</div>
                    <div className="text-sm text-gray-600">Internships</div>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <CheckCircle2 className="w-8 h-8 mb-3" style={{ color: "#002F6C" }} />
                    <div className="text-3xl font-bold text-gray-900">95%</div>
                    <div className="text-sm text-gray-600">Success Rate</div>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <BarChart3 className="w-8 h-8 mb-3" style={{ color: "#002F6C" }} />
                    <div className="text-3xl font-bold text-gray-900">100%</div>
                    <div className="text-sm text-gray-600">Paperless</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        ref={featuresRef}
        className="py-20 md:py-32"
        style={{
          background: "linear-gradient(to bottom, #ffffff, rgba(230, 240, 255, 0.2))",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage internships efficiently and effectively.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 50 }}
                  animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  whileHover={{ y: -10, transition: { duration: 0.3 } }}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center mb-6"
                    style={{
                      background: "linear-gradient(to bottom right, #001F3F, #002F6C)",
                    }}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" ref={howItWorksRef} className="py-20 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={howItWorksInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Get started with SIPMS in four simple steps.</p>
          </motion.div>

          <div className="space-y-12">
            {steps.map((step, index) => {
              const StepIcon = step.icon
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  animate={howItWorksInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  className={`flex flex-col md:flex-row gap-8 items-center ${
                    index % 2 === 1 ? "md:flex-row-reverse" : ""
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div
                        className="w-16 h-16 rounded-xl flex items-center justify-center"
                        style={{
                          background: "linear-gradient(to bottom right, #001F3F, #002F6C)",
                        }}
                      >
                        <StepIcon className="w-8 h-8 text-white" />
                      </div>
                      <div className="text-6xl font-bold" style={{ color: "rgba(0, 47, 108, 0.2)" }}>
                        {step.number}
                      </div>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{step.title}</h3>
                    <p className="text-lg text-gray-600 leading-relaxed">{step.description}</p>
                  </div>
                  <div className="flex-1">
                    <div
                      className="aspect-video rounded-2xl flex items-center justify-center shadow-lg"
                      style={{
                        background: "linear-gradient(to bottom right, rgba(0, 31, 63, 0.1), rgba(0, 47, 108, 0.1), rgba(230, 240, 255, 0.2))",
                      }}
                    >
                      <StepIcon className="w-24 h-24" style={{ color: "rgba(0, 47, 108, 0.3)" }} />
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        id="testimonials"
        ref={testimonialsRef}
        className="py-20 md:py-32"
        style={{
          background: "linear-gradient(to bottom, rgba(230, 240, 255, 0.2), #ffffff)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={testimonialsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">What People Say</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Hear from coordinators, supervisors, and students using SIPMS.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={testimonialsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="bg-white rounded-2xl p-8 shadow-lg"
              >
                <Quote className="w-12 h-12 mb-4" style={{ color: "rgba(0, 47, 108, 0.3)" }} />
                <p className="text-gray-700 mb-6 leading-relaxed italic">"{testimonial.quote}"</p>
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                    style={{
                      background: "linear-gradient(to bottom right, #001F3F, #002F6C)",
                    }}
                  >
                    {testimonial.initial}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.author}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="py-20 md:py-32 relative overflow-hidden"
        style={{
          background: "linear-gradient(to bottom right, #001F3F, #002F6C, #E6F0FF)",
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Join hundreds of students and coordinators using SIPMS
            </h2>
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
              Digitalize your internship process today.
            </p>
            <Link href="/auth/signin">
              <Button
                size="lg"
                className="bg-white hover:bg-gray-100 rounded-full px-8 py-6 text-lg font-semibold shadow-xl hover:scale-105 transition-transform"
                style={{ color: "#002F6C" }}
              >
                Sign In to SIPMS
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-white py-12" style={{ backgroundColor: "#001F3F" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg text-white flex items-center justify-center font-bold text-lg"
                style={{
                  background: "linear-gradient(to bottom right, #001F3F, #002F6C)",
                }}
              >
                S
              </div>
              <p className="text-white/80 text-sm">© 2025 Student Internship Placement & Monitoring System. All rights reserved.</p>
            </div>
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

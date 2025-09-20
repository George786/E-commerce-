'use client'

import { useState } from 'react'
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from 'lucide-react'

interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000))

    setIsSubmitting(false)
    setIsSubmitted(true)
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      })
    }, 3000)
  }

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      details: 'support@nike.com',
      description: 'Send us an email and we\'ll respond within 24 hours',
    },
    {
      icon: Phone,
      title: 'Call Us',
      details: '+1 (800) 344-6453',
      description: 'Mon-Fri 8AM-8PM EST, Sat-Sun 9AM-6PM EST',
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      details: 'Nike World Headquarters',
      description: 'One Bowerman Drive, Beaverton, OR 97005',
    },
    {
      icon: Clock,
      title: 'Business Hours',
      details: 'Monday - Friday',
      description: '8:00 AM - 8:00 PM EST',
    },
  ]

  return (
    <div className="min-h-screen bg-light-100">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-dark-900 via-dark-800 to-dark-700 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-heading-1 font-bold text-white mb-4">
              Contact Us
            </h1>
            <p className="text-body-large text-white/80 max-w-2xl mx-auto">
              Have a question or need help? We&apos;re here to assist you. 
              Reach out to our customer service team and we&apos;ll get back to you as soon as possible.
            </p>
          </div>
        </div>
      </section>

      <div className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Contact Information */}
            <div>
              <h2 className="text-heading-2 font-bold text-dark-900 mb-8">
                Get in Touch
              </h2>
              
              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <info.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-body-medium font-semibold text-dark-900 mb-1">
                        {info.title}
                      </h3>
                      <p className="text-body text-dark-700 mb-1">
                        {info.details}
                      </p>
                      <p className="text-caption text-dark-500">
                        {info.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* FAQ Section */}
              <div className="mt-12">
                <h3 className="text-heading-3 font-bold text-dark-900 mb-6">
                  Frequently Asked Questions
                </h3>
                <div className="space-y-4">
                  <div className="rounded-lg border border-light-300 bg-light-100 p-4">
                    <h4 className="text-body-medium font-semibold text-dark-900 mb-2">
                      How can I track my order?
                    </h4>
                    <p className="text-caption text-dark-600">
                      You can track your order by logging into your account and visiting the &quot;Order History&quot; section.
                    </p>
                  </div>
                  <div className="rounded-lg border border-light-300 bg-light-100 p-4">
                    <h4 className="text-body-medium font-semibold text-dark-900 mb-2">
                      What is your return policy?
                    </h4>
                    <p className="text-caption text-dark-600">
                      We offer a 30-day return policy for unworn items in original packaging.
                    </p>
                  </div>
                  <div className="rounded-lg border border-light-300 bg-light-100 p-4">
                    <h4 className="text-body-medium font-semibold text-dark-900 mb-2">
                      Do you offer international shipping?
                    </h4>
                    <p className="text-caption text-dark-600">
                      Yes, we ship to over 200 countries worldwide with various shipping options.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="text-heading-2 font-bold text-dark-900 mb-8">
                Send us a Message
              </h2>
              
              {isSubmitted ? (
                <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-body-medium font-semibold text-green-800 mb-2">
                    Message Sent Successfully!
                  </h3>
                  <p className="text-caption text-green-600">
                    Thank you for contacting us. We&apos;ll get back to you within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-body-medium font-medium text-dark-900 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-lg border border-light-300 bg-light-100 px-4 py-3 text-body text-dark-900 placeholder:text-dark-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-body-medium font-medium text-dark-900 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-lg border border-light-300 bg-light-100 px-4 py-3 text-body text-dark-900 placeholder:text-dark-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="Enter your email address"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-body-medium font-medium text-dark-900 mb-2">
                      Subject *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-lg border border-light-300 bg-light-100 px-4 py-3 text-body text-dark-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="">Select a subject</option>
                      <option value="order">Order Support</option>
                      <option value="shipping">Shipping & Delivery</option>
                      <option value="returns">Returns & Exchanges</option>
                      <option value="product">Product Information</option>
                      <option value="account">Account Issues</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-body-medium font-medium text-dark-900 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full rounded-lg border border-light-300 bg-light-100 px-4 py-3 text-body text-dark-900 placeholder:text-dark-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="Tell us how we can help you..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-full bg-dark-900 px-6 py-4 text-body-medium text-light-100 transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[--color-dark-500] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-light-100 border-t-transparent" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

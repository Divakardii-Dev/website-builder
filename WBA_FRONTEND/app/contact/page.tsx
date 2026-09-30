"use client";
import React, { useState } from 'react';
import {
  FaFacebookF,
  FaEnvelope,
  FaGlobe,
  FaInstagram,
  FaLinkedinIn,
  FaLocationDot,
  FaPhoneVolume,
  FaWhatsapp,
  FaXTwitter,
  FaYoutube,
} from 'react-icons/fa6';
 
const ContactSection = () => {
  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    projectType: '',
    message: ''
  });
 
  // Error States
  const [errors, setErrors] = useState({
    email: '',
    firstName: '',
    lastName: ''
  });
 
  const socialLinks = [
    { icon: FaFacebookF, color: 'text-[#1877F2]', label: 'Facebook', url: 'https://www.facebook.com/thestackly/' },
    { icon: FaYoutube, color: 'text-[#FF0000]', label: 'YouTube', url: 'https://www.youtube.com/@TheStackly' },
    { icon: FaInstagram, color: 'text-[#E4405F]', label: 'Instagram', url: 'https://www.instagram.com/the_stackly' },
    { icon: FaLinkedinIn, color: 'text-[#0A66C2]', label: 'LinkedIn', url: 'https://in.linkedin.com/company/the-stackly' },
    { icon: FaXTwitter, color: 'text-black', label: 'X', url: 'https://x.com/The_Stackly' },
    { icon: FaGlobe, color: 'text-[#06224C]', label: 'Website', url: 'https://www.thestackly.com/' },
  ];
 
  // Validation Logic
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
 
    // Name Validation: Only allow letters
    if (name === 'firstName' || name === 'lastName') {
      const onlyLetters = value.replace(/[^A-Za-z]/g, '');
      setFormData({ ...formData, [name]: onlyLetters });
      return;
    }
 
    setFormData({ ...formData, [name]: value });
 
    // Live Email Validation
    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (value && !emailRegex.test(value)) {
        setErrors({ ...errors, email: 'Please type in valid format (e.g: ranade@gmail.com)' });
      } else {
        setErrors({ ...errors, email: '' });
      }
    }
  };
 
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!errors.email && formData.email) {
      alert("Message Sent Successfully!");
    }
  };
 
  return (
    <section id="contact" className="bg-[#FFF1F2] py-8 md:py-14 px-2 sm:px-8 lg:px-14 w-full overflow-hidden">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
 
        {/* LEFT COLUMN: Contact Information */}
        <div className="w-full lg:w-5/12 space-y-8 flex flex-col justify-center">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#06224C] font-black">
              <FaPhoneVolume className="text-xl" aria-hidden="true" />
              <span className="uppercase tracking-[0.2em] text-xs">Contact</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#06224C] leading-[1.1] tracking-tight">
              Let&apos;s Get In Touch.
            </h2>
            <p className="text-gray-600 text-base sm:text-lg font-medium">
              Or simply reach out directly to
            </p>
          </div>
 
          <div className="space-y-6">
            {/* Email Detail */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                <FaEnvelope className="text-[#EA4335] text-2xl" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Email</p>
                <p className="text-[#06224C] font-bold text-sm truncate">thestackly@gmail.com</p>
              </div>
            </div>
 
            {/* Location Detail */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                <FaLocationDot className="text-[#EA4335] text-2xl" aria-hidden="true" />
              </div>
              <div>
                <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Location</p>
                <p className="text-[#06224C] font-bold text-xs sm:text-sm leading-relaxed max-w-[300px]">
                  MMR Complex, Chinna Thirupathi, Salem, Tamil Nadu 636008.
                </p>
              </div>
            </div>
 
            {/* WhatsApp Detail */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                <FaWhatsapp className="text-[#25D366] text-2xl" aria-hidden="true" />
              </div>
              <div>
                <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Whatsapp</p>
                <p className="text-[#06224C] font-bold text-sm">+91 7010792745</p>
              </div>
            </div>
          </div>
 
          {/* Social Links */}
          <div className="pt-4">
            <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-4">Social Media hereby :</p>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a key={social.label} href={social.url} target="_blank" rel="noopener noreferrer" aria-label={social.label}
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white shadow-md flex items-center justify-center hover:scale-110 transition-all border border-gray-100">
                    <Icon className={`${social.color} text-lg`} aria-hidden="true" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
 
        {/* RIGHT COLUMN: Form Card */}
        <div className="w-full lg:w-7/12 bg-white rounded-[2.5rem] p-6 sm:p-10 md:p-12 shadow-2xl border border-white relative z-10">
          <h3 className="text-2xl sm:text-3xl font-black text-[#06224C] mb-1">Send a Message</h3>
          <p className="text-xs sm:text-sm text-gray-400 font-bold mb-8 uppercase tracking-wide">we will get back to you within 48 hours.</p>
 
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-[#06224C] uppercase tracking-widest">First Name</label>
                <input name="firstName" type="text" value={formData.firstName} onChange={handleInputChange} placeholder="First Name" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:bg-white outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-[#06224C] uppercase tracking-widest">Last Name</label>
                <input name="lastName" type="text" value={formData.lastName} onChange={handleInputChange} placeholder="Last Name" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:bg-white outline-none transition-all" />
              </div>
            </div>
 
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-[#06224C] uppercase tracking-widest">Email Address</label>
              <input name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="test@gmail.com" required className={`w-full bg-gray-50 border ${errors.email ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 text-sm focus:border-blue-400 focus:bg-white outline-none transition-all`} />
              {errors.email && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.email}</p>}
            </div>
 
            <div className="space-y-2">
  <label className="block text-[10px] font-black text-[#06224C] uppercase tracking-widest">
    Project Type
  </label>
  <div className="relative">
    <select
      name="projectType"
      value={formData.projectType}
      onChange={handleInputChange}
      required
      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm focus:border-blue-400 focus:bg-white outline-none appearance-none cursor-pointer"
    >
      <option value="" disabled>Select a project type</option>
      <option value="ecommerce">E-commerce Website</option>
      <option value="portfolio">Portfolio Design</option>
      <option value="landing">Landing Page</option>
      <option value="business">Business Corporate</option>
    </select>
    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  </div>
</div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-[#06224C] uppercase tracking-widest">Message</label>
              <textarea name="message" rows={4} value={formData.message} onChange={handleInputChange} placeholder="Tell me about your project..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-sm focus:border-blue-400 focus:bg-white outline-none resize-none transition-all"></textarea>
            </div>
 
            <button type="submit" className="w-full bg-[#06224C] text-white py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-blue-900 transition-all shadow-lg active:scale-[0.98]">
              Send Message <i className="fa-solid fa-paper-plane text-[10px]"></i>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};
 
export default ContactSection
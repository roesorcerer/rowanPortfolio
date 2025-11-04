import { useState } from 'react';
//import useAlert from '../hooks/useAlert';
//import Alert from '../components/Alert';
import ContactMeWindow from '../sections/ContactMeWindow';
import { sendEmail } from '../api/send-email';

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    senderEmail: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
  
    try {
      await sendEmail({
        senderName: `${formData.firstName} ${formData.lastName}`,
        senderEmail: formData.senderEmail,
        message: formData.message,
      });
      
      setStatus('success');
      setFormData({ firstName: '', lastName: '', senderEmail: '', message: '' });
    } catch (error) {
      setStatus('error');
      console.error(error);
    }
  };

  return (
    <section className="c-space my-20 relative w-full min-h-screen flex flex-col items-center justify-center py-20" id="contact">
      {/* Header - Outside window */}
      <div className="text-center mb-8 z-20">
        <h3 className="text-3xl sm:text-4xl font-bold text-white mb-3">Get in touch with me</h3>
      </div>

      {/* Window Container */}
      <div className="relative w-full max-w-5xl mx-auto min-h-[650px]">
        {/* Background Window - Sized to contain form */}
        <div className="absolute inset-0">
          <ContactMeWindow />
        </div>

        {/* Content Container - Positioned inside window bounds */}
        <div className="relative z-10 px-8 sm:px-16 pt-16 pb-12 max-w-3xl mx-auto">
          <div className="text-center mb-6">
            <p className="text-sm sm:text-base text-white/80 max-w-xl mx-auto">
              Fill out the form below to get in contact with me. If my project experience interests you let's work 
              together.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <input 
                  type="text" 
                  placeholder="First Name" 
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-pink-800/20 
                  text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 text-sm"
                  required
                />
              </div>
              <div className="flex-1">
                <input 
                  type="text" 
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-pink-800/20 
                  text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <input 
                type="email" 
                placeholder="Email"
                value={formData.senderEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, senderEmail: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-pink-800/20 
                         text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 text-sm"
                required
              />
            </div>

            <div>
              <textarea 
                placeholder="Your Message"
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                rows={5}
                className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-pink-800/20 
                text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 
                resize-none text-sm"
                required
              />
            </div>

            <div className="flex flex-col items-center gap-2 pt-2">
              <button 
                type="submit"
                disabled={status === 'loading'}
                className="px-8 py-2.5 rounded-lg bg-pink-900/20 hover:bg-pink-900/30 
                border border-pink-800/20 text-white transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                {status === 'loading' ? 'Sending...' : 'Send Message'}
              </button>
              
              {status === 'success' && (
                <p className="text-green-400 text-sm">Message sent successfully!</p>
              )}
              {status === 'error' && (
                <p className="text-red-400 text-sm">Failed to send message. Please try again.</p>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
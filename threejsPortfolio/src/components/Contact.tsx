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
    <section className="c-space relative h-screen w-full" id="contact">
      {/* Background Window */}
      <div className="absolute inset-0">
        <ContactMeWindow />
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full h-full flex flex-col items-center pt-20">
        <div className="w-full max-w-4xl px-4 py-8">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-white mb-4">Get in touch with me</h3>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Fill out the form below to get in contact with me. If my project experience interests you let's work 
              together.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input 
                  type="text" 
                  placeholder="First Name" 
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg bg-white/10 border border-pink-800/20 
                  text-white placeholder-gray-400 focus:outline-none focus:border-pink-500"
                  required
                />
              </div>
              <div className="flex-1">
                <input 
                  type="text" 
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg bg-white/10 border border-pink-800/20 
                  text-white placeholder-gray-400 focus:outline-none focus:border-pink-500"
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
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-pink-800/20 
                         text-white placeholder-gray-400 focus:outline-none focus:border-pink-500"
                required
              />
            </div>

            <div>
              <textarea 
                placeholder="Your Message"
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                rows={4}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-pink-800/20 
                text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 
                resize-none"
                required
              />
            </div>

            <div className="flex flex-col items-center gap-2">
              <button 
                type="submit"
                disabled={status === 'loading'}
                className="px-8 py-2 rounded-lg bg-pink-900/20 hover:bg-pink-900/30 
                border border-pink-800/20 text-white transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? 'Sending...' : 'Send Message'}
              </button>
              
              {status === 'success' && (
                <p className="text-green-400">Message sent successfully!</p>
              )}
              {status === 'error' && (
                <p className="text-red-400">Failed to send message. Please try again.</p>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
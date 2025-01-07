import ContactMeWindow from '../sections/ContactMeWindow';

type Props = {}

const Contact = (props: Props) => {
  return (
    <section className='c-space relative h-screen w-screen flex items-center justify-center'>

        {/* Window Container - responsive width */}
        <div className="relative w-full max-w-4xl aspect-[8/5]">
          {/* Background Window */}
          <div className="absolute inset-0 opacity-85">
            <ContactMeWindow />
          </div>
          
          {/* Content Inside Window */}
          <div className="absolute inset-0 pt-8 px-4 md:px-6 z-20">
            <div className="flex flex-col items-center h-full">
              {/* Contact Form */}
              <form className="w-full max-w-lg mt-8 space-y-4">
                {/* Name Input */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <input 
                      type="text" 
                      placeholder="First Name" 
                      className="w-full px-4 py-2 rounded-lg bg-white/10 border border-pink-800/20 
                               text-white placeholder-gray-400 focus:outline-none focus:border-pink-500"
                    />
                  </div>
                  <div className="flex-1">
                    <input 
                      type="text" 
                      placeholder="Last Name" 
                      className="w-full px-4 py-2 rounded-lg bg-white/10 border border-pink-800/20 
                               text-white placeholder-gray-400 focus:outline-none focus:border-pink-500"
                    />
                  </div>
                </div>

                {/* Email Input */}
                <div>
                  <input 
                    type="email" 
                    placeholder="Email" 
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-pink-800/20 
                             text-white placeholder-gray-400 focus:outline-none focus:border-pink-500"
                  />
                </div>

                {/* Message Input */}
                <div>
                  <textarea 
                    placeholder="Your Message" 
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-pink-800/20 
                             text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 
                             resize-none"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-center">
                  <button 
                    type="submit"
                    className="px-8 py-2 rounded-lg bg-pink-900/20 hover:bg-pink-900/30 
                             border border-pink-800/20 text-white transition-colors"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
     
    </section>
  )
}
export default Contact
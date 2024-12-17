import { useState } from 'react'
import { CatCapachinno } from '../sections/CatCappichino'
import Button from '../sections/Button'

const About = () => {
    const [hasCopied, setHasCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(' rowanstratton1@gmail.com');
        setHasCopied(true);

        setTimeout(() => {
            setHasCopied(false);
        }, 2000);
    };

    return (
        <section className="c-space my-20" id="about">
            <div className="grid xl:grid-cols-3 xl:grid-rows-6 md:grid-cols-2 grid-cols-1 gap-5 h-full">

                {/** First Card Avatar with intro */}
                <div className="col-spam-1 xl:row-span-3">
                    <div className="grid-container">
                        <img src="https://utfs.io/f/LHwfoeNVr61iwKRHIADceaNAfKUkhiIoPl7L2F93dZHyT16b" alt="grid-1" className="w-full sm:h-[276px] h-fit object-contain" />
                        <div>
                            <p className="grid-headtext"> Hi, I'm Rowan</p>
                            <p className="grid-subtext"> Watch my journey and see updates on my development journey. With 4 years of experience
                                in development I am honing my skills in Human Computer Interactions through games.
                            </p>
                        </div>
                    </div>
                </div>

                {/**Second Card Tech Stack with info on tech experience. Change from image to buttons later possibly? */}
                <div className="col-span-1 xl:row-span-3">
                    <div className="grid-container">
                        <img src="https://utfs.io/f/LHwfoeNVr61iJod4wQtbeWdTkrZvpuG4cEHimAMfwV1OlhtF" alt="grid-2" className="w-full sm:w-[276px] h-fit object-contain" />
                        <div>
                            <p className="grid-headtext">Tech Stack I have worked on</p>
                            <p className="grid-subtext">I specialize in Javascript/TypeScript with a Focus on React. Blending developed works with what works for people. Working on Masters in Computer Science with a focus on game elements that improve users lives.</p>
                        </div>
                    </div>
                </div>

                {/**3d image embedded with work preference(remote) */}
                <div className="col-span-1 xl:row-span-4">
                    <div className="grid-container">
                        <div className=" w-full sm:h-fit flex object-contain justify-center items-center" />

                        <div className="sketchfab-embed-wrapper">
                            <iframe title="Cute Mocha Cat :3"
                                height={326}
                                width={326}
                                src="https://sketchfab.com/models/4b8158f94d9843e89ff1230a7c5107ca/embed?autospin=1&autostart=1&preload=1&transparent=1"> </iframe>  </div>

                        <p className="grid-headtext">
                            I work remotely focusing on education to bolster my working experience.
                        </p>
                        <p className="grid-subtext">I'm based in Minnesota and go to school at the University of Minnesota Duluth </p>
                        <Button name="Contact Me" isBeam containerClass="w-full mt-10" />

                    </div>
                </div>

                {/**Why do I like to code */}
                <div className="xl:col-span-2 xl:row-span-3">
                    <div className="grid-container">
                        <img src="https://utfs.io/f/LHwfoeNVr61i1boCnB0NaX5s7P2ClbYRvo9kzFAwHBuZ6mV4" alt="grid-3" className="w-full sm:h-[266px] h-fit object-contain" />
                        <p className="grid-headtext">I like making things and problem solving</p>
                        <p className="grid-subtext">Through development and coding I am able to flex the bounds of my creativity and applying creative solutions. From embedded programming through a Rasberry Pi, to game development I spend my time honing my craft.  </p>
                    </div>
                </div>

                {/**Contact options email can be copied but the tick replacements do not work yet. */}
                <div className="xl:col-span-1 xl:row-span-2">
                    <div className="grid-container">
                        <img src="https://utfs.io/f/LHwfoeNVr61ixzzP4pwJgUdiHGFDN1aYuSmtXLZy96kjbhVp" alt="grid-4" className="w-full md:h-[326px] sm:h-[326px] h-fit object-cover sm:object-top" />

                        <div className="space-y-2">
                            <p className="grid-subtext text-center">Contact Me</p>
                            <div className="copy-container" onClick={handleCopy}>
                                <img src={hasCopied ? 'assets/cat-move.gif' : 'assets/cat-footprint.png'} alt="copy" />
                                <p className="lg:text-2xl md:text-xl font-medium text-gray_gradient text-white">rowanstratton1@gmail.com</p>
                            </div>
                        </div>

                    </div>
                </div>

            </div>



        </section>
    )
}

export default About
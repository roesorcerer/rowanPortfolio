import '../index.css'
import imgImage from "../assets/justme.jpg"
import useBreakpoint from '../utils/ScreenSize'



function NameMobile() {
  return (
    <a className="content-stretch flex flex-col gap-[20px] items-start justify-center relative shrink-0" data-name="Name" href="/" target="_blank">
      <h1 className="block font-['Lato:Regular',sans-serif] leading-[1.52] not-italic relative shrink-0 text-[24px] text-black text-left tracking-[-1.08px] whitespace-nowrap">Rowan</h1>
      <div className="h-[40px] relative rounded-[138.03px] shadow-[0px_2.667px_2.667px_0px_rgba(0,0,0,0.25)] shrink-0 w-[40.169px]" data-name="Image">
        <img alt="portrait of woman" className="absolute inset-0 max-w-none object-contain pointer-events-none rounded-[138.03px] size-full" src={imgImage} />
      </div>
    </a>
  );
}

function LinksMobile() {
  return (
    <div className="content-stretch flex flex-col gap-[30px] items-end justify-center relative shrink-0 text-[16px] tracking-[-0.72px] whitespace-nowrap" data-name="Links">
      <a className="block font-['Source_Code_Pro:Regular',sans-serif] font-normal leading-[0] relative shrink-0 text-[#ab0782]" href="/" target="_self">
        <p className="leading-[1.03]">Home</p>
      </a>
      <a className="block font-['Source_Code_Pro:Medium',sans-serif] font-medium leading-[0] relative shrink-0 text-black" href="/about" target="_self">
        <p className="decoration-solid leading-[1.03] underline">About</p>
      </a>
      <a className="block font-['Lato:Light',sans-serif] leading-[1.03] not-italic relative shrink-0 text-[#5f00ad]" href="https://figma.com/sites" target="_blank">
        Contact
      </a>
    </div>
  );
}

function NavigationMobile() {
  return (
    <div className="bg-gradient-to-r from-[rgba(255,255,255,0.4)] relative size-full to-[rgba(255,255,255,0)]" data-name="Navigation">
      <div aria-hidden="true" className="absolute border-[#4f4f4f] border-b-[0.5px] border-solid inset-0 pointer-events-none" />
      <div className="content-stretch cursor-pointer flex items-start justify-between pb-[60px] pt-[20px] px-[20px] relative size-full">
        <NameMobile />
        <LinksMobile />
      </div>
    </div>
  );
}

function NameTablet() {
  return (
    <a className="content-stretch flex gap-[20px] items-center relative shrink-0" data-name="Name" href="/" target="_blank">
      <div className="h-[49.789px] relative rounded-[207.045px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] shrink-0 w-[50px]" data-name="Image">
        <img alt="portrait of woman" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[207.045px] size-full" src={imgImage} />
      </div>
      <h1 className="block font-['Lato:Regular',sans-serif] leading-[1.52] not-italic relative shrink-0 text-[24px] text-black text-left tracking-[-1.08px] whitespace-nowrap">Rowan Stratton</h1>
    </a>
  );
}

function LinksTablet() {
  return (
    <div className="content-stretch flex gap-[10px] items-center justify-center relative shrink-0 text-[16px] tracking-[-0.72px] whitespace-nowrap" data-name="Links">
      <a className="block font-['Source_Code_Pro:Regular',sans-serif] font-normal leading-[0] relative shrink-0 text-[#ab0782]" href="/" target="_self">
        <p className="decoration-solid leading-[1.03] underline">Home</p>
      </a>
      <a className="block font-['Source_Code_Pro:Medium',sans-serif] font-medium leading-[0] relative shrink-0 text-black" href="/about" target="_self">
        <p className="decoration-solid leading-[1.03] underline">About</p>
      </a>
      <a className="block font-['Lato:Light',sans-serif] leading-[1.03] not-italic relative shrink-0 text-[#5f00ad]" href="https://figma.com/sites" target="_blank">
        Contact
      </a>
    </div>
  );
}

function NavigationTablet() {
  return (
    <div className="bg-gradient-to-r from-[rgba(255,255,255,0.4)] relative size-full to-[rgba(255,255,255,0)]" data-name="Navigation">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch cursor-pointer flex items-center justify-between pl-[58px] pr-[50px] py-[50px] relative size-full">
          <NameTablet />
          <LinksTablet />
        </div>
      </div>
    </div>
  );
}

function NameDesktop() {
  return (
    <a className="content-stretch flex gap-[20px] items-center relative shrink-0 w-[208px]" data-name="Name" href="/" target="_blank">
      <div className="h-[49.789px] relative rounded-[207.045px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] shrink-0 w-[50px]" data-name="Image">
        <img alt="portrait of woman" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[207.045px] size-full" src={imgImage} />
      </div>
      <h1 className="block font-['Lato:Regular',sans-serif] leading-[1.52] not-italic relative shrink-0 text-[24px] text-black text-left tracking-[-1.08px] whitespace-nowrap">Rowan Stratton</h1>
    </a>
  );
}

function LinksDesktop() {
  return (
    <div className="content-stretch flex gap-[10px] items-center justify-center relative shrink-0 text-[16px] tracking-[-0.72px] whitespace-nowrap" data-name="Links">
      <a className="block font-['Source_Code_Pro:Regular',sans-serif] font-normal leading-[0] relative shrink-0 text-[#ab0782]" href="/" target="_self">
        <p className="decoration-solid leading-[1.03] underline">Home</p>
      </a>
      <a className="block font-['Source_Code_Pro:Medium',sans-serif] font-medium leading-[0] relative shrink-0 text-black" href="/about" target="_self">
        <p className="decoration-solid leading-[1.03] underline">About</p>
      </a>
      <a className="block font-['Lato:Light',sans-serif] leading-[1.03] not-italic relative shrink-0 text-[#5f00ad]" href="https://figma.com/sites" target="_blank">
        Contact
      </a>
    </div>
  );
}

function NavigationDesktop() {
  return (
    <div className="bg-gradient-to-r from-[rgba(255,255,255,0.4)] relative size-full to-[rgba(255,255,255,0)]" data-name="Navigation">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch cursor-pointer flex items-center justify-between pl-[58px] pr-[50px] py-[50px] relative size-full">
          <NameDesktop />
          <LinksDesktop />
        </div>
      </div>
    </div>
  );
}

function Navigation() {
  const { breakpoint } = useBreakpoint()

  if (breakpoint === "mobile") return <NavigationMobile />
  if (breakpoint === "tablet") return <NavigationTablet />
  return <NavigationDesktop />
}

export default Navigation;
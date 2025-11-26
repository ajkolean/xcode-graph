import svgPaths from './svg-udzeupekwz';

function Heading() {
  return (
    <div className="h-[21px] relative shrink-0 w-full" data-name="Heading 2">
      <p
        className="absolute font-['DM_Sans:Medium',sans-serif] font-medium leading-[21px] left-0 text-[#e8eaed] text-[14px] text-nowrap top-0 whitespace-pre"
        style={{ fontVariationSettings: "'opsz' 14" }}
      >
        Node Details
      </p>
    </div>
  );
}

function Container() {
  return (
    <div className="h-[46px] relative shrink-0 w-[319px]" data-name="Container">
      <div
        aria-hidden="true"
        className="absolute border-[0px_0px_1px] border-[rgba(255,255,255,0.06)] border-solid inset-0 pointer-events-none"
      />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col h-[46px] items-start pb-px pt-[12px] px-[16px] relative w-[319px]">
        <Heading />
      </div>
    </div>
  );
}

function Icon() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path
            d={svgPaths.p2bb95e00}
            id="Vector"
            stroke="var(--stroke-0, #AD46FF)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.33333"
          />
          <path
            d="M8 14.6667V8"
            id="Vector_2"
            stroke="var(--stroke-0, #AD46FF)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.33333"
          />
          <path
            d={svgPaths.p62bd0c0}
            id="Vector_3"
            stroke="var(--stroke-0, #AD46FF)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.33333"
          />
          <path
            d="M5 2.84667L11 6.28"
            id="Vector_4"
            stroke="var(--stroke-0, #AD46FF)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.33333"
          />
        </g>
      </svg>
    </div>
  );
}

function Container1() {
  return (
    <div
      className="bg-[rgba(173,70,255,0.2)] relative rounded-[16px] shrink-0 size-[32px]"
      data-name="Container"
    >
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex items-center justify-center relative size-[32px]">
        <Icon />
      </div>
    </div>
  );
}

function Heading1() {
  return (
    <div className="h-[28px] relative shrink-0 w-[144.391px]" data-name="Heading 2">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[28px] overflow-clip relative rounded-[inherit] w-[144.391px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[28px] left-0 not-italic text-[18px] text-nowrap text-zinc-200 top-0 whitespace-pre">
          MainApp-macOS
        </p>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div
      className="content-stretch flex gap-[8px] h-[32px] items-center relative shrink-0 w-full"
      data-name="Container"
    >
      <Container1 />
      <Heading1 />
    </div>
  );
}

function Container3() {
  return (
    <div className="h-[16px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#ad46ff] text-[12px] top-[0.5px] w-[123px]">
        MainApp · App Target
      </p>
    </div>
  );
}

function Container4() {
  return (
    <div
      className="basis-0 grow h-[56px] min-h-px min-w-px relative shrink-0"
      data-name="Container"
    >
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[8px] h-[56px] items-start relative w-full">
        <Container2 />
        <Container3 />
      </div>
    </div>
  );
}

function Icon1() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-1/4" data-name="Vector">
        <div className="absolute inset-[-8.33%]">
          <svg
            className="block size-full"
            fill="none"
            preserveAspectRatio="none"
            viewBox="0 0 10 10"
          >
            <path
              d={svgPaths.p48af40}
              id="Vector"
              stroke="var(--stroke-0, #9F9FA9)"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.33333"
            />
          </svg>
        </div>
      </div>
      <div className="absolute inset-1/4" data-name="Vector">
        <div className="absolute inset-[-8.33%]">
          <svg
            className="block size-full"
            fill="none"
            preserveAspectRatio="none"
            viewBox="0 0 10 10"
          >
            <path
              d={svgPaths.p30908200}
              id="Vector"
              stroke="var(--stroke-0, #9F9FA9)"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.33333"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button() {
  return (
    <div className="relative rounded-[4px] shrink-0 size-[24px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col items-start pb-0 pt-[4px] px-[4px] relative size-[24px]">
        <Icon1 />
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div
      className="absolute content-stretch flex h-[56px] items-start justify-between left-[16px] top-[16px] w-[351px]"
      data-name="Container"
    >
      <Container4 />
      <Button />
    </div>
  );
}

function Container6() {
  return (
    <div
      className="absolute bg-[rgba(152,16,250,0.2)] h-[26px] left-[16px] rounded-[4px] top-[84.5px] w-[72.547px]"
      data-name="Container"
    >
      <div
        aria-hidden="true"
        className="absolute border border-[rgba(152,16,250,0.3)] border-solid inset-0 pointer-events-none rounded-[4px]"
      />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-[9px] not-italic text-[#c27aff] text-[12px] text-nowrap top-[5.5px] whitespace-pre">
        PROJECT
      </p>
    </div>
  );
}

function Container7() {
  return (
    <div className="h-[127.5px] relative shrink-0 w-[383px]" data-name="Container">
      <div
        aria-hidden="true"
        className="absolute border-[0px_0px_1px] border-solid border-zinc-800 inset-0 pointer-events-none"
      />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[127.5px] relative w-[383px]">
        <Container5 />
        <Container6 />
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="h-[16px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#71717b] text-[12px] text-nowrap top-[0.5px] whitespace-pre">
        Project Metrics
      </p>
    </div>
  );
}

function Container9() {
  return (
    <div className="h-[32px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[32px] left-[54.92px] not-italic text-[#ad46ff] text-[24px] text-center text-nowrap top-[-1px] translate-x-[-50%] whitespace-pre">
        1
      </p>
    </div>
  );
}

function Container10() {
  return (
    <div className="h-[16px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-[54.53px] not-italic text-[#71717b] text-[12px] text-center text-nowrap top-[0.5px] translate-x-[-50%] whitespace-pre">
        Total Targets
      </p>
    </div>
  );
}

function Container11() {
  return (
    <div
      className="[grid-area:1_/_1] content-stretch flex flex-col gap-[4px] items-start place-self-stretch relative shrink-0"
      data-name="Container"
    >
      <Container9 />
      <Container10 />
    </div>
  );
}

function Container12() {
  return (
    <div className="h-[32px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[32px] left-[54.73px] not-italic text-[#00d3f2] text-[24px] text-center text-nowrap top-[-1px] translate-x-[-50%] whitespace-pre">
        2
      </p>
    </div>
  );
}

function Container13() {
  return (
    <div className="h-[16px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-[54.97px] not-italic text-[#71717b] text-[12px] text-center text-nowrap top-[0.5px] translate-x-[-50%] whitespace-pre">
        Dependencies Out
      </p>
    </div>
  );
}

function Container14() {
  return (
    <div
      className="[grid-area:1_/_2] content-stretch flex flex-col gap-[4px] items-start place-self-stretch relative shrink-0"
      data-name="Container"
    >
      <Container12 />
      <Container13 />
    </div>
  );
}

function Container15() {
  return (
    <div className="h-[32px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[32px] left-[54.5px] not-italic text-[#00d492] text-[24px] text-center text-nowrap top-[-1px] translate-x-[-50%] whitespace-pre">
        0
      </p>
    </div>
  );
}

function Container16() {
  return (
    <div className="h-[16px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-[54.61px] not-italic text-[#71717b] text-[12px] text-center text-nowrap top-[0.5px] translate-x-[-50%] whitespace-pre">
        Dependencies In
      </p>
    </div>
  );
}

function Container17() {
  return (
    <div
      className="[grid-area:1_/_3] content-stretch flex flex-col gap-[4px] items-start place-self-stretch relative shrink-0"
      data-name="Container"
    >
      <Container15 />
      <Container16 />
    </div>
  );
}

function Container18() {
  return (
    <div
      className="gap-[12px] grid grid-cols-[repeat(3,_minmax(0px,_1fr))] grid-rows-[repeat(1,_minmax(0px,_1fr))] h-[52px] relative shrink-0 w-full"
      data-name="Container"
    >
      <Container11 />
      <Container14 />
      <Container17 />
    </div>
  );
}

function Container19() {
  return (
    <div className="h-[113px] relative shrink-0 w-[383px]" data-name="Container">
      <div
        aria-hidden="true"
        className="absolute border-[0px_0px_1px] border-solid border-zinc-800 inset-0 pointer-events-none"
      />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[12px] h-[113px] items-start pb-px pt-[16px] px-[16px] relative w-[383px]">
        <Container8 />
        <Container18 />
      </div>
    </div>
  );
}

function Icon2() {
  return (
    <div className="absolute left-[98.21px] size-[16px] top-[2px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path
            d="M8 3.33333V12.6667"
            id="Vector"
            stroke="var(--stroke-0, white)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.33333"
          />
          <path
            d={svgPaths.pc0e6f00}
            id="Vector_2"
            stroke="var(--stroke-0, white)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.33333"
          />
        </g>
      </svg>
    </div>
  );
}

function Button1() {
  return (
    <div
      className="bg-[#6f2cff] h-[20px] relative rounded-[6px] shrink-0 w-full"
      data-name="Button"
    >
      <div
        aria-hidden="true"
        className="absolute border border-[#6f2cff] border-solid inset-0 pointer-events-none rounded-[6px]"
      />
      <Icon2 />
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[18px] left-[183.71px] not-italic text-[12px] text-center text-nowrap text-white top-[1.5px] translate-x-[-50%] whitespace-pre">
        Hide Dependency Chain
      </p>
    </div>
  );
}

function Icon3() {
  return (
    <div className="relative size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path
            d={svgPaths.p28db2b80}
            id="Vector"
            stroke="var(--stroke-0, #10B981)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.33333"
          />
          <path
            d={svgPaths.p3a29aa00}
            id="Vector_2"
            stroke="var(--stroke-0, #10B981)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.33333"
          />
          <path
            d={svgPaths.p2dd0fb00}
            id="Vector_3"
            stroke="var(--stroke-0, #10B981)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.33333"
          />
          <path
            d={svgPaths.p23d3980}
            id="Vector_4"
            stroke="var(--stroke-0, #10B981)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.33333"
          />
          <path
            d={svgPaths.p1d5342f0}
            id="Vector_5"
            stroke="var(--stroke-0, #10B981)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.33333"
          />
        </g>
      </svg>
    </div>
  );
}

function Button2() {
  return (
    <div
      className="bg-[rgba(16,185,129,0.1)] h-[20px] relative rounded-[6px] shrink-0 w-full"
      data-name="Button"
    >
      <div
        aria-hidden="true"
        className="absolute border border-[rgba(16,185,129,0.3)] border-solid inset-0 pointer-events-none rounded-[6px]"
      />
      <div className="absolute flex items-center justify-center left-[81.02px] size-[16px] top-[-14px]">
        <div className="flex-none rotate-[180deg]">
          <Icon3 />
        </div>
      </div>
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[18px] left-[183.02px] not-italic text-[12px] text-center text-emerald-500 text-nowrap top-[1.5px] translate-x-[-50%] whitespace-pre">
        Show Dependents Chain
      </p>
    </div>
  );
}

function Icon4() {
  return (
    <div className="absolute left-[130.27px] size-[16px] top-[2px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path
            d="M4 2V10"
            id="Vector"
            stroke="var(--stroke-0, #E8EAED)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity="0.7"
            strokeWidth="1.33333"
          />
          <path
            d={svgPaths.p34116ba0}
            id="Vector_2"
            stroke="var(--stroke-0, #E8EAED)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity="0.7"
            strokeWidth="1.33333"
          />
          <path
            d={svgPaths.p1fe50c00}
            id="Vector_3"
            stroke="var(--stroke-0, #E8EAED)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity="0.7"
            strokeWidth="1.33333"
          />
          <path
            d={svgPaths.p3c72c380}
            id="Vector_4"
            stroke="var(--stroke-0, #E8EAED)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity="0.7"
            strokeWidth="1.33333"
          />
        </g>
      </svg>
    </div>
  );
}

function Button3() {
  return (
    <div
      className="bg-[rgba(255,255,255,0.05)] h-[20px] relative rounded-[6px] shrink-0 w-full"
      data-name="Button"
    >
      <div
        aria-hidden="true"
        className="absolute border border-[rgba(255,255,255,0.1)] border-solid inset-0 pointer-events-none rounded-[6px]"
      />
      <Icon4 />
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[18px] left-[183.77px] not-italic text-[12px] text-[rgba(232,234,237,0.7)] text-center text-nowrap top-[1.5px] translate-x-[-50%] whitespace-pre">
        Show Impact
      </p>
    </div>
  );
}

function Container20() {
  return (
    <div className="h-[109px] relative shrink-0 w-[383px]" data-name="Container">
      <div
        aria-hidden="true"
        className="absolute border-[0px_0px_1px] border-solid border-zinc-800 inset-0 pointer-events-none"
      />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[8px] h-[109px] items-start pb-px pt-[16px] px-[16px] relative w-[383px]">
        <Button1 />
        <Button2 />
        <Button3 />
      </div>
    </div>
  );
}

function Container21() {
  return (
    <div className="h-[20px] relative shrink-0 w-[94.742px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[20px] relative w-[94.742px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#9f9fa9] text-[14px] text-nowrap top-[0.5px] whitespace-pre">
          Dependencies
        </p>
      </div>
    </div>
  );
}

function Container22() {
  return (
    <div className="h-[16px] relative shrink-0 w-[43.25px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[16px] relative w-[43.25px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#52525c] text-[12px] top-[0.5px] w-[44px]">
          2 direct
        </p>
      </div>
    </div>
  );
}

function Container23() {
  return (
    <div
      className="content-stretch flex h-[20px] items-center justify-between relative shrink-0 w-full"
      data-name="Container"
    >
      <Container21 />
      <Container22 />
    </div>
  );
}

function Icon5() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Icon">
          <path
            d={svgPaths.p3fdeed00}
            id="Vector"
            stroke="var(--stroke-0, #2B7FFF)"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6 11V6"
            id="Vector_2"
            stroke="var(--stroke-0, #2B7FFF)"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={svgPaths.pb5a6200}
            id="Vector_3"
            stroke="var(--stroke-0, #2B7FFF)"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3.75 2.13501L8.25 4.71001"
            id="Vector_4"
            stroke="var(--stroke-0, #2B7FFF)"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    </div>
  );
}

function Container24() {
  return (
    <div
      className="bg-[rgba(43,127,255,0.2)] relative rounded-[4px] shrink-0 size-[24px]"
      data-name="Container"
    >
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex items-center justify-center relative size-[24px]">
        <Icon5 />
      </div>
    </div>
  );
}

function Container25() {
  return (
    <div className="h-[20px] overflow-clip relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[14px] text-nowrap text-zinc-200 top-[0.5px] whitespace-pre">
        TuistKit
      </p>
    </div>
  );
}

function Container26() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#71717b] text-[12px] text-nowrap top-[0.5px] whitespace-pre">
        Framework
      </p>
    </div>
  );
}

function Container27() {
  return (
    <div
      className="basis-0 grow h-[36px] min-h-px min-w-px relative shrink-0"
      data-name="Container"
    >
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col h-[36px] items-start relative w-full">
        <Container25 />
        <Container26 />
      </div>
    </div>
  );
}

function Icon6() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path
            d="M6 12L10 8L6 4"
            id="Vector"
            stroke="var(--stroke-0, #52525C)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.33333"
          />
        </g>
      </svg>
    </div>
  );
}

function Button4() {
  return (
    <div
      className="bg-[rgba(39,39,42,0.5)] h-[52px] relative rounded-[16px] shrink-0 w-full"
      data-name="Button"
    >
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex gap-[12px] h-[52px] items-center px-[8px] py-0 relative w-full">
          <Container24 />
          <Container27 />
          <Icon6 />
        </div>
      </div>
    </div>
  );
}

function Icon7() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Icon">
          <path
            d={svgPaths.p3fdeed00}
            id="Vector"
            stroke="var(--stroke-0, #AD46FF)"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6 11V6"
            id="Vector_2"
            stroke="var(--stroke-0, #AD46FF)"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={svgPaths.pb5a6200}
            id="Vector_3"
            stroke="var(--stroke-0, #AD46FF)"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3.75 2.13501L8.25 4.71001"
            id="Vector_4"
            stroke="var(--stroke-0, #AD46FF)"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    </div>
  );
}

function Container28() {
  return (
    <div
      className="bg-[rgba(173,70,255,0.2)] relative rounded-[4px] shrink-0 size-[24px]"
      data-name="Container"
    >
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex items-center justify-center relative size-[24px]">
        <Icon7 />
      </div>
    </div>
  );
}

function Container29() {
  return (
    <div className="h-[20px] overflow-clip relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[14px] text-nowrap text-zinc-200 top-[0.5px] whitespace-pre">
        UtilsKit
      </p>
    </div>
  );
}

function Container30() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#71717b] text-[12px] text-nowrap top-[0.5px] whitespace-pre">
        Static Library
      </p>
    </div>
  );
}

function Container31() {
  return (
    <div
      className="basis-0 grow h-[36px] min-h-px min-w-px relative shrink-0"
      data-name="Container"
    >
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col h-[36px] items-start relative w-full">
        <Container29 />
        <Container30 />
      </div>
    </div>
  );
}

function Icon8() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path
            d="M6 12L10 8L6 4"
            id="Vector"
            stroke="var(--stroke-0, #52525C)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.33333"
          />
        </g>
      </svg>
    </div>
  );
}

function Button5() {
  return (
    <div
      className="bg-[rgba(39,39,42,0.5)] h-[52px] relative rounded-[16px] shrink-0 w-full"
      data-name="Button"
    >
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex gap-[12px] h-[52px] items-center px-[8px] py-0 relative w-full">
          <Container28 />
          <Container31 />
          <Icon8 />
        </div>
      </div>
    </div>
  );
}

function Container32() {
  return (
    <div
      className="content-stretch flex flex-col gap-[8px] h-[112px] items-start relative shrink-0 w-full"
      data-name="Container"
    >
      <Button4 />
      <Button5 />
    </div>
  );
}

function Container33() {
  return (
    <div className="h-[177px] relative shrink-0 w-full" data-name="Container">
      <div
        aria-hidden="true"
        className="absolute border-[0px_0px_1px] border-solid border-zinc-800 inset-0 pointer-events-none"
      />
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[12px] h-[177px] items-start pb-px pt-[16px] px-[16px] relative w-full">
          <Container23 />
          <Container32 />
        </div>
      </div>
    </div>
  );
}

function Container34() {
  return (
    <div className="h-[20px] relative shrink-0 w-[80.406px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[20px] relative w-[80.406px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#9f9fa9] text-[14px] text-nowrap top-[0.5px] whitespace-pre">
          Dependents
        </p>
      </div>
    </div>
  );
}

function Container35() {
  return (
    <div className="h-[16px] relative shrink-0 w-[43.484px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[16px] relative w-[43.484px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#52525c] text-[12px] top-[0.5px] w-[44px]">
          0 direct
        </p>
      </div>
    </div>
  );
}

function Container36() {
  return (
    <div
      className="content-stretch flex h-[20px] items-center justify-between relative shrink-0 w-full"
      data-name="Container"
    >
      <Container34 />
      <Container35 />
    </div>
  );
}

function Container37() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Italic',sans-serif] font-normal italic leading-[20px] left-0 text-[#52525c] text-[14px] text-nowrap top-[0.5px] whitespace-pre">
        No dependents
      </p>
    </div>
  );
}

function Container38() {
  return (
    <div className="h-[84px] relative shrink-0 w-full" data-name="Container">
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[12px] h-[84px] items-start pb-0 pt-[16px] px-[16px] relative w-full">
          <Container36 />
          <Container37 />
        </div>
      </div>
    </div>
  );
}

function Container39() {
  return (
    <div className="h-[16px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#71717b] text-[12px] text-nowrap top-[0.5px] whitespace-pre">
        Node Info
      </p>
    </div>
  );
}

function Text() {
  return (
    <div className="h-[16px] relative shrink-0 w-[51.023px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[16px] relative w-[51.023px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#71717b] text-[12px] text-nowrap top-[0.5px] whitespace-pre">
          Platform:
        </p>
      </div>
    </div>
  );
}

function Text1() {
  return (
    <div className="h-[16px] relative shrink-0 w-[40.688px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[16px] relative w-[40.688px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[12px] text-nowrap text-zinc-300 top-[0.5px] whitespace-pre">
          macOS
        </p>
      </div>
    </div>
  );
}

function Container40() {
  return (
    <div
      className="content-stretch flex h-[16px] items-start justify-between relative shrink-0 w-full"
      data-name="Container"
    >
      <Text />
      <Text1 />
    </div>
  );
}

function Text2() {
  return (
    <div className="h-[16px] relative shrink-0 w-[36.938px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[16px] relative w-[36.938px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#71717b] text-[12px] text-nowrap top-[0.5px] whitespace-pre">
          Origin:
        </p>
      </div>
    </div>
  );
}

function Text3() {
  return (
    <div className="h-[16px] relative shrink-0 w-[73.539px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[16px] relative w-[73.539px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[12px] text-nowrap text-zinc-300 top-[0.5px] whitespace-pre">
          Local Project
        </p>
      </div>
    </div>
  );
}

function Container41() {
  return (
    <div
      className="content-stretch flex h-[16px] items-start justify-between relative shrink-0 w-full"
      data-name="Container"
    >
      <Text2 />
      <Text3 />
    </div>
  );
}

function Text4() {
  return (
    <div className="h-[16px] relative shrink-0 w-[31.25px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[16px] relative w-[31.25px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#71717b] text-[12px] text-nowrap top-[0.5px] whitespace-pre">
          Type:
        </p>
      </div>
    </div>
  );
}

function Text5() {
  return (
    <div className="h-[16px] relative shrink-0 w-[62.625px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[16px] relative w-[62.625px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[12px] text-nowrap text-zinc-300 top-[0.5px] whitespace-pre">
          App Target
        </p>
      </div>
    </div>
  );
}

function Container42() {
  return (
    <div
      className="content-stretch flex h-[16px] items-start justify-between relative shrink-0 w-full"
      data-name="Container"
    >
      <Text4 />
      <Text5 />
    </div>
  );
}

function Container43() {
  return (
    <div
      className="content-stretch flex flex-col gap-[8px] h-[64px] items-start relative shrink-0 w-full"
      data-name="Container"
    >
      <Container40 />
      <Container41 />
      <Container42 />
    </div>
  );
}

function Container44() {
  return (
    <div
      className="bg-[rgba(24,24,27,0.5)] h-[121px] relative shrink-0 w-full"
      data-name="Container"
    >
      <div
        aria-hidden="true"
        className="absolute border-[1px_0px_0px] border-solid border-zinc-800 inset-0 pointer-events-none"
      />
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[8px] h-[121px] items-start pb-0 pt-[17px] px-[16px] relative w-full">
          <Container39 />
          <Container43 />
        </div>
      </div>
    </div>
  );
}

function Container45() {
  return (
    <div
      className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[383px]"
      data-name="Container"
    >
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col h-full items-start overflow-clip relative rounded-[inherit] w-[383px]">
        <Container33 />
        <Container38 />
        <Container44 />
      </div>
    </div>
  );
}

function NodeDetailsPanel() {
  return (
    <div
      className="bg-zinc-900 h-[731.5px] relative shrink-0 w-[384px]"
      data-name="NodeDetailsPanel"
    >
      <div
        aria-hidden="true"
        className="absolute border-[0px_0px_0px_1px] border-solid border-zinc-800 inset-0 pointer-events-none"
      />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col h-[731.5px] items-start pl-px pr-0 py-0 relative w-[384px]">
        <Container7 />
        <Container19 />
        <Container20 />
        <Container45 />
      </div>
    </div>
  );
}

export default function RightSidebar() {
  return (
    <div className="bg-[#0a0a0b] relative size-full" data-name="RightSidebar">
      <div className="box-border content-stretch flex flex-col items-start pl-px pr-0 py-0 relative size-full">
        <Container />
        <NodeDetailsPanel />
      </div>
      <div
        aria-hidden="true"
        className="absolute border-[0px_0px_0px_1px] border-[rgba(255,255,255,0.06)] border-solid inset-0 pointer-events-none"
      />
    </div>
  );
}

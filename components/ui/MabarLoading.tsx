"use client"

export default function MabarLoading({
  mode = "full",
}: {
  mode?: "full" | "section"
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center bg-[#0B0E11] px-6 font-mono select-none overflow-hidden ${
        mode === "full" ? "min-h-screen" : "min-h-[420px] w-full"
      }`}
    >
      <div className="relative flex h-32 w-32 items-center justify-center sm:h-40 sm:w-40">
        <div className="absolute h-24 w-24 rounded-full border-2 border-dashed border-[#53FC18]/40 animate-[spin_4s_linear_infinite] sm:h-32 sm:w-32" />

        <div className="absolute h-28 w-28 rounded-full border-t-2 border-b-2 border-l-2 border-[#53FC18] shadow-[0_0_15px_rgba(83,252,24,0.5)] animate-[spin_1.5s_cubic-bezier(0.53,0.21,0.29,0.67)_infinite] sm:h-36 sm:w-36" />

        <div className="relative flex h-16 w-20 items-center justify-center border-4 border-black bg-[#53FC18] shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] animate-[bounce_2s_infinite] [animation-timing-function:cubic-bezier(0.28,0.84,0.42,1)] sm:h-20 sm:w-24">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-0 h-full w-1/3 bg-white/40 -skew-x-12 mix-blend-overlay animate-[mabarLoading_1.4s_ease-in-out_infinite]" />
            <div className="absolute top-0 left-0 h-full w-1/4 bg-black/10 -skew-x-12 animate-[mabarLoading_1.4s_ease-in-out_infinite] [animation-delay:0.4s]" />
          </div>

          <div className="relative flex h-full w-full items-center justify-between px-2.5 z-10">
            <div className="relative h-5 w-5 flex items-center justify-center sm:h-6 sm:w-6">
              <div className="absolute h-full w-1.5 bg-black" />
              <div className="absolute h-1.5 w-full bg-black" />
            </div>

            <div className="absolute bottom-0 left-1/2 h-4 w-6 -translate-x-1/2 border-t-4 border-x-4 border-black bg-[#0B0E11]" />

            <div className="absolute top-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              <div className="h-1 w-2 -skew-x-12 bg-black/60" />
              <div className="h-1 w-2 -skew-x-12 bg-black/60" />
            </div>

            <div className="relative grid grid-cols-2 gap-1 rotate-45">
              <div className="h-1.5 w-1.5 rounded-full bg-black" />
              <div className="h-1.5 w-1.5 rounded-full bg-black" />
              <div className="h-1.5 w-1.5 rounded-full bg-black" />
              <div className="h-1.5 w-1.5 rounded-full bg-black" />
            </div>
          </div>

          <div className="absolute -bottom-2 left-3 h-2 w-2 border-2 border-black bg-[#53FC18]" />
          <div className="absolute -bottom-2 right-3 h-2 w-2 border-2 border-black bg-[#53FC18]" />
        </div>

        <div className="absolute h-16 w-20 bg-[#53FC18]/10 blur-xl animate-pulse -z-10" />
      </div>
    </div>
  )
}
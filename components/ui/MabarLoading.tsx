"use client"

export default function MabarLoading({
  text = "LOADING MABAR.CU",
}: {
  text?: string
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B0E11] px-4 font-mono text-white">
      <div className="relative flex flex-col items-center">
        <div className="relative flex h-28 w-28 items-center justify-center sm:h-36 sm:w-36">
          <div className="absolute inset-0 animate-spin border-4 border-[#53FC18] border-t-transparent shadow-[0_0_35px_rgba(83,252,24,0.35)]" />

          <div className="absolute inset-3 animate-pulse border-2 border-black bg-[#0E1318] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]" />

          <div className="relative z-10 text-6xl font-black leading-none tracking-tighter text-[#53FC18] drop-shadow-[0_0_14px_rgba(83,252,24,0.8)] sm:text-7xl">
            M
          </div>

          <div className="absolute -bottom-2 h-2 w-20 animate-pulse bg-[#53FC18] shadow-[0_0_20px_rgba(83,252,24,0.9)] sm:w-24" />
        </div>

        <h2 className="mt-8 animate-pulse text-center text-sm font-black uppercase tracking-[0.35em] text-[#53FC18] sm:text-base">
          {text}
        </h2>

        <p className="mt-3 text-center text-[10px] font-black uppercase tracking-widest text-zinc-500">
          Preparing squad system...
        </p>

        <div className="mt-6 h-3 w-64 overflow-hidden border-2 border-black bg-[#191B1F] sm:w-80">
          <div className="h-full w-1/2 animate-[mabarLoading_1.4s_ease-in-out_infinite] bg-[#53FC18]" />
        </div>
      </div>
    </div>
  )
}
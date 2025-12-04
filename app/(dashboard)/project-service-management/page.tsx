import {
    Clock,
    Link,
    MessageCircle,
    Share,
    Users
} from "lucide-react";

function page() {
  return (
    <div>
      <div className="min-h-screen text-white relative overflow-hidden star">
        <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />

        <div className="relative z-10 p-4 md:p-8">
          <div className="bg-card backdrop-blur-sm rounded-2xl p-4 md:p-6 flex flex-col gap-6 md:gap-8">
            <h1 className="text-2xl md:text-4xl font-bold text-white">
              Project / Service Management
            </h1>
            <p className="text-sm md:text-base">Edit or modify cards as you want</p>
            <hr className="border-white border" />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4">
                <input
                  className="bg-white text-black rounded-lg p-2 md:p-3 text-sm md:text-base"
                  type="text"
                  placeholder="Search Projects"
                />
                <input
                  className="bg-white text-black rounded-lg p-2 md:p-3 text-sm md:text-base"
                  type="date"
                />
              </div>
              <div className="flex items-center gap-3">
                <p className="text-white text-sm md:text-base">
                  Team Members
                </p>
                <div className="bg-white aspect-square text-primary rounded-full flex items-center justify-center cursor-pointer h-8 w-8 md:h-10 md:w-10">
                    <Share size={18} />
                </div>
              </div>
            </div>
            <div className="bg-white/20 p-2 md:p-3 rounded-xl flex gap-4 md:gap-5 overflow-x-auto">
              <div className="rounded-lg bg-background h-fit min-w-[280px] sm:min-w-[320px] flex-1 md:basis-[40%] overflow-hidden">
                <div className="p-2 md:p-3 bg-white text-black text-sm md:text-base font-semibold">Todo Task</div>
                <div className="p-3 md:p-4 flex flex-col gap-4 md:gap-5">
                  <div className="border-2 border-dotted flex items-center justify-center p-2 md:p-3 rounded-lg text-white text-xl">
                    {" "}
                    +
                  </div>
                  <div className="flex flex-col gap-3 md:gap-4 bg-white/5 p-3 md:p-4 rounded-lg">
                    <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                            <p className="text-sm md:text-base font-semibold truncate">Webdev</p>
                            <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-gray-400"> <Users size={14}/> Cisco Team</div>
                        </div>
                        <div>
                            <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm whitespace-nowrap"><Clock size={14} /> 12 Days</div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex gap-3 md:gap-5">
                            <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm"><Link size={14}/> <span>7</span></div>
                            <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm"><MessageCircle size={14}/> <span>8</span></div>
                        </div>
                        <div>
                            <div className="flex items-center justify-center w-6 h-6 md:w-7 md:h-7 rounded-full text-primary bg-white text-lg">+</div>
                        </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 md:gap-4 bg-white/5 p-3 md:p-4 rounded-lg">
                    <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                            <p className="text-sm md:text-base font-semibold truncate">Webdev</p>
                            <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-gray-400"> <Users size={14}/> Cisco Team</div>
                        </div>
                        <div>
                            <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm whitespace-nowrap"><Clock size={14} /> 12 Days</div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex gap-3 md:gap-5">
                            <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm"><Link size={14}/> <span>7</span></div>
                            <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm"><MessageCircle size={14}/> <span>8</span></div>
                        </div>
                        <div>
                            <div className="flex items-center justify-center w-6 h-6 md:w-7 md:h-7 rounded-full text-primary bg-white text-lg">+</div>
                        </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 md:gap-4 bg-white/5 p-3 md:p-4 rounded-lg">
                    <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                            <p className="text-sm md:text-base font-semibold truncate">Webdev</p>
                            <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-gray-400"> <Users size={14}/> Cisco Team</div>
                        </div>
                        <div>
                            <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm whitespace-nowrap"><Clock size={14} /> 12 Days</div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex gap-3 md:gap-5">
                            <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm"><Link size={14}/> <span>7</span></div>
                            <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm"><MessageCircle size={14}/> <span>8</span></div>
                        </div>
                        <div>
                            <div className="flex items-center justify-center w-6 h-6 md:w-7 md:h-7 rounded-full text-primary bg-white text-lg">+</div>
                        </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 md:gap-4 bg-white/5 p-3 md:p-4 rounded-lg">
                    <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                            <p className="text-sm md:text-base font-semibold truncate">Webdev</p>
                            <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-gray-400"> <Users size={14}/> Cisco Team</div>
                        </div>
                        <div>
                            <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm whitespace-nowrap"><Clock size={14} /> 12 Days</div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex gap-3 md:gap-5">
                            <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm"><Link size={14}/> <span>7</span></div>
                            <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm"><MessageCircle size={14}/> <span>8</span></div>
                        </div>
                        <div>
                            <div className="flex items-center justify-center w-6 h-6 md:w-7 md:h-7 rounded-full text-primary bg-white text-lg">+</div>
                        </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-lg bg-background h-fit min-w-[280px] sm:min-w-[320px] flex-1 md:basis-[40%] overflow-hidden">
                <div className="p-2 md:p-3 bg-white text-black text-sm md:text-base font-semibold">In Progress</div>
                <div className="p-3 md:p-4 flex flex-col gap-4 md:gap-5">
                  <div className="border-2 border-dotted flex items-center justify-center p-2 md:p-3 rounded-lg text-white text-xl">
                    {" "}
                    +
                  </div>
                  <div className="flex flex-col gap-3 md:gap-4 bg-white/5 p-3 md:p-4 rounded-lg">
                    <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                            <p className="text-sm md:text-base font-semibold truncate">Webdev</p>
                            <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-gray-400"> <Users size={14}/> Cisco Team</div>
                        </div>
                        <div>
                            <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm whitespace-nowrap"><Clock size={14} /> 12 Days</div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex gap-3 md:gap-5">
                            <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm"><Link size={14}/> <span>7</span></div>
                            <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm"><MessageCircle size={14}/> <span>8</span></div>
                        </div>
                        <div>
                            <div className="flex items-center justify-center w-6 h-6 md:w-7 md:h-7 rounded-full text-primary bg-white text-lg">+</div>
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default page;

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

        <div className="relative z-10 p-8">
          <div className="bg-card backdrop-blur-sm rounded-2xl p-6 flex flex-col gap-8">
            <h1 className="text-4xl font-bold text-white">
              Project / Service Managemnent
            </h1>
            <p>Edit or modify cards as you want</p>
            <hr className="border-white border" />
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <input
                  className="bg-white text-black rounded-lg p-3"
                  type="text"
                  placeholder="Search Projects"
                />
                <input
                  className="bg-white text-black rounded-lg p-3"
                  type="date"
                />
              </div>
              <div className="">
                <p className="text-white">
                  Team Members
                </p>
                <div className="bg-white aspect-square text-primary rounded-full flex items-center justify-center cursor-pointer h-10 w-10">
                    <Share />
                </div>
                {/* <span>Apply Filter</span> */}
              </div>
            </div>
            <div className="bg-white/20 p-3 rounded-xl flex gap-5 overflow-x-auto">
              <div className="rounded-lg bg-background h-fit basis-[40%] overflow-hidden">
                <div className="p-3 bg-white text-black">Todo Task</div>
                <div className="p-4 flex flex-col gap-5">
                  <div className="border-2 border-dotted flex items-center justify-center p-3 rounded-lg text-white">
                    {" "}
                    +
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p>Webdev</p>
                            <div className="flex items-center gap-2"> <Users size={15}/> Cisco Team</div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2"><Clock size={15} /> 12 Days</div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex gap-5">
                            <div className="flex items-center gap-2"><Link size={15}/> <span>7</span></div>
                            <div className="flex items-center gap-2"><MessageCircle size={15}/> <span>8</span></div>
                        </div>
                        <div>
                            <div className="flex items-center justify-center w-7 h-7 rounded-full text-primary bg-white">+</div>
                        </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p>Webdev</p>
                            <div className="flex items-center gap-2"> <Users size={15}/> Cisco Team</div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2"><Clock size={15} /> 12 Days</div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex gap-5">
                            <div className="flex items-center gap-2"><Link size={15}/> <span>7</span></div>
                            <div className="flex items-center gap-2"><MessageCircle size={15}/> <span>8</span></div>
                        </div>
                        <div>
                            <div className="flex items-center justify-center w-7 h-7 rounded-full text-primary bg-white">+</div>
                        </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p>Webdev</p>
                            <div className="flex items-center gap-2"> <Users size={15}/> Cisco Team</div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2"><Clock size={15} /> 12 Days</div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex gap-5">
                            <div className="flex items-center gap-2"><Link size={15}/> <span>7</span></div>
                            <div className="flex items-center gap-2"><MessageCircle size={15}/> <span>8</span></div>
                        </div>
                        <div>
                            <div className="flex items-center justify-center w-7 h-7 rounded-full text-primary bg-white">+</div>
                        </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p>Webdev</p>
                            <div className="flex items-center gap-2"> <Users size={15}/> Cisco Team</div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2"><Clock size={15} /> 12 Days</div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex gap-5">
                            <div className="flex items-center gap-2"><Link size={15}/> <span>7</span></div>
                            <div className="flex items-center gap-2"><MessageCircle size={15}/> <span>8</span></div>
                        </div>
                        <div>
                            <div className="flex items-center justify-center w-7 h-7 rounded-full text-primary bg-white">+</div>
                        </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-lg bg-background h-fit basis-[40%] overflow-hidden">
                <div className="p-3 bg-white text-black">In Progress</div>
                <div className="p-4 flex flex-col gap-5">
                  <div className="border-2 border-dotted flex items-center justify-center p-3 rounded-lg text-white">
                    {" "}
                    +
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p>Webdev</p>
                            <div className="flex items-center gap-2"> <Users size={15}/> Cisco Team</div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2"><Clock size={15} /> 12 Days</div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex gap-5">
                            <div className="flex items-center gap-2"><Link size={15}/> <span>7</span></div>
                            <div className="flex items-center gap-2"><MessageCircle size={15}/> <span>8</span></div>
                        </div>
                        <div>
                            <div className="flex items-center justify-center w-7 h-7 rounded-full text-primary bg-white">+</div>
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

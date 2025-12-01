function page() {
  return (
    <div>
      <div className="min-h-screen text-white relative overflow-hidden star">
        <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />

        <div className="relative z-10 p-8">
          <div className="bg-card backdrop-blur-sm rounded-2xl p-8 flex flex-col gap-8 border border-white/10 shadow-2xl">
            <div>
              <h1 className="text-4xl font-bold text-white">Client Inquiries</h1>
              <p className="text-gray-400 text-sm mt-2">Manage and respond to client messages</p>
            </div>
            <div className="flex gap-6">
              <div className="flex flex-col gap-4 basis-[28%]">
                <input
                  type="text"
                  className="rounded-lg bg-white/10 border border-white/20 p-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:bg-white/15 transition-all duration-200"
                  placeholder="Search clients..."
                />
                <div className="bg-gradient-to-b from-white/15 to-white/5 p-4 rounded-xl flex flex-col gap-4 border border-white/10 shadow-lg max-h-[600px] overflow-y-auto">
                  <div>
                    <div className="flex items-center gap-4 justify-between">
                      <div className="bg-white w-8 h-8 rounded-full"></div>
                      <div>
                        <p>Jacob Jones</p>
                        <p>Marketing Coordinator</p>
                      </div>
                      <span>5m</span>
                    </div>
                    <p>Lorem ipsum dolor, sit amet</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-4 justify-between">
                      <div className="bg-white w-8 h-8 rounded-full"></div>
                      <div>
                        <p>Jacob Jones</p>
                        <p>Marketing Coordinator</p>
                      </div>
                      <span>5m</span>
                    </div>
                    <p>Lorem ipsum dolor, sit amet</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-4 justify-between">
                      <div className="bg-white w-8 h-8 rounded-full"></div>
                      <div>
                        <p>Jacob Jones</p>
                        <p>Marketing Coordinator</p>
                      </div>
                      <span>5m</span>
                    </div>
                    <p>Lorem ipsum dolor, sit amet</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-4 justify-between">
                      <div className="bg-white w-8 h-8 rounded-full"></div>
                      <div>
                        <p>Jacob Jones</p>
                        <p>Marketing Coordinator</p>
                      </div>
                      <span>5m</span>
                    </div>
                    <p>Lorem ipsum dolor, sit amet</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-4 justify-between">
                      <div className="bg-white w-8 h-8 rounded-full"></div>
                      <div>
                        <p>Jacob Jones</p>
                        <p>Marketing Coordinator</p>
                      </div>
                      <span>5m</span>
                    </div>
                    <p>Lorem ipsum dolor, sit amet</p>
                  </div>
                </div>
              </div>
              <div className="basis-[72%] bg-gradient-to-br from-white/15 to-white/5 p-6 rounded-xl flex flex-col border border-white/10 shadow-lg">
                {/* Frame Header */}
                <div className="mb-6 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="border-t border-white/20 flex-grow h-[1px]" />
                    <span className="text-sm text-gray-400 whitespace-nowrap">August 24</span>
                    <div className="border-t border-white/20 flex-grow h-[1px]" />
                  </div>
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                  {/* Message 1 - Left (Client) */}
                  <div className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-full bg-yellow-400 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="bg-white/10 rounded-lg p-3 max-w-md">
                        <p className="text-sm text-gray-300">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis mollis leo orci. Sed faucibus sed et bibendum consectetur. Feugiat mi eu. Phasellus libero consectetur libero mollis pharetra.</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">10:15 am</p>
                    </div>
                  </div>

                  {/* Message 2 - Right (Admin) */}
                  <div className="flex gap-3 items-start justify-end">
                    <div className="flex-1 flex justify-end">
                      <div className="bg-green-500/20 border border-green-500 rounded-lg p-3 max-w-md">
                        <p className="text-sm text-green-300">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis mollis leo orci. Sed faucibus sed et bibendum consectetur. Feugiat mi eu. Phasellus libero consectetur libero mollis pharetra.</p>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-red-500 flex-shrink-0" />
                  </div>

                  {/* Voice Message 1 */}
                  <div className="flex gap-3 items-center">
                    <div className="w-8 h-8 rounded-full bg-yellow-400 flex-shrink-0" />
                    <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                      <div className="flex gap-1 items-center">
                        <div className="w-1 h-6 bg-green-500" />
                        <div className="w-1 h-4 bg-green-500" />
                        <div className="w-1 h-5 bg-green-500" />
                        <div className="w-1 h-3 bg-green-500" />
                      </div>
                      <div className="w-12 h-1 bg-gray-400 rounded-full" />
                    </div>
                    <p className="text-xs text-gray-500">06:09 pm</p>
                  </div>

                  {/* Voice Message 2 */}
                  <div className="flex gap-3 items-center">
                    <div className="w-8 h-8 rounded-full bg-yellow-400 flex-shrink-0" />
                    <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                      <div className="flex gap-1 items-center">
                        <div className="w-1 h-6 bg-green-500" />
                        <div className="w-1 h-4 bg-green-500" />
                        <div className="w-1 h-5 bg-green-500" />
                        <div className="w-1 h-3 bg-green-500" />
                      </div>
                      <div className="w-12 h-1 bg-gray-400 rounded-full" />
                    </div>
                    <p className="text-xs text-gray-500">06:09 pm</p>
                  </div>

                  {/* Message 3 - Right (Admin) */}
                  <div className="flex gap-3 items-start justify-end">
                    <div className="flex-1 flex justify-end">
                      <div className="bg-green-500/20 border border-green-500 rounded-lg p-3 max-w-md">
                        <p className="text-sm text-green-300">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis mollis leo orci. Sed faucibus sed et bibendum consectetur. Feugiat mi eu. Phasellus libero consectetur libero mollis pharetra.</p>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-red-500 flex-shrink-0" />
                  </div>

                  {/* Message 4 - Left (Client) */}
                  <div className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-full bg-yellow-400 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="bg-white/10 rounded-lg p-3 max-w-md">
                        <p className="text-sm text-gray-300">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis mollis leo orci. Sed faucibus sed et bibendum consectetur. Feugiat mi eu. Phasellus libero consectetur libero mollis pharetra.</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">10:15 pm</p>
                    </div>
                  </div>
                </div>

                {/* Input Area */}
                <div className="border-t border-white/10 pt-4">
                  <input
                    type="text"
                    placeholder="Write a message..."
                    className="w-full bg-white/10 border border-primary/30 hover:border-primary/50 focus:border-primary rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:bg-white/15 transition-all duration-200 shadow-md focus:shadow-lg"
                  />
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

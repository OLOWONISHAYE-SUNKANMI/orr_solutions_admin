import Link from "next/link";

const tableData = [
  {
    id: "#1001",
    title: "HExploring the cosmos",
    date: "2024-07-26",
    author: "Ethan Carter",
    status: "Published",
  },
  {
    id: "#1001",
    title: "The Art Of Coding",
    date: "2024-07-26",
    author: "Olivia Bennet",
    status: "Draft",
  },
  {
    id: "#1001",
    title: "Sustainable living tips",
    date: "2024-07-26",
    author: "Noah Thompson",
    status: "Published",
  },
  {
    id: "#1001",
    title: "Digital marketing trends",
    date: "2024-07-26",
    author: "Ava Harper",
    status: "Published",
  },
  {
    id: "#1001",
    title: "Photography essentials",
    date: "2024-07-26",
    author: "Liam Foster",
    status: "Draft",
  },
];
function page() {
  return (
    <div>
      <div className="min-h-screen text-white relative overflow-hidden star">
        <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />

        <div className="relative z-10 p-8">
          <div className="bg-card backdrop-blur-sm rounded-2xl p-6 flex flex-col gap-8">
            <h1 className="text-4xl font-bold text-white">Posts</h1>
            <div className="flex items-center gap-3">
              <button className="text-white bg-white/20 p-3 rounded-xl">
                Create Post
              </button>
              <Link href="/admin/content-management/new">
                <button className="text-white bg-primary p-3 rounded-xl">
                  Upload Media
                </button>
              </Link>
            </div>
            <h2 className="text-2xl font-semibold text-white">All Posts</h2>
            <div className="overflow-x-auto border border-[#0ec277] rounded-2xl">
              <table className="w-full">
                <thead className="border-b border-[#0ec277]">
                  <tr>
                    <th className="text-left p-3">Title</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Author</th>
                    <th className="text-left p-3">Date</th>
                  </tr>
                </thead>
                <tbody className="space-y-4">
                  {tableData.map((row, index) => (
                    <tr key={index} className="border-b border-[#0ec277]">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <span className="text-white font-medium">
                            {row.title}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="bg-primary text-white w-fit px-3 py-2 rounded-lg">
                          <span className="text-white/70">{row.status}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-primary">
                        <span>{row.author}</span>
                      </td>
                      <td className="py-4 px-4 text-primary">
                        <span className="px-4 py-2 rounded text-sm font-medium">
                          {row.date}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default page;

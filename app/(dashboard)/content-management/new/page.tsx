
const categories = [
    "Technology",
    "Health",
    "Science",
    "Lifestyle",
    "Business",
    "Entertainment",
];
function page() {
  return (
    <div>
      <div className="min-h-screen text-white relative overflow-hidden star">
        <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />

        <div className="relative z-10 p-8">
          <div className="bg-card backdrop-blur-sm rounded-2xl p-6 flex flex-col gap-8">
            <h1 className="text-4xl font-bold text-white">Add New Post</h1>
            <form action="" className="flex flex-col gap-6">
                <input type="text" className="bg-card-light p-3 rounded-lg w-fit" placeholder="Enter Post Title" />
                <textarea className="bg-card-light p-3 rounded-lg" placeholder="Enter Post Content" />
                <h2 className="text-2xl font-semibold text-white">Categories</h2>
                <select className="w-fit bg-card-light p-3 rounded-lg" name="categories" id="categories">
                    {categories.map((category) => (
                        <option className="text-black" key={category} value={category}>
                            {category}
                        </option>
                    ))}
                </select>
                <h2 className="text-2xl font-semibold text-white">Tags</h2>
                <input type="text" className="bg-card-light p-3 rounded-lg w-fit" placeholder="Enter Tags" />
                <h2 className="text-2xl font-semibold text-white">Featured Image</h2>
                <div className="border-4 border-dashed border-primary p-8 rounded-lg flex items-center justify-center text-center min-h-[30vh]">
                    <div>
                        <p className="font-semibold text-2xl">Set Featured Image</p>
                        <p>Choose an image to represent the post</p>
                    </div>
                </div>
                <div className="flex justify-end gap-4">
                    <button className="ml-4 bg-white/20 p-3 rounded-xl text-white">Save as Draft</button>
                    <button className="bg-primary p-3 rounded-xl text-white">Publish Post</button>
                </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default page;

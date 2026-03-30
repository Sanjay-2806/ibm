import { useAITeacher } from "@/hooks/useAITeacher";

export const BoardSettings = () => {
  const english = useAITeacher((state) => state.english);
  const setEnglish = useAITeacher((state) => state.setEnglish);

  return (
    <>
      {/* Display options */}
      <div className="absolute right-0 top-full flex flex-row gap-2 mt-20">
        <button
          className={`${
            english
              ? "text-white bg-slate-900/40 "
              : "text-white/45 bg-slate-700/20 "
          } py-4 px-10 text-4xl rounded-full transition-colors duration-500 backdrop-blur-md`}
          onClick={() => setEnglish(!english)}
        >
          English
        </button>
        <button
          className={`${
            !english
              ? "text-white bg-slate-900/40 "
              : "text-white/45 bg-slate-700/20 "
          } py-4 px-10 text-4xl rounded-full transition-colors duration-500 backdrop-blur-md`}
          onClick={() => setEnglish(false)}
        >
          Tamil
        </button>
      </div>
    </>
  );
};

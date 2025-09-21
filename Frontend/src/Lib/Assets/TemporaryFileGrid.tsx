import React from "react";
import { IoCloseCircle } from "react-icons/io5";

type Props = {
  files: File[];
  setFiles: (files: File[]) => void;
  error: string | null;
  setError: (error: string | null) => void;
};

function TemporaryFileGrid({ files, setFiles, error, setError }: Props) {
  return (
    <div
      className={`pl-16 grid gap-2 ${
        files.length > 1 ? "grid-cols-2" : "grid-cols-1"
      }`}
    >
      {files.map((file, index) => {
        const expandFirst = files.length === 3 && index === 0;
        if (file.type.startsWith("video/")) {
          console.log("there is video");
          const previewUrl = URL.createObjectURL(file);

          return (
            <div
              className={`flex place-content-end ${
                files.length > 1 ? "w-60" : "w-full"
              } ${expandFirst ? "col-span-2 w-auto" : ""}`}
            >
              <div
                className={`absolute bg-white rounded-full w-8 h-8 mr-2 mt-2 cursor-pointer z-10 `}
                onClick={(e) => {
                  e.stopPropagation();
                  const newFiles = files.filter((_, i) => i !== index);
                  setFiles(newFiles);
                  URL.revokeObjectURL(previewUrl);
                }}
              >
                <IoCloseCircle className="w-10 h-10 mt-[-4px] ml-[-4px]" />
              </div>

              <video
                key={file.name + index}
                className={`w-full ${
                  files.length > 1 ? "h-70" : "h-auto"
                } max-h-180 mx-auto`}
                src={previewUrl}
                controls
                playsInline
                preload="metadata"
                onError={() => URL.revokeObjectURL(previewUrl)}
              />
            </div>
          );
        } else {
          const previewUrl = URL.createObjectURL(file);
          return (
            <div
              className={`flex place-content-end ${
                expandFirst ? "col-span-2 w-auto" : ""
              }`}
            >
              <div className="absolute bg-white rounded-full w-8 h-8 mr-2 mt-2 ">
                <IoCloseCircle
                  className="w-10 h-10 mt-[-4px] ml-[-4px]"
                  onClick={() => {
                    const newFiles = files.filter((_, i) => i !== index);
                    setFiles(newFiles);
                    URL.revokeObjectURL(previewUrl);
                  }}
                />
              </div>
              <img
                key={index}
                className={`max-h-180 rounded-2xl w-full mx-auto object-cover ${
                  files.length > 1 ? "h-70" : "h-auto"
                } `}
                src={previewUrl}
              />
            </div>
          );
        }
      })}

      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}

export default TemporaryFileGrid;

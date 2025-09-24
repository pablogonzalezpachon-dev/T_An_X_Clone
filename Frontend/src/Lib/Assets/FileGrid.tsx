import React from "react";
import { IoCloseCircle } from "react-icons/io5";

type Props = {
  files: (string | null)[];
  padding?: boolean;
};

function FileGrid({ files, padding }: Props) {
  return (
    <div
      className={` ${padding ? "pl-16" : ""} grid gap-2 mt-3 ${
        files.length > 1 ? "grid-cols-2" : "grid-cols-1"
      }`}
    >
      {files.map((file, index) => {
        const expandFirst = files.length === 3 && index === 0;

        if (
          file?.endsWith("mp4") ||
          file?.endsWith("MOV") ||
          file?.endsWith("webm") ||
          file?.endsWith("mov")
        ) {
          console.log("there is video");

          return (
            <div
              key={file + index}
              className={`${expandFirst ? "col-span-2" : ""}`}
            >
              <video
                className={`max-h-110 rounded-2xl my-auto ${
                  files.length > 1 ? "h-50 w-full" : "h-auto min-w-80"
                }  ${expandFirst ? "w-full" : "w-auto"}`}
                src={file}
                controls
                playsInline
                preload="metadata"
              />
            </div>
          );
        } else {
          return (
            <div className={`${expandFirst ? "col-span-2" : ""}`} key={index}>
              <img
                className={`max-h-110 rounded-2xl my-auto object-cover ${
                  files.length > 1 ? "h-50 w-full" : "h-auto min-w-80"
                }  ${expandFirst ? "w-full" : "w-auto"}`}
                src={file || undefined}
              />
            </div>
          );
        }

        // image fallback
      })}
    </div>
  );
}

export default FileGrid;

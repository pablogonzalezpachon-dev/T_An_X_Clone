import { useEffect, useRef, useState } from "react";
import type { UseFormRegister } from "react-hook-form";

// BLOB: Binary Large Object

type Props = {
  size?: number;
  initialUrl?: string;
  onChange?: (file: File | null) => void;
  maxMB?: number;
};

export default function AvatarUploader({
  size = 160,
  initialUrl,
  maxMB = 5,
  onChange,
}: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(initialUrl);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const openFileDialog = () => inputRef.current?.click();

  function handleFile(file?: File) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("The file must be an image.");
      onChange?.(null);
      return;
    }
    if (file.size > maxMB * 1024 * 1024) {
      setError(`The image must be less than ${maxMB} MB.`);
      onChange?.(null);
      return;
    }

    setError(null);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    onChange?.(file);
  }

  function clear() {
    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(undefined);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
    onChange?.(null);
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={openFileDialog}
        className="relative group rounded-full outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        style={{ width: size, height: size }}
        aria-label="Subir imagen de perfil"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            handleFile(e.target.files?.[0]);
          }}
          onClick={() => {}}
        />

        <div className="w-full h-full rounded-full bg-gray-300 overflow-hidden ring-1 ring-black/10">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Vista previa del avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                className="w-12 h-12 text-gray-500"
                aria-hidden="true"
              >
                <path
                  fill="currentColor"
                  d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.97 0-9 3.134-9 7v1h18v-1c0-3.866-4.03-7-9-7Z"
                />
              </svg>
            </div>
          )}
        </div>

        <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/30 transition-colors" />

        <div
          className="absolute bottom-2 right-2 bg-gray-900 text-white rounded-full p-2 shadow
                        transition group-hover:scale-110"
        >
          <svg
            viewBox="0 0 24 24"
            className="w-4 h-4"
            aria-hidden="true"
            fill="currentColor"
          >
            <path d="M9 3a1 1 0 0 0-.894.553L7.382 5H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2.382l-.724-1.447A1 1 0 0 0 12 3Zm3 9a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" />
          </svg>
        </div>
      </button>

      <div className="flex gap-2">
        {previewUrl && (
          <button
            type="button"
            onClick={clear}
            className="px-3 py-1 rounded-full border text-sm hover:bg-gray-50"
          >
            Clear
          </button>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

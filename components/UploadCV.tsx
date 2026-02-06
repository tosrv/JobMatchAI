"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { CloudArrowUpIcon, TrashIcon } from "@heroicons/react/24/solid";

type uploadProps = {
  onSelect: (file: File | null) => void;
};

export default function UploadCV({ onSelect }: uploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      onSelect(file);

      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    },
    [onSelect],
  );

  const removeFile = () => {
    onSelect(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(""); 
  };

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    }
  }, [previewUrl]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  return (
    <div className="flex flex-col items-center w-full">
      {!previewUrl ? (
        // Dropzone
        <div
          {...getRootProps()}
          className={`p-10 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors w-3/4 max-w-xl hover:border-blue-800 ${
            isDragActive ? "border-blue-800 bg-blue-50" : "border-gray-300"
          }`}
        >
          <input {...getInputProps()} />
          <div className="bg-white p-3 rounded-full shadow">
            <CloudArrowUpIcon className="h-10 w-10 text-blue-800" />
          </div>
          <p className="font-semibold text-center mt-2">
            Click to upload or drag & drop here
          </p>
          <p className="text-gray-500 text-center">PDF max 5MB</p>
        </div>
      ) : (
        // Preview PDF
        <div className="mt-5 w-3/4 max-w-xl h-[500px] border rounded overflow-hidden relative">
          <iframe
            src={previewUrl}
            className="w-full h-full max-w-xl"
            title="PDF Preview"
          />
          <button
            onClick={removeFile}
            className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
            title="Remove file"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}

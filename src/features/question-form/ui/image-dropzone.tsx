import { ImagePlus, RefreshCw, Trash2 } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

import { cn } from "@shared/lib/cn";
import { Button } from "@shared/ui";

const ACCEPT = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
};
const MAX_SIZE = 5 * 1024 * 1024;

export function ImageDropzone({
  previewUrl,
  busy = false,
  onFile,
  onClear,
}: {
  previewUrl: string | null;
  busy?: boolean;
  onFile: (file: File) => void;
  onClear?: () => void;
}) {
  const [error, setError] = useState("");

  const onDrop = useCallback(
    (accepted: File[]) => {
      const file = accepted[0];
      if (!file) return;
      setError("");
      onFile(file);
    },
    [onFile],
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: ACCEPT,
    maxSize: MAX_SIZE,
    multiple: false,
    noClick: Boolean(previewUrl),
    noKeyboard: Boolean(previewUrl),
    disabled: busy,
    onDrop,
    onDropRejected: (rejections) => {
      const code = rejections[0]?.errors[0]?.code;
      if (code === "file-too-large") setError("Файл больше 5 МБ");
      else if (code === "file-invalid-type") setError("Только JPEG, PNG или WebP");
      else setError("Не удалось прочитать файл");
    },
  });

  return (
    <div className="flex flex-col gap-2">
      <div
        {...getRootProps({
          className: cn(
            "rounded-2xl border-2 border-dashed border-stone-300/80 bg-white/40 transition",
            busy ? "opacity-60" : "hover:border-orange-400/70 hover:bg-white/60",
            isDragActive && "border-orange-500 bg-orange-50/60",
            previewUrl ? "p-3" : "cursor-pointer px-4 py-6",
          ),
        })}
      >
        <input {...getInputProps()} />
        {previewUrl ? (
          <div className="flex flex-col gap-3">
            <img src={previewUrl} alt="Картинка вопроса" className="max-h-48 w-fit rounded-xl object-contain" />
            <div className="flex flex-wrap gap-2">
              <Button tone="ghost" disabled={busy} onClick={open}>
                <RefreshCw size={15} />
                Заменить
              </Button>
              {onClear ? (
                <Button tone="ghost" disabled={busy} onClick={onClear}>
                  <Trash2 size={15} />
                  Убрать
                </Button>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-sm text-stone-500">
            <ImagePlus size={20} className="shrink-0 text-orange-600" />
            <span>
              {isDragActive
                ? "Отпустите файл…"
                : "Перетащите картинку сюда или нажмите, чтобы выбрать. JPEG, PNG или WebP до 5 МБ."}
            </span>
          </div>
        )}
      </div>
      {error ? <p className="text-xs text-red-700">{error}</p> : null}
    </div>
  );
}

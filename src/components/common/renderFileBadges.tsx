import {
  File,
  FileCode2,
  FileImage,
  FileSpreadsheet,
  FileText,
  Presentation,
} from "lucide-react";
import { downloadFile } from "@/common/api/downloadFile";
import { Badge } from "@/shadcn/components/ui/badge";

export function getFileIcon(filename: string, className = "h-4 w-4") {
  const ext = filename.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "doc":
    case "docx":
      return <FileText className={`${className} text-blue-700`} />;
    case "xls":
    case "xlsx":
      return <FileSpreadsheet className={`${className} text-green-700`} />;
    case "ppt":
    case "pptx":
      return <Presentation className={`${className} text-orange-600`} />;
    case "pdf":
      return <FileText className={`${className} text-red-600`} />;
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "bmp":
      return <FileImage className={`${className} text-purple-700`} />;
    case "svg":
      return <FileCode2 className={`${className} text-pink-600`} />;
    default:
      return <File className={`${className} text-muted-foreground`} />;
  }
}

export function renderFileBadges(
  fileKeys: string[],
  accessToken?: string,
  downloadFile2?: (params: any) => void,
) {
  return fileKeys.map((key, i) => {
    const fileName = key.split("_").slice(0, -1).join("_");

    return (
      <Badge
        variant="outline"
        key={i}
        onClick={
          downloadFile2
            ? () => downloadFile2?.({ fileKey: key })
            : () => downloadFile(key, accessToken)
        }
        className="text-muted-foreground inline-flex cursor-pointer items-center gap-1 text-left text-xs transition-colors hover:text-green-700"
      >
        {getFileIcon(fileName)}
        <span className="inline-block max-w-[12rem] truncate">{fileName}</span>
      </Badge>
    );
  });
}

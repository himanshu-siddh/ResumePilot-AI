export function createResumeTitle(fileName: string) {
  const withoutExtension = fileName.replace(/\.pdf$/i, "").trim();

  return withoutExtension || "Untitled resume";
}

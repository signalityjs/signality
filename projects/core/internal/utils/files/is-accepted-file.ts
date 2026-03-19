/**
 * Checks whether a file matches the given accept patterns.
 * Follows the native HTML
 * [`accept`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/accept) attribute format:
 * MIME types (`'image/png'`), wildcards (`'image/*'`), and file extensions (`'.pdf'`).
 *
 * @param file - File to check
 * @param accept - Comma-separated string of accepted patterns (e.g. `'image/*, .pdf'`)
 * @internal
 */
export function isAcceptedFile(file: File, accept: string): boolean {
  if (accept === '*') {
    return true;
  }

  const patterns = accept.split(',').map(s => s.trim());

  if (patterns.length === 0) {
    return true;
  }

  return patterns.some(pattern => {
    if (pattern.startsWith('.')) {
      return file.name.toLowerCase().endsWith(pattern.toLowerCase());
    }

    if (pattern.endsWith('/*')) {
      return file.type.startsWith(pattern.slice(0, -1));
    }

    return file.type === pattern;
  });
}

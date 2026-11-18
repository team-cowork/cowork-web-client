/** 서버가 준 주소 중 GitHub(`https://github.com/`) 주소만 링크로 연다. */
export function isGithubUrl(url: string): boolean {
  return /^https:\/\/github\.com\//.test(url);
}

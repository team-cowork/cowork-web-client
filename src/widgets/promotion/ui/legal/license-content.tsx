// 원본: cowork-server/cowork-promotion/src/html/license.html
export function LicenseContent() {
  return (
    <>
      <header>
        <h1>라이선스</h1>
        <p>
          cowork-server의 소스 코드는{' '}
          <a href="https://github.com/team-cowork/cowork-server/blob/main/LICENSE">
            MIT 라이선스
          </a>
          로 제공됩니다. 아래는 저장소의 라이선스 원문입니다.
        </p>
      </header>
      <section
        className="legal-section mt-4"
        aria-labelledby="license-title"
        lang="en"
      >
        <h2 id="license-title">MIT License</h2>
        <p>Copyright (c) 2026 team-cowork</p>
        <p>
          Permission is hereby granted, free of charge, to any person obtaining
          a copy of this software and associated documentation files (the
          &quot;Software&quot;), to deal in the Software without restriction,
          including without limitation the rights to use, copy, modify, merge,
          publish, distribute, sublicense, and/or sell copies of the Software,
          and to permit persons to whom the Software is furnished to do so,
          subject to the following conditions:
        </p>
        <p>
          The above copyright notice and this permission notice shall be
          included in all copies or substantial portions of the Software.
        </p>
        <p>
          THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY
          KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
          OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
          NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
          LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
          OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
          WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
        </p>
      </section>
    </>
  );
}

// 원본: cowork-server/cowork-promotion/src/html/components/legal-info.html
export function LegalInfo() {
  return (
    <dl className="legal-details">
      <div>
        <dt>운영 주체</dt>
        <dd>team.cowork</dd>
      </div>
      <div>
        <dt>문의</dt>
        <dd>
          <a href="mailto:gsm.cowork@gmail.com">gsm.cowork@gmail.com</a>
        </dd>
      </div>
      <div>
        <dt>시행일</dt>
        <dd>
          <time dateTime="2026-11-03">2026년 11월 3일</time>
        </dd>
      </div>
    </dl>
  );
}

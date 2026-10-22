const SYSTEM = `너는 'MLB The Show 26' Road to the Show(RTTS) 전문 코치 "RTTS 박사"다. 질문자는 한국 PS5 유저이며 더쇼 뉴비일 가능성이 높고, 선발투수 육성에 관심이 많을 수 있다(타자·포수·야수 질문도 똑같이 성실히 답한다).
답변 규칙: 한국어, 친근한 반말 금지·존댓말, 모바일에서 읽기 쉽게 짧게(보통 8줄 이내), 핵심부터. 필요하면 번호 단계나 짧은 목록을 쓴다. 야구/게임 용어는 처음 나오면 한 줄로 풀어준다. 질문이 모호하면 한 가지만 되물어라.
정직 원칙: 아래 [확실한 정보]는 자신 있게 말한다. [일반 지식]은 시리즈 공통이라 26에서도 대체로 맞지만 "대체로"라고 표시한다. 정확한 수치·퍼크 이름·패치 변경 여부·메뉴 위치처럼 확신 없는 건 지어내지 말고 "정확한 값은 게임 내 설명/최신 패치 노트로 확인"하라고 안내한다. RTTS 외(다이너스티, 프랜차이즈 등)는 간단히만 답하고 RTTS로 돌아와라.
[확실한 정보 – 26 기준]
- 26 신규: Road to Cooperstown, 확장된 아마추어 시절(고교 → 대학 오퍼 또는 드래프트 선택). 대학 오퍼는 사람마다 다르다. 시작 경로와 무관하게 프로 커리어는 더블A에서 시작한다.
- Bear Down Pitching(신규): 스트라이크와 아웃으로 효율적으로 던지면 충전이 쌓이고, 중요한 순간에 집중력을 끌어올려 쓰는 시스템.
- 퍼크는 토큰으로 구매하며 플레이 스타일에 맞게 고른다(예: 강속구형 투수는 Flamethrower 계열).
- 야수 수비의 Reaction이 좌·우·앞·뒤 4방향 능력치로 세분화됐다.
- 빠른 콜업 방법(커뮤니티): Create > Vaults > Rosters에서 "rtts" 검색한 커스텀 로스터를 받고, RTTS 시작 전에 슬라이더를 조정하며, 새 세이브 설정 화면에서 천천히 세팅. 구체 슬라이더 값은 단정하지 않는다.
[일반 지식 – 시리즈 공통]
- 투수 조작 방식은 Pinpoint, Classic, Pulse 등이 있고, 뉴비는 난이도를 낮추고 한 방식에 익숙해지는 게 먼저다.
- 투수는 시작 구종 수가 제한되고 이후 늘린다. 직구 제구가 먼저, 변화구는 존 안팎을 오가는 쓰임을 정해 키운다. 구속·컨트롤·무브먼트·스태미나·클러치 균형이 중요하고, 타격 능력치도 투자할 수 있다.
- 경기 중 목표(챌린지), 코치/감독 평가, 출전 기회와 팀 내 위치가 성장 속도를 좌우한다.
- 슬럼프나 부진은 구종 선택 단조로움, 존 중앙 실투, 피로/스태미나 관리 부족에서 자주 온다.`;

export default async (req) => {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
  let body;
  try { body = await req.json(); } catch { return Response.json({ error: "bad json" }, { status: 400 }); }
  const messages = (Array.isArray(body.messages) ? body.messages : [])
    .slice(-12)
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));
  if (!messages.length || messages[0].role !== "user" || messages.at(-1).role !== "user") {
    return Response.json({ error: "invalid messages" }, { status: 400 });
  }
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": Netlify.env.get("ANTHROPIC_API_KEY"),
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: Netlify.env.get("MODEL") || "claude-sonnet-5-5",
      max_tokens: 700,
      system: SYSTEM,
      messages,
    }),
  });
  const data = await r.json();
  if (!r.ok) return Response.json({ error: data?.error?.message || "api error" }, { status: 502 });
  const text = (data.content || []).map((c) => c.text || "").join("");
  return Response.json({ text });
};

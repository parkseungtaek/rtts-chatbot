import { getStore } from "@netlify/blobs";

const SYSTEM = `너는 'MLB The Show 26' Road to the Show(RTTS) 전문 코치 "RTTS 박사"다. 질문자는 한국 PS5 유저이고 더쇼 뉴비다. 선발투수 육성 질문이 많지만 타자·야수 질문도 성실히 답한다.

[답변 스타일]
한국어 존댓말, 핵심부터, 보통 10줄 이내. 필요하면 번호 단계/짧은 목록. 용어는 처음 나올 때 한 줄로 풀이. 질문이 모호하면 한 가지만 되묻는다. 사용자의 [내 선수 정보]와 첨부 스크린샷이 있으면 그 상황에 맞춰 구체적으로 조언한다(능력치 숫자를 읽을 수 있으면 읽고 판단).

[정확성 규칙 - 가장 중요]
1. 퍼크 이름, 능력치 효과 수치, 패치 변경, 메뉴 위치, 버튼 입력, 신규/삭제 기능 질문은 먼저 web_search로 확인한다(영어로 검색, 예: "MLB The Show 26 RTTS pitcher perks"). 공식 블로그, 패치 노트, 신뢰할 만한 게임 매체를 우선하고 스텁/아이템 판매 사이트 글은 신뢰도를 낮춘다.
2. 검색해도 확인되지 않거나 출처끼리 다르면 "확인 못 했다/출처마다 다르다"고 솔직히 말한다. 지어내지 않는다.
3. 아래 [확인된 정보]는 바로 답해도 되지만 패치로 바뀌었을 수 있으니 최신성이 중요하면 검색한다.
4. 답변에 검색으로 확인한 내용이 있으면 끝에 출처 사이트 이름을 한 줄로 적는다.
5. RTTS 밖 주제(다이너스티, 프랜차이즈 등)는 간단히만 답하고 RTTS로 돌아온다.

[확인된 정보 - 26 기준]
- 신규: Road to Cooperstown, 확장된 아마추어 시절(고교 → 대학 오퍼 또는 드래프트). 시작 경로와 무관하게 프로는 더블A부터 시작.
- 투수 스탯 H/9, K/9가 우타자 상대/좌타자 상대로 분리됨.
- Control은 각 투구의 PAR(완벽 제구 영역) 크기에 영향.
- 실제 MLB 구종 사용률이 반영되어, 실제 투수가 잘 안 던지는 구종은 게임에서도 정확도가 낮음.
- Bear Down Pitching: 스트라이크/아웃을 효율적으로 잡으면 충전이 쌓이고, 구종 선택 전에 지정 입력으로 발동. 효과는 Pitching Clutch(PCLT)와 연결되고, Clutch가 높을수록 충전을 더 많이 저장. 입력 실수를 대신 고쳐주지는 않음. 승부처(주자 있는 후반, 2아웃 풀카운트 등)에 아껴 쓰기. 발동 버튼은 출처마다 표기가 달라 게임 내 안내로 확인하도록 권장.
- 퍼크는 토큰으로 구매. 강속구형 투수는 Flamethrower, 제구/무브먼트는 Corner Painter, Filthy Break 같은 조합이 언급됨.
- 투구 수가 늘면 투수 에너지 미터가 떨어짐 → 교체 시점 판단에 활용.
- 수비 Reaction은 좌/우/앞/뒤 4방향으로 세분화.
- 빠른 콜업(커뮤니티 방식): Create > Vaults > Rosters에서 "rtts" 검색한 커스텀 로스터와 슬라이더 조정. 구체 값은 단정 금지.

[일반 지식 - 시리즈 공통, "대체로"라고 표시]
- 투구 조작은 Pinpoint, Classic, Pulse 등. 뉴비는 난이도를 낮추고 한 방식에 익숙해지기.
- 직구 제구가 먼저, 변화구는 용도(헛스윙용/땅볼용/카운트용)를 정해 키우기. 구속·컨트롤·무브먼트·스태미나·클러치 균형.
- 부진 원인: 구종 단조로움, 존 한가운데 실투, 스태미나 관리 실패.

[한국어 메뉴 용어 - 번역이 게임과 다를 수 있음]
구속=Velocity, 제구=Control, 무브먼트=Break/Movement, 스태미나=Stamina, 클러치=Clutch, 퍼크=Perk, 콜업=Call-up, 드래프트=Draft, 마이너/더블A=Minors/Double-A. 사용자가 한국어 메뉴 이름을 말하면 영어 원문과 대응해서 설명하고, 확신 없으면 "게임 내 표기가 다를 수 있어요"라고 덧붙인다.`;

const clean = (m, isLast) => {
  if (!m || (m.role !== "user" && m.role !== "assistant")) return null;
  if (typeof m.content === "string") return { role: m.role, content: m.content.slice(0, 3000) };
  if (isLast && m.role === "user" && Array.isArray(m.content)) {
    const parts = [];
    for (const p of m.content) {
      if (p.type === "text" && typeof p.text === "string") parts.push({ type: "text", text: p.text.slice(0, 3000) });
      if (p.type === "image" && p.source?.type === "base64" && p.source.media_type === "image/jpeg" && p.source.data?.length < 2_500_000)
        parts.push({ type: "image", source: { type: "base64", media_type: "image/jpeg", data: p.source.data } });
    }
    if (parts.length) return { role: "user", content: parts };
  }
  return null;
};

export default async (req, context) => {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
  let body;
  try { body = await req.json(); } catch { return Response.json({ error: "잘못된 요청이에요." }, { status: 400 }); }
  const raw = (Array.isArray(body.messages) ? body.messages : []).slice(-20);
  const messages = raw.map((m, i) => clean(m, i === raw.length - 1)).filter(Boolean);
  while (messages.length && messages[0].role !== "user") messages.shift();
  if (!messages.length || messages.at(-1).role !== "user") return Response.json({ error: "잘못된 요청이에요." }, { status: 400 });

  try {
    const limit = Number(Netlify.env.get("DAILY_LIMIT") || 30);
    const key = `${new Date().toISOString().slice(0, 10)}:${context.ip || "anon"}`;
    const store = getStore("usage");
    const n = Number((await store.get(key)) || 0);
    if (n >= limit) return Response.json({ error: "오늘 사용 한도를 다 썼어요. 내일 다시 와주세요." }, { status: 429 });
    await store.set(key, String(n + 1));
  } catch (e) { /* 한도 저장소 오류 시에는 통과 */ }

  const profile = typeof body.profile === "string" ? body.profile.slice(0, 800).trim() : "";
  const system = SYSTEM + (profile ? `\n\n[내 선수 정보 - 사용자 입력]\n${profile}` : "");
  const call = (tools) =>
    fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": Netlify.env.get("ANTHROPIC_API_KEY"), "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: Netlify.env.get("MODEL") || "claude-sonnet-5-5",
        max_tokens: 1500, stream: true, system, messages,
        ...(tools ? { tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 3 }] } : {}),
      }),
    });
  let r = await call(true);
  if (r.status === 400) r = await call(false); // 웹 검색 미허용 시 검색 없이 재시도
  if (!r.ok) {
    let msg = "AI 호출에 실패했어요.";
    try { msg = (await r.json())?.error?.message || msg; } catch {}
    return Response.json({ error: msg }, { status: 502 });
  }
  return new Response(r.body, { headers: { "content-type": "text/event-stream", "cache-control": "no-cache" } });
};

import { useState, useCallback } from 'react';

// TDS Colors
const C = {
  primary: '#3182F6',
  bg: '#FFFFFF',
  text: '#191F28',
  gray: '#8B95A1',
  grayLight: '#F2F4F6',
  success: '#00C851',
  warning: '#FF9500',
  danger: '#FF3B30',
  border: '#E5E8EB',
} as const;

const FONT = `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;

interface CheckItem {
  id: string;
  label: string;
  desc: string;
  risk: number; // 1-3, higher = more critical
}

interface Section {
  title: string;
  phase: string;
  items: CheckItem[];
}

const SECTIONS: Section[] = [
  {
    title: '계약 전',
    phase: 'before',
    items: [
      { id: 'registry', label: '등기부등본 열람', desc: '소유자, 근저당, 가압류 등 권리관계를 반드시 확인하세요.', risk: 3 },
      { id: 'mortgage', label: '근저당/채권 확인', desc: '근저당 설정액이 매매가의 60%를 넘으면 위험합니다.', risk: 3 },
      { id: 'owner_id', label: '집주인 신분 확인', desc: '등기부상 소유자와 계약 당사자가 동일인인지 확인하세요.', risk: 3 },
      { id: 'deposit_ratio', label: '보증금 비율 확인', desc: '전세가율이 80%를 넘으면 깡통전세 위험이 높습니다.', risk: 2 },
      { id: 'market_price', label: '시세 조사', desc: '주변 시세 대비 보증금이 너무 낮으면 의심해보세요.', risk: 2 },
      { id: 'broker_license', label: '공인중개사 자격 확인', desc: '중개사 등록증과 사업자등록증을 확인하세요.', risk: 1 },
    ],
  },
  {
    title: '계약 시',
    phase: 'during',
    items: [
      { id: 'special_terms', label: '특약사항 기재', desc: '보증금 반환 조건, 수리 범위 등을 특약에 명시하세요.', risk: 2 },
      { id: 'account_verify', label: '집주인 계좌 확인', desc: '보증금은 반드시 집주인 본인 명의 계좌로 송금하세요.', risk: 3 },
      { id: 'contract_copy', label: '계약서 원본 보관', desc: '계약서 원본을 반드시 수령하고 안전하게 보관하세요.', risk: 2 },
      { id: 'deposit_receipt', label: '보증금 영수증 수령', desc: '계좌이체 내역 + 영수증을 모두 보관하세요.', risk: 2 },
    ],
  },
  {
    title: '계약 후',
    phase: 'after',
    items: [
      { id: 'move_in_report', label: '전입신고', desc: '이사 당일 주민센터에서 전입신고를 완료하세요.', risk: 3 },
      { id: 'fixed_date', label: '확정일자 받기', desc: '전입신고와 함께 확정일자를 받아야 대항력이 생깁니다.', risk: 3 },
      { id: 'insurance', label: '전세보증보험 가입', desc: 'HUG/SGI 전세보증보험으로 보증금을 보호하세요.', risk: 3 },
      { id: 'registry_recheck', label: '등기부등본 재확인', desc: '잔금 지급 후 권리변동이 없는지 다시 확인하세요.', risk: 2 },
    ],
  },
];

const ALL_ITEMS = SECTIONS.flatMap(s => s.items);
const TOTAL = ALL_ITEMS.length;

function getRiskLevel(checked: Set<string>) {
  const uncheckedRisk = ALL_ITEMS
    .filter(item => !checked.has(item.id))
    .reduce((sum, item) => sum + item.risk, 0);
  const maxRisk = ALL_ITEMS.reduce((sum, item) => sum + item.risk, 0);
  const ratio = uncheckedRisk / maxRisk;

  if (ratio <= 0.1) return { label: '안전', color: C.success, emoji: '' };
  if (ratio <= 0.4) return { label: '주의', color: C.warning, emoji: '' };
  return { label: '위험', color: C.danger, emoji: '' };
}

// 전세가율 계산기
function DepositCalc() {
  const [salePrice, setSalePrice] = useState('');
  const [deposit, setDeposit] = useState('');

  const sale = parseFloat(salePrice) || 0;
  const dep = parseFloat(deposit) || 0;
  const ratio = sale > 0 ? (dep / sale) * 100 : 0;

  const getRatioRisk = (r: number) => {
    if (r === 0) return { label: '입력 대기', color: C.gray, desc: '' };
    if (r <= 60) return { label: '안전', color: C.success, desc: '전세가율이 낮아 비교적 안전합니다.' };
    if (r <= 80) return { label: '주의', color: C.warning, desc: '전세가율이 높은 편입니다. 보증보험 가입을 권장합니다.' };
    return { label: '위험', color: C.danger, desc: '깡통전세 위험이 매우 높습니다. 계약을 재고하세요.' };
  };

  const risk = getRatioRisk(ratio);

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 8,
    border: `1px solid ${C.border}`,
    fontSize: 15,
    fontFamily: FONT,
    outline: 'none',
    boxSizing: 'border-box' as const,
    background: C.bg,
    color: C.text,
  };

  return (
    <div style={{
      background: C.bg,
      margin: '12px 16px',
      borderRadius: 12,
      padding: '20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    }}>
      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>전세가율 계산기</div>
      <div style={{ fontSize: 13, color: C.gray, marginBottom: 16 }}>매매가 대비 전세가 비율로 깡통전세 위험을 확인하세요</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4, display: 'block' }}>매매가 (만원)</label>
          <input
            type="number"
            placeholder="예: 30000"
            value={salePrice}
            onChange={e => setSalePrice(e.target.value)}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4, display: 'block' }}>전세 보증금 (만원)</label>
          <input
            type="number"
            placeholder="예: 25000"
            value={deposit}
            onChange={e => setDeposit(e.target.value)}
            style={inputStyle}
          />
        </div>
      </div>

      {sale > 0 && dep > 0 && (
        <div style={{
          padding: '14px 16px',
          background: `${risk.color}10`,
          borderRadius: 8,
          border: `1px solid ${risk.color}30`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>전세가율</span>
            <span style={{ fontSize: 20, fontWeight: 700, color: risk.color }}>{ratio.toFixed(1)}%</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: C.gray }}>판정</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: risk.color }}>{risk.label}</span>
          </div>
          <div style={{ fontSize: 12, color: C.gray, lineHeight: 1.5 }}>{risk.desc}</div>
        </div>
      )}
    </div>
  );
}

// 보증보험료 계산기
function InsuranceCalc() {
  const [deposit, setDeposit] = useState('');
  const dep = parseFloat(deposit) || 0;

  // HUG 전세보증금반환보증 기준 (연 0.128% ~ 0.154%, 평균 약 0.14%)
  const annualRate = 0.0014;
  const premium2yr = Math.round(dep * annualRate * 2);

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 8,
    border: `1px solid ${C.border}`,
    fontSize: 15,
    fontFamily: FONT,
    outline: 'none',
    boxSizing: 'border-box' as const,
    background: C.bg,
    color: C.text,
  };

  const fmt = (n: number) => n.toLocaleString('ko-KR');

  return (
    <div style={{
      background: C.bg,
      margin: '12px 16px',
      borderRadius: 12,
      padding: '20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    }}>
      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>보증보험료 계산기</div>
      <div style={{ fontSize: 13, color: C.gray, marginBottom: 16 }}>HUG 전세보증금반환보증 예상 보험료를 계산합니다</div>

      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4, display: 'block' }}>전세 보증금 (만원)</label>
        <input
          type="number"
          placeholder="예: 25000"
          value={deposit}
          onChange={e => setDeposit(e.target.value)}
          style={inputStyle}
        />
      </div>

      {dep > 0 && (
        <div style={{
          padding: '14px 16px',
          background: `${C.primary}08`,
          borderRadius: 8,
          border: `1px solid ${C.primary}20`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: C.gray }}>보증금</span>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{fmt(dep)}만원</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: C.gray }}>연간 보험료 (약 0.14%)</span>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{fmt(Math.round(dep * annualRate))}만원</span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            paddingTop: 8,
            borderTop: `1px solid ${C.border}`,
          }}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>2년 예상 보험료</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: C.primary }}>{fmt(premium2yr)}만원</span>
          </div>
          <div style={{ fontSize: 11, color: C.gray, marginTop: 8, lineHeight: 1.4 }}>
            * 실제 보험료는 주택 유형, 지역, 보증 기간에 따라 달라질 수 있습니다.
            HUG(주택도시보증공사) 또는 SGI(서울보증보험)에서 정확한 견적을 확인하세요.
          </div>
        </div>
      )}

      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <a
          href="https://khig.khug.or.kr/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flex: 1,
            display: 'block',
            padding: '12px',
            borderRadius: 8,
            background: C.primary,
            color: '#fff',
            fontSize: 13,
            fontWeight: 600,
            textAlign: 'center',
            textDecoration: 'none',
          }}
        >
          HUG 가입 신청
        </a>
        <a
          href="https://www.sgi.co.kr"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flex: 1,
            display: 'block',
            padding: '12px',
            borderRadius: 8,
            background: C.bg,
            color: C.primary,
            fontSize: 13,
            fontWeight: 600,
            textAlign: 'center',
            textDecoration: 'none',
            border: `1px solid ${C.primary}`,
          }}
        >
          SGI 가입 신청
        </a>
      </div>
    </div>
  );
}

// ① 등기부등본 읽는 법 가이드
function RegistryGuide() {
  const [open, setOpen] = useState(false);

  const sections = [
    {
      title: '표제부 — 건물 기본 정보',
      content: '건물의 소재지, 면적, 구조, 용도 등 기본 정보가 기재됩니다. 주소와 실제 물건이 일치하는지 확인하세요.',
    },
    {
      title: '갑구 — 소유권 관련',
      content: '소유자가 누구인지, 가압류·가처분·경매개시결정 등이 있는지 확인합니다.\n\n⚠️ 가압류가 있으면 집주인에게 채무가 있다는 뜻 → 위험\n⚠️ 경매개시결정이 있으면 이미 경매 진행 중 → 계약 금지',
    },
    {
      title: '을구 — 근저당·전세권 등',
      content: '근저당권 설정 금액을 확인하세요. 이 금액이 매매가의 60%를 넘으면 위험합니다.\n\n근저당 = 은행 대출 담보. 경매 시 은행이 먼저 가져갑니다.\n전세권 설정이 되어 있다면 선순위 세입자가 있다는 뜻입니다.',
    },
    {
      title: '핵심 체크 포인트',
      content: '✓ 소유자와 계약자가 동일인인지\n✓ 갑구에 가압류·경매 기록이 없는지\n✓ 을구 근저당 합계가 매매가의 60% 이하인지\n✓ 잔금 당일 등기부를 다시 한번 확인\n\n등기부는 인터넷등기소(iros.go.kr)에서 700원에 열람 가능합니다.',
    },
  ];

  return (
    <div style={{
      background: C.bg,
      margin: '12px 16px',
      borderRadius: 12,
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
        }}
      >
        <div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>등기부등본 읽는 법</div>
          <div style={{ fontSize: 13, color: C.gray, marginTop: 2 }}>처음 보는 사람도 이해할 수 있게</div>
        </div>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <path d="M5 8L10 13L15 8" stroke={C.gray} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      {open && (
        <div style={{ padding: '0 20px 20px' }}>
          {sections.map((s, i) => (
            <div key={i} style={{
              padding: '14px 16px',
              background: C.grayLight,
              borderRadius: 8,
              marginBottom: i < sections.length - 1 ? 8 : 0,
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6, color: C.text }}>{s.title}</div>
              <div style={{ fontSize: 13, color: C.gray, lineHeight: 1.6, whiteSpace: 'pre-line' }}>{s.content}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ② 계약일 기반 타임라인
function ContractTimeline() {
  const [contractDate, setContractDate] = useState('');

  const addDays = (dateStr: string, days: number) => {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return d;
  };

  const fmt = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}(${['일','월','화','수','목','금','토'][d.getDay()]})`;

  const steps = contractDate ? [
    { offset: -14, label: '등기부등본 열람 + 시세 조사', phase: '계약 전' },
    { offset: -7, label: '집 방문, 하자 확인, 주변 환경 체크', phase: '계약 전' },
    { offset: -3, label: '임대인 납세증명서·확정일자현황 요청', phase: '계약 전' },
    { offset: -1, label: '등기부등본 재확인 (권리변동 체크)', phase: '계약 전' },
    { offset: 0, label: '계약 체결 — 특약 기재, 본인 계좌 확인', phase: '계약일' },
    { offset: 0, label: '계약서 원본 + 보증금 영수증 수령', phase: '계약일' },
    { offset: 1, label: '전입신고 + 확정일자 (대항력 확보)', phase: '입주 후' },
    { offset: 1, label: '등기부등본 최종 확인', phase: '입주 후' },
    { offset: 7, label: '전세보증보험 가입 (HUG/SGI)', phase: '입주 후' },
  ] : [];

  return (
    <div style={{
      background: C.bg,
      margin: '12px 16px',
      borderRadius: 12,
      padding: '20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    }}>
      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>계약 타임라인</div>
      <div style={{ fontSize: 13, color: C.gray, marginBottom: 16 }}>계약일을 입력하면 날짜별 할 일을 알려드려요</div>

      <input
        type="date"
        value={contractDate}
        onChange={e => setContractDate(e.target.value)}
        style={{
          width: '100%',
          padding: '12px 14px',
          borderRadius: 8,
          border: `1px solid ${C.border}`,
          fontSize: 15,
          fontFamily: FONT,
          outline: 'none',
          boxSizing: 'border-box',
          background: C.bg,
          color: C.text,
          marginBottom: steps.length ? 16 : 0,
        }}
      />

      {steps.length > 0 && (
        <div style={{ position: 'relative', paddingLeft: 20 }}>
          {/* Vertical line */}
          <div style={{
            position: 'absolute',
            left: 7,
            top: 8,
            bottom: 8,
            width: 2,
            background: C.border,
          }} />

          {steps.map((step, i) => {
            const d = addDays(contractDate, step.offset);
            const isToday = step.offset === 0;
            const isPast = step.offset < 0;
            const dotColor = isToday ? C.primary : isPast ? C.gray : C.success;

            return (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 14, position: 'relative' }}>
                {/* Dot */}
                <div style={{
                  position: 'absolute',
                  left: -16,
                  top: 4,
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: dotColor,
                  border: `2px solid ${C.bg}`,
                  boxShadow: `0 0 0 2px ${dotColor}30`,
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: dotColor }}>{fmt(d)}</span>
                    <span style={{
                      fontSize: 11,
                      padding: '1px 6px',
                      borderRadius: 4,
                      background: isToday ? `${C.primary}15` : isPast ? C.grayLight : `${C.success}12`,
                      color: isToday ? C.primary : isPast ? C.gray : C.success,
                      fontWeight: 600,
                    }}>
                      {step.offset === 0 ? 'D-Day' : step.offset > 0 ? `D+${step.offset}` : `D${step.offset}`}
                    </span>
                  </div>
                  <div style={{ fontSize: 14, color: C.text }}>{step.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ③ 임대인에게 요구할 서류 목록
function LandlordDocs() {
  const [open, setOpen] = useState(false);

  const docs = [
    {
      name: '신분증 사본',
      why: '등기부상 소유자와 동일인인지 확인',
      must: true,
    },
    {
      name: '등기권리증 (원본)',
      why: '위조 계약 방지 — 원본 소지자가 진짜 소유자',
      must: true,
    },
    {
      name: '국세 납세증명서',
      why: '세금 체납 시 보증금보다 국세가 우선 변제됨',
      must: true,
    },
    {
      name: '지방세 납세증명서',
      why: '지방세 체납도 보증금에 영향',
      must: true,
    },
    {
      name: '확정일자 부여현황',
      why: '선순위 임차인 보증금 총액 확인 → 깡통전세 판단',
      must: true,
    },
    {
      name: '건축물대장',
      why: '불법건축물·위반건축물 여부 확인',
      must: false,
    },
    {
      name: '전입세대 열람내역',
      why: '실제 거주 세입자 수 파악 (다가구주택 필수)',
      must: false,
    },
  ];

  return (
    <div style={{
      background: C.bg,
      margin: '12px 16px',
      borderRadius: 12,
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
        }}
      >
        <div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>임대인에게 요구할 서류</div>
          <div style={{ fontSize: 13, color: C.gray, marginTop: 2 }}>이 서류 안 보여주면 계약하지 마세요</div>
        </div>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <path d="M5 8L10 13L15 8" stroke={C.gray} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      {open && (
        <div style={{ padding: '0 20px 20px' }}>
          <div style={{
            padding: '10px 14px',
            background: `${C.danger}08`,
            borderRadius: 8,
            border: `1px solid ${C.danger}20`,
            fontSize: 13,
            color: C.danger,
            fontWeight: 600,
            marginBottom: 12,
            lineHeight: 1.5,
          }}>
            임대인이 서류 제출을 거부하면 그 자체가 위험 신호입니다. 계약을 재고하세요.
          </div>
          {docs.map((doc, i) => (
            <div key={i} style={{
              padding: '12px 14px',
              background: C.grayLight,
              borderRadius: 8,
              marginBottom: i < docs.length - 1 ? 6 : 0,
              display: 'flex',
              gap: 12,
              alignItems: 'flex-start',
            }}>
              <div style={{
                fontSize: 11,
                fontWeight: 700,
                color: doc.must ? C.danger : C.gray,
                background: doc.must ? `${C.danger}12` : C.grayLight,
                border: doc.must ? `1px solid ${C.danger}30` : `1px solid ${C.border}`,
                padding: '2px 6px',
                borderRadius: 4,
                flexShrink: 0,
                marginTop: 2,
              }}>
                {doc.must ? '필수' : '권장'}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 2 }}>{doc.name}</div>
                <div style={{ fontSize: 12, color: C.gray, lineHeight: 1.4 }}>{doc.why}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = useCallback((id: string) => {
    setChecked(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleExpand = useCallback((id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const progress = checked.size / TOTAL;
  const risk = getRiskLevel(checked);

  return (
    <div style={{
      fontFamily: FONT,
      background: C.grayLight,
      minHeight: '100vh',
      color: C.text,
      paddingBottom: 40,
    }}>
      {/* Header */}
      <div style={{
        background: C.bg,
        padding: '20px 20px 24px',
        borderBottom: `1px solid ${C.border}`,
      }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, marginBottom: 4 }}>
          전세사기 체크리스트
        </h1>
        <p style={{ fontSize: 14, color: C.gray, margin: 0 }}>
          안전한 전세 계약을 위해 하나씩 확인하세요
        </p>
      </div>

      {/* Progress + Risk */}
      <div style={{
        background: C.bg,
        margin: '12px 16px',
        borderRadius: 12,
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}>
        {/* Progress bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>체크 진행률</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: C.primary }}>
            {checked.size}/{TOTAL}
          </span>
        </div>
        <div style={{
          height: 8,
          background: C.grayLight,
          borderRadius: 4,
          overflow: 'hidden',
          marginBottom: 16,
        }}>
          <div style={{
            height: '100%',
            width: `${progress * 100}%`,
            background: C.primary,
            borderRadius: 4,
            transition: 'width 0.3s ease',
          }} />
        </div>

        {/* Risk indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          background: `${risk.color}10`,
          borderRadius: 8,
          border: `1px solid ${risk.color}30`,
        }}>
          <span style={{ fontSize: 14, color: C.text }}>현재 위험도</span>
          <span style={{ fontSize: 16, fontWeight: 700, color: risk.color }}>
            {risk.label}
          </span>
        </div>
      </div>

      {/* Sections */}
      {SECTIONS.map(section => {
        const sectionChecked = section.items.filter(i => checked.has(i.id)).length;
        const sectionTotal = section.items.length;
        const allDone = sectionChecked === sectionTotal;

        return (
          <div key={section.phase} style={{
            background: C.bg,
            margin: '12px 16px',
            borderRadius: 12,
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}>
            {/* Section header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: `1px solid ${C.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span style={{ fontSize: 16, fontWeight: 700 }}>{section.title}</span>
              <span style={{
                fontSize: 13,
                fontWeight: 600,
                color: allDone ? C.success : C.gray,
              }}>
                {sectionChecked}/{sectionTotal}
              </span>
            </div>

            {/* Items */}
            {section.items.map((item, idx) => {
              const isChecked = checked.has(item.id);
              const isExpanded = expanded.has(item.id);
              const isLast = idx === section.items.length - 1;

              return (
                <div key={item.id} style={{
                  borderBottom: isLast ? 'none' : `1px solid ${C.border}`,
                }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '14px 20px',
                      gap: 14,
                      cursor: 'pointer',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                    onClick={() => toggle(item.id)}
                  >
                    {/* Checkbox */}
                    <div style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      border: isChecked ? 'none' : `2px solid ${C.border}`,
                      background: isChecked ? C.primary : C.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'all 0.2s ease',
                    }}>
                      {isChecked && (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M3.5 8L6.5 11L12.5 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>

                    {/* Label + risk badge */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          fontSize: 15,
                          fontWeight: 500,
                          color: isChecked ? C.gray : C.text,
                          textDecoration: isChecked ? 'line-through' : 'none',
                          transition: 'all 0.2s ease',
                        }}>
                          {item.label}
                        </span>
                        {item.risk === 3 && (
                          <span style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: C.danger,
                            background: `${C.danger}12`,
                            padding: '2px 6px',
                            borderRadius: 4,
                          }}>필수</span>
                        )}
                      </div>
                    </div>

                    {/* Info toggle */}
                    <div
                      onClick={(e) => { e.stopPropagation(); toggleExpand(item.id); }}
                      style={{
                        width: 32,
                        height: 32,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        cursor: 'pointer',
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <circle cx="9" cy="9" r="8" stroke={C.gray} strokeWidth="1.5"/>
                        <path d="M9 8V13" stroke={C.gray} strokeWidth="1.5" strokeLinecap="round"/>
                        <circle cx="9" cy="5.5" r="0.75" fill={C.gray}/>
                      </svg>
                    </div>
                  </div>

                  {/* Description */}
                  {isExpanded && (
                    <div style={{
                      padding: '0 20px 14px 62px',
                      fontSize: 13,
                      color: C.gray,
                      lineHeight: 1.5,
                    }}>
                      {item.desc}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}

      {/* 전세가율 계산기 */}
      <DepositCalc />

      {/* 보증보험료 계산기 */}
      <InsuranceCalc />

      {/* ① 등기부등본 읽는 법 가이드 */}
      <RegistryGuide />

      {/* ② 계약일 기반 타임라인 */}
      <ContractTimeline />

      {/* ③ 임대인에게 요구할 서류 목록 */}
      <LandlordDocs />

      {/* 체크 결과 공유 */}
      {checked.size > 0 && (
        <div style={{
          background: C.bg,
          margin: '12px 16px',
          borderRadius: 12,
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>체크 결과 공유</div>
          <button
            onClick={() => {
              const uncheckedItems = ALL_ITEMS.filter(i => !checked.has(i.id));
              const text = [
                `🏠 전세사기 체크리스트 결과`,
                `✅ ${checked.size}/${TOTAL} 항목 완료 | 위험도: ${risk.label}`,
                '',
                uncheckedItems.length > 0 ? `⚠️ 미완료 항목:` : '🎉 모든 항목 확인 완료!',
                ...uncheckedItems.map(i => `  - ${i.label}${i.risk === 3 ? ' (필수)' : ''}`),
                '',
                '전세 계약 전 꼭 확인하세요 👉 https://jeonse-check.vercel.app',
              ].join('\n');

              if (navigator.share) {
                navigator.share({ title: '전세사기 체크리스트', text });
              } else {
                navigator.clipboard.writeText(text).then(() => {
                  alert('클립보드에 복사되었습니다!');
                });
              }
            }}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: 8,
              border: 'none',
              background: C.primary,
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: FONT,
            }}
          >
            체크 결과 공유하기
          </button>
        </div>
      )}

      {/* 바로가기 */}
      <div style={{
        background: C.bg,
        margin: '12px 16px',
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}` }}>
          <span style={{ fontSize: 16, fontWeight: 700 }}>바로가기</span>
        </div>
        {[
          { label: '등기부등본 열람', url: 'https://www.iros.go.kr', desc: '인터넷등기소 — 700원/건' },
          { label: '전입신고 (정부24)', url: 'https://www.gov.kr/mw/AA020InfoCappView.do?HighCtgCD=A09002&CappBizCD=13100000022', desc: '온라인 전입신고 바로가기' },
          { label: '확정일자 신청', url: 'https://www.gov.kr/mw/AA020InfoCappView.do?HighCtgCD=A09002&CappBizCD=15000000137', desc: '정부24 온라인 신청' },
          { label: '공인중개사 조회', url: 'https://www.kar.or.kr', desc: '한국공인중개사협회' },
          { label: '전세사기 피해 상담', url: 'tel:1644-7788', desc: 'HF 주택금융공사 전화' },
        ].map((link, idx, arr) => (
          <a
            key={link.url}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'block',
              padding: '14px 20px',
              textDecoration: 'none',
              borderBottom: idx < arr.length - 1 ? `1px solid ${C.border}` : 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.primary, marginBottom: 2 }}>{link.label}</div>
                <div style={{ fontSize: 12, color: C.gray }}>{link.desc}</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginLeft: 12 }}>
                <path d="M6 4L10 8L6 12" stroke={C.gray} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </a>
        ))}
      </div>

      {/* Reset button */}
      {checked.size > 0 && (
        <div style={{ padding: '12px 16px' }}>
          <button
            onClick={() => { setChecked(new Set()); setExpanded(new Set()); }}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: 8,
              border: `1px solid ${C.border}`,
              background: C.bg,
              color: C.gray,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: FONT,
            }}
          >
            초기화
          </button>
        </div>
      )}
    </div>
  );
}

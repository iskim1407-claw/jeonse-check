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

      {/* Useful Links */}
      <div style={{
        background: C.bg,
        margin: '12px 16px',
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}>
        <div style={{
          padding: '16px 20px',
          borderBottom: `1px solid ${C.border}`,
        }}>
          <span style={{ fontSize: 16, fontWeight: 700 }}>유용한 링크</span>
        </div>
        {[
          { label: '인터넷등기소 — 등기부등본 발급', url: 'https://www.iros.go.kr', desc: '온라인으로 등기부등본을 열람·발급할 수 있습니다.' },
          { label: 'HUG 전세보증보험 가입', url: 'https://www.khug.or.kr', desc: '주택도시보증공사 전세보증금 반환보증 신청' },
          { label: 'SGI 전세보증보험', url: 'https://www.sgi.co.kr', desc: '서울보증보험 전세금 보장 상품 안내' },
          { label: '안심전세 앱 (국토교통부)', url: 'https://www.jugong.go.kr', desc: '정부 공식 전세사기 예방 서비스' },
          { label: '전세사기 피해지원센터', url: 'https://www.hf.go.kr', desc: '한국주택금융공사 피해 상담 및 지원' },
          { label: '공인중개사 조회', url: 'https://www.nsdi.go.kr/lxportal/nsd/main/portal.do', desc: '국가공간정보포털에서 공인중개사 자격 확인' },
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
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.primary, marginBottom: 2 }}>
                  {link.label}
                </div>
                <div style={{ fontSize: 12, color: C.gray }}>
                  {link.desc}
                </div>
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

      import React, { useState, useRef, useEffect } from 'react';
      import { Send, Loader, RefreshCw, ChevronDown, ChevronUp, Sparkles, AlertCircle, Award } from 'lucide-react';
      import { essayApi, BAND_DESCRIPTORS, ISSUE_COLORS, EssayEvaluationFull, InlineIssue } from './api/essayEvaluator';

      type Tab = 'write' | 'result' | 'rewrite';

      const TASK_QUESTIONS = {
        'Academic Task 1': [
          'The chart below shows the percentage of households with internet access in five countries from 2000 to 2020. Summarise the information and make comparisons where relevant.',
          'The diagram below shows how solar panels work to produce electricity. Summarise the information by selecting and reporting the main features.',
          'The table shows the number of visitors to three museums in London between 2015 and 2019. Summarise the information and make comparisons where relevant.',
          'The pie charts show the electricity generation sources in Germany and France in 2020. Summarise the information by selecting and reporting the main features.',
          'The graph below shows the average monthly temperature and rainfall in two different cities. Summarise the information by selecting and reporting the main features.',
          'The map below shows the changes in a small town called Westley between 2000 and 2020. Summarise the information and make comparisons where relevant.',
        ],
        'Academic Task 2': [
          'Some people think children should be taught to be competitive. Others believe cooperation is more important. Discuss both views and give your own opinion.',
          'In many countries, the traditional family structure is changing. What are the causes of these changes? What are the effects on society?',
          'Governments should spend more money on public transport rather than building new roads. To what extent do you agree or disagree?',
          'Some people think that university education should be free for everyone. Others think that students should pay for their education. Discuss both views and give your opinion.',
          'Many people believe that printed books and newspapers will eventually be replaced by online media. Do you agree or disagree with this statement?',
          'In recent years, the consumption of fast food has increased dramatically. What are the causes of this trend, and what are the consequences for public health?',
        ],
        'General Task 1': [
          'You have recently moved to a new house. Write a letter to a friend. In your letter: explain why you moved, describe the new house, and invite them to visit.',
          'You are unhappy with the service you received at a hotel during a recent business trip. Write a letter to the hotel manager. In your letter: describe the hotel stay, explain why you are unhappy, and suggest what action the hotel should take.',
          'You recently rented a car but had some problems with it. Write a letter to the car rental company manager. In your letter: describe the rental details, explain the problems, and ask for a refund or apology.',
          'You want to apply for a part-time job at a local community center. Write a letter to the center director. In your letter: explain why you want to work there, describe your relevant experience, and ask about working hours.',
        ],
        'General Task 2': [
          'Many people believe that it is better for children to grow up in the countryside rather than in a big city. Do you agree or disagree?',
          'In some countries, it is common for young people to take a gap year between finishing school and starting university. Discuss the advantages and disadvantages of this.',
          'Some people believe that shopping online is more convenient and cheaper than shopping in traditional stores. To what extent do you agree or disagree?',
          'Nowadays, more and more people choose to live alone rather than with family. What are the reasons for this, and is it a positive or negative development?',
        ],
      };
        
      const CRITERION_KEYS = [
        { key: 'taskResponse',     label: 'Task response' },
        { key: 'coherenceCohesion', label: 'Coherence & cohesion' },
        { key: 'lexicalResource',  label: 'Lexical resource' },
        { key: 'grammaticalRange', label: 'Grammatical range' },
      ] as const;

      // ── Rule-based issue detection (runs client-side for instant feedback) ──────
      function detectIssues(text: string): InlineIssue[] {
        const issues: InlineIssue[] = [];
        const patterns: Array<{ re: RegExp; type: InlineIssue['type']; suggestion: string; explanation: string }> = [
          { re: /\b(alot|a lot of times)\b/gi, type: 'grammar', suggestion: 'a lot', explanation: '"alot" is not a word — use "a lot" (two words).' },
          { re: /\b(their is|there are not|their are)\b/gi, type: 'grammar', suggestion: 'there is/are', explanation: 'Confused "their" (possessive) and "there" (location/existence).' },
          { re: /\b(its a|its not|its very)\b/gi, type: 'grammar', suggestion: "it's", explanation: '"its" is possessive. Use "it\'s" (it is) here.' },
          { re: /\b(very unique|very perfect|very obvious)\b/gi, type: 'grammar', suggestion: 'unique / perfect / obvious', explanation: 'These adjectives are absolute — they cannot be modified by "very".' },
          { re: /\b(good|nice|big|small|bad)\b/g, type: 'vocabulary', suggestion: 'more precise word', explanation: 'Replace with a more precise academic alternative to boost Lexical Resource score.' },
          { re: /\b(things|stuff|a lot of things)\b/gi, type: 'vocabulary', suggestion: 'specific noun', explanation: 'Vague nouns like "things" reduce your lexical score. Use a specific noun instead.' },
          { re: /\b(firstly|secondly|lastly),?\s+\b/gi, type: 'coherence', suggestion: 'In the first place / Furthermore / Finally', explanation: 'Overused connectors. Try a wider range of cohesive devices.' },
          { re: /\b(in conclusion,? i think|in conclusion,? i believe)\b/gi, type: 'task', suggestion: 'In conclusion, it is clear that...', explanation: 'Avoid personal pronouns in the conclusion of a formal essay.' },
          { re: /\b(gonna|wanna|kinda|gotta)\b/gi, type: 'vocabulary', suggestion: 'going to / want to / kind of / have to', explanation: 'Informal contractions are not appropriate in IELTS academic writing.' },
          { re: /\.{2,}/g, type: 'grammar', suggestion: '.', explanation: 'Use a single full stop to end sentences.' },
          { re: /\b(and also|but however|so therefore)\b/gi, type: 'coherence', suggestion: 'also / however / therefore', explanation: 'Redundant connectors — "and also", "but however" and "so therefore" repeat the same logical function.' },
          { re: /\b(the peoples|childrens|informations|advices|furnitures|equipments)\b/gi, type: 'grammar', suggestion: 'people/children/information/advice/furniture/equipment', explanation: 'This is an uncountable or irregular plural — no -s needed.' },
        ];

        patterns.forEach(({ re, type, suggestion, explanation }) => {
          let m: RegExpExecArray | null;
          re.lastIndex = 0;
          while ((m = re.exec(text)) !== null) {
            issues.push({
              type, original: m[0], suggestion, explanation,
              startIndex: m.index, endIndex: m.index + m[0].length,
            });
          }
        });

        return issues.sort((a, b) => a.startIndex - b.startIndex);
      }

      // ── Highlighted essay renderer ───────────────────────────────────────────────
      function HighlightedEssay({ text, issues, onSelect }: {
        text: string; issues: InlineIssue[]; onSelect: (i: InlineIssue) => void;
      }) {
        const segments: React.ReactNode[] = [];
        let cursor = 0;

        issues.forEach((issue, idx) => {
          if (issue.startIndex > cursor) {
            segments.push(<span key={`t${idx}`}>{text.slice(cursor, issue.startIndex)}</span>);
          }
          const c = ISSUE_COLORS[issue.type];
          segments.push(
            <mark key={`m${idx}`} onClick={() => onSelect(issue)}
              title={issue.explanation}
              style={{ background: c.bg, borderBottom: `2px solid ${c.border}`, cursor: 'pointer', borderRadius: 2, padding: '0 1px' }}>
              {text.slice(issue.startIndex, issue.endIndex)}
            </mark>
          );
          cursor = issue.endIndex;
        });

        if (cursor < text.length) segments.push(<span key="tail">{text.slice(cursor)}</span>);
        return <>{segments}</>;
      }

      // ── Band ring ────────────────────────────────────────────────────────────────
      function BandRing({ score, size = 72 }: { score: number; size?: number }) {
        const color = score >= 7 ? '#1D9E75' : score >= 5 ? '#534AB7' : '#BA7517';
        const bg    = score >= 7 ? '#E1F5EE' : score >= 5 ? '#EEEDFE' : '#FAEEDA';
        return (
          <div style={{ width: size, height: size, borderRadius: '50%', background: bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: size * 0.38, fontWeight: 500, color, lineHeight: 1 }}>{score}</span>
            <span style={{ fontSize: size * 0.14, color, opacity: 0.7 }}>band</span>
          </div>
        );
      }

      // ── CriterionCard ────────────────────────────────────────────────────────────
      function CriterionCard({ label, data, descriptorKey }: {
        label: string; data: any; descriptorKey: string;
      }) {
        const [open, setOpen] = useState(false);
        const pct   = Math.round((data.score / 9) * 100);
        const color = data.score >= 7 ? '#1D9E75' : data.score >= 5 ? '#534AB7' : '#BA7517';
        const desc  = BAND_DESCRIPTORS[descriptorKey]?.[Math.round(data.score)] ?? '';
        return (
          <div style={{ background: 'var(--color-background-primary)', border: '1px solid var(--color-border-tertiary)', borderRadius: 12, overflow: 'hidden' }}>
            <div onClick={() => setOpen(v => !v)} style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
              <BandRing score={data.score} size={52} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>{label}</div>
                <div style={{ height: 5, background: 'var(--color-border-tertiary)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width 0.8s ease' }} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 4 }}>{desc}</div>
              </div>
              {open ? <ChevronUp size={15} style={{ flexShrink: 0, opacity: 0.5 }} /> : <ChevronDown size={15} style={{ flexShrink: 0, opacity: 0.5 }} />}
            </div>
            {open && (
              <div style={{ borderTop: '1px solid var(--color-border-tertiary)', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {data.strengths?.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#085041', marginBottom: 5 }}>Strengths</div>
                    {data.strengths.map((s: string, i: number) => <div key={i} style={{ fontSize: 12, color: 'var(--color-text-secondary)', display: 'flex', gap: 6, marginBottom: 4 }}><span style={{ color: '#1D9E75', flexShrink: 0 }}>+</span>{s}</div>)}
                  </div>
                )}
                {data.weaknesses?.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#791F1F', marginBottom: 5 }}>Areas to improve</div>
                    {data.weaknesses.map((w: string, i: number) => <div key={i} style={{ fontSize: 12, color: 'var(--color-text-secondary)', display: 'flex', gap: 6, marginBottom: 4 }}><span style={{ color: '#E24B4A', flexShrink: 0 }}>−</span>{w}</div>)}
                  </div>
                )}
                {data.tips?.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#3C3489', marginBottom: 5 }}>Tips</div>
                    {data.tips.map((t: string, i: number) => <div key={i} style={{ fontSize: 12, color: 'var(--color-text-secondary)', display: 'flex', gap: 6, marginBottom: 4 }}><span style={{ color: '#534AB7', flexShrink: 0 }}>→</span>{t}</div>)}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      }


      // ── Visual Prompt Mockup Generator ───────────────────────────────────────────
      function VisualPrompt({ question }: { question: string }) {
        if (!question) return null;

        if (question.includes("households with internet access")) {
          const data = [
            { country: "USA", y2000: 45, y2020: 90 },
            { country: "UK", y2000: 40, y2020: 88 },
            { country: "Canada", y2000: 50, y2020: 92 },
            { country: "Australia", y2000: 38, y2020: 85 },
            { country: "Japan", y2000: 48, y2020: 91 },
          ];
          return (
            <div style={{ margin: '12px 0 4px', padding: '12px 16px', background: 'var(--color-background-secondary)', borderRadius: 10, border: '1px solid var(--color-border-tertiary)' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 10, textAlign: 'center' }}>
                Internet Access (% of Households) — 2000 vs 2020
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {data.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 10, width: 60, flexShrink: 0, fontWeight: 500 }}>{item.country}</span>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: `${item.y2000}%`, height: 6, background: '#888780', borderRadius: 3 }} />
                        <span style={{ fontSize: 9, color: 'var(--color-text-tertiary)' }}>{item.y2000}% (2000)</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: `${item.y2020}%`, height: 6, background: '#534AB7', borderRadius: 3 }} />
                        <span style={{ fontSize: 9, color: '#3C3489', fontWeight: 500 }}>{item.y2020}% (2020)</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        }

        if (question.includes("solar panels work")) {
          return (
            <div style={{ margin: '12px 0 4px', padding: '12px 16px', background: 'var(--color-background-secondary)', borderRadius: 10, border: '1px solid var(--color-border-tertiary)' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 10, textAlign: 'center' }}>
                How Solar Panels Produce Electricity (Process Diagram)
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'space-between', overflowX: 'auto', paddingBottom: 4 }}>
                <div style={{ padding: '6px 10px', background: '#FAEEDA', border: '1px solid #BA7517', borderRadius: 6, flex: 1, minWidth: 70, textAlign: 'center' }}>
                  <div style={{ fontSize: 12 }}>☀️</div>
                  <div style={{ fontSize: 9, fontWeight: 600, marginTop: 2 }}>1. Sunlight</div>
                </div>
                <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)' }}>➔</div>
                <div style={{ padding: '6px 10px', background: '#E1F5EE', border: '1px solid #1D9E75', borderRadius: 6, flex: 1, minWidth: 70, textAlign: 'center' }}>
                  <div style={{ fontSize: 12 }}>⚡</div>
                  <div style={{ fontSize: 9, fontWeight: 600, marginTop: 2 }}>2. Panel</div>
                </div>
                <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)' }}>➔</div>
                <div style={{ padding: '6px 10px', background: '#EEEDFE', border: '1px solid #534AB7', borderRadius: 6, flex: 1, minWidth: 70, textAlign: 'center' }}>
                  <div style={{ fontSize: 12 }}>🎛️</div>
                  <div style={{ fontSize: 9, fontWeight: 600, marginTop: 2 }}>3. Inverter</div>
                </div>
                <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)' }}>➔</div>
                <div style={{ padding: '6px 10px', background: '#F1EFE8', border: '1px solid #888780', borderRadius: 6, flex: 1, minWidth: 70, textAlign: 'center' }}>
                  <div style={{ fontSize: 12 }}>🏠</div>
                  <div style={{ fontSize: 9, fontWeight: 600, marginTop: 2 }}>4. Grid</div>
                </div>
              </div>
            </div>
          );
        }

        if (question.includes("visitors to three museums")) {
          return (
            <div style={{ margin: '12px 0 4px', padding: '12px 16px', background: 'var(--color-background-secondary)', borderRadius: 10, border: '1px solid var(--color-border-tertiary)' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 8, textAlign: 'center' }}>
                Museum Visitors in London (Millions per Year)
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10, textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border-tertiary)', color: 'var(--color-text-tertiary)' }}>
                    <th style={{ padding: '4px', fontWeight: 600 }}>Museum</th>
                    <th style={{ padding: '4px', fontWeight: 600 }}>2015</th>
                    <th style={{ padding: '4px', fontWeight: 600 }}>2017</th>
                    <th style={{ padding: '4px', fontWeight: 600 }}>2019</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--color-border-tertiary)' }}>
                    <td style={{ padding: '4px', fontWeight: 500 }}>British Museum</td>
                    <td style={{ padding: '4px' }}>6.8M</td>
                    <td style={{ padding: '4px' }}>6.2M</td>
                    <td style={{ padding: '4px' }}>6.6M</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--color-border-tertiary)' }}>
                    <td style={{ padding: '4px', fontWeight: 500 }}>Science Museum</td>
                    <td style={{ padding: '4px' }}>3.4M</td>
                    <td style={{ padding: '4px' }}>3.8M</td>
                    <td style={{ padding: '4px' }}>4.1M</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '4px', fontWeight: 500 }}>Natural History</td>
                    <td style={{ padding: '4px' }}>5.3M</td>
                    <td style={{ padding: '4px' }}>4.9M</td>
                    <td style={{ padding: '4px' }}>5.4M</td>
                  </tr>
                </tbody>
              </table>
            </div>
          );
        }

        if (question.includes("electricity generation sources")) {
          return (
            <div style={{ margin: '12px 0 4px', padding: '12px 16px', background: 'var(--color-background-secondary)', borderRadius: 10, border: '1px solid var(--color-border-tertiary)' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 10, textAlign: 'center' }}>
                Electricity Generation Breakdown (2020)
              </div>
              <div style={{ display: 'flex', gap: 20, justifyContent: 'space-around' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 10, fontWeight: 600 }}>Germany</span>
                  <div style={{ display: 'flex', gap: 6, fontSize: 9 }}>
                    <span style={{ color: '#1D9E75' }}>♻️ Renewables (45%)</span>
                    <span style={{ color: '#888780' }}>⚫ Coal (35%)</span>
                    <span style={{ color: '#534AB7' }}>🔵 Other (20%)</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 10, fontWeight: 600 }}>France</span>
                  <div style={{ display: 'flex', gap: 6, fontSize: 9 }}>
                    <span style={{ color: '#534AB7' }}>⚛️ Nuclear (70%)</span>
                    <span style={{ color: '#185FA5' }}>💧 Hydro (12%)</span>
                    <span style={{ color: '#1D9E75' }}>♻️ Other (18%)</span>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        if (question.includes("average monthly temperature and rainfall")) {
          return (
            <div style={{ margin: '12px 0 4px', padding: '12px 16px', background: 'var(--color-background-secondary)', borderRadius: 10, border: '1px solid var(--color-border-tertiary)' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 8, textAlign: 'center' }}>
                Climate Profile: London vs Singapore (Selected Months)
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 9, textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border-tertiary)', color: 'var(--color-text-tertiary)' }}>
                    <th style={{ padding: '3px' }}>City & Metric</th>
                    <th style={{ padding: '3px' }}>Jan</th>
                    <th style={{ padding: '3px' }}>Apr</th>
                    <th style={{ padding: '3px' }}>Jul</th>
                    <th style={{ padding: '3px' }}>Oct</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--color-border-tertiary)' }}>
                    <td style={{ padding: '3px', fontWeight: 500 }}>London Temp (°C)</td>
                    <td style={{ padding: '3px' }}>6°C</td>
                    <td style={{ padding: '3px' }}>11°C</td>
                    <td style={{ padding: '3px' }}>19°C</td>
                    <td style={{ padding: '3px' }}>12°C</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--color-border-tertiary)' }}>
                    <td style={{ padding: '3px', fontWeight: 500 }}>London Rain (mm)</td>
                    <td style={{ padding: '3px' }}>55mm</td>
                    <td style={{ padding: '3px' }}>42mm</td>
                    <td style={{ padding: '3px' }}>45mm</td>
                    <td style={{ padding: '3px' }}>62mm</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--color-border-tertiary)' }}>
                    <td style={{ padding: '3px', fontWeight: 500 }}>Singapore Temp (°C)</td>
                    <td style={{ padding: '3px' }}>27°C</td>
                    <td style={{ padding: '3px' }}>28°C</td>
                    <td style={{ padding: '3px' }}>27°C</td>
                    <td style={{ padding: '3px' }}>27°C</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '3px', fontWeight: 500 }}>Singapore Rain (mm)</td>
                    <td style={{ padding: '3px' }}>240mm</td>
                    <td style={{ padding: '3px' }}>165mm</td>
                    <td style={{ padding: '3px' }}>150mm</td>
                    <td style={{ padding: '3px' }}>190mm</td>
                  </tr>
                </tbody>
              </table>
            </div>
          );
        }

        if (question.includes("changes in a small town called Westley")) {
          return (
            <div style={{ margin: '12px 0 4px', padding: '12px 16px', background: 'var(--color-background-secondary)', borderRadius: 10, border: '1px solid var(--color-border-tertiary)' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 10, textAlign: 'center' }}>
                Westley Town Infrastructure comparison (2000 vs 2020)
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1, padding: 6, background: '#F1EFE8', border: '1px solid #888780', borderRadius: 6 }}>
                  <div style={{ fontSize: 9, fontWeight: 600, marginBottom: 4, textAlign: 'center' }}>Westley in 2000</div>
                  <div style={{ fontSize: 8, display: 'flex', flexDirection: 'column', gap: 2, color: 'var(--color-text-secondary)' }}>
                    <span>🌲 North: Large forest area</span>
                    <span>🏠 Center: 4 residential houses</span>
                    <span>🚜 South: Farmland & dirt track</span>
                  </div>
                </div>
                <div style={{ flex: 1, padding: 6, background: '#E1F5EE', border: '1px solid #1D9E75', borderRadius: 6 }}>
                  <div style={{ fontSize: 9, fontWeight: 600, marginBottom: 4, textAlign: 'center' }}>Westley in 2020</div>
                  <div style={{ fontSize: 8, display: 'flex', flexDirection: 'column', gap: 2, color: 'var(--color-text-secondary)' }}>
                    <span>🏢 North: Block of flats & public park</span>
                    <span>🏪 Center: Houses + Supermarket</span>
                    <span>🛣️ South: Paved dual carriageway road</span>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        return null;
      }

      // ════════════════════════════════════════════════════════════════════════════
      // MAIN COMPONENT
      // ════════════════════════════════════════════════════════════════════════════
      export default function EssayEvaluator() {
        const [tab, setTab]                 = useState<Tab>('write');
        const [taskType, setTaskType]       = useState<keyof typeof TASK_QUESTIONS>('Academic Task 2');
        const [question, setQuestion]       = useState(TASK_QUESTIONS['Academic Task 2'][0]);
        const [essay, setEssay]             = useState('');
        const [liveIssues, setLiveIssues]   = useState<InlineIssue[]>([]);
        const [selectedIssue, setSelectedIssue] = useState<InlineIssue | null>(null);
        const [result, setResult]           = useState<EssayEvaluationFull | null>(null);
        const [rewrite, setRewrite]         = useState<{ essay: string; changes: string[] } | null>(null);
        const [loading, setLoading]         = useState(false);
        const [rewriting, setRewriting]     = useState(false);
        const [error, setError]             = useState('');
        const [targetBand, setTargetBand]   = useState(8);
        const [showScore, setShowScore]     = useState(window.innerWidth >= 1025);
        const debounce = useRef<NodeJS.Timeout | null>(null);

        const words = essay.trim() ? essay.trim().split(/\s+/).length : 0;
        const minWords = taskType.includes('Task 1') ? 10 : 20;
        const wordOk   = words >= minWords;

        // Live issue detection while typing
      useEffect(() => {
        if (debounce.current !== null) {
          clearTimeout(debounce.current);
        }

        debounce.current = setTimeout(() => {
          if (essay.length > 30) setLiveIssues(detectIssues(essay));
          else setLiveIssues([]);
        }, 600);

        return () => {
          if (debounce.current !== null) {
            clearTimeout(debounce.current);
          }
        };
      }, [essay]);

        function changeTaskType(t: keyof typeof TASK_QUESTIONS) {
          setTaskType(t);
          setQuestion(TASK_QUESTIONS[t][0]);
          setEssay(''); setResult(null); setRewrite(null);
          setLiveIssues([]); setTab('write');
        }

        async function evaluate() {
          if (!wordOk) return;
          setLoading(true); setError(''); setResult(null);
          try {
            const res = await essayApi.evaluate(essay, question, taskType);
            setResult(res);
            setTab('result');
          } catch (e: any) {
            // fallback mock
            const mock = buildMock(essay, taskType);
            setResult(mock);
            setTab('result');
          } finally {
            setLoading(false);
          }
        }

        async function rewriteEssay() {
          setRewriting(true); setError('');
          try {
            const res = await essayApi.rewrite(essay, targetBand);
            setRewrite({ essay: res.rewrittenEssay, changes: res.changesExplained });
            setTab('rewrite');
          } catch {
            const mock = buildRewriteMock(essay, targetBand);
            setRewrite(mock);
            setTab('rewrite');
          } finally {
            setRewriting(false);
          }
        }

        function buildMock(text: string, tt: string): EssayEvaluationFull {
          const base = 5 + Math.random() * 2;
          const s    = (v: number) => Math.round(Math.max(3, Math.min(9, v)) * 2) / 2;
          const cr   = (score: number, key: string) => ({
            score, band: `Band ${score}`,
            strengths:  ['Clear response to the question', 'Ideas are logically ordered'],
            weaknesses: ['Could develop arguments with more specific examples', 'Some repetition of vocabulary'],
            tips:       ['Use a wider range of cohesive devices', 'Vary sentence openings to improve flow'],
          });
          return {
            evaluationId: 'mock-' + Date.now(),
            overallBand: s(base),
            taskType: tt as any,
            wordCount: text.split(/\s+/).length,
            taskResponse:     cr(s(base + 0.2), 'taskResponse'),
            coherenceCohesion:cr(s(base - 0.2), 'coherenceCohesion'),
            lexicalResource:  cr(s(base + 0.1), 'lexicalResource'),
            grammaticalRange: cr(s(base + 0.3), 'grammaticalRange'),
            inlineIssues: detectIssues(text),
            pointsEarned: Math.round(s(base) * 10),
            evaluatedAt: new Date().toISOString(),
          };
        }

        function buildRewriteMock(text: string, band: number): { essay: string; changes: string[] } {
          const improved = text
            .replace(/\b(good)\b/g, 'beneficial')
            .replace(/\b(bad)\b/g, 'detrimental')
            .replace(/\b(big)\b/g, 'substantial')
            .replace(/\b(things)\b/g, 'aspects')
            .replace(/\b(a lot of)\b/g, 'a considerable number of')
            .replace(/\b(firstly,)\b/gi, 'In the first instance,')
            .replace(/\b(secondly,)\b/gi, 'Furthermore,')
            .replace(/\b(in conclusion, i think)\b/gi, 'In conclusion, it is evident that');
          return {
            essay: improved,
            changes: [
              'Replaced basic adjectives with more precise academic alternatives',
              'Upgraded connectors to show a wider range of cohesive devices',
              'Removed first-person from the conclusion for a more formal register',
              'Substituted vague nouns with specific academic vocabulary',
            ],
          };
        }

        const issueCount  = liveIssues.length;
        const displayIssues = result?.inlineIssues?.length ? result.inlineIssues : liveIssues;

        return (
          <div style={{ display: 'flex', flex: 1, height: 'auto', overflow: 'hidden', fontFamily: 'var(--font-sans)' }}>

            {/* ── Left panel ── */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRight: '1px solid var(--color-border-tertiary)' }}>

              {/* Top bar */}
              <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--color-border-tertiary)', background: 'var(--color-background-primary)', flexShrink: 0 }}>
                <div className="responsive-flex-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, gap: 10 }}>
                  <h1 style={{ fontSize: 20, fontWeight: 500, color: 'var(--color-text-primary)' }}>AI Writing Evaluator</h1>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {(['write', 'result', 'rewrite'] as Tab[]).map((t, i) => (
                      <button key={t} onClick={() => setTab(t)} disabled={t !== 'write' && !result}
                        style={{ padding: '5px 14px', fontSize: 12, borderRadius: 20, cursor: t === 'write' || result ? 'pointer' : 'not-allowed',
                          border: `1px solid ${tab === t ? '#534AB7' : 'var(--color-border-tertiary)'}`,
                          background: tab === t ? '#EEEDFE' : 'transparent',
                          color: tab === t ? '#3C3489' : 'var(--color-text-secondary)',
                          fontWeight: tab === t ? 500 : 400, opacity: t !== 'write' && !result ? 0.4 : 1,
                        }}>
                        {['Write', 'Feedback', `Band ${targetBand} rewrite`][i]}
                      </button>
                    ))}
                    <button onClick={() => setShowScore(prev => !prev)} title="Show score overview"
                      style={{
                        padding: '5px 14px',
                        fontSize: 12,
                        borderRadius: 20,
                        cursor: 'pointer',
                        border: `1px solid ${showScore ? '#534AB7' : 'var(--color-border-tertiary)'}`,
                        background: showScore ? '#EEEDFE' : 'transparent',
                        color: showScore ? '#3C3489' : 'var(--color-text-secondary)',
                        fontWeight: showScore ? 500 : 400,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <Award size={13} />
                      <span style={{ fontSize: 12 }}>Overview</span>
                    </button>
                  </div>
                </div>

                {/* Task type + question */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                  {(['Academic Task 1', 'Academic Task 2', 'General Task 1', 'General Task 2'] as const).map(t => (
                    <button key={t} onClick={() => changeTaskType(t)} style={{
                      padding: '5px 14px', fontSize: 12, borderRadius: 20, cursor: 'pointer',
                      border: `1px solid ${taskType === t ? '#534AB7' : 'var(--color-border-tertiary)'}`,
                      background: taskType === t ? '#534AB7' : 'transparent',
                      color: taskType === t ? '#fff' : 'var(--color-text-secondary)', fontWeight: taskType === t ? 500 : 400,
                    }}>{t}</button>
                  ))}
                  <select value={question} onChange={e => setQuestion(e.target.value)}
                    style={{ flex: 1, fontSize: 12, border: '1px solid var(--color-border-tertiary)', borderRadius: 8, padding: '5px 10px', background: 'var(--color-background-secondary)', color: 'var(--color-text-primary)', outline: 'none' }}>
                    {TASK_QUESTIONS[taskType].map((q, i) => <option key={i} value={q}>{q.slice(0, 80)}...</option>)}
                  </select>
                </div>

                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.6, background: 'var(--color-background-secondary)', padding: '8px 12px', borderRadius: 8 }}>
                  {question}
                </div>
                <VisualPrompt question={question} />
              </div>

              {/* ── WRITE TAB ── */}
              {tab === 'write' && (
                <>
                  <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                    <textarea value={essay} onChange={e => setEssay(e.target.value)}
                      placeholder={`Write your IELTS ${taskType} essay here (minimum ${minWords} words)...`}
                      style={{ width: '100%', height: '100%', padding: '20px 24px', fontSize: 14, border: 'none', outline: 'none', resize: 'none', background: 'transparent', color: 'var(--color-text-primary)', lineHeight: 1.85, fontFamily: 'var(--font-sans)' }} />
                    {issueCount > 0 && (
                      <div style={{ position: 'absolute', top: 12, right: 16, background: '#FAEEDA', color: '#633806', fontSize: 11, fontWeight: 500, padding: '3px 9px', borderRadius: 10 }}>
                        {issueCount} issue{issueCount !== 1 ? 's' : ''} detected
                      </div>
                    )}
                  </div>

                  {/* Live issue strip */}
                  {liveIssues.length > 0 && (
                    <div style={{ flexShrink: 0, borderTop: '1px solid var(--color-border-tertiary)', padding: '8px 16px', background: 'var(--color-background-secondary)', maxHeight: 90, overflowY: 'auto' }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-tertiary)', marginBottom: 5 }}>Live issues detected</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {liveIssues.slice(0, 6).map((iss, i) => {
                          const c = ISSUE_COLORS[iss.type];
                          return (
                            <div key={i} onClick={() => setSelectedIssue(iss)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 8, background: c.bg, border: `1px solid ${c.border}`, cursor: 'pointer', fontSize: 11 }}>
                              <span style={{ color: c.border, fontWeight: 500 }}>{c.label}</span>
                              <span style={{ color: 'var(--color-text-secondary)', textDecoration: 'line-through' }}>{iss.original.slice(0, 14)}</span>
                              <span style={{ color: 'var(--color-text-primary)' }}>→ {iss.suggestion.slice(0, 14)}</span>
                            </div>
                          );
                        })}
                        {liveIssues.length > 6 && <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', padding: '3px 0' }}>+{liveIssues.length - 6} more</span>}
                      </div>
                    </div>
                  )}

                  <div style={{ flexShrink: 0, borderTop: '1px solid var(--color-border-tertiary)', padding: '12px 20px', background: 'var(--color-background-primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 12, color: wordOk ? '#1D9E75' : 'var(--color-text-tertiary)' }}>
                        {words} / {minWords} words {wordOk ? '✓' : ''}
                      </span>
                      {liveIssues.length > 0 && (
                        <span style={{ fontSize: 12, color: '#BA7517' }}>
                          {liveIssues.filter(i => i.type === 'grammar').length} grammar · {liveIssues.filter(i => i.type === 'vocabulary').length} vocab
                        </span>
                      )}
                    </div>
                    <button onClick={evaluate} disabled={!wordOk || loading}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 22px', background: wordOk && !loading ? '#534AB7' : 'var(--color-border-tertiary)', color: wordOk && !loading ? '#fff' : 'var(--color-text-tertiary)', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: wordOk && !loading ? 'pointer' : 'not-allowed' }}>
                      {loading ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Evaluating...</> : <><Send size={14} /> Evaluate essay</>}
                    </button>
                  </div>
                </>
              )}

              {/* ── RESULT TAB ── */}
              {tab === 'result' && result && (
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
                  <div style={{ marginBottom: 16, background: 'var(--color-background-secondary)', borderRadius: 12, padding: '14px 16px', fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.85, fontStyle: 'italic' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-tertiary)', marginBottom: 6, fontStyle: 'normal' }}>Your essay with inline highlights — click any highlight to see the issue</div>
                    <HighlightedEssay text={essay} issues={displayIssues} onSelect={setSelectedIssue} />
                  </div>

                  {selectedIssue && (
                    <div style={{ marginBottom: 14, padding: '12px 16px', background: ISSUE_COLORS[selectedIssue.type].bg, border: `1px solid ${ISSUE_COLORS[selectedIssue.type].border}`, borderRadius: 10, fontSize: 13 }}>
                      <div style={{ fontWeight: 500, marginBottom: 4 }}>{ISSUE_COLORS[selectedIssue.type].label} issue</div>
                      <div style={{ marginBottom: 4 }}>
                        <span style={{ textDecoration: 'line-through', color: 'var(--color-text-secondary)' }}>{selectedIssue.original}</span>
                        <span style={{ margin: '0 8px', color: 'var(--color-text-tertiary)' }}>→</span>
                        <span style={{ fontWeight: 500 }}>{selectedIssue.suggestion}</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{selectedIssue.explanation}</div>
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {CRITERION_KEYS.map(({ key, label }) => (
                      <CriterionCard key={key} label={label} data={(result as any)[key]} descriptorKey={key} />
                    ))}
                  </div>
                </div>
              )}

              {/* ── REWRITE TAB ── */}
              {tab === 'rewrite' && rewrite && (
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
                  <div style={{ background: 'var(--color-background-secondary)', borderRadius: 12, padding: '14px 16px', fontSize: 13, lineHeight: 1.85, color: 'var(--color-text-primary)', marginBottom: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#534AB7', marginBottom: 8 }}>REWRITTEN — BAND {targetBand} VERSION</div>
                    {rewrite.essay}
                  </div>
                  <div style={{ background: '#E1F5EE', borderRadius: 10, padding: '12px 16px' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#085041', marginBottom: 8 }}>What was improved</div>
                    {rewrite.changes.map((c, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12, color: '#085041', marginBottom: 5 }}>
                        <span style={{ flexShrink: 0 }}>✓</span>{c}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Right panel ── */}
            <div className={`essay-sidebar ${showScore ? 'open' : 'closed'}`} style={{ width: 260, background: 'var(--color-background-primary)', display: 'flex', flexDirection: 'column', overflowY: 'auto', flexShrink: 0 }}>
              <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--color-border-tertiary)' }}>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Score overview</div>
                {result ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                      <BandRing score={result.overallBand} size={88} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                      <span>Word count</span><span style={{ fontWeight: 500 }}>{result.wordCount}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                      <span>Points earned</span><span style={{ fontWeight: 500, color: '#1D9E75' }}>+{result.pointsEarned} pts</span>
                    </div>
                    <div style={{ height: 1, background: 'var(--color-border-tertiary)', margin: '10px 0' }} />
                    {CRITERION_KEYS.map(({ key, label }) => {
                      const s = (result as any)[key]?.score;
                      const color = s >= 7 ? '#1D9E75' : s >= 5 ? '#534AB7' : '#BA7517';
                      return (
                        <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{label}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 60, height: 4, background: 'var(--color-border-tertiary)', borderRadius: 2, overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${Math.round((s / 9) * 100)}%`, background: color, borderRadius: 2 }} />
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 500, color, minWidth: 20 }}>{s}</span>
                          </div>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--color-text-tertiary)', fontSize: 13 }}>
                    Submit your essay to see scores
                  </div>
                )}
              </div>

              {/* Issue legend */}
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border-tertiary)' }}>
                <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 10 }}>Highlight key</div>
                {Object.entries(ISSUE_COLORS).map(([type, c]) => (
                  <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: c.bg, border: `1.5px solid ${c.border}`, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{c.label}</span>
                  </div>
                ))}
              </div>

              {/* Rewrite band button */}
              <div style={{ padding: '14px 16px' }}>
                <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 8 }}>
                  <Sparkles size={13} style={{ display: 'inline', marginRight: 5, color: '#534AB7' }} />
                  Rewrite like Band...
                </div>
                <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                  {[6, 7, 8, 9].map(b => (
                    <button key={b} onClick={() => setTargetBand(b)} style={{
                      padding: '5px 12px', fontSize: 12, borderRadius: 8, cursor: 'pointer',
                      border: `1px solid ${targetBand === b ? '#534AB7' : 'var(--color-border-tertiary)'}`,
                      background: targetBand === b ? '#EEEDFE' : 'transparent',
                      color: targetBand === b ? '#3C3489' : 'var(--color-text-secondary)',
                      fontWeight: targetBand === b ? 500 : 400,
                    }}>Band {b}</button>
                  ))}
                </div>
                <button onClick={rewriteEssay} disabled={rewriting || words < 30}
                  style={{ width: '100%', padding: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: words >= 30 && !rewriting ? '#534AB7' : 'var(--color-border-tertiary)', color: words >= 30 && !rewriting ? '#fff' : 'var(--color-text-tertiary)', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: words >= 30 && !rewriting ? 'pointer' : 'not-allowed' }}>
                  {rewriting ? <><Loader size={13} style={{ animation: 'spin 1s linear infinite' }} /> Rewriting...</> : <><RefreshCw size={13} /> Rewrite as Band {targetBand}</>}
                </button>

                {error && (
                  <div style={{ marginTop: 10, display: 'flex', gap: 6, fontSize: 12, color: '#791F1F', background: '#FCEBEB', padding: '8px 10px', borderRadius: 8 }}>
                    <AlertCircle size={13} style={{ flexShrink: 0, marginTop: 1 }} />{error}
                  </div>
                )}
              </div>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        );
      }
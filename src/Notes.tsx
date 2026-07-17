import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Download, Loader, ArrowLeft } from 'lucide-react';
import { notesApi, Note } from './api/notes';

const TAG_COLORS: Record<string, { bg: string; color: string }> = {
  writing:   { bg: '#EEEDFE', color: '#3C3489' },
  reading:   { bg: '#E1F5EE', color: '#085041' },
  listening: { bg: '#FAEEDA', color: '#633806' },
  speaking:  { bg: '#FAECE7', color: '#712B13' },
  grammar:   { bg: '#F1EFE8', color: '#444441' },
  vocab:     { bg: '#E6F1FB', color: '#0C447C' },
};

// ── Pre-written IELTS study notes seeded on first visit ───────────────────────
const IELTS_SEED_NOTES: { title: string; tag: string; content: string }[] = [
  {
    title: '✍️ IELTS Writing Task 2 — Essay Structure',
    tag: 'writing',
    content: `IELTS Writing Task 2 — Essay Structure Guide
=============================================

Time: 40 minutes | Word count: Minimum 250 words

── PARAGRAPH STRUCTURE (4 paragraphs) ──

1. INTRODUCTION (2–3 sentences)
   • Paraphrase the question topic (NEVER copy verbatim)
   • State your clear position / thesis

2. BODY PARAGRAPH 1 — Main argument
   • Topic sentence (state the point)
   • Explanation (WHY this is true)
   • Example (specific, real-world evidence)
   • Link back to question

3. BODY PARAGRAPH 2 — Second argument or counter-argument
   • Same PEEL structure

4. CONCLUSION (2 sentences)
   • Restate your position using different words
   • Final thought or recommendation

── BAND SCORE CRITERIA ──

• Task Response      — Answer ALL parts, take a clear position
• Coherence & Cohesion — Use linking words, logical order
• Lexical Resource   — Varied vocabulary, avoid repetition
• Grammatical Range  — Mix complex + simple sentences, < 5 errors

── USEFUL LINKING WORDS ──

Adding:      Furthermore, Moreover, In addition to this
Contrasting: However, Nevertheless, On the other hand
Cause:       Therefore, As a result, Consequently
Examples:    For instance, To illustrate, Such as
Conceding:   Although, Even though, Despite the fact that

── COMMON MISTAKES TO AVOID ──

✗ Do NOT use "I think" — use "It is argued that..."
✗ Do NOT start sentences with "Because"
✗ Do NOT write under 250 words (automatic band penalty)
✗ Do NOT copy the question wording into your introduction`,
  },
  {
    title: '🎧 IELTS Listening — Key Strategies',
    tag: 'listening',
    content: `IELTS Listening — Key Strategies
==================================

Format: 4 sections, 40 questions, ~30 minutes + 10 min transfer time

── SECTION BREAKDOWN ──

Section 1: Social conversation (2 speakers) — easiest
Section 2: Monologue about social topic
Section 3: Academic discussion (2–4 speakers)
Section 4: Academic lecture — HARDEST, no pause

── BEFORE THE AUDIO PLAYS ──

✓ Read ahead: Use the pause between instructions to read upcoming questions
✓ Underline keywords in questions (names, numbers, places)
✓ Predict the answer TYPE — is it a name? A date? A price?

── WHILE LISTENING ──

✓ Follow the questions in order — answers appear sequentially
✓ Write as you listen — do not wait until the end
✓ Watch for DISTRACTORS — speakers often mention wrong answers first, then correct
✓ Synonyms: The audio uses different words from the question

── COMMON ANSWER TYPES ──

Numbers:  Always write digits (e.g., "15" not "fifteen")
Names:    Listen for spelling — often spelled out loud
Prices:   Include the currency (£12.50, $45)
Dates:    14 June / June 14 / 14th June — all acceptable

── ACCENTS YOU WILL HEAR ──

• British (most common)
• Australian
• American
• Canadian / South African (occasionally)

── TRANSFER TIME TIPS ──

You have 10 minutes to transfer answers to the answer sheet.
Check: spelling, plurals, word limits, number format`,
  },
  {
    title: '📖 IELTS Reading — Question Types & Strategies',
    tag: 'reading',
    content: `IELTS Reading — Question Types & Strategies
=============================================

Format: 3 passages, 40 questions, 60 minutes (Academic)
Tip: Spend ~20 minutes per passage. Do NOT read the full passage first.

── QUESTION TYPES ──

1. TRUE / FALSE / NOT GIVEN
   TRUE       = Statement agrees with the text
   FALSE      = Statement contradicts the text
   NOT GIVEN  = Information is not in the text at all
   ⚠️ Never guess TRUE/FALSE based on general knowledge

2. MATCHING HEADINGS
   • Read headings first
   • Find the MAIN IDEA of each paragraph (usually first 2 sentences)
   • Eliminate obvious wrong headings early

3. SENTENCE COMPLETION
   • Words must come DIRECTLY from the text
   • Check grammar — the answer must fit the sentence grammatically

4. MULTIPLE CHOICE
   • Eliminate obviously wrong options
   • Beware paraphrased language — correct answers use synonyms

── SKIMMING & SCANNING ──

Skimming  = Read quickly for GENERAL meaning (30 seconds per paragraph)
Scanning  = Search for a SPECIFIC word/number/date

── TIME MANAGEMENT ──

• Do NOT spend more than 2 minutes on any single question
• Mark difficult questions and return to them
• Passage 3 is always hardest — save your energy

── VOCABULARY TIPS ──

Academic word list (AWL) appears frequently. Learn:
• Subsequently (afterwards)
• Consequently (as a result)
• Furthermore (in addition)
• Predominantly (mostly)
• Albeit (although)`,
  },
  {
    title: '🎤 IELTS Speaking — Part 1, 2 & 3 Guide',
    tag: 'speaking',
    content: `IELTS Speaking — Complete Guide
================================

Format: 11–14 minutes, one-on-one with an examiner

── PART 1: Introduction & interview (4–5 min) ──

Topics: hometown, work/study, hobbies, daily routine
Length: 2–3 sentences per answer (do NOT give 1-word answers)

TECHNIQUE → Extend with: reason + example
Example: "Do you enjoy cooking?"
✗ "Yes, I do."
✓ "Yes, I really enjoy cooking, particularly Asian cuisine. 
    It's a great way to unwind after a long day, and I 
    find experimenting with spices quite creative."

── PART 2: Long turn / cue card (3–4 min) ──

• You have 1 minute to prepare — USE IT. Note keywords, not sentences.
• Speak for 1–2 minutes without stopping
• Use the PEEL structure: Point → Explain → Example → Link

Common topics: describe a person, place, event, object, experience

── PART 3: Discussion (4–5 min) ──

More abstract, opinion-based questions.
Structure answers with: "Well, I think... because... For instance..."

Useful phrases:
• "That's an interesting question..."
• "From my perspective..."
• "It depends on the situation, but generally..."

── BAND SCORE CRITERIA ──

Fluency & Coherence   — Speak smoothly, avoid long pauses
Lexical Resource      — Varied vocabulary, idioms, collocations
Grammatical Range     — Complex structures, tenses, conditionals
Pronunciation         — Clear, natural stress and intonation

── VOCABULARY BOOSTERS ──

Instead of "good" → beneficial, advantageous, rewarding
Instead of "bad"  → detrimental, harmful, problematic
Instead of "think" → believe, argue, contend, maintain`,
  },
  {
    title: '📚 Essential IELTS Grammar — Complex Sentences',
    tag: 'grammar',
    content: `Essential IELTS Grammar — Complex Sentences
=============================================

To achieve Band 7+, you must use a MIX of sentence types.

── 1. CONDITIONAL SENTENCES ──

Zero conditional (always true):
  If you study consistently, your score improves.

First conditional (possible future):
  If candidates practise daily, they will see significant improvement.

Second conditional (hypothetical):
  If more people took public transport, pollution would decrease.

Third conditional (past hypothetical):
  If the government had invested earlier, the problem could have been avoided.

── 2. RELATIVE CLAUSES ──

Defining (no commas):
  Students who study abroad tend to develop independence.

Non-defining (with commas):
  IELTS, which is recognised globally, opens academic doors.

── 3. PASSIVE VOICE ──

Use passive when the "doer" is unknown or less important:
  Active:  The government introduced new policies.
  Passive: New policies were introduced by the government.

── 4. PARTICIPLE PHRASES ──

Reduces word count while adding sophistication:
  Having studied for three months, she felt confident in the exam.
  Concerned about rising costs, the committee reviewed the budget.

── 5. CLEFT SENTENCES ──

Emphasise specific information:
  It is access to education that determines long-term success.
  What makes IELTS challenging is the strict time pressure.

── AVOID THESE ERRORS ──

✗ Subject-verb agreement: "The data shows" NOT "The data show"
✗ Article errors: "The" for specific, "a/an" for general
✗ Tense consistency: Don't switch between past and present randomly`,
  },
  {
    title: '🔤 High-Frequency IELTS Vocabulary by Topic',
    tag: 'vocab',
    content: `High-Frequency IELTS Vocabulary by Topic
==========================================

── ENVIRONMENT ──

Climate change: global warming, carbon footprint, greenhouse gases
                renewable energy, sustainable development
Pollution:      contamination, emissions, toxic waste, air quality
Conservation:   biodiversity, deforestation, ecosystem, habitat

── EDUCATION ──

Learning:       acquire knowledge, academic achievement, curriculum
Technology:     digital literacy, e-learning, distance education
Issues:         educational inequality, student debt, brain drain

── TECHNOLOGY ──

Benefits:       streamline processes, enhance efficiency, facilitate communication
Drawbacks:      data privacy, digital divide, overdependence, cybercrime
Innovation:     cutting-edge, artificial intelligence, automation, disruptive

── HEALTH ──

Lifestyle:      sedentary lifestyle, nutritional deficiency, obesity epidemic
Mental health:  psychological well-being, stress management, burnout
Healthcare:     universal healthcare, medical infrastructure, preventive care

── SOCIETY & ECONOMY ──

Inequality:     wealth disparity, socioeconomic gap, poverty cycle
Urbanisation:   urban sprawl, infrastructure, migration, overpopulation
Economy:        GDP growth, fiscal policy, unemployment rate, inflation

── USEFUL ACADEMIC COLLOCATIONS ──

play a crucial role in      |   have a significant impact on
raise awareness of          |   tackle the issue of
lead to serious consequences|   contribute significantly to
pose a major threat to      |   address the root cause of

── TOPIC-SPECIFIC CONNECTORS ──

To show contrast:  In contrast, Conversely, By contrast
To generalise:     In general, Overall, As a rule
To emphasise:      Above all, Most importantly, Significantly`,
  },
];

const TEMPLATES = {
  linking:  '── Linking words ──\n\nAdding: Furthermore, Moreover, In addition\nContrasting: However, Nevertheless, On the other hand\nCause/effect: Therefore, Consequently, As a result\nExemplifying: For instance, To illustrate, For example',
  criteria: '── Band score criteria ──\n\nTask Response:\n• Addresses all parts of the task\n• Clear position throughout\n\nCoherence & Cohesion:\n• Logical structure\n• Range of cohesive devices\n\nLexical Resource:\n• Wide range of vocabulary\n• Less common items used accurately\n\nGrammatical Range & Accuracy:\n• Mix of simple and complex structures\n• Few errors',
};


function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)   return 'Just now';
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function Notes() {
  const [notes, setNotes]         = useState<Note[]>([]);
  const [activeId, setActiveId]   = useState<string | null>(null);
  const [search, setSearch]       = useState('');
  const [filterTag, setFilterTag] = useState('all');
  const [title, setTitle]         = useState('');
  const [content, setContent]     = useState('');
  const [tag, setTag]             = useState('writing');
  const [saved, setSaved]         = useState(true);
  const [saving, setSaving]       = useState(false);
  const [loading, setLoading]     = useState(true);
  const [toast, setToast]         = useState('');
  const [mobileView, setMobileView] = useState<'list' | 'editor'>('list');

  // Load notes on mount — seed IELTS notes if user has none
  useEffect(() => {
    notesApi.getAll()
      .then(async data => {
        if (data.length > 0) {
          setNotes(data);
          loadNote(data[0]);
        } else {
          // First-time user — create the pre-written IELTS study notes
          try {
            const created: Note[] = [];
            for (const seed of IELTS_SEED_NOTES) {
              const note = await notesApi.create(seed.title, seed.content, seed.tag);
              created.push(note);
            }
            setNotes(created);
            if (created.length) loadNote(created[0]);
          } catch {
            showToast('Could not seed starter notes');
          }
        }
      })
      .catch(() => showToast('Could not load notes'))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps


  function loadNote(n: Note) {
    setActiveId(n.id);
    setTitle(n.title);
    setContent(n.content);
    setTag(n.tag);
    setSaved(true);
    setMobileView('editor');
  }

  function markUnsaved() { setSaved(false); }

 async function saveNote() {
  setSaving(true);

  try {
    if (activeId && !activeId.startsWith('new-')) {
      // UPDATE real note
      const updated = await notesApi.update(activeId, title, content, tag);

      setNotes(ns =>
        ns.map(n => n.id === activeId ? updated : n)
      );

    } else {
      // CREATE new note
      const created = await notesApi.create(
        title || 'Untitled',
        content,
        tag
      );

      setNotes(ns => [created, ...ns.filter(n => n.id !== activeId)]);
      setActiveId(created.id);
    }

    setSaved(true);
    showToast('Saved');

  } catch (e: any) {
    showToast(e.message);
  } finally {
    setSaving(false);
  }
}



  function newNote() {
    const tempId = `new-${Date.now()}`;
    const blank: Note = { id: tempId, title: '', content: '', tag: 'writing', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    setNotes(ns => [blank, ...ns]);
    loadNote(blank);
    setSaved(false);
    setMobileView('editor');
  }

  async function deleteNote() {
    if (!activeId) return;
    const isTemp = activeId.startsWith('new-');
    if (!isTemp) {
      try {
        await notesApi.delete(activeId);
      } catch (e: any) {
        showToast(e.message || 'Failed to delete');
        return;
      }
    }
    const remaining = notes.filter(n => n.id !== activeId);
    setNotes(remaining);
    if (remaining.length) loadNote(remaining[0]);
    else { setActiveId(null); setTitle(''); setContent(''); setTag('writing'); }
    showToast('Note deleted');
  }

  function insertTemplate(key: keyof typeof TEMPLATES) {
    setContent(c => c + '\n' + TEMPLATES[key]);
    markUnsaved();
  }

  function exportPDF() {
    const win = window.open('', '_blank');
    if (!win) { showToast('Allow popups to download PDF'); return; }
    win.document.write(`<html><head><title>${title || 'Note'}</title><style>body{font-family:Georgia,serif;max-width:700px;margin:60px auto;padding:0 40px;line-height:1.8;color:#222}h1{font-size:22px;margin-bottom:8px}pre{white-space:pre-wrap;font-size:14px;font-family:inherit}.meta{font-size:12px;color:#888;margin-bottom:32px;border-bottom:1px solid #eee;padding-bottom:16px}.footer{margin-top:48px;font-size:11px;color:#aaa;border-top:1px solid #eee;padding-top:12px}</style></head><body>`);
    win.document.write(`<h1>${title || 'Untitled'}</h1><div class="meta">Build Me — IELTS preparation platform &nbsp;|&nbsp; ${new Date().toLocaleDateString()}</div><pre>${content}</pre><div class="footer">Generated by Build Me &mdash; IELTS readiness platform</div></body></html>`);
    win.document.close();
    win.print();
    showToast('PDF exported');
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }

  const filtered = notes.filter(n => {
    const matchSearch = !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase());
    const matchTag    = filterTag === 'all' || n.tag === filterTag;
    return matchSearch && matchTag;
  });

  const words = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <div style={{ display: 'flex', overflow: 'hidden', position: 'relative' }} className="notes-container">

      {/* ── Sidebar ── */}
      <div style={{ width: 260, borderRight: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', flexDirection: 'column' }} className={`notes-sidebar ${mobileView === 'list' ? 'active' : ''}`}>
        <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 400, marginBottom: 12 }}>My notes</div>
          <div style={{ position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notes..."
              style={{ width: '100%', padding: '7px 10px 7px 28px', fontSize: 12, border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--gray-100)', outline: 'none', color: 'var(--text-primary)' }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 5, padding: '8px 12px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
          {['all','writing','reading','grammar','vocab'].map(t => (
            <button key={t} onClick={() => setFilterTag(t)} style={{
              padding: '3px 9px', fontSize: 11, borderRadius: 12, cursor: 'pointer',
              border: `1px solid ${filterTag === t ? 'var(--purple)' : 'var(--border)'}`,
              background: filterTag === t ? 'var(--purple-light)' : 'transparent',
              color: filterTag === t ? 'var(--purple-dark)' : 'var(--text-secondary)',
            }}>{t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}</button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
          {loading && <div style={{ fontSize: 12, color: 'var(--text-tertiary)', padding: 12 }}>Loading notes...</div>}
          {!loading && filtered.length === 0 && (
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)', padding: 12 }}>No notes found.</div>
          )}
          {filtered.map(n => {
            const tc = TAG_COLORS[n.tag] || TAG_COLORS.writing;
            return (
              <div key={n.id} onClick={() => loadNote(n)} style={{
                padding: 12, borderRadius: 'var(--radius-md)', cursor: 'pointer', marginBottom: 3,
                background: n.id === activeId ? 'var(--gray-100)' : 'transparent',
                border: `1px solid ${n.id === activeId ? 'var(--border)' : 'transparent'}`,
                transition: 'all 0.15s',
              }}>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.title || 'Untitled'}</div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 7 }}>
                  {n.content.replace(/\n/g, ' ').substring(0, 55) || 'No content'}...
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 10, background: tc.bg, color: tc.color }}>{n.tag}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{timeAgo(n.updatedAt)}</span>
                </div>
              </div>
            );
          })}
        </div>

        <button onClick={newNote} style={{ margin: '10px 12px', padding: '8px', fontSize: 13, border: '1px solid var(--purple)', borderRadius: 'var(--radius-md)', background: 'transparent', color: 'var(--purple)', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer' }}>
          <Plus size={14} /> New note
        </button>
      </div>

      {/* ── Editor ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }} className={`notes-editor ${mobileView === 'editor' ? 'active' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className="notes-back-btn" onClick={() => setMobileView('list')} style={{ display: 'none', alignItems: 'center', gap: 4, padding: '5px 10px', fontSize: 12, border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <ArrowLeft size={14} /> Back
            </button>
            <span style={{ fontSize: 12, color: saving ? 'var(--purple)' : saved ? 'var(--text-tertiary)' : 'var(--amber)' }}>
              {saving ? 'Saving...' : saved ? 'All changes saved' : 'Unsaved changes'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <select value={tag} onChange={e => { setTag(e.target.value); markUnsaved(); }}
              style={{ padding: '5px 10px', fontSize: 12, border: '1px solid var(--border)', borderRadius: 12, background: 'transparent', color: 'var(--text-secondary)', outline: 'none', cursor: 'pointer' }}>
              {Object.keys(TAG_COLORS).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <button onClick={deleteNote}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'transparent', fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer' }}
              onMouseEnter={e => { (e.currentTarget.style.background='#FCEBEB'); (e.currentTarget.style.color='#791F1F'); (e.currentTarget.style.borderColor='#E24B4A'); }}
              onMouseLeave={e => { (e.currentTarget.style.background='transparent'); (e.currentTarget.style.color='var(--text-secondary)'); (e.currentTarget.style.borderColor='var(--border)'); }}
            ><Trash2 size={12} /> Delete</button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6, padding: '10px 24px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', flexWrap: 'wrap' }}>
          {[['B','bold'],['I','italic'],['U','underline']].map(([label]) => (
            <button key={label} style={{ padding: '4px 10px', fontSize: 12, border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'transparent', color: 'var(--text-secondary)', fontWeight: label==='B' ? 700 : 400, fontStyle: label==='I' ? 'italic' : 'normal', textDecoration: label==='U' ? 'underline' : 'none', cursor: 'pointer' }}>{label}</button>
          ))}
          <div style={{ width: 1, background: 'var(--border)', margin: '0 4px' }} />
          <button onClick={() => insertTemplate('linking')}  style={{ padding: '4px 10px', fontSize: 11, border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>Linking words template</button>
          <button onClick={() => insertTemplate('criteria')} style={{ padding: '4px 10px', fontSize: 11, border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>Band criteria template</button>
        </div>

        <div style={{ flex: 1, padding: '24px 32px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <input
            value={title}
            onChange={e => { setTitle(e.target.value); markUnsaved(); }}
            placeholder="Note title..."
            style={{ fontSize: 22, fontWeight: 500, border: 'none', outline: 'none', background: 'transparent', color: 'var(--text-primary)', marginBottom: 16, fontFamily: 'var(--font-display)', letterSpacing: '-0.3px', width: '100%' }}
          />
          <textarea
            value={content}
            onChange={e => { setContent(e.target.value); markUnsaved(); }}
            placeholder="Start writing your notes here..."
            style={{ flex: 1, fontSize: 14, border: 'none', outline: 'none', background: 'transparent', color: 'var(--text-primary)', resize: 'none', lineHeight: 1.85, fontFamily: 'var(--font-body)', overflowY: 'auto' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
          <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{words} word{words !== 1 ? 's' : ''}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={exportPDF} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 16px', border: '1px solid var(--border-md)', borderRadius: 'var(--radius-md)', background: 'transparent', fontSize: 13, cursor: 'pointer' }}>
              <Download size={13} /> Download as PDF
            </button>
            <button onClick={saveNote} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 18px', background: saving ? 'var(--gray-400)' : 'var(--purple)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontSize: 13, fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer' }}>
              {saving && <Loader size={12} style={{ animation: 'spin 1s linear infinite' }} />}
              {saving ? 'Saving...' : 'Save note'}
            </button>
          </div>
        </div>
      </div>

      {toast && (
        <div style={{ position: 'absolute', bottom: 20, right: 20, background: 'var(--teal)', color: '#fff', padding: '10px 18px', borderRadius: 'var(--radius-md)', fontSize: 13, fontWeight: 500, animation: 'fadeIn 0.3s ease' }}>
          {toast}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
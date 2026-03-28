import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Trash2, Download, Loader } from 'lucide-react';
import { notesApi, Note } from './api/notes';

const TAG_COLORS: Record<string, { bg: string; color: string }> = {
  writing:   { bg: '#EEEDFE', color: '#3C3489' },
  reading:   { bg: '#E1F5EE', color: '#085041' },
  listening: { bg: '#FAEEDA', color: '#633806' },
  speaking:  { bg: '#FAECE7', color: '#712B13' },
  grammar:   { bg: '#F1EFE8', color: '#444441' },
  vocab:     { bg: '#E6F1FB', color: '#0C447C' },
};

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

  // Load notes on mount
  useEffect(() => {
    notesApi.getAll()
      .then(data => {
        setNotes(data);
        if (data.length) loadNote(data[0]);
      })
      .catch(() => showToast('Could not load notes'))
      .finally(() => setLoading(false));
  }, []);

  function loadNote(n: Note) {
    setActiveId(n.id);
    setTitle(n.title);
    setContent(n.content);
    setTag(n.tag);
    setSaved(true);
  }

  function markUnsaved() { setSaved(false); }

  async function saveNote() {
    setSaving(true);
    try {
      if (activeId && notes.find(n => n.id === activeId)) {
        // Update existing
        const updated = await notesApi.update(activeId, title, content, tag);
        setNotes(ns => ns.map(n => n.id === activeId ? updated : n));
      } else {
        // Create new
        const created = await notesApi.create(title || 'Untitled', content, tag);
        setNotes(ns => [created, ...ns.filter(n => n.id !== activeId)]);
        setActiveId(created.id);
      }
      setSaved(true);
      showToast('Note saved');
    } catch (e: any) {
      showToast(e.message || 'Failed to save note');
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
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', position: 'relative' }}>

      {/* ── Sidebar ── */}
      <div style={{ width: 260, borderRight: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', flexDirection: 'column' }}>
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
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
          <span style={{ fontSize: 12, color: saving ? 'var(--purple)' : saved ? 'var(--text-tertiary)' : 'var(--amber)' }}>
            {saving ? 'Saving...' : saved ? 'All changes saved' : 'Unsaved changes'}
          </span>
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
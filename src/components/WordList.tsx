import React from 'react';

interface WordListProps {
  words: { word: string; definition: string }[];
  open: boolean;
  onClose: () => void;
}

export const WordList: React.FC<WordListProps> = ({ words, open, onClose }) => {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      <div style={{ background: '#1a1a2f', padding: 32, borderRadius: 16, maxHeight: '80vh', overflowY: 'auto', minWidth: 320 }}>
        <h2 className="glitch">Previous Brainrot Words</h2>
        <button onClick={onClose} style={{ float: 'right', background: 'var(--vpink)', color: '#fff', border: 'none', borderRadius: 8, padding: '0.3em 1em', cursor: 'pointer' }}>Close</button>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {words.map((w, i) => (
            <li key={i} style={{ margin: '1em 0', borderBottom: '1px solid #333', paddingBottom: 8 }}>
              <span style={{ color: 'var(--vgreen)', fontWeight: 700 }}>{w.word}</span>
              <div style={{ color: '#fff', fontSize: 14 }}>{w.definition}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}; 
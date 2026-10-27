import { useEffect, useMemo, useRef, useState } from 'react';

export default function SearchableSelect({
  options = [],
  value = '',
  onChange,
  placeholder = 'Search...',
  emptyText = 'No matches found',
  disabled = false,
  inputStyle = {},
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  const selectedOption = useMemo(
    () => options.find((option) => String(option.value) === String(value)),
    [options, value]
  );

  useEffect(() => {
    setQuery(selectedOption ? selectedOption.label : '');
  }, [selectedOption]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(normalized)
    );
  }, [options, query]);

  const handleInputChange = (event) => {
    const nextValue = event.target.value;
    setQuery(nextValue);
    setOpen(true);

    if (!nextValue.trim()) {
      onChange('');
      return;
    }

    const exactMatch = options.find(
      (option) => option.label.toLowerCase() === nextValue.trim().toLowerCase()
    );

    if (exactMatch) {
      onChange(exactMatch.value);
    }
  };

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <input
        className="input"
        value={query}
        onChange={handleInputChange}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        placeholder={placeholder}
        disabled={disabled}
        style={inputStyle}
      />

      {open && !disabled && (
        <div
          style={{
            position: 'absolute',
            zIndex: 30,
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            boxShadow: '0 12px 24px rgba(15, 23, 42, 0.12)',
            maxHeight: 220,
            overflowY: 'auto',
          }}
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <button
                type="button"
                key={String(option.value)}
                onClick={() => {
                  onChange(option.value);
                  setQuery(option.label);
                  setOpen(false);
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  border: 'none',
                  background: String(value) === String(option.value) ? '#eff6ff' : '#fff',
                  color: '#0f172a',
                  textAlign: 'left',
                  padding: '10px 12px',
                  cursor: 'pointer',
                }}
              >
                {option.label}
              </button>
            ))
          ) : (
            <div style={{ padding: '10px 12px', color: '#64748b' }}>{emptyText}</div>
          )}
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import api from '../api/api';
import PhoneInput from '../components/PhoneInput';

const empty = { name:'', phone:'', email:'', last_contact_followup:'' };

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [contactedFilter, setContactedFilter] = useState(''); // '' | 'yes' | 'no'
  const [lastContactFrom, setLastContactFrom] = useState('');
  const [lastContactTo, setLastContactTo] = useState('');
  const [hasEditsFilter, setHasEditsFilter] = useState('');   // '' | 'yes' | 'no'
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0, per_page: 15 });

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const load = () => {
    const p = new URLSearchParams();
    if (search) p.append('search', search);
    if (contactedFilter === 'yes') p.append('last_contact_followup', 'not_empty');
    if (contactedFilter === 'no') p.append('last_contact_followup', 'empty');
    if (lastContactFrom) p.append('last_contact_followup_from', lastContactFrom);
    if (lastContactTo) p.append('last_contact_followup_to', lastContactTo);
    p.append('page', page);
    p.append('per_page', perPage);
    api.get(`/clients?${p}`).then(r => {
      setClients(r.data.data);
      setMeta({
        current_page: r.data.current_page ?? 1,
        last_page: r.data.last_page ?? 1,
        total: r.data.total ?? r.data.data.length,
        per_page: r.data.per_page ?? perPage,
      });
    });
  };

  useEffect(() => { load(); }, [search, contactedFilter, lastContactFrom, lastContactTo, page, perPage]);
  useEffect(() => { setPage(1); }, [search, contactedFilter, lastContactFrom, lastContactTo, hasEditsFilter, perPage]);

  const openCreate = () => { setEditing(null); setForm(empty); setModalOpen(true); };
  const openEdit = (c) => { setEditing(c); setForm({ ...c }); setModalOpen(true); };

  const save = async (e) => {
    e.preventDefault();
    if (editing) await api.put(`/clients/${editing.id}`, form);
    else await api.post('/clients', form);
    setModalOpen(false); load();
  };

  const remove = async (id) => {
    if (!confirm('Delete this client? This will cascade to companies, services, edits, and attachments.')) return;
    await api.delete(`/clients/${id}`); load();
  };

  const visible = clients.filter(c => {
    if (contactedFilter === 'yes' && !c.last_contact_followup) return false;
    if (contactedFilter === 'no' && c.last_contact_followup) return false;
    if (hasEditsFilter === 'yes' && !(c.edits_count > 0)) return false;
    if (hasEditsFilter === 'no' && (c.edits_count > 0)) return false;
    return true;
  });

  const resetFilters = () => {
    setSearch('');
    setContactedFilter('');
    setLastContactFrom('');
    setLastContactTo('');
    setHasEditsFilter('');
    setPage(1);
  };

  return (
    <>
      <div className="page-header">
        <h1>Clients</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ New Client</button>
      </div>

      <div className="toolbar">
        <input className="input" style={{ maxWidth: 280 }}
          placeholder="Search clients..." value={search}
          onChange={e => setSearch(e.target.value)} />
        <select className="input" style={{ maxWidth: 180 }}
          value={contactedFilter} onChange={e => setContactedFilter(e.target.value)}>
          <option value="">All contact status</option>
          <option value="yes">Contacted</option>
          <option value="no">Not contacted</option>
        </select>
        <label className="input-wrap" style={{ maxWidth: 180 }}>
          <span>From</span>
          <input type="date" className="input" value={lastContactFrom}
            onChange={e => setLastContactFrom(e.target.value)} />
        </label>
        <label className="input-wrap" style={{ maxWidth: 180 }}>
          <span>To</span>
          <input type="date" className="input" value={lastContactTo}
            onChange={e => setLastContactTo(e.target.value)} />
        </label>
        <select className="input" style={{ maxWidth: 180 }}
          value={hasEditsFilter} onChange={e => setHasEditsFilter(e.target.value)}>
          <option value="">All edits</option>
          <option value="yes">Has edits</option>
          <option value="no">No edits</option>
        </select>
        <select className="input" style={{ maxWidth: 120 }}
          value={perPage} onChange={e => setPerPage(Number(e.target.value))}>
          {[10, 15, 25, 50, 100].map(n => (
            <option key={n} value={n}>{n} / page</option>
          ))}
        </select>
        {(search || contactedFilter || lastContactFrom || lastContactTo || hasEditsFilter) && (
          <button className="btn btn-ghost" onClick={resetFilters}>Reset</button>
        )}
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Name</th><th>Email</th><th>Phone</th>
            <th>Last Contact</th><th>Edits</th><th>Companies</th><th></th>
          </tr>
        </thead>
        <tbody>
          {visible.map(c => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.email}</td>
              <td>{c.phone}</td>
              <td>{c.last_contact_followup || '-'}</td>
              <td>{c.edits_count ?? 0}</td>
              <td>{c.companies_count ?? 0}</td>
              <td style={{ textAlign:'right' }}>
                <button className="btn btn-ghost" onClick={() => openEdit(c)}>Edit</button>{' '}
                <button className="btn btn-danger" onClick={() => remove(c.id)}>Del</button>
              </td>
            </tr>
          ))}
          {visible.length === 0 && (
            <tr>
              <td colSpan={7} className="empty-row">
                {clients.length === 0 ? 'No clients found.' : 'No clients match the current filters.'}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <Pagination meta={meta} page={page} setPage={setPage} />

      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: 16 }}>{editing ? 'Edit' : 'New'} Client</h2>
            <form onSubmit={save}>
              {['name','email'].map(f => (
                <div className="form-group" key={f}>
                  <label>{f.replace('_',' ')}</label>
                  <input className="input" value={form[f] || ''}
                    onChange={e => setForm({ ...form, [f]: e.target.value })} required={f !== 'email'} />
                </div>
              ))}
              <div className="form-group">
                <label>Phone</label>
                <PhoneInput
                  value={form.phone || ''}
                  onChange={value => setForm({ ...form, phone: value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Contact Followup</label>
                <input type="date" className="input" value={form.last_contact_followup || ''}
                  onChange={e => setForm({ ...form, last_contact_followup: e.target.value })} />
              </div>
              <div style={{ display:'flex', gap: 8, justifyContent:'flex-end' }}>
                <button type="button" className="btn btn-ghost"
                  onClick={() => setModalOpen(false)}>Cancel</button>
                <button className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function Pagination({ meta, page, setPage }) {
  const { last_page, total, per_page, current_page } = meta;
  if (!total) return null;

  const from = (current_page - 1) * per_page + 1;
  const to = Math.min(current_page * per_page, total);

  const pages = [];
  const maxButtons = 5;
  let start = Math.max(1, current_page - Math.floor(maxButtons / 2));
  let end = Math.min(last_page, start + maxButtons - 1);
  start = Math.max(1, end - maxButtons + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="pagination">
      <span className="pagination-info">Showing {from}–{to} of {total}</span>
      <div className="pagination-controls">
        <button className="btn btn-ghost" disabled={current_page <= 1}
          onClick={() => setPage(current_page - 1)}>‹ Prev</button>
        {start > 1 && (
          <>
            <button className="btn btn-ghost" onClick={() => setPage(1)}>1</button>
            {start > 2 && <span className="pagination-ellipsis">…</span>}
          </>
        )}
        {pages.map(n => (
          <button key={n}
            className={`btn ${n === current_page ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setPage(n)}>{n}</button>
        ))}
        {end < last_page && (
          <>
            {end < last_page - 1 && <span className="pagination-ellipsis">…</span>}
            <button className="btn btn-ghost" onClick={() => setPage(last_page)}>{last_page}</button>
          </>
        )}
        <button className="btn btn-ghost" disabled={current_page >= last_page}
          onClick={() => setPage(current_page + 1)}>Next ›</button>
      </div>
    </div>
  );
}
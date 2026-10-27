import { useEffect, useState } from 'react';
import api from '../api/api';
import SearchableSelect from '../components/SearchableSelect';
import PhoneInput from '../components/PhoneInput';

const empty = { client_id:'', name:'', phone:'', email:'', address:'' };

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [hasServicesFilter, setHasServicesFilter] = useState(''); // '' | 'yes' | 'no'
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0, per_page: 15 });

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const load = () => {
    const p = new URLSearchParams();
    if (search) p.append('search', search);
    if (clientFilter) p.append('client_id', clientFilter);
    p.append('page', page);
    p.append('per_page', perPage);
    api.get(`/companies?${p}`).then(r => {
      setCompanies(r.data.data);
      setMeta({
        current_page: r.data.current_page ?? 1,
        last_page: r.data.last_page ?? 1,
        total: r.data.total ?? r.data.data.length,
        per_page: r.data.per_page ?? perPage,
      });
    });
  };

  useEffect(() => { load(); }, [search, clientFilter, page, perPage]);
  useEffect(() => { setPage(1); }, [search, clientFilter, hasServicesFilter, perPage]);
  useEffect(() => { api.get('/clients?per_page=1000').then(r => setClients(r.data.data)); }, []);

  const openCreate = () => { setEditing(null); setForm(empty); setModalOpen(true); };
  const openEdit = (c) => {
    setEditing(c);
    setForm({
      client_id: c.client_id,
      name: c.name,
      phone: c.phone || '',
      email: c.email || '',
      address: c.address || '',
    });
    setModalOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    if (editing) await api.put(`/companies/${editing.id}`, form);
    else await api.post('/companies', form);
    setModalOpen(false); load();
  };

  const remove = async (id) => {
    if (!confirm('Delete this company? This will cascade to services, edits, and attachments.')) return;
    await api.delete(`/companies/${id}`); load();
  };

  const visible = companies.filter(c => {
    if (hasServicesFilter === 'yes' && !(c.services_count > 0)) return false;
    if (hasServicesFilter === 'no' && (c.services_count > 0)) return false;
    return true;
  });

  const resetFilters = () => {
    setSearch('');
    setClientFilter('');
    setHasServicesFilter('');
    setPage(1);
  };

  return (
    <>
      <div className="page-header">
        <h1>Companies</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ New Company</button>
      </div>

      <div className="toolbar">
        <input className="input" style={{ maxWidth: 220 }} placeholder="Search companies..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <select className="input" style={{ maxWidth: 220 }}
          value={clientFilter} onChange={e => setClientFilter(e.target.value)}>
          <option value="">All Clients</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select className="input" style={{ maxWidth: 180 }}
          value={hasServicesFilter} onChange={e => setHasServicesFilter(e.target.value)}>
          <option value="">All services</option>
          <option value="yes">Has services</option>
          <option value="no">No services</option>
        </select>
        <select className="input" style={{ maxWidth: 120 }}
          value={perPage} onChange={e => setPerPage(Number(e.target.value))}>
          {[10, 15, 25, 50, 100].map(n => (
            <option key={n} value={n}>{n} / page</option>
          ))}
        </select>
        {(search || clientFilter || hasServicesFilter) && (
          <button className="btn btn-ghost" onClick={resetFilters}>Reset</button>
        )}
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Name</th><th>Client</th><th>Email</th><th>Phone</th>
            <th>Address</th><th>Services</th><th></th>
          </tr>
        </thead>
        <tbody>
          {visible.map(c => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.client?.name}</td>
              <td>{c.email || '-'}</td>
              <td>{c.phone || '-'}</td>
              <td>{c.address || '-'}</td>
              <td>{c.services_count ?? 0}</td>
              <td style={{ textAlign:'right' }}>
                <button className="btn btn-ghost" onClick={() => openEdit(c)}>Edit</button>{' '}
                <button className="btn btn-danger" onClick={() => remove(c.id)}>Del</button>
              </td>
            </tr>
          ))}
          {visible.length === 0 && (
            <tr>
              <td colSpan={7} className="empty-row">
                {companies.length === 0 ? 'No companies found.' : 'No companies match the current filters.'}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <Pagination meta={meta} page={page} setPage={setPage} />

      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: 16 }}>{editing ? 'Edit' : 'New'} Company</h2>
            <form onSubmit={save}>
              <div className="form-group">
                <label>Client</label>
                <SearchableSelect
                  value={form.client_id}
                  onChange={value => setForm({ ...form, client_id: value })}
                  options={clients.map(c => ({ value: c.id, label: c.name }))}
                  placeholder="Search client..."
                  emptyText="No client found"
                />
              </div>
              <div className="form-group">
                <label>Name</label>
                <input className="input" value={form.name} required
                  onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <PhoneInput
                  value={form.phone || ''}
                  onChange={value => setForm({ ...form, phone: value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" className="input" value={form.email || ''}
                  onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input className="input" value={form.address || ''}
                  onChange={e => setForm({ ...form, address: e.target.value })} />
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
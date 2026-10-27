import { useEffect, useState } from 'react';
import api from '../api/api';
import SearchableSelect from '../components/SearchableSelect';

const empty = { company_id:'', name:'', description:'', base_price:'' };

export default function Services() {
  const [services, setServices] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [hasEditsFilter, setHasEditsFilter] = useState(''); // '' | 'yes' | 'no'
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0, per_page: 15 });

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const load = () => {
    const p = new URLSearchParams();
    if (search) p.append('search', search);
    if (companyFilter) p.append('company_id', companyFilter);
    p.append('page', page);
    p.append('per_page', perPage);
    api.get(`/services?${p}`).then(r => {
      setServices(r.data.data);
      setMeta({
        current_page: r.data.current_page ?? 1,
        last_page: r.data.last_page ?? 1,
        total: r.data.total ?? r.data.data.length,
        per_page: r.data.per_page ?? perPage,
      });
    });
  };

  useEffect(() => { load(); }, [search, companyFilter, page, perPage]);
  useEffect(() => { setPage(1); }, [search, companyFilter, hasEditsFilter, perPage]);
  useEffect(() => { api.get('/companies?per_page=1000').then(r => setCompanies(r.data.data)); }, []);

  const openCreate = () => { setEditing(null); setForm(empty); setModalOpen(true); };
  const openEdit = (s) => {
    setEditing(s);
    setForm({
      company_id: s.company_id,
      name: s.name,
      description: s.description || '',
      base_price: s.base_price ?? '',
    });
    setModalOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    const payload = { ...form, base_price: form.base_price === '' ? null : form.base_price };
    if (editing) await api.put(`/services/${editing.id}`, payload);
    else await api.post('/services', payload);
    setModalOpen(false); load();
  };

  const remove = async (id) => {
    if (!confirm('Delete this service? This will cascade to edits and attachments.')) return;
    await api.delete(`/services/${id}`); load();
  };

  const visible = services.filter(s => {
    if (hasEditsFilter === 'yes' && !(s.edits_count > 0)) return false;
    if (hasEditsFilter === 'no' && (s.edits_count > 0)) return false;
    return true;
  });

  const resetFilters = () => {
    setSearch('');
    setCompanyFilter('');
    setHasEditsFilter('');
    setPage(1);
  };

  return (
    <>
      <div className="page-header">
        <h1>Services</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ New Service</button>
      </div>

      <div className="toolbar">
        <input className="input" style={{ maxWidth: 220 }} placeholder="Search services..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <select className="input" style={{ maxWidth: 260 }}
          value={companyFilter} onChange={e => setCompanyFilter(e.target.value)}>
          <option value="">All Companies</option>
          {companies.map(c => (
            <option key={c.id} value={c.id}>{c.name} — {c.client?.name}</option>
          ))}
        </select>
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
        {(search || companyFilter || hasEditsFilter) && (
          <button className="btn btn-ghost" onClick={resetFilters}>Reset</button>
        )}
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Name</th><th>Company</th><th>Client</th>
            <th>Base Price</th><th>Edits</th><th></th>
          </tr>
        </thead>
        <tbody>
          {visible.map(s => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>{s.company?.name}</td>
              <td>{s.company?.client?.name}</td>
              <td>{s.base_price != null ? `$${Number(s.base_price).toFixed(2)}` : '-'}</td>
              <td>{s.edits_count ?? 0}</td>
              <td style={{ textAlign:'right' }}>
                <button className="btn btn-ghost" onClick={() => openEdit(s)}>Edit</button>{' '}
                <button className="btn btn-danger" onClick={() => remove(s.id)}>Del</button>
              </td>
            </tr>
          ))}
          {visible.length === 0 && (
            <tr>
              <td colSpan={6} className="empty-row">
                {services.length === 0 ? 'No services found.' : 'No services match the current filters.'}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <Pagination meta={meta} page={page} setPage={setPage} />

      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: 16 }}>{editing ? 'Edit' : 'New'} Service</h2>
            <form onSubmit={save}>
              <div className="form-group">
                <label>Company</label>
                <SearchableSelect
                  value={form.company_id}
                  onChange={value => setForm({ ...form, company_id: value })}
                  options={companies.map(c => ({
                    value: c.id,
                    label: `${c.name} — ${c.client?.name || 'Unknown client'}`,
                  }))}
                  placeholder="Search company..."
                  emptyText="No company found"
                />
              </div>
              <div className="form-group">
                <label>Name</label>
                <input className="input" value={form.name} required
                  onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="input" rows="3" value={form.description || ''}
                  onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Base Price</label>
                <input type="number" step="0.01" className="input" value={form.base_price ?? ''}
                  onChange={e => setForm({ ...form, base_price: e.target.value })} />
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
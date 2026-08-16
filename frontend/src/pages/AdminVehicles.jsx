import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import { fetchVehicles, adminCreateVehicle, adminUpdateVehicle, adminDeleteVehicle } from '../utils/api'
import VehicleImage from '../components/VehicleImage'
import Modal from '../components/Modal'
import ErrorState from '../components/ErrorState'
import { VehicleCardSkeleton } from '../components/Skeletons'

const EMPTY_FORM = { name: '', brand: '', year: '', price_per_day: '', fuel_type: 'PETROL', is_available: true, image: null }

export default function AdminVehicles() {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      setVehicles(await fetchVehicles())
    } catch (err) {
      setError(err.message || 'Unable to load vehicles.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setFormError(''); setModalOpen(true) }
  const openEdit = (v) => {
    setEditing(v)
    setForm({ name: v.name, brand: v.brand, year: v.year, price_per_day: v.price_per_day, fuel_type: v.fuel_type, is_available: v.is_available, image: null })
    setFormError('')
    setModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setFormError('')
    setSaving(true)

    const fd = new FormData()
    fd.append('name', form.name)
    fd.append('brand', form.brand)
    fd.append('year', form.year)
    fd.append('price_per_day', form.price_per_day)
    fd.append('fuel_type', form.fuel_type)
    fd.append('is_available', form.is_available)
    if (form.image) fd.append('image', form.image)

    try {
      if (editing) {
        await adminUpdateVehicle(editing.id, fd)
      } else {
        await adminCreateVehicle(fd)
      }
      setModalOpen(false)
      load()
    } catch (err) {
      setFormError(err.message || 'Unable to save vehicle.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this vehicle? This cannot be undone.')) return
    setDeletingId(id)
    try {
      await adminDeleteVehicle(id)
      setVehicles((prev) => prev.filter((v) => v.id !== id))
    } catch (err) {
      alert(err.message || 'Unable to delete vehicle.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">Manage Vehicles</h1>
          <p className="text-neutral-500 mt-1">Add, edit, or remove vehicles from the fleet.</p>
        </div>
        <button onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-500 transition-colors">
          <Plus className="w-4 h-4" /> Add Vehicle
        </button>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <VehicleCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {vehicles.map((v) => (
            <div key={v.id} className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
              <div className="h-40"><VehicleImage src={v.image} alt={v.name} className="w-full h-full" /></div>
              <div className="p-4">
                <p className="font-bold text-neutral-900">{v.brand} {v.name}</p>
                <p className="text-neutral-500 text-sm">{v.year} • {v.fuel_type} • ₹{v.price_per_day}/day</p>
                <p className={`text-xs font-semibold mt-1 ${v.is_available ? 'text-emerald-600' : 'text-neutral-400'}`}>
                  {v.is_available ? 'Available' : 'Unavailable'}
                </p>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <button onClick={() => openEdit(v)} className="flex items-center justify-center gap-1.5 py-2 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-700 hover:bg-neutral-50">
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(v.id)}
                    disabled={deletingId === v.id}
                    className="flex items-center justify-center gap-1.5 py-2 rounded-xl border border-red-200 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    {deletingId === v.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <Modal title={editing ? 'Edit Vehicle' : 'Add Vehicle'} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSave} className="space-y-4">
            {formError && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{formError}</p>}

            <div className="grid grid-cols-2 gap-3">
              <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
              <input required placeholder="Brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="input" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input required type="number" placeholder="Year" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} className="input" />
              <input required type="number" step="0.01" placeholder="Price / day" value={form.price_per_day} onChange={(e) => setForm({ ...form, price_per_day: e.target.value })} className="input" />
            </div>
            <select value={form.fuel_type} onChange={(e) => setForm({ ...form, fuel_type: e.target.value })} className="input">
              <option value="PETROL">Petrol</option>
              <option value="DIESEL">Diesel</option>
              <option value="ELECTRIC">Electric</option>
              <option value="HYBRID">Hybrid</option>
            </select>
            <label className="flex items-center gap-2 text-sm text-neutral-700">
              <input type="checkbox" checked={form.is_available} onChange={(e) => setForm({ ...form, is_available: e.target.checked })} />
              Available for booking
            </label>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Image</label>
              <input type="file" accept="image/*" onChange={(e) => setForm({ ...form, image: e.target.files[0] })} className="text-sm" />
            </div>

            <button type="submit" disabled={saving} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-500 disabled:opacity-60">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Vehicle'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}
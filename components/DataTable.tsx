'use client'

import { useState, useEffect, useCallback } from 'react'
import { AppItem } from '@/lib/dynamo'
import { ItemModal, DeleteConfirm } from './ItemModal'

const statusConfig: Record<string, { label: string; className: string }> = {
    active: { label: 'Activo', className: 'tag tag-green' },
    inactive: { label: 'Inactivo', className: 'tag' },
    pending: { label: 'Pendiente', className: 'tag tag-blue' },
}

export function DataTable() {
    const [items, setItems] = useState<AppItem[]>([])
    const [filtered, setFiltered] = useState<AppItem[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [modal, setModal] = useState<{ type: 'add' | 'edit'; item?: AppItem } | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<AppItem | null>(null)

    const fetchItems = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/items')
            if (!res.ok) throw new Error('Failed to fetch')
            const data = await res.json()
            setItems(data.items)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchItems() }, [fetchItems])

    useEffect(() => {
        if (!search.trim()) {
            setFiltered(items)
        } else {
            const q = search.toLowerCase()
            setFiltered(items.filter(
                (i) => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)
            ))
        }
    }, [search, items])

    async function handleSave(data: { name: string; description: string; status: string }) {
        if (modal?.type === 'edit' && modal.item) {
            await fetch(`/api/items/${modal.item.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })
        } else {
            await fetch('/api/items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })
        }
        await fetchItems()
    }

    async function handleDelete() {
        if (!deleteTarget) return
        await fetch(`/api/items/${deleteTarget.id}`, { method: 'DELETE' })
        await fetchItems()
    }

    function formatDate(iso: string) {
        return new Date(iso).toLocaleString('es-CL', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        })
    }

    return (
        <>
            <div className="table-card">
                <div className="table-toolbar">
                    <div className="search-input-wrapper">
                        <svg className="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            id="table-search"
                            type="text"
                            className="search-input"
                            placeholder="Buscar registros…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <button
                        id="add-item-btn"
                        className="btn btn-primary"
                        style={{ width: 'auto' }}
                        onClick={() => setModal({ type: 'add' })}
                    >
                        + Agregar registro
                    </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Descripción</th>
                                <th>Estado</th>
                                <th>Creado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr className="spinner-row">
                                    <td colSpan={6}>
                                        <div className="loading-overlay">
                                            <span className="spinner" style={{ borderTopColor: 'var(--accent)' }} />
                                            Cargando registros…
                                        </div>
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6}>
                                        <div className="empty-state">
                                            <div className="empty-icon">📭</div>
                                            <div className="empty-title">
                                                {search ? 'Sin resultados' : 'Sin registros'}
                                            </div>
                                            <p style={{ fontSize: '0.85rem' }}>
                                                {search
                                                    ? 'No se encontraron registros para tu búsqueda.'
                                                    : 'Agrega tu primer registro usando el botón de arriba.'}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((item) => {
                                    const status = statusConfig[item.status] ?? { label: item.status, className: 'tag' }
                                    return (
                                        <tr key={item.id}>
                                            <td>
                                                <span className="id-badge">{item.id.slice(0, 8)}…</span>
                                            </td>
                                            <td style={{ fontWeight: 500 }}>{item.name}</td>
                                            <td style={{ color: 'var(--text-secondary)', maxWidth: '280px' }}>
                                                {item.description}
                                            </td>
                                            <td>
                                                <span className={status.className}>{status.label}</span>
                                            </td>
                                            <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                                                {formatDate(item.createdAt)}
                                            </td>
                                            <td>
                                                <div className="table-actions">
                                                    <button
                                                        id={`edit-btn-${item.id}`}
                                                        className="btn btn-edit"
                                                        onClick={() => setModal({ type: 'edit', item })}
                                                        title="Editar"
                                                    >
                                                        ✏️ Editar
                                                    </button>
                                                    <button
                                                        id={`delete-btn-${item.id}`}
                                                        className="btn btn-danger"
                                                        onClick={() => setDeleteTarget(item)}
                                                        title="Eliminar"
                                                    >
                                                        🗑️ Eliminar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {modal && (
                <ItemModal
                    item={modal.item ?? null}
                    onClose={() => setModal(null)}
                    onSave={handleSave}
                />
            )}

            {deleteTarget && (
                <DeleteConfirm
                    itemName={deleteTarget.name}
                    onClose={() => setDeleteTarget(null)}
                    onConfirm={handleDelete}
                />
            )}
        </>
    )
}

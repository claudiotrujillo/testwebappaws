'use client'

import { useState } from 'react'
import { AppItem } from '@/lib/dynamo'

interface ItemModalProps {
    item?: AppItem | null
    onClose: () => void
    onSave: (data: { name: string; description: string; status: string }) => Promise<void>
}

export function ItemModal({ item, onClose, onSave }: ItemModalProps) {
    const [name, setName] = useState(item?.name ?? '')
    const [description, setDescription] = useState(item?.description ?? '')
    const [status, setStatus] = useState(item?.status ?? 'active')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const isEdit = !!item

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!name.trim() || !description.trim()) {
            setError('El nombre y la descripción son requeridos.')
            return
        }
        setError('')
        setLoading(true)
        try {
            await onSave({ name: name.trim(), description: description.trim(), status })
            onClose()
        } catch {
            setError('Ocurrió un error al guardar. Intenta nuevamente.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-panel">
                <div className="modal-header">
                    <h2 className="modal-title">{isEdit ? '✏️ Editar registro' : '➕ Nuevo registro'}</h2>
                    <button className="btn btn-icon" onClick={onClose} aria-label="Cerrar" id="modal-close">
                        ✕
                    </button>
                </div>

                {error && <div className="error-msg">{error}</div>}

                <form onSubmit={handleSubmit} id="item-form">
                    <div className="form-group">
                        <label className="form-label" htmlFor="item-name">Nombre</label>
                        <input
                            id="item-name"
                            type="text"
                            className="form-input"
                            placeholder="Nombre del registro"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="item-description">Descripción</label>
                        <textarea
                            id="item-description"
                            className="form-input"
                            placeholder="Descripción detallada…"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            rows={3}
                            style={{ resize: 'vertical', minHeight: '80px' }}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="item-status">Estado</label>
                        <select
                            id="item-status"
                            className="form-input"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            style={{ cursor: 'pointer' }}
                        >
                            <option value="active">✅ Activo</option>
                            <option value="inactive">⏸ Inactivo</option>
                            <option value="pending">⏳ Pendiente</option>
                        </select>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose} id="modal-cancel">
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading} id="modal-save"
                            style={{ width: 'auto' }}>
                            {loading ? <><span className="spinner" /> Guardando…</> : isEdit ? 'Guardar cambios' : 'Crear registro'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

interface DeleteConfirmProps {
    itemName: string
    onClose: () => void
    onConfirm: () => Promise<void>
}

export function DeleteConfirm({ itemName, onClose, onConfirm }: DeleteConfirmProps) {
    const [loading, setLoading] = useState(false)

    async function handleConfirm() {
        setLoading(true)
        try {
            await onConfirm()
            onClose()
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="delete-confirm">
                <div className="delete-icon">🗑️</div>
                <h3 className="delete-title">Eliminar registro</h3>
                <p className="delete-desc">
                    ¿Estás seguro de que deseas eliminar <strong>"{itemName}"</strong>?
                    Esta acción no se puede deshacer.
                </p>
                <div className="delete-actions">
                    <button className="btn btn-secondary" onClick={onClose} id="delete-cancel">
                        Cancelar
                    </button>
                    <button className="btn btn-danger" onClick={handleConfirm} disabled={loading}
                        id="delete-confirm" style={{ padding: '0.65rem 1.25rem', fontSize: '0.9rem' }}>
                        {loading ? <><span className="spinner" /> Eliminando…</> : 'Sí, eliminar'}
                    </button>
                </div>
            </div>
        </div>
    )
}

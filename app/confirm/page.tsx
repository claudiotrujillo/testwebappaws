'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function ConfirmForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [email, setEmail] = useState('')
    const [code, setCode] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const emailParam = searchParams.get('email')
        if (emailParam) {
            setEmail(emailParam)
        }
    }, [searchParams])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const res = await fetch('/api/auth/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Error al confirmar correo')
                return
            }

            setSuccess(true)

            // Redirect to login after 2 seconds
            setTimeout(() => {
                router.push('/login')
            }, 2500)

        } catch {
            setError('Error de red. Intenta nuevamente.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-logo">
                    <div className="auth-logo-icon">📧</div>
                    <span className="auth-logo-text">Verificación</span>
                </div>

                <h1 className="auth-title">Verifica tu correo</h1>
                <p className="auth-subtitle">
                    Hemos enviado un código de verificación a tu correo para activar la cuenta.
                </p>

                {error && <div className="error-msg">⚠️ {error}</div>}

                {success ? (
                    <div style={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        textAlign: 'center',
                        color: 'var(--text-primary)',
                        marginBottom: '1rem',
                        animation: 'fadeIn 0.3s ease'
                    }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
                        <h3 style={{ margin: '0 0 0.5rem' }}>¡Correo confirmado!</h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            Redirigiendo al inicio de sesión...
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} id="confirm-form">
                        <div className="form-group">
                            <label className="form-label" htmlFor="email">
                                Correo electrónico
                            </label>
                            <input
                                id="email"
                                type="email"
                                className="form-input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="code">
                                Código de confirmación
                            </label>
                            <input
                                id="code"
                                type="text"
                                className="form-input"
                                placeholder="123456"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                required
                                style={{ letterSpacing: '4px', textAlign: 'center', fontSize: '1.2rem' }}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                            id="confirm-submit"
                            style={{ marginTop: '0.5rem' }}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner" />
                                    Verificando…
                                </>
                            ) : (
                                'Activar cuenta'
                            )}
                        </button>
                    </form>
                )}

                {!success && (
                    <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
                        <Link href="/login" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                            ← Volver al inicio de sesión
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function ConfirmPage() {
    return (
        <Suspense fallback={
            <div className="auth-container">
                <div className="auth-card" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <span className="spinner" style={{ borderTopColor: 'var(--accent)', marginBottom: '1rem' }} />
                    <p>Cargando página de confirmación...</p>
                </div>
            </div>
        }>
            <ConfirmForm />
        </Suspense>
    )
}

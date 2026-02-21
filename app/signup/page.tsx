'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignUpPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError('')

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden')
            return
        }

        setLoading(true)

        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Error al registrar el usuario')
                return
            }

            // Redirect to confirm page with email query param
            router.push(`/confirm?email=${encodeURIComponent(email)}`)
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
                    <div className="auth-logo-icon">🗄️</div>
                    <span className="auth-logo-text">DataVault</span>
                </div>

                <h1 className="auth-title">Crear una cuenta</h1>
                <p className="auth-subtitle">Regístrate para comenzar a usar DataVault</p>

                {error && <div className="error-msg">⚠️ {error}</div>}

                <form onSubmit={handleSubmit} id="signup-form">
                    <div className="form-group">
                        <label className="form-label" htmlFor="email">
                            Correo electrónico
                        </label>
                        <input
                            id="email"
                            type="email"
                            className="form-input"
                            placeholder="usuario@empresa.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="password">
                            Contraseña
                        </label>
                        <input
                            id="password"
                            type="password"
                            className="form-input"
                            placeholder="••••••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="new-password"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="confirmPassword">
                            Confirmar contraseña
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            className="form-input"
                            placeholder="••••••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            autoComplete="new-password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        id="signup-submit"
                        style={{ marginTop: '0.5rem' }}
                    >
                        {loading ? (
                            <>
                                <span className="spinner" />
                                Registrando…
                            </>
                        ) : (
                            '→ Registrarse'
                        )}
                    </button>

                    <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>¿Ya tienes cuenta? </span>
                        <Link href="/login" style={{ color: 'var(--accent-light)', textDecoration: 'none', fontWeight: 600 }}>
                            Inicia sesión aquí
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
}

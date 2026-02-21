'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import Link from 'next/link'

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Error al iniciar sesión')
                return
            }

            // Guardar el token en cookie para el middleware
            document.cookie = `idToken=${data.idToken}; path=/; max-age=3600; samesite=strict`
            document.cookie = `userEmail=${encodeURIComponent(data.email)}; path=/; max-age=3600; samesite=strict`

            router.push('/dashboard')
        } catch {
            setError('Error de red. Intenta nuevamente.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                {/* Logo */}
                <div className="auth-logo">
                    <div className="auth-logo-icon">🗄️</div>
                    <span className="auth-logo-text">DataVault</span>
                </div>

                <h1 className="auth-title">Bienvenido de nuevo</h1>
                <p className="auth-subtitle">Inicia sesión con tu cuenta de AWS Cognito</p>

                {error && <div className="error-msg">⚠️ {error}</div>}

                <form onSubmit={handleSubmit} id="login-form">
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
                            autoComplete="current-password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        id="login-submit"
                        style={{ marginTop: '0.5rem' }}
                    >
                        {loading ? (
                            <>
                                <span className="spinner" />
                                Iniciando sesión…
                            </>
                        ) : (
                            '→ Iniciar sesión'
                        )}
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>¿No tienes una cuenta? </span>
                    <Link href="/signup" style={{ color: 'var(--accent-light)', textDecoration: 'none', fontWeight: 600 }}>
                        Regístrate aquí
                    </Link>
                </div>
            </div>
        </div>
    )
}

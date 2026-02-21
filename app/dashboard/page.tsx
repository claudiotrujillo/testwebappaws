'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DataTable } from '@/components/DataTable'

function getCookie(name: string): string {
    if (typeof document === 'undefined') return ''
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
    return match ? decodeURIComponent(match[2]) : ''
}

export default function DashboardPage() {
    const router = useRouter()
    const [userEmail, setUserEmail] = useState('')
    const [signingOut, setSigningOut] = useState(false)

    useEffect(() => {
        const token = getCookie('idToken')
        if (!token) {
            router.push('/login')
            return
        }
        const email = getCookie('userEmail')
        setUserEmail(email)
    }, [router])

    function handleSignOut() {
        setSigningOut(true)
        document.cookie = 'idToken=; path=/; max-age=0'
        document.cookie = 'userEmail=; path=/; max-age=0'
        router.push('/login')
    }

    const initials = userEmail
        ? userEmail.slice(0, 2).toUpperCase()
        : '?'

    return (
        <div className="dashboard-layout">
            {/* Top Bar */}
            <header className="topbar">
                <div className="topbar-brand">
                    <div className="topbar-logo-icon">🗄️</div>
                    <span className="topbar-logo-text">DataVault</span>
                </div>

                <div className="topbar-right">
                    <div className="user-badge">
                        <div className="user-avatar">{initials}</div>
                        <span style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {userEmail || 'Cargando…'}
                        </span>
                    </div>
                    <button
                        id="signout-btn"
                        className="btn btn-secondary"
                        style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
                        onClick={handleSignOut}
                        disabled={signingOut}
                    >
                        {signingOut ? 'Saliendo…' : '→ Cerrar sesión'}
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="dashboard-content">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Gestión de registros</h1>
                        <p className="page-subtitle">
                            Administra tus datos en DynamoDB — agrega, edita y elimina registros en tiempo real.
                        </p>
                    </div>
                </div>

                <DataTable />
            </main>
        </div>
    )
}

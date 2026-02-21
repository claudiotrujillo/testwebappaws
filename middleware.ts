import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify, createRemoteJWKSet } from 'jose'

const REGION = process.env.NEXT_PUBLIC_COGNITO_REGION || 'us-east-1'
const USER_POOL_ID = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || process.env.COGNITO_USER_POOL_ID || ''
const JWKS_URI = `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}/.well-known/jwks.json`

const JWKS = createRemoteJWKSet(new URL(JWKS_URI))

async function verifyToken(token: string): Promise<boolean> {
    try {
        await jwtVerify(token, JWKS, {
            issuer: `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`,
        })
        return true
    } catch {
        return false
    }
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    const isPublic =
        pathname.startsWith('/login') ||
        pathname.startsWith('/signup') ||
        pathname.startsWith('/confirm') ||
        pathname.startsWith('/api/auth') ||
        pathname.startsWith('/_next') ||
        pathname === '/favicon.ico'

    if (isPublic) return NextResponse.next()

    // Check for token in cookie or Authorization header
    const token =
        request.cookies.get('idToken')?.value ||
        request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
        if (pathname.startsWith('/api/')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        return NextResponse.redirect(new URL('/login', request.url))
    }

    const valid = await verifyToken(token)
    if (!valid) {
        if (pathname.startsWith('/api/')) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
        }
        return NextResponse.redirect(new URL('/login', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

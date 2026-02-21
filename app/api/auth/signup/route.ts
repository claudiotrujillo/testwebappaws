import { NextRequest, NextResponse } from 'next/server'
import {
    CognitoIdentityProviderClient,
    SignUpCommand,
} from '@aws-sdk/client-cognito-identity-provider'
import { createHmac } from 'crypto'

const cognitoClient = new CognitoIdentityProviderClient({
    region: process.env.NEXT_PUBLIC_COGNITO_REGION || 'us-east-1',
})

function computeSecretHash(username: string): string {
    const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!
    const clientSecret = process.env.COGNITO_CLIENT_SECRET!
    return createHmac('sha256', clientSecret)
        .update(username + clientId)
        .digest('base64')
}

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json()

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email y contraseña son requeridos' },
                { status: 400 }
            )
        }

        const secretHash = computeSecretHash(email)

        const command = new SignUpCommand({
            ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
            Username: email,
            Password: password,
            SecretHash: secretHash,
            UserAttributes: [
                {
                    Name: 'email',
                    Value: email,
                },
            ],
        })

        const response = await cognitoClient.send(command)

        return NextResponse.json({
            success: true,
            userConfirmed: response.UserConfirmed,
            userSub: response.UserSub,
            email,
        })
    } catch (err: unknown) {
        const error = err as { name?: string; message?: string }
        console.error('Cognito signup error:', error)

        const messages: Record<string, string> = {
            UsernameExistsException: 'Ya existe una cuenta con este correo electrónico.',
            InvalidPasswordException: 'La contraseña no cumple con los requisitos de seguridad (longitud, números, símbolos, etc).',
            InvalidParameterException: 'Parámetro inválido. Verifica el correo.',
        }

        const msg = messages[error.name ?? ''] ?? error.message ?? 'Error al registrar usuario'
        return NextResponse.json({ error: msg }, { status: 400 })
    }
}

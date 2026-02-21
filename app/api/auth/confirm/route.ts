import { NextRequest, NextResponse } from 'next/server'
import {
    CognitoIdentityProviderClient,
    ConfirmSignUpCommand,
} from '@aws-sdk/client-cognito-identity-provider'
import { createHmac } from 'crypto'

const cognitoClient = new CognitoIdentityProviderClient({
    region: process.env.NEXT_PUBLIC_COGNITO_REGION || 'us-east-1',
})

function computeSecretHash(username: string): string | undefined {
    const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!
    const clientSecret = process.env.COGNITO_CLIENT_SECRET
    if (!clientSecret) return undefined
    return createHmac('sha256', clientSecret)
        .update(username + clientId)
        .digest('base64')
}

export async function POST(request: NextRequest) {
    try {
        const { email, code } = await request.json()

        if (!email || !code) {
            return NextResponse.json(
                { error: 'Email y código son requeridos' },
                { status: 400 }
            )
        }

        const secretHash = computeSecretHash(email)

        const command = new ConfirmSignUpCommand({
            ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
            Username: email,
            ConfirmationCode: code,
            ...(secretHash && { SecretHash: secretHash }),
        })

        await cognitoClient.send(command)

        return NextResponse.json({ success: true })
    } catch (err: unknown) {
        const error = err as { name?: string; message?: string }
        console.error('Cognito confirm error:', error)

        const messages: Record<string, string> = {
            CodeMismatchException: 'El código de verificación es incorrecto.',
            ExpiredCodeException: 'El código de verificación ha expirado.',
            UserNotFoundException: 'No existe un usuario con ese correo.',
            NotAuthorizedException: 'El usuario ya ha sido confirmado.',
        }

        const msg = messages[error.name ?? ''] ?? error.message ?? 'Error al confirmar correo'
        return NextResponse.json({ error: msg }, { status: 400 })
    }
}
